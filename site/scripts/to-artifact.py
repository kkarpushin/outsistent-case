#!/usr/bin/env python3
"""Turn the static Next export (site/out) into one artifact page plus its media files.

The artifact viewer only runs inline scripts and relative files, so the page keeps the
prerendered markup and CSS, drops the Next runtime, loads the fonts from Google Fonts and
gets a small script for the two interactive parts (self-check and phone menu).

  python3 scripts/to-artifact.py        -> artifact/index.html + artifact/files.json
"""
import json
import re
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
OUT = SITE / "out"
DEST = SITE / "artifact"

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800'
         '&family=Caveat:wght@500;700&display=swap">')

OVERRIDES = """
:root{--font-montserrat:"Montserrat",ui-sans-serif,system-ui,sans-serif;--font-caveat:"Caveat","Comic Sans MS",cursive;color-scheme:light}
html,body{background:#fff}
"""

SCRIPT = r"""
(function () {
  var sc = document.querySelector("[data-sc]");
  if (sc) {
    var boxes = [].slice.call(sc.querySelectorAll('input[type="checkbox"]'));
    var rows = [].slice.call(sc.querySelectorAll("[data-sc-row]"));
    var bars = [].slice.call(sc.querySelectorAll("[data-sc-bar]"));
    var count = sc.querySelector("[data-sc-count]");
    var box = sc.querySelector("[data-sc-verdict]");
    var title = sc.querySelector("[data-sc-title]");
    var text = sc.querySelector("[data-sc-text]");
    var tones = ["bg-tint", "text-teal-deep", "bg-[#fff3df]", "text-[#8a5300]", "bg-[#fde8e8]", "text-[#9b1c20]"];
    var dots = ["bg-teal", "bg-risk-important", "bg-risk-critical", "bg-white/15"];
    var V = [
      { tone: ["bg-tint", "text-teal-deep"], dot: "bg-teal", t: "Схоже, банку нема до чого чіплятися", x: "Збережіть список і перевіряйте себе раз на квартал." },
      { tone: ["bg-[#fff3df]", "text-[#8a5300]"], dot: "bg-risk-important", t: "Банк може поставити запитання", x: "Краще підготувати відповіді заздалегідь, ніж збирати документи за три дні." },
      { tone: ["bg-[#fde8e8]", "text-[#9b1c20]"], dot: "bg-risk-critical", t: "Це картина, яку банк бачить як один бізнес", x: "Варто подивитися на структуру до запиту, а не після." }
    ];
    var update = function () {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      var v = n <= 2 ? V[0] : n <= 5 ? V[1] : V[2];
      count.textContent = n;
      bars.forEach(function (b, i) {
        dots.forEach(function (d) { b.classList.remove(d); });
        b.classList.add(i < n ? v.dot : "bg-white/15");
      });
      tones.forEach(function (c) { box.classList.remove(c); });
      v.tone.forEach(function (c) { box.classList.add(c); });
      title.textContent = v.t;
      text.textContent = v.x;
      rows.forEach(function (r, i) {
        r.classList.toggle("bg-tint/60", boxes[i].checked);
        r.classList.toggle("hover:bg-paper", !boxes[i].checked);
      });
    };
    boxes.forEach(function (b) { b.addEventListener("change", update); });
    update();
  }

  var menu = document.querySelector("[data-menu]");
  var openBtn = document.querySelector("[data-menu-open]");
  if (menu && openBtn) {
    var items = [].slice.call(menu.querySelectorAll("li"));
    var setOpen = function (on) {
      menu.hidden = !on;
      menu.classList.toggle("opacity-0", !on);
      menu.classList.toggle("pointer-events-none", !on);
      menu.classList.toggle("opacity-100", on);
      items.forEach(function (li) {
        li.classList.toggle("opacity-0", !on);
        li.classList.toggle("translate-y-3", !on);
        li.classList.toggle("opacity-100", on);
        li.classList.toggle("translate-y-0", on);
      });
      openBtn.setAttribute("aria-expanded", on ? "true" : "false");
      document.body.style.overflow = on ? "hidden" : "";
    };
    openBtn.addEventListener("click", function () { setOpen(true); });
    menu.querySelector("[data-menu-close]").addEventListener("click", function () { setOpen(false); });
    [].slice.call(menu.querySelectorAll("[data-menu-link]")).forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }
})();
"""


def main():
    html = (OUT / "index.html").read_text()
    title = re.search(r"<title>(.*?)</title>", html, re.S).group(1)
    desc = re.search(r'<meta name="description" content="([^"]*)"', html)
    css = ""
    for href in re.findall(r'<link rel="stylesheet" href="([^"]+\.css)"', html):
        css += (OUT / href.lstrip("/")).read_text()
    css = re.sub(r"@font-face\s*{[^}]*}", "", css)  # next/font files live under /_next; fonts come from Google

    body = re.search(r"<body[^>]*>(.*)</body>", html, re.S).group(1)
    body = re.sub(r"<script\b[^>]*>.*?</script>", "", body, flags=re.S)
    body = re.sub(r"<link\b[^>]*>", "", body)
    body = re.sub(r"<next-route-announcer.*?</next-route-announcer>", "", body, flags=re.S)
    body = re.sub(r'(src|href|poster)="/(images|video)/', r'\1="\2/', body)
    body = re.sub(r'(srcSet|srcset)="([^"]*)"', lambda m: f'{m.group(1)}="' + m.group(2).replace("/images/", "images/") + '"', body)

    page = (f"<meta charset=\"utf-8\">\n<title>{title}</title>\n"
            + (f'<meta name="description" content="{desc.group(1)}">\n' if desc else "")
            + FONTS + f"\n<style>{css}{OVERRIDES}</style>\n{body}\n<script>{SCRIPT}</script>\n")
    DEST.mkdir(exist_ok=True)
    (DEST / "index.html").write_text(page)

    used = sorted(set(re.findall(r'(?:images|video)/[A-Za-z0-9._-]+\.(?:webp|png|jpg|mp4)', page)))
    files = {u: str((OUT / u).resolve()) for u in used if (OUT / u).exists()}
    missing = [u for u in used if not (OUT / u).exists()]
    (DEST / "files.json").write_text(json.dumps(files, indent=2))
    print(f"{DEST / 'index.html'}  {len(page.encode()) // 1024} KB, {len(files)} files" + (f", missing: {missing}" if missing else ""))


if __name__ == "__main__":
    main()
