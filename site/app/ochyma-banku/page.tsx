import type { Metadata } from "next";
import Hero from "../components/Hero";
import SelfCheck from "../components/SelfCheck";
import { About, BankSees, Cases, Deliverables, Faq, FinalCta, Fit, Footer, Pricing, Process, Reviews, WhyNow } from "../components/Sections";

export const metadata: Metadata = {
  title: "Експрес-перевірка «Очима банку» · Outsistent",
  description: "Карта ризиків ваших рахунків і структури ФОП очима банку — за 3 робочі дні, навіть якщо банк ще нічого не запитував.",
};

export default function OchymaBanku() {
  return (
    <>
      <Hero />
      <main>
        <SelfCheck />
        <BankSees />
        <WhyNow />
        <Fit />
        <Deliverables />
        <Process />
        <Pricing />
        <Cases />
        <About />
        <Reviews />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
