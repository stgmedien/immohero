import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export async function ProcessSteps() {
  const locale = await getLocale();
  const steps = [
    { n: "01", title: t(locale, "process_step1_title"), body: t(locale, "process_step1_body") },
    { n: "02", title: t(locale, "process_step2_title"), body: t(locale, "process_step2_body") },
    { n: "03", title: t(locale, "process_step3_title"), body: t(locale, "process_step3_body") },
    { n: "04", title: t(locale, "process_step4_title"), body: t(locale, "process_step4_body") },
  ];
  return (
    <section className="container-page py-20">
      <div className="mb-12 max-w-2xl">
        <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">
          {t(locale, "process_eyebrow")}
        </p>
        <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
          {t(locale, "process_headline")}
        </h2>
      </div>
      <ol className="grid gap-6 md:grid-cols-4">
        {steps.map((step) => (
          <li key={step.n} className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
            <p className="font-serif text-3xl text-[var(--color-accent)]">{step.n}</p>
            <h3 className="mt-3 font-serif text-xl leading-tight">{step.title}</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
