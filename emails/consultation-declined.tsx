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
  reason: string;
}

export function ConsultationDeclinedEmail({ customerName, reason }: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Wir finden einen neuen Termin für dein Beratungsgespräch</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                {customerName ? `Hallo ${customerName},` : "Hallo,"}
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                dein Wunschtermin für das Beratungsgespräch hat bei uns leider nicht geklappt:
              </Text>
              <Section className="my-5 rounded-lg bg-[#F4F2EC] px-5 py-4">
                <Text className="m-0 text-sm text-[#1E2319]">{reason}</Text>
              </Section>
              <Text className="text-sm text-[#5A5F52]">
                Kein Problem — wir melden uns kurzfristig mit einem neuen Terminvorschlag.
                Alternativ kannst du auch direkt antworten und uns deine bevorzugten Zeiten nennen.
              </Text>
              <Link
                href="mailto:hallo@immohero.org"
                className="mt-5 inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Zeiten vorschlagen
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

export default ConsultationDeclinedEmail;
