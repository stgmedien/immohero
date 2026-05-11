// Shot-Bibliothek — übernommen aus Aero One Shotlist Master
// (src/data/seed.ts → SHOT_MASTER_ROWS, src/types/domain.ts → ShotDefinition)

export type ShotCategory = "Establish" | "Cinematic" | "Technical" | "Detail" | "Interior";
export type ShotPriority = "must" | "nice" | "optional";

export interface ShotDefinition {
  id: string;
  name: string;
  category: ShotCategory;
  perspective: string;
  /** Höhe in Metern (Drohne) bzw. 1.5 m (Innen-360). */
  altitudeMeters: number;
  movement: string;
  /** Sekunden; 0 = Standbild. */
  durationSec: number;
  priority: ShotPriority;
  description: string;
  /** Mapping zu unseren Property-Typen aus lib/services.ts */
  propertyTemplate: string;
  /** Stilpaket: standard, cinematic, premium, innen_360, vermessung, vorher_nachher */
  stylePackage: string;
}

const SHOT_MASTER_VERSION = "2026-05-03";

const RAW_ROWS = `
efh|standard|efh-standard-01-hero-frontal|Hero Frontal|Establish|Frontal|25|Static|0|must|Klassische Frontansicht, Haus mittig, Eingang sichtbar.
efh|standard|efh-standard-02-45deg-hero|45° Hero|Establish|45° Schräg|30|Static|0|must|Ikonische 45°-Ecke mit Vorder- und Seitenfassade.
efh|standard|efh-standard-03-garten-ruckseite|Garten / Rückseite|Establish|45° Schräg|25|Static|0|must|Rückseite mit Garten/Terrasse.
efh|standard|efh-standard-04-top-down-grundstuck|Top-Down Grundstück|Technical|Top-Down|50|Static|0|must|Senkrecht über dem Grundstück, zeigt Grundstücksgrenzen.
efh|standard|efh-standard-05-lage-kontext|Lage / Kontext|Establish|Schräg|80|Static|0|nice|Haus im Stadtviertel-Kontext.
efh|standard|efh-standard-06-detail-eingang|Detail Eingang|Detail|Frontal|10|Static|0|nice|Niedrige Höhe, Eingangsbereich/Architekturdetail.
efh|standard|efh-standard-07-sunset-abend|Sunset / Abend|Establish|45° Schräg|30|Static|0|optional|Goldene Stunde, warme Stimmung.
efh|cinematic|efh-cinematic-01-reveal-anflug|Reveal Anflug|Cinematic|Frontal|40|Push-In|8|must|Langsamer Anflug auf das Haus, Höhe sinkt.
efh|cinematic|efh-cinematic-02-hero-45deg-orbit|Hero 45° Orbit|Cinematic|45° Orbit|35|Orbit|12|must|360° Orbit um das Objekt auf mittlerer Höhe.
efh|cinematic|efh-cinematic-03-pull-out-reveal|Pull-Out Reveal|Cinematic|Frontal|20|Pull-Out + Crane Up|6|must|Aufzug rückwärts, Kontext wird sichtbar.
efh|cinematic|efh-cinematic-04-top-down-reveal|Top-Down Reveal|Technical|Top-Down|60|Crane Down|5|must|Senkrechter Sinkflug auf Dach.
efh|cinematic|efh-cinematic-05-garten-flyover|Garten Flyover|Cinematic|Schräg|15|Flyover|4|must|Niedriger Überflug Garten/Pool.
efh|cinematic|efh-cinematic-06-side-dolly|Side Dolly|Cinematic|Seite|20|Dolly|5|nice|Seitliche Fahrt entlang der Fassade.
efh|cinematic|efh-cinematic-07-detail-push-in|Detail Push-In|Detail|Frontal|25|Push-In|4|nice|Schneller Push auf Eingang/Detail.
efh|cinematic|efh-cinematic-08-umgebung-reveal|Umgebung Reveal|Cinematic|Schräg|80|Reveal|6|nice|Reveal aus Baum/Hindernis heraus.
efh|cinematic|efh-cinematic-09-sunset-orbit|Sunset Orbit|Cinematic|45° Orbit|35|Orbit (langsam)|10|optional|Goldene Stunde, langsamer Orbit.
efh|innen_360|efh-innen_360-01-360deg-eingang-diele|360° Eingang/Diele|Interior|360° Pano|1.5|Static|0|must|HDR-Panorama, Bracketing 5 Belichtungen.
efh|innen_360|efh-innen_360-02-360deg-wohnzimmer|360° Wohnzimmer|Interior|360° Pano|1.5|Static|0|must|Hauptwohnraum, mittig positioniert.
efh|innen_360|efh-innen_360-03-360deg-kuche|360° Küche|Interior|360° Pano|1.5|Static|0|must|Küche, Lichtsituation beachten.
efh|innen_360|efh-innen_360-04-360deg-schlafzimmer|360° Schlafzimmer|Interior|360° Pano|1.5|Static|0|must|Hauptschlafzimmer.
efh|innen_360|efh-innen_360-05-360deg-bad|360° Bad|Interior|360° Pano|1.5|Static|0|must|Badezimmer, Spiegel-Reflexionen prüfen.
efh|innen_360|efh-innen_360-06-hdr-wohnzimmer-wide|HDR Wohnzimmer Wide|Interior|Wide-Angle|1.6|Static|0|nice|Klassisches HDR-Foto, Wide.
efh|innen_360|efh-innen_360-07-hdr-kuche-wide|HDR Küche Wide|Interior|Wide-Angle|1.6|Static|0|nice|Klassisches HDR-Foto, Wide.
efh|innen_360|efh-innen_360-08-360deg-outdoor-terrasse|360° Outdoor Terrasse|Interior|360° Pano|1.5|Static|0|optional|Outdoor-Übergang Innen/Außen.
mfh|standard|mfh-standard-01-hero-frontal|Hero Frontal|Establish|Frontal|40|Static|0|must|Volle Fassadenhöhe sichtbar, Haus mittig.
mfh|standard|mfh-standard-02-45deg-hero|45° Hero|Establish|45° Schräg|45|Static|0|must|Zwei Fassaden in einem Bild.
mfh|standard|mfh-standard-03-ruckseite|Rückseite|Establish|45° Schräg|40|Static|0|must|Hofseite/Balkonseite.
mfh|standard|mfh-standard-04-top-down-grundstuck|Top-Down Grundstück|Technical|Top-Down|70|Static|0|must|Grundstück, Stellplätze, Außenanlage.
mfh|standard|mfh-standard-05-lage-quartier|Lage / Quartier|Establish|Schräg|100|Static|0|must|Einbettung im Wohnquartier.
mfh|standard|mfh-standard-06-stellplatze-tiefgarage|Stellplätze / Tiefgarage|Establish|45° Schräg|30|Static|0|nice|Parkmöglichkeiten sichtbar.
mfh|standard|mfh-standard-07-detail-eingang|Detail Eingang|Detail|Frontal|12|Static|0|nice|Hauseingang, Klingelanlage.
mfh|cinematic|mfh-cinematic-01-reveal-anflug|Reveal Anflug|Cinematic|Frontal|60|Push-In|8|must|Anflug auf Hauptfassade.
mfh|cinematic|mfh-cinematic-02-hero-orbit|Hero Orbit|Cinematic|45° Orbit|50|Orbit|14|must|Voller Orbit zeigt alle Fassaden.
mfh|cinematic|mfh-cinematic-03-pull-out-quartier|Pull-Out Quartier|Cinematic|Frontal|35|Pull-Out + Crane Up|7|must|Reveal des umliegenden Quartiers.
mfh|cinematic|mfh-cinematic-04-top-down-reveal|Top-Down Reveal|Technical|Top-Down|80|Crane Down|5|must|Senkrechter Sinkflug.
mfh|cinematic|mfh-cinematic-05-fassade-dolly|Fassade Dolly|Detail|Seite|25|Dolly|6|must|Parallele Fahrt entlang Fassade.
mfh|cinematic|mfh-cinematic-06-hof-innenhof|Hof / Innenhof|Cinematic|Schräg|30|Reveal|5|nice|Reveal aus dem Innenhof.
mfh|cinematic|mfh-cinematic-07-detail-eingang|Detail Eingang|Detail|Frontal|25|Push-In|4|nice|Push auf Hauseingang.
mfh|innen_360|mfh-innen_360-01-360deg-hauseingang|360° Hauseingang|Interior|360° Pano|1.5|Static|0|must|Eingangsbereich, Treppenhaus.
mfh|innen_360|mfh-innen_360-02-360deg-treppenhaus|360° Treppenhaus|Interior|360° Pano|1.5|Static|0|must|Treppenhaus, oberhalb 1. OG.
mfh|innen_360|mfh-innen_360-03-360deg-musterwohnung-wohnen|360° Musterwohnung Wohnen|Interior|360° Pano|1.5|Static|0|must|Wohnbereich Musterwohnung.
mfh|innen_360|mfh-innen_360-04-360deg-musterwohnung-kuche|360° Musterwohnung Küche|Interior|360° Pano|1.5|Static|0|must|Küche Musterwohnung.
mfh|innen_360|mfh-innen_360-05-360deg-musterwohnung-schlafen|360° Musterwohnung Schlafen|Interior|360° Pano|1.5|Static|0|must|Schlafzimmer Musterwohnung.
mfh|innen_360|mfh-innen_360-06-360deg-gemeinschaftsraum|360° Gemeinschaftsraum|Interior|360° Pano|1.5|Static|0|nice|Falls vorhanden: Waschküche, Fahrradkeller.
villa|premium|villa-premium-01-hero-frontal-foto|Hero Frontal Foto|Establish|Frontal|35|Static|0|must|Headline-Foto, Frontfassade, perfektes Licht.
villa|premium|villa-premium-02-hero-45deg-foto|Hero 45° Foto|Establish|45° Schräg|40|Static|0|must|Klassisches Premium-Hero.
villa|premium|villa-premium-03-top-down-estate|Top-Down Estate|Technical|Top-Down|80|Static|0|must|Gesamtes Anwesen, Grundstücksdimensionen.
villa|premium|villa-premium-04-pool-garten-foto|Pool / Garten Foto|Establish|45° Schräg|25|Static|0|must|Pool, Außenbereich, Lifestyle.
villa|premium|villa-premium-05-sunset-hero-foto|Sunset Hero Foto|Establish|45° Schräg|40|Static|0|must|Goldene Stunde, warme Atmosphäre.
villa|premium|villa-premium-06-lage-foto|Lage Foto|Establish|Schräg|100|Static|0|must|Einbettung in Landschaft/Lage.
villa|premium|villa-premium-07-architektur-detail|Architektur-Detail|Detail|Frontal|15|Static|0|nice|Besonderheit (Erker, Balkon, Material).
villa|premium|villa-premium-08-reveal-anflug-video|Reveal Anflug Video|Cinematic|Frontal|80|Push-In|10|must|Cineastischer Anflug, langsam.
villa|premium|villa-premium-09-hero-orbit-video|Hero Orbit Video|Cinematic|45° Orbit|40|Orbit (langsam)|18|must|Voller Orbit, langsam, Premium-Feel.
villa|premium|villa-premium-10-pool-flyover-video|Pool Flyover Video|Cinematic|Schräg|12|Flyover|6|must|Niedriger Pool-Überflug.
villa|premium|villa-premium-11-pull-out-estate-video|Pull-Out Estate Video|Cinematic|Frontal|30|Pull-Out + Crane Up|8|must|Großer Reveal des Anwesens.
villa|premium|villa-premium-12-top-down-crane-video|Top-Down Crane Video|Technical|Top-Down|100|Crane Down|6|nice|Senkrechter Sinkflug.
villa|premium|villa-premium-13-side-dolly-video|Side Dolly Video|Cinematic|Seite|20|Dolly|7|nice|Fassaden-Dolly.
villa|premium|villa-premium-14-sunset-orbit-video|Sunset Orbit Video|Cinematic|45° Orbit|40|Orbit (langsam)|12|optional|Goldene Stunde, finaler Closer.
villa|cinematic|villa-cinematic-01-reveal-aus-landschaft|Reveal aus Landschaft|Cinematic|Schräg|80|Reveal|8|must|Reveal aus Bäumen/Hügel.
villa|cinematic|villa-cinematic-02-hero-orbit|Hero Orbit|Cinematic|45° Orbit|45|Orbit (langsam)|16|must|Voller, langsamer Orbit.
villa|cinematic|villa-cinematic-03-pool-flyover|Pool Flyover|Cinematic|Schräg|10|Flyover|5|must|Niedriger Pool-/Garten-Überflug.
villa|cinematic|villa-cinematic-04-top-down-reveal|Top-Down Reveal|Technical|Top-Down|80|Crane Down|6|must|Senkrechter Sinkflug auf Anwesen.
villa|cinematic|villa-cinematic-05-pull-out-estate|Pull-Out Estate|Cinematic|Frontal|30|Pull-Out + Crane Up|8|must|Reveal Grundstücksdimensionen.
villa|cinematic|villa-cinematic-06-architektur-push-in|Architektur Push-In|Detail|Frontal|30|Push-In|5|nice|Push auf Architekturdetail.
villa|cinematic|villa-cinematic-07-side-dolly|Side Dolly|Cinematic|Seite|20|Dolly|6|nice|Fassaden-Dolly.
villa|cinematic|villa-cinematic-08-sunset-hero|Sunset Hero|Cinematic|45° Schräg|40|Static-Hold|5|nice|Statisches Hero-Bild.
gewerbe|standard|gewerbe-standard-01-hero-frontal|Hero Frontal|Establish|Frontal|50|Static|0|must|Frontfassade, Eingang/Logo sichtbar.
gewerbe|standard|gewerbe-standard-02-45deg-hero|45° Hero|Establish|45° Schräg|55|Static|0|must|Zwei Fassaden, ikonische Ansicht.
gewerbe|standard|gewerbe-standard-03-ruckseite-anlieferung|Rückseite / Anlieferung|Establish|45° Schräg|50|Static|0|must|Logistik-/Anlieferzone.
gewerbe|standard|gewerbe-standard-04-top-down-areal|Top-Down Areal|Technical|Top-Down|80|Static|0|must|Grundstück, Parkplätze, Zufahrt.
gewerbe|standard|gewerbe-standard-05-lage-anbindung|Lage / Anbindung|Establish|Schräg|120|Static|0|must|Verkehrsanbindung sichtbar.
gewerbe|standard|gewerbe-standard-06-parkplatz-stellplatze|Parkplatz / Stellplätze|Establish|45° Schräg|40|Static|0|nice|Mitarbeiter-/Kundenparkplätze.
gewerbe|standard|gewerbe-standard-07-logo-eingang-detail|Logo / Eingang Detail|Detail|Frontal|15|Static|0|nice|Branding-Detail.
gewerbe|premium|gewerbe-premium-01-hero-frontal-foto|Hero Frontal Foto|Establish|Frontal|50|Static|0|must|Headline-Foto.
gewerbe|premium|gewerbe-premium-02-hero-45deg-foto|Hero 45° Foto|Establish|45° Schräg|55|Static|0|must|Klassisches Hero.
gewerbe|premium|gewerbe-premium-03-top-down-areal|Top-Down Areal|Technical|Top-Down|90|Static|0|must|Gesamtareal.
gewerbe|premium|gewerbe-premium-04-lage-foto|Lage Foto|Establish|Schräg|130|Static|0|must|Anbindung/Standort.
gewerbe|premium|gewerbe-premium-05-eingang-logo-detail|Eingang/Logo Detail|Detail|Frontal|15|Static|0|must|Branding-Detail.
gewerbe|premium|gewerbe-premium-06-ruckseite-foto|Rückseite Foto|Establish|45° Schräg|50|Static|0|nice|Logistikseite.
gewerbe|premium|gewerbe-premium-07-sunset-hero-foto|Sunset Hero Foto|Establish|45° Schräg|55|Static|0|nice|Goldene Stunde.
gewerbe|premium|gewerbe-premium-08-reveal-anflug-video|Reveal Anflug Video|Cinematic|Frontal|90|Push-In|8|must|Cineastischer Anflug.
gewerbe|premium|gewerbe-premium-09-hero-orbit-video|Hero Orbit Video|Cinematic|45° Orbit|55|Orbit|16|must|Voller Orbit.
gewerbe|premium|gewerbe-premium-10-top-down-crane-video|Top-Down Crane Video|Technical|Top-Down|100|Crane Down|6|must|Senkrechter Sinkflug.
gewerbe|premium|gewerbe-premium-11-pull-out-areal-video|Pull-Out Areal Video|Cinematic|Frontal|40|Pull-Out + Crane Up|8|must|Reveal Standort.
gewerbe|cinematic|gewerbe-cinematic-01-reveal-anflug|Reveal Anflug|Cinematic|Frontal|90|Push-In|8|must|Anflug Hauptfassade.
gewerbe|cinematic|gewerbe-cinematic-02-hero-orbit|Hero Orbit|Cinematic|45° Orbit|55|Orbit|14|must|Voller Orbit.
gewerbe|cinematic|gewerbe-cinematic-03-top-down-reveal|Top-Down Reveal|Technical|Top-Down|80|Crane Down|5|must|Senkrechter Sinkflug.
gewerbe|cinematic|gewerbe-cinematic-04-pull-out-standort|Pull-Out Standort|Cinematic|Frontal|40|Pull-Out + Crane Up|7|must|Reveal Standortqualität.
gewerbe|cinematic|gewerbe-cinematic-05-fassade-dolly|Fassade Dolly|Detail|Seite|30|Dolly|6|must|Parallel-Fahrt.
industrie|standard|industrie-standard-01-hero-frontal|Hero Frontal|Establish|Frontal|70|Static|0|must|Hauptfassade, Eingang Verwaltung.
industrie|standard|industrie-standard-02-45deg-hero|45° Hero|Establish|45° Schräg|80|Static|0|must|Hallenkomplex-Übersicht.
industrie|standard|industrie-standard-03-top-down-areal|Top-Down Areal|Technical|Top-Down|120|Static|0|must|Gesamtes Werkgelände.
industrie|standard|industrie-standard-04-logistikseite|Logistikseite|Establish|45° Schräg|60|Static|0|must|LKW-Tore, Anlieferung.
industrie|standard|industrie-standard-05-lage-verkehr|Lage / Verkehr|Establish|Schräg|150|Static|0|must|Anbindung Autobahn/Bahn.
industrie|standard|industrie-standard-06-lager-aussenflachen|Lager-/Außenflächen|Technical|Top-Down|100|Static|0|nice|Lagerflächen, Container.
industrie|vermessung|industrie-vermessung-01-orthofoto-mosaik|Orthofoto Mosaik|Technical|Top-Down|100|Grid-Flug|0|must|Automatisierter Grid-Flug, 80% Overlap, georeferenziert.
industrie|vermessung|industrie-vermessung-02-top-down-ubersicht|Top-Down Übersicht|Technical|Top-Down|120|Static|0|must|Einzelaufnahme Gesamtareal.
industrie|vermessung|industrie-vermessung-03-schrag-vermessung-nord|Schräg-Vermessung Nord|Technical|45° Schräg|80|Static|0|nice|Für 3D-Modell, Nordseite.
industrie|vermessung|industrie-vermessung-04-schrag-vermessung-sud|Schräg-Vermessung Süd|Technical|45° Schräg|80|Static|0|nice|Für 3D-Modell, Südseite.
grundstueck|vermessung|grundstueck-vermessung-01-orthofoto-grid|Orthofoto Grid|Technical|Top-Down|100|Grid-Flug|0|must|Automatisierter Grid-Flug, georeferenziert.
grundstueck|vermessung|grundstueck-vermessung-02-top-down-ubersicht|Top-Down Übersicht|Technical|Top-Down|120|Static|0|must|Gesamtgrundstück in einem Frame.
grundstueck|vermessung|grundstueck-vermessung-03-schrag-ubersicht|Schräg-Übersicht|Technical|45° Schräg|100|Static|0|must|Topografie/Geländeprofil.
grundstueck|vermessung|grundstueck-vermessung-04-lage-erschliessung|Lage / Erschließung|Technical|Schräg|150|Static|0|nice|Zufahrt, Anschlüsse, Umgebung.
grundstueck|standard|grundstueck-standard-01-hero-schrag|Hero Schräg|Establish|45° Schräg|80|Static|0|must|Hauptansicht des Grundstücks.
grundstueck|standard|grundstueck-standard-02-top-down-ubersicht|Top-Down Übersicht|Technical|Top-Down|100|Static|0|must|Senkrecht, Grundstück komplett.
grundstueck|standard|grundstueck-standard-03-zufahrt-erschliessung|Zufahrt / Erschließung|Establish|Frontal|40|Static|0|must|Zugang sichtbar.
grundstueck|standard|grundstueck-standard-04-lage-umgebung|Lage / Umgebung|Establish|Schräg|120|Static|0|must|Einbettung Umgebung.
bauprojekt|vorher_nachher|bauprojekt-vorher_nachher-01-reference-frontal|Reference Frontal|Establish|Frontal|50|Static|0|must|Locked-Position, identische Koordinaten bei jedem Termin.
bauprojekt|vorher_nachher|bauprojekt-vorher_nachher-02-reference-45deg|Reference 45°|Establish|45° Schräg|50|Static|0|must|Locked-Position, zweite ikonische Perspektive.
bauprojekt|vorher_nachher|bauprojekt-vorher_nachher-03-top-down-baufeld|Top-Down Baufeld|Technical|Top-Down|80|Static|0|must|Locked-Position, senkrecht über Baufeld-Mittelpunkt.
bauprojekt|vorher_nachher|bauprojekt-vorher_nachher-04-reference-ruckseite|Reference Rückseite|Establish|45° Schräg|50|Static|0|must|Locked-Position, Rückseite.
bauprojekt|vorher_nachher|bauprojekt-vorher_nachher-05-detail-bauphase|Detail Bauphase|Detail|Frei|25|Static|0|nice|Aktuelle Baudetails (variabel je Termin).
bauprojekt|vermessung|bauprojekt-vermessung-01-orthofoto-grid|Orthofoto Grid|Technical|Top-Down|80|Grid-Flug|0|must|Automatisierter Grid-Flug, identische Mission.
bauprojekt|vermessung|bauprojekt-vermessung-02-top-down-ubersicht|Top-Down Übersicht|Technical|Top-Down|100|Static|0|must|Locked-Position.
bauprojekt|vermessung|bauprojekt-vermessung-03-schrag-vermessung|Schräg-Vermessung|Technical|45° Schräg|70|Static|0|must|Für 3D-Vergleich Baufortschritt.
wohnung|innen_360|wohnung-innen_360-01-360deg-eingang|360° Eingang/Flur|Interior|360° Pano|1.5|Static|0|must|HDR-Panorama Eingangsbereich.
wohnung|innen_360|wohnung-innen_360-02-360deg-wohnzimmer|360° Wohnzimmer|Interior|360° Pano|1.5|Static|0|must|Hauptwohnraum.
wohnung|innen_360|wohnung-innen_360-03-360deg-kuche|360° Küche|Interior|360° Pano|1.5|Static|0|must|Küche, Lichtsituation beachten.
wohnung|innen_360|wohnung-innen_360-04-360deg-schlafzimmer|360° Schlafzimmer|Interior|360° Pano|1.5|Static|0|must|Schlafzimmer.
wohnung|innen_360|wohnung-innen_360-05-360deg-bad|360° Bad|Interior|360° Pano|1.5|Static|0|must|Badezimmer.
wohnung|innen_360|wohnung-innen_360-06-hdr-wohnzimmer-wide|HDR Wohnzimmer Wide|Interior|Wide-Angle|1.6|Static|0|nice|Klassisches HDR-Foto.
wohnung|innen_360|wohnung-innen_360-07-360deg-balkon|360° Balkon|Interior|360° Pano|1.5|Static|0|optional|Falls Balkon vorhanden.
wohnung|standard|wohnung-standard-01-hdr-wohnzimmer|HDR Wohnzimmer|Interior|Wide-Angle|1.6|Static|0|must|HDR-Foto Wohnzimmer, Tageslicht bevorzugt.
wohnung|standard|wohnung-standard-02-hdr-kuche|HDR Küche|Interior|Wide-Angle|1.6|Static|0|must|HDR-Foto Küche.
wohnung|standard|wohnung-standard-03-hdr-schlafzimmer|HDR Schlafzimmer|Interior|Wide-Angle|1.6|Static|0|must|HDR-Foto Schlafzimmer.
wohnung|standard|wohnung-standard-04-hdr-bad|HDR Bad|Interior|Wide-Angle|1.6|Static|0|must|HDR-Foto Bad.
wohnung|standard|wohnung-standard-05-hdr-flur-eingang|HDR Flur / Eingang|Interior|Wide-Angle|1.6|Static|0|nice|HDR-Foto Eingangsbereich.
wohnung|standard|wohnung-standard-06-detail-fenster-licht|Detail Fenster / Licht|Detail|Frontal|1.6|Static|0|nice|Architekturdetail/Lichtsituation.
wohnung|standard|wohnung-standard-07-balkon-aussicht|Balkon / Aussicht|Establish|Wide-Angle|1.6|Static|0|optional|Falls vorhanden: Balkonblick.
haus|standard|haus-standard-01-hero-frontal|Hero Frontal|Establish|Frontal|25|Static|0|must|Klassische Frontansicht Haus.
haus|standard|haus-standard-02-45deg-hero|45° Hero|Establish|45° Schräg|30|Static|0|must|Ikonische 45°-Ecke.
haus|standard|haus-standard-03-garten-ruckseite|Garten / Rückseite|Establish|45° Schräg|25|Static|0|must|Rückseite mit Garten/Terrasse.
haus|standard|haus-standard-04-top-down-grundstuck|Top-Down Grundstück|Technical|Top-Down|50|Static|0|must|Grundstücksgrenzen sichtbar.
haus|standard|haus-standard-05-lage-kontext|Lage / Kontext|Establish|Schräg|80|Static|0|nice|Haus im Quartierkontext.
haus|innen_360|haus-innen_360-01-360deg-eingang|360° Eingang/Diele|Interior|360° Pano|1.5|Static|0|must|HDR-Panorama Eingang.
haus|innen_360|haus-innen_360-02-360deg-wohnzimmer|360° Wohnzimmer|Interior|360° Pano|1.5|Static|0|must|Hauptwohnraum.
haus|innen_360|haus-innen_360-03-360deg-kuche|360° Küche|Interior|360° Pano|1.5|Static|0|must|Küche.
haus|innen_360|haus-innen_360-04-360deg-schlafzimmer|360° Schlafzimmer|Interior|360° Pano|1.5|Static|0|must|Schlafzimmer.
haus|innen_360|haus-innen_360-05-360deg-bad|360° Bad|Interior|360° Pano|1.5|Static|0|must|Bad.
`;

function parseRows(): ShotDefinition[] {
  return RAW_ROWS.trim()
    .split("\n")
    .map((line) => {
      const [
        propertyTemplate,
        stylePackage,
        id,
        name,
        category,
        perspective,
        altitude,
        movement,
        duration,
        priority,
        ...rest
      ] = line.split("|");
      return {
        id,
        name,
        propertyTemplate,
        stylePackage,
        category: category as ShotCategory,
        perspective,
        altitudeMeters: Number(altitude),
        movement,
        durationSec: Number(duration),
        priority: priority as ShotPriority,
        description: rest.join("|"),
      };
    });
}

export const SHOTS: ShotDefinition[] = parseRows();
export const SHOT_LIBRARY_VERSION = SHOT_MASTER_VERSION;

const PROPERTY_TYPE_TO_TEMPLATE: Record<string, string> = {
  wohnung: "wohnung",
  haus: "haus",
  villa: "villa",
  mfh: "mfh",
  gewerbe: "gewerbe",
  industrie: "industrie",
  grundstueck: "grundstueck",
  bauprojekt: "bauprojekt",
};

const STYLE_FALLBACKS: Record<string, string[]> = {
  standard: ["standard", "innen_360"],
  cinematic: ["cinematic", "standard"],
  premium: ["premium", "cinematic", "standard"],
  innen_360: ["innen_360"],
  vermessung: ["vermessung", "standard"],
  vorher_nachher: ["vorher_nachher", "standard"],
};

export function shotsForOrder(propertyType: string, stylePackages: string[]): ShotDefinition[] {
  const template = PROPERTY_TYPE_TO_TEMPLATE[propertyType] ?? propertyType;
  const collected = new Map<string, ShotDefinition>();

  for (const style of stylePackages) {
    const fallbackChain = STYLE_FALLBACKS[style] ?? [style];
    for (const candidateStyle of fallbackChain) {
      const matching = SHOTS.filter(
        (s) => s.propertyTemplate === template && s.stylePackage === candidateStyle,
      );
      if (matching.length > 0) {
        for (const shot of matching) collected.set(shot.id, shot);
        break;
      }
    }
  }

  return Array.from(collected.values());
}
