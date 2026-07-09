import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  customerName: string | null;
  shortCode: string;
  priceCents: number;
  paymentUrl: string;
  propertyAddress: string;
  note?: string | null;
}

const euro = (c: number) => (c / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export function OfferPaymentEmail({
  customerName,
  shortCode,
  priceCents,
  paymentUrl,
  propertyAddress,
  note,
}: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Dein Angebot {shortCode} — {euro(priceCents)} · jetzt sicher bezahlen</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                Dein persönliches Angebot{customerName ? `, ${customerName}` : ""}
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Danke für das Gespräch! Hier ist dein Angebot für {propertyAddress} (Anfrage{" "}
                <strong>{shortCode}</strong>). Du kannst direkt und sicher über den Button unten
                bezahlen — danach starten wir mit der Terminplanung.
              </Text>

              <Section className="my-6 rounded-xl border-2 border-[#3F5A3A] bg-[#F0F3EB] px-6 py-6 text-center">
                <Text className="m-0 text-xs uppercase tracking-[0.12em] text-[#5A5F52]">Gesamtpreis</Text>
                <Text className="m-0 mt-1 font-serif text-4xl text-[#1E2319]">{euro(priceCents)}</Text>
                <Text className="m-0 mt-1 text-xs text-[#5A5F52]">inkl. 19 % MwSt.</Text>
              </Section>

              {note ? (
                <Text className="rounded-xl bg-[#F8F6EF] px-4 py-3 text-sm text-[#3B3D34]">{note}</Text>
              ) : null}

              <Link
                href={paymentUrl}
                className="mt-2 inline-block rounded-full bg-[#1E2319] px-7 py-3.5 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Jetzt sicher bezahlen →
              </Link>

              <Text className="mt-4 text-xs text-[#8A8E80]">
                Zahlung über Stripe — Kreditkarte, SEPA, Klarna oder PayPal. Falls der Button nicht
                funktioniert, öffne diesen Link: <br />
                <span className="break-all">{paymentUrl}</span>
              </Text>

              <Hr className="my-6 border-[#D9D4C4]" />
              <Text className="text-sm text-[#5A5F52]">
                Fragen zum Angebot? Antworte einfach auf diese E-Mail oder ruf uns an.
              </Text>
            </Section>
            <Text className="mt-6 text-xs text-[#8A8E80]">
              ImmoHero · Jonathan Kreutzheide · Freiherr-vom-Stein-Straße 7 · 33332 Gütersloh
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default OfferPaymentEmail;
