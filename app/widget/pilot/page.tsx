import { PilotChat } from "@/components/pilot/chat";
import { getPersona } from "@/lib/pilot/personas";
import type { Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PilotWidgetPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string; lang?: string; embed?: string }>;
}) {
  const params = await searchParams;
  const persona = getPersona(params.persona);
  const locale: Locale = params.lang === "en" ? "en" : "de";
  const embedded = params.embed !== "0";

  return (
    <div className="h-dvh">
      <PilotChat
        persona={persona.key}
        locale={locale}
        greeting={persona.greeting[locale]}
        quickChips={persona.quickChips[locale]}
        embedded={embedded}
      />
    </div>
  );
}
