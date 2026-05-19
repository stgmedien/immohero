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
  address: string;
  shortCode: string;
  portalUrl: string;
}

export function AboSubmissionApprovedEmail({
  customerName,
  address,
  shortCode,
  portalUrl,
}: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Dein Objekt ist in Produktion — {shortCode}</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                {customerName ? `Hallo ${customerName},` : "Hallo,"} wir legen los!
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Dein eingereichtes Objekt wurde geprüft und ist jetzt als Auftrag in
                Produktion. Wir koordinieren die nächsten Schritte und melden uns zur
                Terminabstimmung.
              </Text>
              <Section className="my-6 rounded-lg bg-[#F0F3EB] px-5 py-5">
                <Text className="m-0 text-xs uppercase tracking-[0.15em] text-[#5A5F52]">
                  Auftrag {shortCode}
                </Text>
                <Text className="m-0 mt-1 font-serif text-xl">{address}</Text>
              </Section>
              <Link
                href={portalUrl}
                className="inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Zum Abo-Bereich
              </Link>
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

export default AboSubmissionApprovedEmail;
