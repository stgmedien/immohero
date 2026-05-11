// Booking, checkout, dashboard, delivery screens
const { useState: useBK, useMemo: useBM } = React;

// ============ BOOKING / CALENDAR ============
const BookingScreen = ({ theme, copy, state, setState, onNext, onBack, provider }) => {
  const [selDate, setSelDate] = useBK(provider?.availability[0] || '2026-04-22');
  const [selSlot, setSelSlot] = useBK('10:00');
  const slots = ['08:00', '10:00', '12:00', '14:00', '16:00'];

  // calendar grid
  const days = useBM(() => {
    const arr = [];
    const base = new Date('2026-04-20');
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      arr.push({ iso, d, avail: provider?.availability.includes(iso) || (i % 3 === 1 && i > 1) });
    }
    return arr;
  }, [provider]);

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '40px 28px 100px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.inkSoft, fontSize: 13, padding: 0, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IHIcon name="arrowLeft" size={14} /> Zurück zum Profil
      </button>
      <div style={{ fontSize: 13, color: theme.inkMute, marginBottom: 10 }}>Schritt 4 von 5</div>
      <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 44, margin: 0, color: theme.ink, letterSpacing: -0.8, fontWeight: 400, lineHeight: 1.05 }}>Termin mit {provider?.name.split(' ')[0]}</h1>
      <p style={{ fontSize: 15, color: theme.inkSoft, marginTop: 10, marginBottom: 36 }}>Wähle einen Tag und ein Zeitfenster. Dein·e Profi bestätigt innerhalb von {provider?.responseHr} Stunden.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <Card theme={theme} pad={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <b style={{ fontSize: 14, color: theme.ink }}>April 2026</b>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ width: 32, height: 32, borderRadius: 999, border: `1px solid ${theme.line}`, background: 'none', cursor: 'pointer', color: theme.ink }}><IHIcon name="arrowLeft" size={13} /></button>
              <button style={{ width: 32, height: 32, borderRadius: 999, border: `1px solid ${theme.line}`, background: 'none', cursor: 'pointer', color: theme.ink }}><IHIcon name="arrowRight" size={13} /></button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => <div key={d} style={{ fontSize: 11, color: theme.inkMute, textAlign: 'center', padding: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {days.map((d) => {
              const active = selDate === d.iso;
              return (
                <button key={d.iso} disabled={!d.avail} onClick={() => setSelDate(d.iso)} style={{ aspectRatio: '1/1', borderRadius: 12, border: `1.5px solid ${active ? theme.ink : 'transparent'}`, background: active ? theme.primarySoft : d.avail ? theme.bgAlt : 'transparent', color: d.avail ? theme.ink : theme.inkMute, cursor: d.avail ? 'pointer' : 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: active ? 600 : 500, position: 'relative' }}>
                  {d.d.getDate()}
                  {d.avail && <span style={{ width: 4, height: 4, borderRadius: '50%', background: theme.primary, marginTop: 2 }} />}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 24, fontSize: 12, color: theme.inkMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Zeitfenster · {new Date(selDate).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {slots.map((s) => (
              <button key={s} onClick={() => setSelSlot(s)} style={{ padding: '12px 0', borderRadius: 12, border: `1.5px solid ${selSlot === s ? theme.ink : theme.line}`, background: selSlot === s ? theme.ink : theme.surface, color: selSlot === s ? theme.bg : theme.ink, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card theme={theme} pad={18}>
            <div style={{ fontSize: 12, color: theme.inkMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Zusammenfassung</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <Avatar initials={provider?.avatar} size={40} color={theme.bg} bg={theme.primary} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>{provider?.name}</div>
                <div style={{ fontSize: 12, color: theme.inkSoft }}>{provider?.studio}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>Datum</span><b style={{ color: theme.ink }}>{new Date(selDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>Zeit</span><b style={{ color: theme.ink }}>{selSlot} – {parseInt(selSlot) + 2}:00</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>Adresse</span><b style={{ color: theme.ink, textAlign: 'right', maxWidth: 150 }}>{state.property.address || 'Köln'}</b></div>
            </div>
          </Card>
          <Card theme={theme} pad={18}>
            <div style={{ fontSize: 12, color: theme.inkMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Leistungen</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {state.mediaSel.map((id) => {
                const m = window.IH_MEDIA.find((x) => x.id === id);
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: theme.ink }}>
                      <MediaIcon id={id} size={13} /> {m.name}
                    </span>
                    <span style={{ color: theme.inkSoft }}>{m.price} €</span>
                  </div>
                );
              })}
            </div>
          </Card>
          <Btn theme={theme} full size="lg" onClick={onNext} iconRight="arrowRight">{copy.bookCta}</Btn>
        </div>
      </div>
    </div>
  );
};

// ============ CHECKOUT ============
const CheckoutScreen = ({ theme, state, onComplete, onBack, provider }) => {
  const [payMethod, setPay] = useBK('card');
  const total = state.mediaSel.reduce((a, id) => a + window.IH_MEDIA.find((m) => m.id === id).price, 0);
  const bundleInfo = state.bundleSel ? window.IH_BUNDLES.find((b) => b.id === state.bundleSel) : null;
  const discount = bundleInfo ? Math.round(total * bundleInfo.save / 100) : 0;
  const finalTotal = total - discount;
  const service = Math.round(finalTotal * 0.05);
  const grand = finalTotal + service;

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '40px 28px 100px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.inkSoft, fontSize: 13, padding: 0, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IHIcon name="arrowLeft" size={14} /> Zurück
      </button>
      <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 44, margin: 0, color: theme.ink, letterSpacing: -0.8, fontWeight: 400 }}>Buchung abschließen</h1>
      <p style={{ fontSize: 15, color: theme.inkSoft, marginTop: 10, marginBottom: 32 }}>Der Betrag wird erst nach Lieferung der Medien abgebucht.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card theme={theme} pad={22}>
            <b style={{ fontSize: 13, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>Kontakt</b>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
              <Field theme={theme} label="Vorname"><Input theme={theme} defaultValue="Mara" /></Field>
              <Field theme={theme} label="Nachname"><Input theme={theme} defaultValue="Köhler" /></Field>
              <Field theme={theme} label="E-Mail"><Input theme={theme} defaultValue="mara.koehler@example.de" /></Field>
              <Field theme={theme} label="Telefon"><Input theme={theme} defaultValue="+49 172 5531287" /></Field>
            </div>
          </Card>

          <Card theme={theme} pad={22}>
            <b style={{ fontSize: 13, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>Zahlungsart</b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14, marginBottom: 16 }}>
              {[{ k: 'card', l: 'Karte' }, { k: 'sepa', l: 'SEPA' }, { k: 'paypal', l: 'PayPal' }].map((p) => (
                <button key={p.k} onClick={() => setPay(p.k)} style={{ padding: 14, borderRadius: 12, border: `1.5px solid ${payMethod === p.k ? theme.ink : theme.line}`, background: payMethod === p.k ? theme.primarySoft : theme.surface, color: theme.ink, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>{p.l}</button>
              ))}
            </div>
            {payMethod === 'card' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px', gap: 12 }}>
                <Field theme={theme} label="Kartennummer"><Input theme={theme} placeholder="4242 4242 4242 4242" /></Field>
                <Field theme={theme} label="Ablauf"><Input theme={theme} placeholder="04/28" /></Field>
                <Field theme={theme} label="CVC"><Input theme={theme} placeholder="•••" /></Field>
              </div>
            )}
          </Card>

          <div style={{ padding: 14, borderRadius: 12, background: theme.primarySoft, fontSize: 13, color: theme.ink, display: 'flex', gap: 10 }}>
            <IHIcon name="shield" size={16} style={{ color: theme.primary, flexShrink: 0, marginTop: 1 }} />
            <span><b>Käuferschutz aktiv.</b> Keine Abbuchung, falls der Termin nicht zustande kommt oder die Lieferung nicht passt.</span>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
          <Card theme={theme} pad={22}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${theme.line}` }}>
              <Avatar initials={provider?.avatar} size={36} color={theme.bg} bg={theme.primary} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink }}>{provider?.name}</div>
                <div style={{ fontSize: 11.5, color: theme.inkSoft }}>22. Apr 2026 · 10:00</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              {state.mediaSel.map((id) => {
                const m = window.IH_MEDIA.find((x) => x.id === id);
                return <div key={id} style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>{m.name}</span><span>{m.price} €</span></div>;
              })}
            </div>
            <div style={{ height: 1, background: theme.line, margin: '14px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>Zwischensumme</span><span>{total} €</span></div>
              {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.accent }}><span>Paket-Rabatt</span><span>–{discount} €</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>Servicegebühr</span><span>{service} €</span></div>
            </div>
            <div style={{ height: 1, background: theme.line, margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <b style={{ fontSize: 14, color: theme.ink }}>Gesamt</b>
              <b style={{ fontSize: 24, color: theme.ink, letterSpacing: -0.3 }}>{grand} €</b>
            </div>
            <Btn theme={theme} full size="lg" onClick={onComplete} style={{ marginTop: 18 }}>Jetzt verbindlich buchen</Btn>
            <div style={{ fontSize: 11, color: theme.inkMute, textAlign: 'center', marginTop: 10 }}>Mit Klick akzeptierst du die AGB & Datenschutzrichtlinien.</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============ DASHBOARD / STATUS ============
const DashboardScreen = ({ theme, state, provider, onViewDelivery }) => {
  const steps = [
    { k: 'booked', l: 'Buchung bestätigt', d: '20. Apr, 14:32', done: true, icon: 'check' },
    { k: 'prep', l: 'Vorbereitung', d: 'Checkliste gesendet', done: true, icon: 'check' },
    { k: 'shoot', l: 'Termin vor Ort', d: '22. Apr, 10:00', done: false, active: true, icon: 'camera' },
    { k: 'edit', l: 'Bearbeitung', d: 'innerhalb 48 Std.', done: false, icon: 'sparkle' },
    { k: 'deliver', l: 'Lieferung', d: 'ca. 24. Apr', done: false, icon: 'download' },
  ];
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 28px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, color: theme.inkMute, marginBottom: 6 }}>Buchung #IH-4821</div>
          <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 44, margin: 0, color: theme.ink, letterSpacing: -0.8, fontWeight: 400 }}>Alles unterwegs, Mara.</h1>
          <p style={{ fontSize: 15, color: theme.inkSoft, marginTop: 10 }}>Dein Termin mit {provider?.name} findet übermorgen um 10:00 statt.</p>
        </div>
        <Btn theme={theme} variant="secondary" onClick={onViewDelivery} iconRight="arrowRight">Lieferung ansehen (Demo)</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Timeline */}
          <Card theme={theme} pad={24}>
            <b style={{ fontSize: 13, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>Status</b>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {steps.map((s, i) => (
                <div key={s.k} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: s.done ? theme.primary : s.active ? theme.accent : theme.bgAlt, color: s.done || s.active ? '#fff' : theme.inkMute, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IHIcon name={s.icon} size={14} stroke={2.2} />
                    </div>
                    {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: s.done ? theme.primary : theme.line, minHeight: 30 }} />}
                  </div>
                  <div style={{ paddingBottom: 18, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: s.active ? 600 : 500, color: s.done || s.active ? theme.ink : theme.inkMute }}>{s.l}</div>
                    <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 2 }}>{s.d}</div>
                    {s.active && (
                      <div style={{ marginTop: 10, padding: 12, background: theme.accentSoft, borderRadius: 10, fontSize: 12.5, color: theme.ink, display: 'flex', gap: 8 }}>
                        <IHIcon name="spark" size={14} style={{ color: theme.accent, flexShrink: 0, marginTop: 1 }} />
                        <span><b>Checkliste:</b> Vorhänge auf, Licht an, persönliche Gegenstände verstauen. Wir haben dir einen Leitfaden per E-Mail geschickt.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Messages */}
          <Card theme={theme} pad={22}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <b style={{ fontSize: 13, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>Nachrichten mit {provider?.name.split(' ')[0]}</b>
              <span style={{ fontSize: 11.5, padding: '3px 8px', background: theme.primarySoft, color: theme.primary, borderRadius: 999 }}>1 neu</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Avatar initials={provider?.avatar} size={30} color={theme.bg} bg={theme.primary} />
                <div style={{ maxWidth: '75%', padding: '10px 14px', background: theme.bgAlt, borderRadius: 14, borderTopLeftRadius: 4, fontSize: 13.5, color: theme.ink, lineHeight: 1.45 }}>
                  Hallo Mara, freue mich auf Mittwoch! Könntest du die Balkontür entriegeln, falls ich ein Luftbild vom Innenhof brauche?
                  <div style={{ fontSize: 10.5, color: theme.inkMute, marginTop: 4 }}>vor 2 Stunden</div>
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <input placeholder="Antwort schreiben…" style={{ flex: 1, height: 40, padding: '0 14px', borderRadius: 999, border: `1px solid ${theme.line}`, background: theme.surface, color: theme.ink, fontSize: 13, outline: 'none' }} />
                <button style={{ width: 40, height: 40, borderRadius: '50%', background: theme.ink, color: theme.bg, border: 'none', cursor: 'pointer' }}><IHIcon name="arrowRight" size={16} /></button>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card theme={theme} pad={20}>
            <b style={{ fontSize: 13, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>Objekt</b>
            <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden' }}>
              <Placeholder ratio="16/10" tone="green" label="Objekt · Lindenstraße 14" />
            </div>
            <div style={{ marginTop: 12, fontSize: 13.5, color: theme.ink, fontWeight: 500 }}>{state.property.address || 'Lindenstraße 14, 50674 Köln'}</div>
            <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 3 }}>{state.property.type === 'house' ? 'Haus' : 'Wohnung'} · {state.property.size || '112 m²'} · {state.property.rooms || 4} Zimmer</div>
          </Card>
          <Card theme={theme} pad={20}>
            <b style={{ fontSize: 13, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>Buchung</b>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>Anbieter</span><b style={{ color: theme.ink }}>{provider?.name}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>Termin</span><b style={{ color: theme.ink }}>Mi, 22. Apr · 10:00</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>Lieferung</span><b style={{ color: theme.ink }}>bis 24. Apr</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.inkSoft }}><span>Betrag</span><b style={{ color: theme.ink }}>387 €</b></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============ DELIVERY / REVIEW ============
const DeliveryScreen = ({ theme, provider, onBack, onApprove }) => {
  const [tab, setTab] = useBK('photos');
  const [approved, setApproved] = useBK(false);
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 28px 100px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.inkSoft, fontSize: 13, padding: 0, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IHIcon name="arrowLeft" size={14} /> Zurück zum Dashboard
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 8px', background: theme.primarySoft, color: theme.primary, borderRadius: 999, fontSize: 12, fontWeight: 500, marginBottom: 10 }}>
            <IHIcon name="check" size={13} stroke={2.4} /> Geliefert · 24. Apr 2026, 09:14
          </div>
          <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 44, margin: 0, color: theme.ink, letterSpacing: -0.8, fontWeight: 400 }}>Deine Medien sind da.</h1>
          <p style={{ fontSize: 15, color: theme.inkSoft, marginTop: 8 }}>32 Fotos · 2D-Grundriss · 8 Drohnenaufnahmen · Exposé-Text</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn theme={theme} variant="secondary" icon="download">Alle herunterladen (ZIP)</Btn>
          {!approved ? <Btn theme={theme} onClick={() => setApproved(true)} icon="check">Freigeben</Btn> : <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: theme.primary, color: theme.primaryInk, borderRadius: 999, fontSize: 13.5, fontWeight: 500 }}><IHIcon name="check" size={15} stroke={2.4} /> Freigegeben</div>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: `1px solid ${theme.line}` }}>
        {[
          { k: 'photos', l: 'Fotos', n: 32 },
          { k: 'drone', l: 'Drohne', n: 8 },
          { k: 'plan', l: 'Grundriss', n: 1 },
          { k: 'copy', l: 'Exposé', n: 1 },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? theme.ink : 'transparent'}`, color: tab === t.k ? theme.ink : theme.inkSoft, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', marginBottom: -1 }}>
            {t.l} <span style={{ color: theme.inkMute, fontWeight: 400 }}>{t.n}</span>
          </button>
        ))}
      </div>

      {tab === 'photos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const tones = ['warm', 'green', 'dusk', 'terra', 'sky', 'cool'];
            return <div key={i} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}><Placeholder ratio="1/1" tone={tones[i % tones.length]} label={`IMG_${String(i + 1).padStart(2, '0')}`} /></div>;
          })}
        </div>
      )}
      {tab === 'drone' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 14, overflow: 'hidden' }}><Placeholder ratio="16/9" tone="sky" label={`drone_${i + 1}`} /></div>
          ))}
        </div>
      )}
      {tab === 'plan' && (
        <div style={{ borderRadius: 14, overflow: 'hidden', maxWidth: 720 }}><Placeholder ratio="4/3" tone="warm" label="Grundriss OG · 112 m²" /></div>
      )}
      {tab === 'copy' && (
        <Card theme={theme} pad={28} style={{ maxWidth: 720 }}>
          <b style={{ fontSize: 12, color: theme.inkMute, textTransform: 'uppercase', letterSpacing: 0.8 }}>Exposé-Text</b>
          <h2 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, color: theme.ink, marginTop: 8, marginBottom: 14, letterSpacing: -0.3, fontWeight: 400 }}>Lichtdurchfluteter Altbau im Belgischen Viertel</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: theme.inkSoft, textWrap: 'pretty' }}>
            Gepflegte 4-Zimmer-Wohnung mit 112 m² in einer der begehrtesten Lagen Kölns. Eichendielen, Stuck, zwei Balkone zum begrünten Innenhof. Großzügiger Wohn-/Essbereich mit offener Küche, zwei Schlafzimmer, separater Arbeitsbereich. Baujahr 1904, 2021 energetisch saniert. Fußläufig zu Aachener Weiher, Rudolfplatz und Brüsseler Platz.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn theme={theme} variant="secondary" size="sm" icon="text">Ändern</Btn>
            <Btn theme={theme} variant="secondary" size="sm" icon="download">Kopieren</Btn>
          </div>
        </Card>
      )}

      {approved && (
        <Card theme={theme} pad={22} style={{ marginTop: 24, background: theme.primarySoft, border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <IHIcon name="heart" size={22} style={{ color: theme.primary, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 14, color: theme.ink }}>Bewertung für {provider?.name}?</b>
              <div style={{ fontSize: 13, color: theme.inkSoft }}>Hilf anderen Verkäufer·innen mit einer kurzen Rückmeldung.</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <IHIcon key={s} name="star" size={22} stroke={1.6} style={{ color: theme.accent, fill: theme.accent }} />
              ))}
            </div>
            <Btn theme={theme} size="sm">Bewerten</Btn>
          </div>
        </Card>
      )}
    </div>
  );
};

Object.assign(window, { BookingScreen, CheckoutScreen, DashboardScreen, DeliveryScreen });
