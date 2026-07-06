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
  name: string | null;
  courseTitle: string;
  serial: string;
  verifyUrl: string;
}

export function CertificateEmail({ name, courseTitle, serial, verifyUrl }: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Kurs abgeschlossen — dein Zertifikat {serial}</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">Aero One Academy</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                Geschafft{name ? `, ${name}` : ""}! 🎓
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Du hast den Kurs <strong>{courseTitle}</strong> vollständig abgeschlossen. Dein
                Zertifikat ist ausgestellt und öffentlich verifizierbar.
              </Text>

              <Section className="my-6 rounded-xl border-2 border-[#3F5A3A] bg-[#F0F3EB] px-6 py-7 text-center">
                <Text className="m-0 text-xs uppercase tracking-[0.15em] text-[#5A5F52]">
                  Zertifikats-Nummer
                </Text>
                <Text className="m-0 mt-2 font-mono text-2xl font-bold tracking-[0.12em] text-[#1E2319]">
                  {serial}
                </Text>
              </Section>

              <Link
                href={verifyUrl}
                className="inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Zertifikat ansehen &amp; drucken
              </Link>

              <Text className="mt-5 text-sm text-[#5A5F52]">
                Teile den Link gern mit Auftraggebern — jeder kann die Echtheit unter der
                Zertifikats-Nummer prüfen. Nächster Schritt: Passport-Stufe erhöhen und für
                bezahlte ImmoHero-Aufträge sichtbar werden.
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

export default CertificateEmail;
