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
  name: string | null;
  level: "basic" | "intermediate" | "advanced";
  levelScore: number;
  passportLevel: number;
  courseTitle: string | null;
  magicLinkSent: boolean;
}

const LEVEL_LABEL: Record<Props["level"], string> = {
  basic: "Einsteiger",
  intermediate: "Fortgeschritten",
  advanced: "Profi",
};

export function PilotWelcomeEmail({ name, level, levelScore, passportLevel, courseTitle, magicLinkSent }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org";
  return (
    <Html lang="de">
      <Head />
      <Preview>Deine Einstufung steht — willkommen im Aero-One-Pilotenprogramm</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">Aero One × ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                Willkommen an Bord{name ? `, ${name}` : ""}!
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Du hast den ersten Schritt gemacht, dein Hobby zum Beruf zu machen. Hier ist deine
                Einstufung — und dein Weg zu bezahlten Immobilien-Aufträgen.
              </Text>

              <Section className="my-6 rounded-xl bg-[#F0F3EB] px-6 py-6 text-center">
                <Text className="m-0 text-xs uppercase tracking-[0.15em] text-[#5A5F52]">
                  Deine Einstufung
                </Text>
                <Text className="m-0 mt-2 font-serif text-3xl text-[#1E2319]">
                  {LEVEL_LABEL[level]}
                </Text>
                <Text className="m-0 mt-2 text-sm text-[#5A5F52]">
                  Score {levelScore}/100 · Pilot-Passport Stufe {passportLevel}
                </Text>
              </Section>

              {courseTitle ? (
                <Text className="text-sm text-[#3B3D34]">
                  Wir haben dich in den passenden Academy-Kurs eingeschrieben:{" "}
                  <strong>{courseTitle}</strong>
                </Text>
              ) : null}

              <Link
                href={`${baseUrl}/academy/mein-bereich`}
                className="mt-2 inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Zu deinem Lernbereich
              </Link>

              <Text className="mt-4 text-xs text-[#8A8E80]">
                {magicLinkSent
                  ? "Dein persönlicher Login-Link kommt in einer separaten E-Mail (Betreff: Dein Login-Link für ImmoHero). Kein Passwort nötig."
                  : "Zum Einloggen: einfach auf immohero.org/login deine E-Mail eingeben — du bekommst einen Login-Link, kein Passwort nötig."}
              </Text>

              <Hr className="my-6 border-[#D9D4C4]" />

              <Text className="text-sm font-medium">So geht es weiter:</Text>
              <Text className="m-0 mt-1 text-sm text-[#5A5F52]">
                1. Academy-Kurs starten und Zertifikat sichern
                <br />
                2. Pilot-Passport-Stufen steigen (Assessment-Call ab Stufe 2)
                <br />
                3. Ab Passport 3 wirst du für echte, bezahlte Aufträge sichtbar — Ø 339 € pro Projekt
              </Text>
            </Section>

            <Text className="mt-6 text-xs text-[#8A8E80]">
              Aero One · ein Schülerunternehmen mit ImmoHero · Gütersloh · hello@immohero.org
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PilotWelcomeEmail;
