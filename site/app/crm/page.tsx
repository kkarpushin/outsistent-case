import type { Metadata } from "next";
import CrmPanel from "../components/CrmPanel";

export const metadata: Metadata = {
  title: "CRM · Outsistent",
  robots: { index: false, follow: false },
};

export default function Crm() {
  return (
    <main className="min-h-screen bg-paper">
      <CrmPanel />
    </main>
  );
}
