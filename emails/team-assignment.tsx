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
  recipientName: string;
  shortCode: string;
  scheduledAt: string;
  propertyAddress: string;
  role: string;
  studioUrl: string;
}

export function TeamAssignmentEmail({ recipientName, shortCode, scheduledAt, propertyAddress, role, studioUrl }: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Neuer Auftrag {shortCode} für dich.</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero · Studio</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl">
                Hi {recipientName}, du wurdest zugewiesen.
              </Heading>
              <Text className="mt-3 text-[#5A5F52]">
                Auftrag <strong>{shortCode}</strong> — Rolle: <strong>{role}</strong>
              </Text>
              <Text className="text-[#5A5F52]">
                Termin: {new Date(scheduledAt).toLocaleString("de-DE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text className="text-[#5A5F52]">Adresse: {propertyAddress}</Text>
              <Link
                href={studioUrl}
                className="mt-6 inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Im Studio öffnen
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default TeamAssignmentEmail;
