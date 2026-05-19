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
  portalUrl: string;
}

export function AboInviteEmail({ customerName, portalUrl }: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Dein ImmoHero Abo-Zugang — Leistungen auswählen</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                {customerName ? `Hallo ${customerName},` : "Hallo,"} dein Abo-Zugang ist
                bereit.
              </Heading>
              <Text className="mt-2 text-[#5A5F52]">
                Über deinen persönlichen Bereich wählst du einmalig die Leistungen aus,
                die wir bei jedem deiner Objekte umsetzen sollen — danach reichst du
                neue Objekte mit einem Klick ein. Keine erneute Buchung, keine
                Einzelzahlung.
              </Text>
              <Section className="my-6 text-center">
                <Link
                  href={portalUrl}
                  className="inline-block rounded-full bg-[#1E2319] px-7 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
                >
                  Leistungen auswählen &amp; loslegen
                </Link>
              </Section>
              <Text className="text-sm text-[#5A5F52]">
                Du meldest dich einfach mit dieser E-Mail-Adresse an — wir schicken dir
                einen Login-Link, kein Passwort nötig.
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

export default AboInviteEmail;
