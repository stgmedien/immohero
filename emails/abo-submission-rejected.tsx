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
  address: string;
  reason: string;
  portalUrl: string;
}

export function AboSubmissionRejectedEmail({ address, reason, portalUrl }: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Rückfrage zu deinem eingereichten Objekt</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                Kurze Rückfrage zu deinem Objekt
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Wir konnten deine Einreichung für <strong>{address}</strong> noch nicht
                in Produktion nehmen. Anmerkung unseres Teams:
              </Text>
              <Section className="my-6 rounded-lg bg-[#F0F3EB] px-5 py-5">
                <Text className="m-0 text-sm text-[#1E2319]">{reason}</Text>
              </Section>
              <Text className="text-sm text-[#5A5F52]">
                Du kannst das Objekt im Abo-Bereich gerne mit den ergänzten Angaben
                erneut einreichen.
              </Text>
              <Link
                href={portalUrl}
                className="mt-4 inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Zum Abo-Bereich
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

export default AboSubmissionRejectedEmail;
