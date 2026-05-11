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
  url: string;
  email: string;
}

export function MagicLinkEmail({ url, email }: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Dein Login-Link für ImmoHero</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl tracking-tight">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                Hier ist dein Login-Link.
              </Heading>
              <Text className="mt-3 text-[#5A5F52]">
                Klicke auf den Button unten, um dich bei ImmoHero anzumelden. Der Link ist 24 Stunden gültig und funktioniert nur einmal.
              </Text>
              <Link
                href={url}
                className="mt-6 inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Bei ImmoHero anmelden
              </Link>
              <Text className="mt-6 text-xs text-[#8A8E80]">
                Funktioniert der Button nicht? Kopiere diesen Link in deinen Browser:
                <br />
                <span className="break-all">{url}</span>
              </Text>
            </Section>
            <Text className="mt-6 text-xs text-[#8A8E80]">
              Du hast diese E-Mail nicht angefordert? Dann ignoriere sie einfach — es geschieht nichts. Anfrage kam für {email}.
            </Text>
            <Text className="mt-8 text-xs text-[#8A8E80]">
              ImmoHero · Jonathan Kreutzheide · Freiherr-vom-Stein-Straße 7 · 33332 Gütersloh
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default MagicLinkEmail;
