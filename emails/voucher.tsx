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
  name: string;
  voucherCode: string;
  amountEuro: string;
  minOrderEuro: string;
  expiresAt: string;
  bookingUrl: string;
  walletUrl?: string;
}

export function VoucherEmail({
  name,
  voucherCode,
  amountEuro,
  minOrderEuro,
  expiresAt,
  bookingUrl,
  walletUrl,
}: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Dein {amountEuro}-Gutschein für ImmoHero — Code {voucherCode}</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                Danke für deinen Besuch, {name}!
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Hier ist dein persönlicher Gutschein über <strong>{amountEuro}</strong> für deine
                erste Buchung professioneller Immobilienmedien.
              </Text>

              <Section className="my-6 rounded-xl border-2 border-dashed border-[#3F5A3A] bg-[#F0F3EB] px-6 py-7 text-center">
                <Text className="m-0 text-xs uppercase tracking-[0.15em] text-[#5A5F52]">
                  Dein Gutschein-Code
                </Text>
                <Text className="m-0 mt-2 font-mono text-3xl font-bold tracking-[0.15em] text-[#1E2319]">
                  {voucherCode}
                </Text>
                <Text className="m-0 mt-3 text-sm text-[#5A5F52]">
                  {amountEuro} Rabatt · gültig bis {expiresAt}
                </Text>
              </Section>

              <Link
                href={bookingUrl}
                className="inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Jetzt einlösen
              </Link>

              {walletUrl ? (
                <Section className="mt-4">
                  <Link
                    href={walletUrl}
                    className="inline-block rounded-full border border-[#D9D4C4] px-6 py-3 text-sm font-medium text-[#1E2319] no-underline"
                  >
                    📲 Zur Google Wallet hinzufügen
                  </Link>
                </Section>
              ) : null}

              <Hr className="my-6 border-[#D9D4C4]" />

              <Text className="text-sm font-medium">So löst du den Gutschein ein:</Text>
              <Text className="m-0 mt-1 text-sm text-[#5A5F52]">
                1. Wähle auf immohero.org deine Services oder ein Paket
                <br />
                2. Im Bezahlfenster (Stripe) auf „Gutscheincode hinzufügen" klicken
                <br />
                3. Code <strong>{voucherCode}</strong> eingeben — {amountEuro} werden abgezogen
              </Text>

              <Text className="mt-5 text-xs text-[#8A8E80]">
                Einlösbar ab einem Bestellwert von {minOrderEuro}. Einmalig verwendbar.
                Gültig bis {expiresAt}. Keine Barauszahlung.
              </Text>
            </Section>

            <Text className="mt-6 text-xs text-[#8A8E80]">
              ImmoHero · Jonathan Kreutzheide · Freiherr-vom-Stein-Straße 7 · 33332 Gütersloh ·
              hallo@immohero.org
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default VoucherEmail;
