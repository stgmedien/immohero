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
  referralCode: string;
  discountCents: number;
  bookingUrl: string;
  feedbackUrl?: string;
}

function euros(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

export function RebookingReferralEmail({
  customerName,
  referralCode,
  discountCents,
  bookingUrl,
  feedbackUrl,
}: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Danke für deinen Auftrag — und {euros(discountCents)} für deine Empfehlung</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                {customerName ? `Hallo ${customerName},` : "Hallo,"} wie hat's geklappt?
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Wir würden gerne von dir hören — und haben dir gleichzeitig einen
                Empfehlungs-Code für deinen nächsten Auftrag (oder zum Weitergeben) hinterlegt.
              </Text>
              {feedbackUrl ? (
                <Link
                  href={feedbackUrl}
                  className="mt-4 inline-block text-sm font-medium underline decoration-[#1E2319] underline-offset-4"
                >
                  → Kurzes Feedback in 30 Sekunden
                </Link>
              ) : null}
              <Section className="my-6 rounded-lg bg-[#F0F3EB] px-5 py-5 text-center">
                <Text className="m-0 text-xs uppercase tracking-[0.15em] text-[#5A5F52]">
                  Dein Empfehlungs-Code
                </Text>
                <Text className="m-0 mt-2 font-mono text-3xl font-bold tracking-wider">
                  {referralCode}
                </Text>
                <Text className="m-0 mt-2 text-sm text-[#5A5F52]">
                  {euros(discountCents)} Rabatt für dich oder einen Empfohlenen.
                </Text>
              </Section>
              <Link
                href={`${bookingUrl}?ref=${referralCode}`}
                className="mt-2 inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Code einlösen
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

export default RebookingReferralEmail;
