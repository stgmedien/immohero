import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export default async function CheckEmailPage() {
  const locale = await getLocale();
  return (
    <main className="container-narrow flex min-h-screen flex-col justify-center py-16 text-center">
      <Logo className="mx-auto" />
      <div className="mt-10 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
        <h1 className="font-serif text-3xl">{t(locale, "check_email_title")}</h1>
        <p className="mt-3 text-[var(--color-ink-soft)]">{t(locale, "check_email_sub")}</p>
        <p className="mt-6 text-xs text-[var(--color-ink-mute)]">
          {t(locale, "check_email_no_mail_prefix")}{" "}
          <Link href="/login" className="underline">
            {t(locale, "check_email_no_mail_link")}
          </Link>
          {t(locale, "check_email_no_mail_suffix")}
        </p>
      </div>
    </main>
  );
}
