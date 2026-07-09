import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  customerName: string | null;
  shortCode: string;
  items: { name: string; priceCents: number }[];
  estimateCents: number;
  propertyAddress: string;
  whenLabel: string | null;
}

const euro = (c: number) => (c / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export function InquiryReceivedEmail({
  customerName,
  shortCode,
  items,
  estimateCents,
  propertyAddress,
  whenLabel,
}: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Deine Anfrage {shortCode} ist bei uns — wir melden uns telefonisch</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                Danke für deine Anfrage{customerName ? `, ${customerName}` : ""}!
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Wir haben deine Anfrage <strong>{shortCode}</strong> für {propertyAddress} erhalten.
                Ein:e Berater:in aus unserem Team meldet sich {whenLabel ? `zum vereinbarten Termin (${whenLabel})` : "in Kürze telefonisch"} bei dir —
                bespricht kurz die Details und schickt dir dann dein <strong>persönliches Angebot mit Preis und Zahlungslink</strong>.
              </Text>

              <Section className="my-5 rounded-xl bg-[#F0F3EB] px-5 py-4">
                <Text className="m-0 text-xs uppercase tracking-[0.12em] text-[#5A5F52]">Deine Auswahl</Text>
                {items.map((it) => (
                  <Text key={it.name} className="m-0 mt-1.5 text-sm">
                    {it.name}
                    <span className="float-right text-[#5A5F52]">{euro(it.priceCents)}</span>
                  </Text>
                ))}
                <Hr className="my-3 border-[#D9D4C4]" />
                <Text className="m-0 text-sm">
                  Richtpreis (unverbindlich)
                  <span className="float-right font-semibold">{euro(estimateCents)}</span>
                </Text>
              </Section>

              <Text className="text-xs text-[#8A8E80]">
                Das ist nur ein Richtwert aus unserem Katalog — dein finaler Preis kommt nach dem
                Gespräch, abgestimmt auf dein Objekt. Erst dann bezahlst du, ganz bequem per Link.
                Es entstehen dir bis dahin keine Kosten.
              </Text>

              <Hr className="my-6 border-[#D9D4C4]" />
              <Text className="text-sm text-[#5A5F52]">
                Fragen? Antworte einfach auf diese E-Mail oder schreib an hello@immohero.org.
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

export default InquiryReceivedEmail;
