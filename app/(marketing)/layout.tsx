import { TopNav } from "@/components/site/top-nav";
import { Footer } from "@/components/site/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Pilot Journey Engine — Recruiter-Persona auf immohero.org */}
      <script src="/pilot-widget.js" data-persona="recruiter" data-lang="de" defer />
    </>
  );
}
