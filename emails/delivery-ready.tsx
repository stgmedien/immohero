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
  shortCode: string;
  downloadUrl: string;
  fileCount: number;
  expiresAt: string;
}

export function DeliveryReadyEmail({ customerName, shortCode, downloadUrl, fileCount, expiresAt }: Props) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Deine Bilder sind bereit zum Download.</Preview>
      <Tailwind>
        <Body className="bg-[#F4F2EC] font-sans text-[#1E2319]">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Heading className="font-serif text-3xl">ImmoHero</Heading>
            <Section className="mt-6 rounded-xl border border-[#D9D4C4] bg-white p-7">
              <Heading as="h2" className="font-serif text-2xl leading-tight">
                Hallo {customerName}, deine Lieferung ist da.
              </Heading>
              <Text className="mt-3 text-[#5A5F52]">
                Auftrag <strong>{shortCode}</strong> — {fileCount} Dateien stehen ab sofort bereit. Du kannst sie über deinen Kundenbereich oder direkt über den Link unten herunterladen.
              </Text>
              <Link
                href={downloadUrl}
                className="mt-6 inline-block rounded-full bg-[#1E2319] px-6 py-3 text-sm font-medium text-[#F4F2EC] no-underline"
              >
                Lieferung öffnen
              </Link>
              <Text className="mt-6 text-xs text-[#8A8E80]">
                Direktlink gültig bis {new Date(expiresAt).toLocaleDateString("de-DE")}. Im Kundenbereich bleiben die Dateien dauerhaft verfügbar.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default DeliveryReadyEmail;
