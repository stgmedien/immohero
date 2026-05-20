import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "./icons";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export async function CtaStrip() {
  const locale = await getLocale();
  return (
    <section className="container-page py-12">
      <div className="overflow-hidden rounded-[24px] bg-[var(--color-ink)] p-10 text-[var(--color-primary-ink)] md:p-14">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm uppercase tracking-wider text-[var(--color-primary)]">
              {t(locale, "cta_eyebrow")}
            </p>
            <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
              {t(locale, "cta_headline")}
            </h2>
            <p className="mt-3 max-w-xl text-[var(--color-primary-soft)]/90">
              {t(locale, "cta_sub")}
            </p>
          </div>
          <Button asChild size="xl" variant="accent" className="self-start md:self-center">
            <Link href="/buchen">
              {t(locale, "nav_book")}
              <ArrowRightIcon size={20} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
