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
  shortCode: string;
  propertyAddress: string;
  reason: string;
  refundCents: number;
  portalUrl: string;
}

function euros(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

export function OrderCancelledEmail({
  customerName,
  shortCode,
  propertyAddress,
  reason,
  refundCents,
  portalUrl,
}: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Dein Auftrag {shortCode} wurde storniert</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                {customerName ? `Hallo ${customerName},` : "Hallo,"} dein Auftrag wurde
                storniert.
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Auftrag <strong>{shortCode}</strong> · {propertyAddress}
              </Text>
              <Section className="my-6 rounded-lg bg-[#F0F3EB] px-5 py-5">
                <Text className="m-0 text-xs uppercase tracking-[0.15em] text-[#5A5F52]">
                  Grund
                </Text>
                <Text className="m-0 mt-1 text-sm">{reason}</Text>
              </Section>
              {refundCents > 0 ? (
                <Text className="text-sm text-[#5A5F52]">
                  Wir haben dir <strong>{euros(refundCents)}</strong> erstattet. Je nach
                  Bank kann die Gutschrift einige Werktage dauern.
                </Text>
              ) : (
                <Text className="text-sm text-[#5A5F52]">
                  Falls eine Zahlung erfolgt ist und eine Erstattung ansteht, melden wir
                  uns dazu separat bei dir.
                </Text>
              )}
              <Link
                href={portalUrl}
                className="mt-5 inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Zum Kundenbereich
              </Link>
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

export default OrderCancelledEmail;
