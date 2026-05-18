import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  customerName: string;
  shortCode: string;
  scheduledAt: string;
  isConsultation?: boolean;
  propertyAddress: string;
  items: { name: string; priceCents: number }[];
  totalCents: number;
  portalUrl: string;
}

function euros(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function BookingConfirmationEmail({
  customerName,
  shortCode,
  scheduledAt,
  isConsultation,
  propertyAddress,
  items,
  totalCents,
  portalUrl,
}: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Buchung {shortCode} ist bestätigt — wir sehen uns am {new Date(scheduledAt).toLocaleDateString("de-DE")}.</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[600px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                Danke {customerName}! Deine Buchung ist bestätigt.
              </Heading>
              <Text className="mt-3 text-[#5A5F52]">
                Auftragsnummer <strong>{shortCode}</strong>.
              </Text>

              <Section className="mt-6 rounded-lg bg-[#F4F2EC] p-5">
                <Row>
                  <Text className="m-0 text-xs uppercase tracking-wider text-[#8A8E80]">
                    {isConsultation ? "Beratungsgespräch (Wunschtermin)" : "Termin"}
                  </Text>
                  <Text className="m-0 mt-1 font-serif text-xl">
                    {new Date(scheduledAt).toLocaleString("de-DE", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  {isConsultation ? (
                    <Text className="m-0 mt-1 text-xs text-[#8A8E80]">
                      Wir bestätigen diesen Termin in Kürze per E-Mail mit dem Video-Link.
                      Den Drehtermin legen wir gemeinsam im Gespräch fest.
                    </Text>
                  ) : null}
                </Row>
                <Row>
                  <Text className="mt-4 text-xs uppercase tracking-wider text-[#8A8E80]">Objektadresse</Text>
                  <Text className="m-0 mt-1">{propertyAddress}</Text>
                </Row>
              </Section>

              <Hr className="my-6 border-[#D9D4C4]" />

              <Text className="font-medium">Gebuchte Leistungen</Text>
              <Section className="mt-2">
                {items.map((item) => (
                  <Row key={item.name}>
                    <Text className="m-0 inline">{item.name}</Text>
                    <Text className="m-0 inline text-right text-[#5A5F52]">{euros(item.priceCents)}</Text>
                  </Row>
                ))}
              </Section>

              <Hr className="my-4 border-[#D9D4C4]" />
              <Row>
                <Text className="m-0 inline font-medium">Gesamt</Text>
                <Text className="m-0 inline text-right font-serif text-2xl">{euros(totalCents)}</Text>
              </Row>

              <Link
                href={portalUrl}
                className="mt-6 inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Zum Kundenbereich
              </Link>

              <Text className="mt-6 text-sm text-[#5A5F52]">
                {isConsultation
                  ? "Einer unserer Berater bestätigt deinen Wunschtermin zeitnah und schickt dir den Video-Link (Google Meet, Teams oder Zoom). Im Gespräch klären wir alle Details und legen den Drehtermin fest."
                  : "Wir melden uns 24 Stunden vor dem Termin nochmal mit einer Erinnerung. Bei Wetterunsicherheit (Drohne) sprechen wir uns vorab telefonisch ab."}
              </Text>
            </Section>

            <Text className="mt-6 text-xs text-[#8A8E80]">
              ImmoHero · Jonathan Kreutzheide · Freiherr-vom-Stein-Straße 7 · 33332 Gütersloh · jonathan@stg-medien.com
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default BookingConfirmationEmail;
