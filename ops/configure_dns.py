#!/usr/bin/env python3
"""Add only the karina.kovcheg.ai A record; dry-run unless --apply.

Copied from docs/course-trilogy-2026-09-27/ops/configure_dns.py (audited run
2026-09-27); only the target name, the address argument, the record floor and
the snapshot directory changed.

Secrets are read at runtime and sent to the Namecheap HTTPS endpoint in a
POST body. No credential is printed or included in a URL or snapshot.

Namecheap setHosts replaces the complete host collection. This script keeps
all supported existing DNS fields, preserves EmailType=FWD, refuses unknown
meaningful settings, compares a fresh read before writing, and verifies the
entire resulting collection. Provider-generated HostId values cannot be sent
back to setHosts and may change; they remain in private before/after snapshots.
There is no automatic mutation retry or automatic rollback.
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import ipaddress
import json
import os
from pathlib import Path
import shlex
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

DOMAIN = "kovcheg.ai"
ENDPOINT = "https://api.namecheap.com/xml.response"
TARGET_NAMES = ("karina",)
TARGET_ADDRESS = ""  # set from --address (the new droplet IPv4)
TARGET_TTL = "300"
MIN_EXISTING_RECORDS = 30  # 29 audited on 2026-09-27 + learn on 2026-10-13
SNAPSHOT_DIR = Path.home() / "dns-backups"
DNS_FIELDS = ("Name", "Type", "Address", "MXPref", "TTL")
METADATA_FIELDS = {
    "HostId", "HostID", "IsActive", "IsDDNSEnabled",
    "AssociatedAppTitle", "FriendlyName",
}
# CAA is deliberately excluded: its additional Flag/Tag serialization has not
# been verified against this live zone. An unexpected type needs human review.
SUPPORTED_TYPES = {
    "A", "AAAA", "ALIAS", "CNAME", "MX", "MXE", "NS", "TXT",
    "URL", "URL301", "FRAME",
}


class SafeDNSError(Exception):
    """An error whose message is safe to print without revealing credentials."""


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_credentials(path: Path) -> dict[str, str]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        raise SafeDNSError(f"Cannot read credentials ({type(exc).__name__}).") from None
    values = {}
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].lstrip()
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        if key not in {"NC_USER", "NC_KEY"}:
            continue
        try:
            parts = shlex.split(value, comments=True)
        except ValueError:
            raise SafeDNSError("Invalid quoting in a required credential.") from None
        if len(parts) != 1 or not parts[0] or key in values:
            raise SafeDNSError("Missing, duplicated, or invalid required credential.")
        values[key] = parts[0]
    if set(values) != {"NC_USER", "NC_KEY"}:
        raise SafeDNSError("Credential file must contain NC_USER and NC_KEY.")
    return values


def client_ip(value: str | None) -> str:
    if value is None:
        try:
            with urllib.request.urlopen("https://api.ipify.org", timeout=15) as response:
                value = response.read(128).decode("ascii").strip()
        except Exception as exc:
            raise SafeDNSError(
                f"Cannot discover the public IPv4 ({type(exc).__name__}); "
                "use --client-ip with the Namecheap-whitelisted address."
            ) from None
    try:
        parsed = ipaddress.IPv4Address(value)
    except ipaddress.AddressValueError:
        raise SafeDNSError("Client IP must be an IPv4 address.") from None
    if not parsed.is_global:
        raise SafeDNSError("Client IP must be a public IPv4 address.")
    return str(parsed)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


class NamecheapAPI:
    def __init__(self, credentials: dict[str, str], address: str):
        self.credentials = credentials
        self.address = address
        self.opener = urllib.request.build_opener(NoRedirect())

    def call(self, command: str, fields: dict[str, str] | None = None) -> ET.Element:
        if command not in {"namecheap.domains.dns.getHosts", "namecheap.domains.dns.setHosts"}:
            raise SafeDNSError("Unsupported API command.")
        params = {
            "ApiUser": self.credentials["NC_USER"],
            "ApiKey": self.credentials["NC_KEY"],
            "UserName": self.credentials["NC_USER"],
            "ClientIp": self.address,
            "Command": command,
            "SLD": "kovcheg",
            "TLD": "ai",
        }
        if fields:
            if set(fields) & set(params):
                raise SafeDNSError("Payload attempted to override API parameters.")
            params.update(fields)
        request = urllib.request.Request(
            ENDPOINT,
            data=urllib.parse.urlencode(params).encode("utf-8"),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        try:
            with self.opener.open(request, timeout=30) as response:
                raw = response.read(2_000_001)
            if len(raw) > 2_000_000:
                raise SafeDNSError("API response exceeded the safety limit.")
            root = ET.fromstring(raw)
        except urllib.error.HTTPError as exc:
            raise SafeDNSError(f"Namecheap returned HTTP {exc.code}; response body suppressed.") from None
        except SafeDNSError:
            raise
        except Exception as exc:
            # Do not stringify exceptions: an HTTP exception can contain the
            # request or provider response, which must not enter logs.
            raise SafeDNSError(f"Namecheap request failed ({type(exc).__name__}).") from None
        errors = [node.attrib.get("Number", "unknown") for node in root.iter()
                  if local_name(node.tag) == "Error"]
        if root.attrib.get("Status") != "OK" or errors:
            safe_codes = [code if code.isdigit() else "unknown" for code in errors]
            raise SafeDNSError(f"Namecheap API error codes: {','.join(safe_codes) or 'unknown'}.")
        commands = [node.text for node in root.iter() if local_name(node.tag) == "RequestedCommand"]
        if len(commands) != 1 or (commands[0] or "").strip().lower() != command.lower():
            raise SafeDNSError("Unexpected command in the API response.")
        return root

    def get_hosts(self) -> dict:
        root = self.call("namecheap.domains.dns.getHosts")
        results = [node for node in root.iter() if local_name(node.tag) == "DomainDNSGetHostsResult"]
        if len(results) != 1:
            raise SafeDNSError("Expected exactly one DNS zone result.")
        result = results[0]
        hosts = [dict(node.attrib) for node in result
                 if local_name(node.tag).lower() == "host"]
        if len(hosts) != len(result):
            raise SafeDNSError("Unexpected child data in DNS zone response.")
        return {"zone": dict(result.attrib), "records": hosts}

    def set_hosts(self, fields: dict[str, str]) -> None:
        root = self.call("namecheap.domains.dns.setHosts", fields)
        results = [node for node in root.iter() if local_name(node.tag) == "DomainDNSSetHostsResult"]
        if len(results) != 1 or results[0].attrib.get("Domain") != DOMAIN or results[0].attrib.get("IsSuccess") != "true":
            raise SafeDNSError("Namecheap did not confirm a successful DNS update.")


def validate_state(state: dict) -> None:
    zone = state["zone"]
    if zone.get("Domain") != DOMAIN or zone.get("IsUsingOurDNS") != "true":
        raise SafeDNSError("Unexpected domain or zone is not on Namecheap DNS.")
    if zone.get("EmailType") != "FWD":
        raise SafeDNSError("EmailType changed from FWD; stop for review without changing mail settings.")
    if set(zone) - {"Domain", "IsUsingOurDNS", "EmailType"}:
        raise SafeDNSError("Unknown zone settings; preserving them needs review.")
    records = state["records"]
    if len(records) < MIN_EXISTING_RECORDS:
        raise SafeDNSError(f"Fewer than the audited {MIN_EXISTING_RECORDS} records; stop for review.")
    for record in records:
        if not set(DNS_FIELDS).issubset(record):
            raise SafeDNSError("Existing record lacks a required DNS field.")
        if set(record) - set(DNS_FIELDS) - METADATA_FIELDS:
            raise SafeDNSError("Existing record has unsupported fields; no update is safe.")
        if record["Type"] not in SUPPORTED_TYPES:
            raise SafeDNSError("Existing record has an unverified type; no update is safe.")
        if record.get("IsActive", "true") != "true":
            raise SafeDNSError("Inactive records require review before using setHosts.")
        if record.get("IsDDNSEnabled", "false") != "false":
            raise SafeDNSError("Dynamic DNS requires review before using setHosts.")
        if record.get("AssociatedAppTitle") or record.get("FriendlyName"):
            raise SafeDNSError("Record application metadata requires review before using setHosts.")
        if not record["Name"] or not record["Address"]:
            raise SafeDNSError("Existing record contains an empty name or address.")
        if not record["TTL"].isdigit() or not 60 <= int(record["TTL"]) <= 60000:
            raise SafeDNSError("Existing TTL cannot be safely round-tripped through setHosts.")
        if not record["MXPref"].isdigit():
            raise SafeDNSError("Existing MX preference cannot be safely preserved.")


def relative_name(name: str) -> str:
    name = name.rstrip(".").lower()
    suffix = "." + DOMAIN
    return name[:-len(suffix)] if name.endswith(suffix) else name


def make_plan(state: dict) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    validate_state(state)
    original = state["records"]
    additions = []
    for name in TARGET_NAMES:
        existing = [record for record in original if relative_name(record["Name"]) == name]
        if existing:
            # Idempotent if the exact requested destination already exists.
            # A different record, duplicate, IPv6, CNAME, or other configuration
            # at a target requires review; never overwrite it automatically.
            if len(existing) != 1 or existing[0]["Type"] != "A" or existing[0]["Address"] != TARGET_ADDRESS:
                raise SafeDNSError(f"Conflicting or unexpected records exist at {name}.{DOMAIN}; refusing changes.")
        else:
            additions.append({"Name": name, "Type": "A", "Address": TARGET_ADDRESS,
                              "MXPref": "10", "TTL": TARGET_TTL})
    return [dict(record) for record in original] + additions, additions


def build_payload(state: dict, records: list[dict[str, str]]) -> dict[str, str]:
    payload = {"EmailType": state["zone"]["EmailType"]}
    mapping = {"Name": "HostName", "Type": "RecordType", "Address": "Address",
               "MXPref": "MXPref", "TTL": "TTL"}
    for index, record in enumerate(records, 1):
        for field, parameter in mapping.items():
            payload[f"{parameter}{index}"] = record[field]
    return payload


def full_fingerprint(state: dict) -> str:
    # Includes service metadata and HostId for the pre-write race check. Order
    # from the provider is irrelevant; duplicates are kept by sorting a list.
    normalized = {"zone": state["zone"], "records": sorted(
        state["records"], key=lambda record: json.dumps(record, sort_keys=True))}
    return json.dumps(normalized, sort_keys=True, ensure_ascii=False)


def semantic_records(records: list[dict[str, str]]) -> Counter:
    return Counter(tuple(record[field] for field in DNS_FIELDS) for record in records)


def verify_after(before: dict, expected_records: list[dict[str, str]], after: dict) -> None:
    validate_state(after)
    if before["zone"] != after["zone"]:
        raise SafeDNSError("Zone attributes changed after POST; inspect private snapshots.")
    expected = semantic_records(expected_records)
    actual = semantic_records(after["records"])
    if expected != actual:
        raise SafeDNSError(
            "DNS verification failed: "
            f"{sum((expected - actual).values())} expected record(s) missing/changed; "
            f"{sum((actual - expected).values())} unexpected record(s). "
            "No automatic rollback or second write was attempted. Inspect snapshots."
        )


def snapshot(phase: str, state: dict, additions: list[dict[str, str]] | None = None) -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    SNAPSHOT_DIR.mkdir(mode=0o700, exist_ok=True)
    descriptor, path = tempfile.mkstemp(prefix=f"kovcheg-dns-{stamp}-{phase}-", suffix=".json", dir=SNAPSHOT_DIR)
    try:
        os.fchmod(descriptor, 0o600)
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            json.dump({"captured_at": now(), "phase": phase, "state": state,
                       "planned_additions": additions or []}, stream,
                      ensure_ascii=False, sort_keys=True, indent=2)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
    except Exception:
        # No API call uses this path. An incomplete local backup must stop work.
        raise SafeDNSError("Could not complete the private local DNS snapshot.") from None
    return path


def run(args: argparse.Namespace) -> int:
    api = NamecheapAPI(load_credentials(args.secrets_file), client_ip(args.client_ip))
    before = api.get_hosts()
    expected, additions = make_plan(before)
    before_path = snapshot("before", before, additions)
    print(f"Mode: {'APPLY' if args.apply else 'DRY RUN (no DNS changes)'}")
    print(f"Zone: {DOMAIN}; provider: Namecheap; EmailType: FWD")
    print(f"Preserve: {len(before['records'])} existing records, including all DNS fields")
    print(f"Private before snapshot (0600): {before_path}")
    for record in additions:
        print(f"Add: {record['Name']}.{DOMAIN} A {TARGET_ADDRESS} TTL {TARGET_TTL}")
    if not additions:
        print("The target A record already exists at the requested address; no write needed.")
        return 0
    payload = build_payload(before, expected)
    # A second complete read catches changes since the snapshot. This is not a
    # transactional compare-and-swap: avoid concurrent DNS edits during apply.
    fresh = api.get_hosts()
    validate_state(fresh)
    make_plan(fresh)
    if full_fingerprint(before) != full_fingerprint(fresh):
        print(f"Private changed-zone snapshot (0600): {snapshot('changed-before-write', fresh)}")
        raise SafeDNSError("Zone changed since the snapshot; refusing POST. Re-run after reviewing the change.")
    print(f"Fresh read unchanged; planned final count: {len(expected)} records")
    if not args.apply:
        print("Dry-run passed. No setHosts command sent. Use --apply only after site review.")
        return 0
    write_error = None
    try:
        api.set_hosts(payload)
    except SafeDNSError as exc:
        write_error = str(exc)
    # Always read after the single write attempt, including timeout/error cases.
    # The write could have succeeded before the response was lost.
    try:
        after = api.get_hosts()
        after_path = snapshot("after", after)
        print(f"Private after snapshot (0600): {after_path}")
        verify_after(before, expected, after)
    except SafeDNSError as exc:
        if write_error:
            print(f"Write response: {write_error}")
        raise SafeDNSError(f"After-write state requires review: {exc} Do not blindly repeat --apply.") from None
    if write_error:
        print("Write response was inconclusive, but the complete resulting DNS state is verified.")
    print(f"Verified: all {len(before['records'])} existing DNS records preserved; {len(additions)} A record(s) added; EmailType unchanged.")
    print("Next: verify both authoritative NS, then public resolvers. Previously cached NXDOMAIN may last about 3601 seconds.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apply", action="store_true", help="Send one setHosts POST after the dry-run safeguards pass")
    parser.add_argument("--secrets-file", type=Path, default=Path.home() / ".claude/secrets/namecheap.env")
    parser.add_argument("--client-ip", help="Whitelisted public IPv4; by default discover the current public IPv4")
    parser.add_argument("--address", required=True, help="IPv4 the karina A record must point to")
    args = parser.parse_args()
    global TARGET_ADDRESS
    try:
        parsed = ipaddress.IPv4Address(args.address)
    except ipaddress.AddressValueError:
        print("ERROR: --address must be an IPv4 address.", file=sys.stderr)
        return 2
    if not parsed.is_global:
        print("ERROR: --address must be a public IPv4 address.", file=sys.stderr)
        return 2
    TARGET_ADDRESS = str(parsed)
    try:
        return run(args)
    except SafeDNSError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("Interrupted. If --apply had started, read the current zone before any retry.", file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"ERROR: unexpected {type(exc).__name__}; details suppressed to protect credentials.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
