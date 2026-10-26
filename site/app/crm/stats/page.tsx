import type { Metadata } from "next";
import StatsPanel from "../../components/StatsPanel";

export const metadata: Metadata = {
  title: "Реклама і статистика · Outsistent",
  robots: { index: false, follow: false },
};

export default function Stats() {
  return (
    <main className="min-h-screen bg-paper">
      <StatsPanel />
    </main>
  );
}
