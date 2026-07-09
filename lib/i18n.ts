export type Locale = "de" | "en";

const DICT: Record<Locale, Record<string, string>> = {
  de: {
    // TopNav
    nav_packages: "Pakete",
    nav_services: "Einzelservices",
    nav_faq: "FAQ",
    nav_account: "Konto",
    nav_studio: "Studio",
    nav_login: "Login",
    nav_book: "Jetzt buchen",
    // Hero
    hero_badge: "Aktiv in OWL & NRW · MwSt enthalten",
    hero_headline: "Professionelle Immobilien­medien, ohne Umwege.",
    hero_sub:
      "Fotografie, Drohne, Video, 360°-Tour, Matterport, Grundrisse und Exposé-Texte — schnell gebucht, kuratiert geliefert. Ein Team. Ein Preis. Eine Buchung.",
    hero_cta_book: "Jetzt buchen",
    hero_cta_packages: "Pakete ansehen",
    hero_caption: "Aktuelles Beispielobjekt · Gütersloh",
    hero_alt_aerial: "Drohnenfoto Mehrfamilienhaus aus der Luft",
    hero_chip_drone: "Drohne · 4K",
    hero_chip_shot: "Hero · Schräg",
    hero_pill_delivery: "Lieferung in 48 Std.",
    hero_stat_delivery_label: "Lieferzeit",
    hero_stat_delivery_value: "48 Std.",
    hero_stat_area_label: "Servicegebiet",
    hero_stat_area_value: "OWL · NRW",
    hero_stat_pricing_label: "Pakete",
    hero_stat_pricing_value: "ab 79 €",
    gallery_detail: "Detail",
    gallery_angle: "Schräg",
    gallery_context: "Kontext",
    // Footer
    footer_tagline:
      "Professionelle Immobilienmedien, in OWL & NRW geliefert. Foto, Drohne, Video, 360°, Grundriss, Text.",
    footer_col_services: "Services",
    footer_col_company: "Unternehmen",
    footer_col_legal: "Rechtliches",
    footer_link_packages: "Pakete",
    footer_link_faq: "FAQ",
    footer_link_about: "Über uns",
    footer_link_changelog: "Changelog",
    footer_link_status: "Status",
    footer_link_contact: "Kontakt",
    footer_link_imprint: "Impressum",
    footer_link_privacy: "Datenschutz",
    footer_link_terms: "AGB",
    footer_copy: "Alle Preise inkl. MwSt. wenn nicht anders ausgewiesen.",
    // ProcessSteps
    process_eyebrow: "So funktioniert ImmoHero",
    process_headline: "In vier Schritten zum fertigen Exposé.",
    process_step1_title: "Online buchen",
    process_step1_body:
      "Wähle Paket oder Einzelservices, gib deine Adresse und das passende Zeitfenster an.",
    process_step2_title: "Bezahlen & bestätigen",
    process_step2_body:
      "Sichere Online-Bezahlung per Karte, SEPA oder Klarna. Bestätigung direkt im Postfach.",
    process_step3_title: "Shooting vor Ort",
    process_step3_body:
      "Unser zertifiziertes Team kommt zu deinem Termin — punktgenau, freundlich, in 1–3 Stunden.",
    process_step4_title: "Lieferung in 48 Stunden",
    process_step4_body:
      "Bilder, Video, Plan und Tour landen in deinem Kundenbereich — bereit für Portal und Exposé.",
    // FAQ
    faq_eyebrow: "Häufige Fragen",
    faq_headline: "Klarheit, bevor du buchst.",
    faq_q_area: "Wo seid ihr aktiv?",
    faq_a_area:
      "Ostwestfalen-Lippe (OWL) und das übrige Nordrhein-Westfalen — von Bielefeld, Gütersloh und Paderborn bis Köln und Düsseldorf. Eine Postleitzahl-Prüfung erfolgt direkt im Buchungsfunnel.",
    faq_q_speed: "Wie schnell bekomme ich meine Bilder?",
    faq_a_speed:
      "Standardlieferung innerhalb von 48 Stunden nach dem Shooting. Videos & 360°-Touren benötigen meist 3–5 Werktage je nach Umfang.",
    faq_q_weather: "Was, wenn das Wetter nicht mitspielt?",
    faq_a_weather:
      "Wir behalten die Wettervorhersage im Blick und verschieben Drohnenflüge ggf. kostenfrei. Innenaufnahmen finden immer statt — du wirst proaktiv benachrichtigt.",
    faq_q_rights: "Welche Nutzungsrechte habe ich?",
    faq_a_rights:
      "Du erhältst zeitlich und räumlich unbeschränkte Nutzungsrechte für die Vermarktung der jeweiligen Immobilie inkl. Online-Portale, Social Media und Print-Exposés.",
    faq_q_pilot: "Wer fliegt die Drohne?",
    faq_a_pilot:
      "Ein zertifizierter Drohnenpilot mit EU-Kenntnisnachweis (A1/A3 und A2). Wir halten alle Auflagen der Luftverkehrsordnung ein.",
    faq_q_upsell: "Kann ich nachträglich Services hinzubuchen?",
    faq_a_upsell:
      "Ja — solange das Shooting noch nicht abgeschlossen ist. Über den Kundenbereich kannst du jederzeit nachbuchen, eine Rechnung wird automatisch erstellt.",
    // CTA Strip
    cta_eyebrow: "In 5 Minuten gebucht",
    cta_headline: "Bereit für deine besten Immobilienbilder?",
    cta_sub: "Wähle dein Paket, bestätige den Termin, bezahle sicher online. Wir kümmern uns um den Rest.",
    // Bundle Card
    bundle_recommended: "Empfohlen",
    bundle_save_percent: "{p}% sparen",
    bundle_savings: "Du sparst {amount} gegenüber Einzelbuchung",
    bundle_book: "{name} buchen",
    bundle_details: "Details ansehen",
    // Landing inline sections
    landing_services_eyebrow: "Einzelservices",
    landing_services_headline: "Wähle genau das, was du brauchst.",
    landing_packages_eyebrow: "Pakete",
    landing_packages_headline: "Mehr buchen, weniger zahlen.",
    landing_packages_sub:
      "Bis zu 20 % Rabatt gegenüber Einzelbuchung. Alle Pakete inkl. Lieferung in 48 Stunden.",
    // Pakete page
    pakete_eyebrow: "Pakete",
    pakete_headline: "Eine Buchung. Alles drin.",
    pakete_sub:
      "Wähle zwischen Basis für schnelle Vermarktung, Smart für die meisten Objekte oder Premium für hochwertige Liegenschaften.",
    pakete_table_title: "Was ist in jedem Paket enthalten?",
    pakete_table_service_col: "Service",
    pakete_table_inc: "Enthalten",
    pakete_table_not: "Nicht enthalten",
    pakete_table_footnote: "Einzelpreise siehe Detailseiten — alle Pakete inkl. 19 % MwSt.",
    // Services page
    services_eyebrow: "Einzelservices",
    services_headline: "Was wir liefern.",
    services_sub:
      "Jeder Service einzeln buchbar — oder kombiniert in einem Paket mit Rabatt.",
    // FAQ page
    faq_page_eyebrow: "FAQ",
    faq_page_headline: "Was du wissen solltest.",
    // About
    about_eyebrow: "Über uns",
    about_headline: "Lokales Team, kuratierte Qualität.",
    about_p1:
      "ImmoHero wurde gegründet, um Maklern und privaten Verkäufern in OWL und NRW einen einzigen, verlässlichen Ansprechpartner für hochwertige Immobilienmedien zu geben.",
    about_p2:
      "Unser Team besteht aus zertifizierten Fotograf:innen, Drohnenpiloten mit EU-Kenntnisnachweis und Editor:innen — alle in der Region zuhause. Wir kommen vorbei, machen die Aufnahmen, bearbeiten alles in unserer eigenen Postproduktion und liefern fertige Dateien innerhalb von 48 Stunden.",
    about_pillar_local_title: "Vor Ort gefilmt",
    about_pillar_local_body:
      "Wir kennen unsere Region — Bielefeld, Gütersloh, Paderborn bis Köln und Düsseldorf. Kurze Wege, schnelle Termine.",
    about_pillar_delivery_title: "Saubere Lieferung",
    about_pillar_delivery_body:
      "Standardisierte Workflows für Foto, Drohne, Video und 360°. Du bekommst, was du erwartest — pünktlich und sauber benannt.",
    about_pillar_personal_title: "Persönlich",
    about_pillar_personal_body: "Ein direkter Ansprechpartner für jedes Projekt. Keine Hotline, keine Tickets.",
    // Contact
    contact_eyebrow: "Kontakt",
    contact_headline: "Wir sind direkt erreichbar.",
    contact_sub:
      "Du hast eine Frage zu einem bestehenden Auftrag, möchtest ein größeres Projekt besprechen oder brauchst eine individuelle Lösung? Schreib uns direkt — wir antworten meist innerhalb weniger Stunden.",
    contact_direct: "Direktkontakt",
    contact_email: "E-Mail",
    contact_phone: "Telefon",
    contact_address: "Adresse",
    // Booking — Layout
    buchen_cancel: "Buchung abbrechen",
    // Booking — Stepper
    step_service: "Service",
    step_property: "Objekt",
    step_schedule: "Termin",
    step_checkout: "Kontakt & Anfrage",
    // Booking — page titles
    buchen_title: "Wähle deine Services",
    buchen_property_title: "Objekt & Adresse",
    buchen_schedule_title: "Beratungsgespräch",
    buchen_checkout_title: "Kontakt & Anfrage",
    // Booking — Service step
    svc_pkg_title: "Paket wählen — empfohlen",
    svc_pkg_sub: "Bis zu 20 % Rabatt gegenüber Einzelbuchung.",
    svc_single_title: "… oder Einzelservices",
    svc_single_sub_with_pkg:
      "Eine Auswahl ersetzt das Paket — du kannst trotzdem zusätzlich Services kombinieren.",
    svc_single_sub_no_pkg: "Tippe alle Services an, die du buchen möchtest.",
    svc_next: "Weiter zu Objekt & Adresse",
    // Booking — Property step
    prop_type_title: "Objekttyp",
    prop_type_sub: "So matchen wir die richtige Shotliste für dein Shooting.",
    prop_address_title: "Adresse",
    prop_address_sub: "Wir fahren zu jeder Adresse innerhalb OWL/NRW.",
    prop_label_address: "Straße und Hausnummer",
    prop_label_plz: "PLZ",
    prop_label_city: "Stadt",
    prop_optional_title: "Optional",
    prop_label_notes: "Hinweise für unser Team",
    prop_placeholder_notes: "Z. B. Schlüsselübergabe, Parkmöglichkeit, Tierbesitz…",
    prop_label_qm: "Wohnfläche (m²)",
    prop_placeholder_qm: "z. B. 142",
    prop_error_address: "Straße und Hausnummer fehlen.",
    prop_error_plz: "Bitte 5-stellige PLZ.",
    prop_error_city: "Stadt fehlt.",
    prop_plz_checking: "Prüfe Verfügbarkeit…",
    prop_plz_match: "Wir kommen zu dir — {city}, {region}.",
    prop_plz_out: "Außerhalb unseres Servicegebiets.",
    prop_back: "← Zurück",
    prop_next: "Weiter zum Termin",
    // Booking — Schedule step
    sched_title: "Beratungsgespräch",
    sched_sub:
      "Vor dem Dreh sprichst du kurz (~30 Min.) mit einem unserer Berater — per Video (Google Meet/Teams/Zoom). Dabei klären wir alle Details und legen gemeinsam den Drehtermin fest. Wähle dein Wunsch-Zeitfenster für das Gespräch.",
    sched_loading: "Lade verfügbare Zeiten…",
    sched_no_slots:
      "Aktuell sind online keine freien Termine sichtbar. Buche trotzdem — wir melden uns nach der Bezahlung kurzfristig zur Terminabstimmung.",
    sched_day: "Tag",
    sched_time: "Uhrzeit",
    sched_free: "{n} frei",
    sched_pick_day_first: "Bitte zuerst einen Tag wählen.",
    sched_back: "← Zurück",
    sched_next: "Weiter zum Kontakt",
    sched_continue_no_slot: "Ohne festen Termin weiter",
    // Booking — Checkout step
    check_who_title: "Wer fragt an?",
    check_who_sub: "Wir senden dir die Anfrage-Bestätigung an diese Adresse und melden uns telefonisch.",
    check_first_name: "Vorname",
    check_last_name: "Nachname",
    check_email: "E-Mail",
    check_phone: "Telefon",
    check_company: "Firma (optional, z. B. Maklerbüro)",
    check_agb_prefix: "Ich akzeptiere die",
    check_agb_terms: "AGB",
    check_agb_and: "und habe die",
    check_agb_privacy: "Datenschutzerklärung",
    check_agb_suffix: "gelesen.",
    check_error_required: "Bitte alle Pflichtfelder ausfüllen.",
    check_error_agb: "Bitte bestätige AGB und Datenschutzerklärung.",
    check_error_unknown: "Unbekannter Fehler beim Absenden der Anfrage.",
    check_back: "← Zurück",
    check_submit: "Anfrage absenden",
    check_submitting: "Wird gesendet…",
    check_payment_info:
      "Unverbindliche Anfrage — kein Zahlungsschritt. Wir rufen dich an und schicken dir dein persönliches Angebot mit Preis und Zahlungslink.",
    // Booking — Summary card
    sum_title: "Deine Auswahl",
    sum_empty: "Noch nichts ausgewählt.",
    sum_bundle_note: "Paket „{name}“ — {p} % Rabatt",
    sum_subtotal: "Zwischensumme",
    sum_discount: "Paketrabatt",
    sum_total: "Richtpreis",
    sum_estimate_note: "unverbindlich · finaler Preis nach dem Gespräch",
    // Booking — Erfolg / Anfrage page
    erfolg_title: "Buchung bestätigt.",
    erfolg_with_order: "Auftrag {code} ist bei uns. Du bekommst gleich eine Bestätigung an {email}.",
    erfolg_no_order:
      "Du bekommst gleich eine Bestätigungs-E-Mail mit allen Details und einem Login-Link zu deinem Kundenbereich.",
    erfolg_inquiry_title: "Anfrage eingegangen.",
    erfolg_inquiry_with_order:
      "Deine Anfrage {code} ist bei uns. Eine Bestätigung ist an {email} unterwegs — wir melden uns telefonisch mit deinem Angebot.",
    erfolg_inquiry_no_order:
      "Deine Anfrage ist bei uns. Eine Bestätigung ist per E-Mail unterwegs — wir melden uns telefonisch mit deinem Angebot.",
    erfolg_inquiry_hint:
      "Kein Zahlungsschritt nötig: Nach dem kurzen Telefonat bekommst du dein persönliches Angebot mit Preis und einem sicheren Zahlungslink.",
    erfolg_btn_account: "Zum Kundenbereich",
    erfolg_btn_home: "Zurück zur Startseite",
    // Login
    login_title: "Einloggen",
    login_sub: "Wir senden dir einen Magic-Link an deine E-Mail. Kein Passwort nötig.",
    login_email_label: "E-Mail-Adresse",
    login_error: "Login fehlgeschlagen. Bitte versuche es erneut.",
    login_submit: "Login-Link senden",
    login_terms_prefix: "Noch kein Konto? Es wird automatisch beim ersten Login erstellt. Mit dem Login akzeptierst du unsere",
    login_terms_link: "Datenschutzerklärung",
    login_terms_suffix: ".",
    check_email_title: "Prüfe deine E-Mails",
    check_email_sub:
      "Wir haben dir einen Login-Link geschickt. Klicke einfach drauf — du landest direkt in deinem Bereich.",
    check_email_no_mail_prefix: "Keine Mail? Schaue im Spam-Ordner oder",
    check_email_no_mail_link: "sende den Link erneut",
    check_email_no_mail_suffix: ".",
    // Konto layout + dashboard
    konto_logout: "Abmelden",
    konto_tab_orders: "Aufträge",
    konto_tab_profile: "Profil",
    konto_hello_named: "Hallo {name}.",
    konto_hello_anon: "Hallo und willkommen.",
    konto_subtitle: "Hier siehst du alle deine Buchungen und Lieferungen.",
    konto_new_booking: "Neue Buchung",
    konto_empty_title: "Noch keine Buchungen.",
    konto_empty_sub: "Starte deine erste Buchung in unter fünf Minuten.",
    konto_empty_cta: "Jetzt buchen",
    konto_order_appointment_label: "Termin",
    konto_order_tax_note: "inkl. MwSt",
    konto_pay_now: "Jetzt bezahlen",
    order_status_inquiry: "Anfrage — wir melden uns",
    order_status_offer_sent: "Angebot da — zahlbar",
    order_status_pending: "Wartet auf Zahlung",
    order_status_paid: "Bezahlt",
    order_status_scheduled: "Termin bestätigt",
    order_status_shooting: "Shooting läuft",
    order_status_editing: "Bearbeitung",
    order_status_delivered: "Geliefert",
    order_status_cancelled: "Storniert",
    // Status page
    status_title: "System-Status",
    status_ok: "Alles läuft.",
    status_degraded: "Eingeschränkt verfügbar.",
    status_down: "Eine Komponente ist gestört.",
    status_last_check: "Letzte Prüfung",
    // Feedback page
    fb_done_title: "Danke für dein Feedback!",
    fb_done_sub:
      "Wir haben es notiert. Falls du etwas nachreichen willst, melde dich einfach unter hello@immohero.org.",
    fb_question_title: "Wie war's mit ImmoHero?",
    fb_question_sub: "Wie wahrscheinlich würdest du uns weiterempfehlen?",
    fb_low: "Sehr unwahrscheinlich",
    fb_high: "Sehr wahrscheinlich",
    fb_comment_label: "Was war gut, was können wir besser machen? (optional)",
    fb_submit: "Feedback abgeben",
    fb_submitting: "Sende…",
    fb_thanks: "Vielen Dank! Wir freuen uns über jede Rückmeldung.",
  },
  en: {
    // TopNav
    nav_packages: "Packages",
    nav_services: "Services",
    nav_faq: "FAQ",
    nav_account: "Account",
    nav_studio: "Studio",
    nav_login: "Log in",
    nav_book: "Book now",
    // Hero
    hero_badge: "Serving OWL & NRW · VAT included",
    hero_headline: "Professional real-estate media, the direct way.",
    hero_sub:
      "Photography, drone, video, 360° tours, Matterport, floor plans and listing copy — quick to book, curated delivery. One team. One price. One booking.",
    hero_cta_book: "Book now",
    hero_cta_packages: "See packages",
    hero_caption: "Recent example · Gütersloh",
    hero_alt_aerial: "Aerial drone photo of a multi-family building",
    hero_chip_drone: "Drone · 4K",
    hero_chip_shot: "Hero · Angled",
    hero_pill_delivery: "Delivery in 48 h",
    hero_stat_delivery_label: "Turnaround",
    hero_stat_delivery_value: "48 h",
    hero_stat_area_label: "Service area",
    hero_stat_area_value: "OWL · NRW",
    hero_stat_pricing_label: "Packages",
    hero_stat_pricing_value: "from €79",
    gallery_detail: "Detail",
    gallery_angle: "Angled",
    gallery_context: "Context",
    // Footer
    footer_tagline:
      "Professional real-estate media, delivered in OWL & NRW. Photo, drone, video, 360°, floor plan, copy.",
    footer_col_services: "Services",
    footer_col_company: "Company",
    footer_col_legal: "Legal",
    footer_link_packages: "Packages",
    footer_link_faq: "FAQ",
    footer_link_about: "About",
    footer_link_changelog: "Changelog",
    footer_link_status: "Status",
    footer_link_contact: "Contact",
    footer_link_imprint: "Imprint",
    footer_link_privacy: "Privacy",
    footer_link_terms: "Terms",
    footer_copy: "All prices include VAT unless stated otherwise.",
    // ProcessSteps
    process_eyebrow: "How ImmoHero works",
    process_headline: "Four steps to a finished listing.",
    process_step1_title: "Book online",
    process_step1_body:
      "Pick a package or single services, enter your address and your preferred time window.",
    process_step2_title: "Pay & confirm",
    process_step2_body:
      "Secure online payment by card, SEPA or Klarna. Confirmation lands directly in your inbox.",
    process_step3_title: "On-site shoot",
    process_step3_body:
      "Our certified team arrives on the dot — friendly, prepared, in 1–3 hours.",
    process_step4_title: "Delivery within 48 hours",
    process_step4_body:
      "Photos, video, plans and tour land in your account — ready for portals and listings.",
    // FAQ
    faq_eyebrow: "Frequently asked",
    faq_headline: "Clarity before you book.",
    faq_q_area: "Where do you operate?",
    faq_a_area:
      "East Westphalia-Lippe (OWL) and the rest of North Rhine-Westphalia — from Bielefeld, Gütersloh and Paderborn to Cologne and Düsseldorf. ZIP-code coverage is checked directly in the booking funnel.",
    faq_q_speed: "How quickly do I get my photos?",
    faq_a_speed:
      "Standard delivery within 48 hours of the shoot. Videos and 360° tours typically take 3–5 working days depending on scope.",
    faq_q_weather: "What if the weather doesn't cooperate?",
    faq_a_weather:
      "We watch the forecast and reschedule drone flights free of charge if needed. Indoor sessions always happen — we proactively keep you in the loop.",
    faq_q_rights: "What usage rights do I get?",
    faq_a_rights:
      "You receive unlimited usage rights — time and territory — to market the specific property: online portals, social media and print listings.",
    faq_q_pilot: "Who flies the drone?",
    faq_a_pilot:
      "A certified drone pilot with EU competency certificates (A1/A3 and A2). We comply with all aviation regulations.",
    faq_q_upsell: "Can I add services later?",
    faq_a_upsell:
      "Yes — as long as the shoot hasn't been completed. You can book add-ons via your account any time; an invoice is generated automatically.",
    // CTA Strip
    cta_eyebrow: "Booked in 5 minutes",
    cta_headline: "Ready for your best real-estate photos?",
    cta_sub: "Pick your package, confirm the date, pay securely online. We handle the rest.",
    // Bundle Card
    bundle_recommended: "Recommended",
    bundle_save_percent: "save {p}%",
    bundle_savings: "You save {amount} vs. booking individually",
    bundle_book: "Book {name}",
    bundle_details: "See details",
    // Landing inline sections
    landing_services_eyebrow: "Single services",
    landing_services_headline: "Pick exactly what you need.",
    landing_packages_eyebrow: "Packages",
    landing_packages_headline: "Book more, pay less.",
    landing_packages_sub:
      "Up to 20% off versus single bookings. All packages delivered in 48 hours.",
    // Pakete page
    pakete_eyebrow: "Packages",
    pakete_headline: "One booking. Everything included.",
    pakete_sub:
      "Choose Basis for fast listings, Smart for most properties or Premium for high-end estates.",
    pakete_table_title: "What's in each package?",
    pakete_table_service_col: "Service",
    pakete_table_inc: "Included",
    pakete_table_not: "Not included",
    pakete_table_footnote: "Single-service prices on the detail pages — all packages include 19% VAT.",
    // Services page
    services_eyebrow: "Single services",
    services_headline: "What we deliver.",
    services_sub:
      "Every service bookable individually — or combined in a package with a discount.",
    // FAQ page
    faq_page_eyebrow: "FAQ",
    faq_page_headline: "What you should know.",
    // About
    about_eyebrow: "About",
    about_headline: "Local team, curated quality.",
    about_p1:
      "ImmoHero was founded to give estate agents and private sellers in OWL and NRW one reliable partner for premium real-estate media.",
    about_p2:
      "Our team consists of certified photographers, drone pilots with EU competency certificates and editors — all based in the region. We come on site, shoot, edit in our own postproduction and deliver finished files within 48 hours.",
    about_pillar_local_title: "Shot on site",
    about_pillar_local_body:
      "We know our region — Bielefeld, Gütersloh, Paderborn through Cologne and Düsseldorf. Short distances, quick scheduling.",
    about_pillar_delivery_title: "Clean delivery",
    about_pillar_delivery_body:
      "Standardised workflows for photo, drone, video and 360°. You get what you expect — on time, properly named.",
    about_pillar_personal_title: "Personal",
    about_pillar_personal_body: "One direct contact per project. No hotline, no tickets.",
    // Contact
    contact_eyebrow: "Contact",
    contact_headline: "Talk to us directly.",
    contact_sub:
      "Got a question about an existing booking, a larger project to discuss or a custom request? Write us directly — we usually reply within a few hours.",
    contact_direct: "Direct contact",
    contact_email: "Email",
    contact_phone: "Phone",
    contact_address: "Address",
    // Booking — Layout
    buchen_cancel: "Cancel booking",
    // Booking — Stepper
    step_service: "Service",
    step_property: "Property",
    step_schedule: "Date",
    step_checkout: "Contact & request",
    // Booking — page titles
    buchen_title: "Choose your services",
    buchen_property_title: "Property & address",
    buchen_schedule_title: "Consultation",
    buchen_checkout_title: "Contact & request",
    // Booking — Service step
    svc_pkg_title: "Pick a package — recommended",
    svc_pkg_sub: "Up to 20% off versus single bookings.",
    svc_single_title: "… or single services",
    svc_single_sub_with_pkg:
      "Picking services replaces the package — you can also combine extras on top.",
    svc_single_sub_no_pkg: "Tap every service you want to book.",
    svc_next: "Next: property & address",
    // Booking — Property step
    prop_type_title: "Property type",
    prop_type_sub: "We use this to match the right shot list for your shoot.",
    prop_address_title: "Address",
    prop_address_sub: "We come to any address within OWL/NRW.",
    prop_label_address: "Street and house number",
    prop_label_plz: "ZIP",
    prop_label_city: "City",
    prop_optional_title: "Optional",
    prop_label_notes: "Notes for our team",
    prop_placeholder_notes: "e.g. key handover, parking, pets…",
    prop_label_qm: "Floor area (m²)",
    prop_placeholder_qm: "e.g. 142",
    prop_error_address: "Street and house number missing.",
    prop_error_plz: "5-digit ZIP, please.",
    prop_error_city: "City is missing.",
    prop_plz_checking: "Checking availability…",
    prop_plz_match: "We cover you — {city}, {region}.",
    prop_plz_out: "Outside our service area.",
    prop_back: "← Back",
    prop_next: "Next: date",
    // Booking — Schedule step
    sched_title: "Consultation",
    sched_sub:
      "Before the shoot you have a short (~30 min.) video call with one of our advisers — Google Meet / Teams / Zoom. We clarify all details and pick the shoot date together. Choose your preferred time window for the call.",
    sched_loading: "Loading available slots…",
    sched_no_slots:
      "No free slots visible online right now. Continue anyway — we'll reach out to find a time.",
    sched_day: "Day",
    sched_time: "Time",
    sched_free: "{n} free",
    sched_pick_day_first: "Please pick a day first.",
    sched_back: "← Back",
    sched_next: "Next: contact",
    sched_continue_no_slot: "Continue without a fixed time",
    // Booking — Checkout step
    check_who_title: "Who's asking?",
    check_who_sub: "We send the request confirmation to this address and call you back.",
    check_first_name: "First name",
    check_last_name: "Last name",
    check_email: "Email",
    check_phone: "Phone",
    check_company: "Company (optional, e.g. agency)",
    check_agb_prefix: "I accept the",
    check_agb_terms: "Terms",
    check_agb_and: "and have read the",
    check_agb_privacy: "Privacy policy",
    check_agb_suffix: ".",
    check_error_required: "Please fill in all required fields.",
    check_error_agb: "Please accept the terms and privacy policy.",
    check_error_unknown: "Unknown error while sending your request.",
    check_back: "← Back",
    check_submit: "Send request",
    check_submitting: "Sending…",
    check_payment_info:
      "Non-binding request — no payment step. We'll call you and send your personal quote with a price and a payment link.",
    // Booking — Summary card
    sum_title: "Your selection",
    sum_empty: "Nothing selected yet.",
    sum_bundle_note: "Package \"{name}\" — {p}% off",
    sum_subtotal: "Subtotal",
    sum_discount: "Package discount",
    sum_total: "Est. price",
    sum_estimate_note: "non-binding · final price after the call",
    // Booking — Erfolg / request page
    erfolg_title: "Booking confirmed.",
    erfolg_with_order: "Order {code} is with us. You'll get a confirmation at {email} shortly.",
    erfolg_no_order:
      "You'll get a confirmation email shortly with all the details and a login link to your account.",
    erfolg_inquiry_title: "Request received.",
    erfolg_inquiry_with_order:
      "Your request {code} is with us. A confirmation is on its way to {email} — we'll call you with your quote.",
    erfolg_inquiry_no_order:
      "Your request is with us. A confirmation is on its way by email — we'll call you with your quote.",
    erfolg_inquiry_hint:
      "No payment step needed: after a short call you'll get your personal quote with a price and a secure payment link.",
    erfolg_btn_account: "To my account",
    erfolg_btn_home: "Back to home",
    // Login
    login_title: "Log in",
    login_sub: "We send you a magic link by email. No password required.",
    login_email_label: "Email address",
    login_error: "Login failed. Please try again.",
    login_submit: "Send login link",
    login_terms_prefix: "No account yet? It's created automatically on first login. By logging in you accept our",
    login_terms_link: "Privacy policy",
    login_terms_suffix: ".",
    check_email_title: "Check your inbox",
    check_email_sub:
      "We sent you a login link. Just click it — you'll land straight in your account.",
    check_email_no_mail_prefix: "No email? Check spam or",
    check_email_no_mail_link: "send the link again",
    check_email_no_mail_suffix: ".",
    // Konto layout + dashboard
    konto_logout: "Log out",
    konto_tab_orders: "Orders",
    konto_tab_profile: "Profile",
    konto_hello_named: "Hi {name}.",
    konto_hello_anon: "Hi and welcome.",
    konto_subtitle: "All your bookings and deliveries — in one place.",
    konto_new_booking: "New booking",
    konto_empty_title: "No bookings yet.",
    konto_empty_sub: "Start your first booking in under five minutes.",
    konto_empty_cta: "Book now",
    konto_order_appointment_label: "Appointment",
    konto_order_tax_note: "incl. VAT",
    konto_pay_now: "Pay now",
    order_status_inquiry: "Request — we'll be in touch",
    order_status_offer_sent: "Quote ready — payable",
    order_status_pending: "Awaiting payment",
    order_status_paid: "Paid",
    order_status_scheduled: "Date confirmed",
    order_status_shooting: "Shoot in progress",
    order_status_editing: "Editing",
    order_status_delivered: "Delivered",
    order_status_cancelled: "Cancelled",
    // Status page
    status_title: "System status",
    status_ok: "All systems go.",
    status_degraded: "Degraded performance.",
    status_down: "A component is down.",
    status_last_check: "Last check",
    // Feedback page
    fb_done_title: "Thanks for your feedback!",
    fb_done_sub:
      "We noted it. If you want to add anything, drop us a line at hello@immohero.org.",
    fb_question_title: "How was your ImmoHero experience?",
    fb_question_sub: "How likely are you to recommend us?",
    fb_low: "Very unlikely",
    fb_high: "Very likely",
    fb_comment_label: "What went well, what could we improve? (optional)",
    fb_submit: "Send feedback",
    fb_submitting: "Sending…",
    fb_thanks: "Thank you! Every bit of feedback helps.",
  },
};

/**
 * Server-Locale wird in `lib/i18n.server.ts` aus next/headers gelesen.
 * Diese Datei bleibt pur — sie wird auch in Client-Bundles importiert,
 * deshalb darf hier kein server-only Import stehen.
 */
export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const raw = DICT[locale]?.[key] ?? DICT.de[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/** Client-seitiges Pendant: liest das `locale`-Cookie aus `document.cookie`. */
export function readClientLocale(): Locale {
  if (typeof document === "undefined") return "de";
  const m = document.cookie.match(/(?:^|;\s*)locale=(de|en)/);
  if (m) return m[1] as Locale;
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en")) {
    return "en";
  }
  return "de";
}
