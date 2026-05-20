import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export async function FAQ() {
  const locale = await getLocale();
  const faqs = [
    { q: t(locale, "faq_q_area"), a: t(locale, "faq_a_area") },
    { q: t(locale, "faq_q_speed"), a: t(locale, "faq_a_speed") },
    { q: t(locale, "faq_q_weather"), a: t(locale, "faq_a_weather") },
    { q: t(locale, "faq_q_rights"), a: t(locale, "faq_a_rights") },
    { q: t(locale, "faq_q_pilot"), a: t(locale, "faq_a_pilot") },
    { q: t(locale, "faq_q_upsell"), a: t(locale, "faq_a_upsell") },
  ];
  return (
    <section className="container-page py-20" id="faq">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">
          {t(locale, "faq_eyebrow")}
        </p>
        <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
          {t(locale, "faq_headline")}
        </h2>
      </div>
      <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
        {faqs.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl tracking-tight">
              {item.q}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--color-line)] text-lg transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pt-3 text-sm text-[var(--color-ink-soft)] text-pretty md:max-w-[80%]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
