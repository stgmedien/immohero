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
  address: string;
}

export function AboSubmissionReceivedEmail({ customerName, address }: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Wir haben dein Objekt erhalten — {address}</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                {customerName ? `Hallo ${customerName},` : "Hallo,"} dein Objekt ist da.
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Wir haben deine Einreichung erhalten und prüfen sie. Sobald wir den
                Auftrag angelegt haben, bekommst du eine Bestätigung mit der
                Auftragsnummer.
              </Text>
              <Section className="my-6 rounded-lg bg-[#F0F3EB] px-5 py-5">
                <Text className="m-0 text-xs uppercase tracking-[0.15em] text-[#5A5F52]">
                  Objekt
                </Text>
                <Text className="m-0 mt-1 font-serif text-xl">{address}</Text>
              </Section>
              <Text className="text-sm text-[#5A5F52]">
                Deine Abo-Leistungen sind bereits hinterlegt — du musst nichts weiter
                tun. Wir melden uns in Kürze.
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

export default AboSubmissionReceivedEmail;
