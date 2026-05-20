import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  customerName: string;
  shortCode: string;
  scheduledAt: string;
  propertyAddress: string;
  hoursUntil: number;
}

export function ShootReminderEmail({
  customerName,
  shortCode,
  scheduledAt,
  propertyAddress,
  hoursUntil,
}: Props) {
  const when = new Date(scheduledAt).toLocaleString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <Html lang="de">
      <Head />
      <Preview>
        Erinnerung — dein Termin {hoursUntil <= 3 ? "in Kürze" : "morgen"}: {when}
      </Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                {customerName ? `Hallo ${customerName},` : "Hallo,"} kleine Erinnerung an deinen Termin
              </Heading>
              <Section className="my-6 rounded-lg bg-[#F0F3EB] px-5 py-5">
                <Text className="m-0 text-xs uppercase tracking-[0.15em] text-[#5A5F52]">
                  {hoursUntil <= 3 ? "In Kürze" : "Morgen"}
                </Text>
                <Text className="m-0 mt-1 font-serif text-xl">{when}</Text>
                <Text className="m-0 mt-2 text-sm text-[#5A5F52]">{propertyAddress}</Text>
                <Text className="m-0 mt-1 text-xs text-[#5A5F52]">Auftrag {shortCode}</Text>
              </Section>
              <Text className="text-sm text-[#1E2319]">
                <strong>Kurze Checkliste vorab:</strong>
              </Text>
              <ul className="m-0 list-disc pl-5 text-sm text-[#5A5F52]">
                <li>Aufgeräumt, persönliche Gegenstände weggeräumt</li>
                <li>Vorhänge offen, Lichter prüfen</li>
                <li>Schlüssel / Zugang geklärt</li>
                <li>Bei Drohne: Wetter checken, Telefon erreichbar</li>
              </ul>
              <Text className="mt-5 text-sm text-[#5A5F52]">
                Termin verschieben oder Frage? Antworte einfach auf diese Mail.
              </Text>
            </Section>
            <Text className="mt-6 text-xs text-[#8A8E80]">
              ImmoHero · Jonathan Kreutzheide · Gütersloh · hello@immohero.org
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ShootReminderEmail;
