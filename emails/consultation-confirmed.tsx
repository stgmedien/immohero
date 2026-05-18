import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  customerName: string;
  whenLabel: string;
  meetingUrl: string | null;
  repName: string;
  shortCode: string | null;
}

export function ConsultationConfirmedEmail({
  customerName,
  whenLabel,
  meetingUrl,
  repName,
  shortCode,
}: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Dein Beratungstermin ist bestätigt — {whenLabel}</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                {customerName ? `Hallo ${customerName},` : "Hallo,"} dein Termin steht!
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                {repName} freut sich auf das Beratungsgespräch vor deinem Dreh.
                {shortCode ? ` (Auftrag ${shortCode})` : ""}
              </Text>

              <Section className="my-6 rounded-lg bg-[#F0F3EB] px-5 py-5">
                <Text className="m-0 text-xs uppercase tracking-[0.15em] text-[#5A5F52]">
                  Termin
                </Text>
                <Text className="m-0 mt-1 font-serif text-xl">{whenLabel} Uhr</Text>
                <Text className="m-0 mt-1 text-sm text-[#5A5F52]">Dauer ca. 30 Minuten · Video-Call</Text>
              </Section>

              {meetingUrl ? (
                <Link
                  href={meetingUrl}
                  className="inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
                >
                  Video-Call beitreten
                </Link>
              ) : (
                <Text className="text-sm text-[#5A5F52]">
                  Den Einwahl-Link bekommst du rechtzeitig vor dem Termin per Kalender-Einladung.
                </Text>
              )}

              <Text className="mt-6 text-sm text-[#5A5F52]">
                Du hast die Kalender-Einladung separat erhalten — einfach annehmen, dann hast du
                den Termin direkt im Kalender. Im Gespräch besprechen wir alle Details und legen
                gemeinsam den Drehtermin fest.
              </Text>
            </Section>
            <Text className="mt-6 text-xs text-[#8A8E80]">
              ImmoHero · Jonathan Kreutzheide · Gütersloh · hallo@immohero.org
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ConsultationConfirmedEmail;
