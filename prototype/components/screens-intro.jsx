// Screens: Home/Onboarding, Media package selection
const { useState: useSt1 } = React;

// ============ HOME / INTRO ============
const HomeScreen = ({ theme, copy, onStart }) => (
  <div style={{ maxWidth: 1280, margin: '0 auto', padding: '70px 28px 100px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 60 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 60, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px 5px 8px', background: theme.primarySoft, color: theme.primary, borderRadius: 999, fontSize: 12, fontWeight: 500, marginBottom: 24 }}>
            <IHIcon name="sparkle" size={13} /> Für private Verkäufer·innen
          </div>
          <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 1.02, margin: 0, color: theme.ink, letterSpacing: -1.4, fontWeight: 400, textWrap: 'balance' }}>
            {copy.heroTitle}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: theme.inkSoft, marginTop: 24, maxWidth: 520, textWrap: 'pretty' }}>
            {copy.heroSub}
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 36, alignItems: 'center' }}>
            <Btn theme={theme} size="lg" onClick={onStart} iconRight="arrowRight">{copy.ctaStart}</Btn>
            <span style={{ fontSize: 13, color: theme.inkMute }}>Kostenlos starten · Zahlung erst nach Buchung</span>
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 52, flexWrap: 'wrap' }}>
            {[
              { n: '1.240+', l: 'geprüfte Anbieter' },
              { n: '96 %', l: 'pünktlich geliefert' },
              { n: '< 24h', l: 'Durchschnitt bis Termin' },
            ].map((s) => (
              <div key={s.l}>
                <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 34, color: theme.ink, letterSpacing: -0.5 }}>{s.n}</div>
                <div style={{ fontSize: 12.5, color: theme.inkSoft }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', border: `1px solid ${theme.line}` }}>
            <Placeholder ratio="4/5" tone="green" label="Hausfassade" />
          </div>
          <div style={{ position: 'absolute', bottom: -24, left: -24, background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,.08)', width: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <MatchRing score={96} size={42} stroke={3.5} color={theme.primary} bg={theme.primarySoft} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink }}>Top-Treffer</div>
                <div style={{ fontSize: 11.5, color: theme.inkSoft }}>Lea H. · 4,2 km</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: theme.inkSoft, lineHeight: 1.4 }}>Altbau-Spezialistin · Termin diese Woche · Preis im Budget</div>
          </div>
          <div style={{ position: 'absolute', top: -18, right: -18, background: theme.accent, color: '#fff', padding: '10px 14px', borderRadius: 14, fontSize: 12.5, fontWeight: 500, transform: 'rotate(3deg)', boxShadow: '0 8px 20px rgba(194,98,62,.3)' }}>
            <IHIcon name="spark" size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
            3 Matches in 0,4 Sek.
          </div>
        </div>
      </div>

      {/* How it works */}
      <div>
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: theme.inkMute, marginBottom: 20 }}>So läuft's</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { n: '01', t: 'Objekt anlegen', d: 'Adresse, Typ, Größe – in 2 Minuten erfasst.', i: 'home' },
            { n: '02', t: 'Medien auswählen', d: 'Einzeln oder als Paket mit Rabatt.', i: 'package' },
            { n: '03', t: 'Anbieter matchen', d: 'Wir finden die 3 besten für dein Objekt.', i: 'sparkle' },
            { n: '04', t: 'Buchen & empfangen', d: 'Termin fix, Medien in 48 Std. im Postfach.', i: 'download' },
          ].map((s) => (
            <div key={s.n} style={{ padding: 22, border: `1px solid ${theme.line}`, borderRadius: 18, background: theme.surface }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, color: theme.primary, letterSpacing: -0.5 }}>{s.n}</span>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: theme.primarySoft, color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IHIcon name={s.i} size={17} />
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink, marginBottom: 4 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ============ ONBOARDING ============
const OnboardingScreen = ({ theme, copy, state, setState, onNext }) => {
  const update = (patch) => setState({ property: { ...state.property, ...patch } });
  const p = state.property;
  const canContinue = p.type && p.rooms && p.size && p.address;
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 28px 100px' }}>
      <div style={{ fontSize: 13, color: theme.inkMute, marginBottom: 10 }}>Schritt 1 von 5</div>
      <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 46, margin: 0, color: theme.ink, letterSpacing: -0.8, fontWeight: 400, lineHeight: 1.05 }}>{copy.onboardTitle}</h1>
      <p style={{ fontSize: 16, color: theme.inkSoft, marginTop: 12, marginBottom: 36 }}>{copy.onboardSub}</p>

      <Card theme={theme} pad={28} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: theme.inkSoft, marginBottom: 10 }}>Objekttyp</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { k: 'apartment', l: 'Wohnung' },
              { k: 'house', l: 'Haus' },
              { k: 'multi', l: 'Mehrfamilienhaus' },
              { k: 'plot', l: 'Grundstück' },
            ].map((t) => (
              <button key={t.k} onClick={() => update({ type: t.k })} style={{ padding: '14px 12px', borderRadius: 12, border: `1.5px solid ${p.type === t.k ? theme.ink : theme.line}`, background: p.type === t.k ? theme.primarySoft : theme.surface, color: theme.ink, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <IHIcon name={t.k === 'apartment' ? 'package' : t.k === 'house' ? 'home' : t.k === 'multi' ? 'home' : 'plan'} size={18} />
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14 }}>
          <Field theme={theme} label="Adresse">
            <Input theme={theme} value={p.address || ''} onChange={(e) => update({ address: e.target.value })} placeholder="Lindenstraße 14, 50674 Köln" />
          </Field>
          <Field theme={theme} label="Wohnfläche">
            <Input theme={theme} value={p.size || ''} onChange={(e) => update({ size: e.target.value })} placeholder="112 m²" />
          </Field>
          <Field theme={theme} label="Zimmer">
            <Select theme={theme} value={p.rooms || ''} onChange={(e) => update({ rooms: e.target.value })}>
              <option value="">–</option>
              {['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5+'].map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <Field theme={theme} label="Baujahr">
            <Input theme={theme} value={p.year || ''} onChange={(e) => update({ year: e.target.value })} placeholder="1978" />
          </Field>
          <Field theme={theme} label="Stil">
            <Select theme={theme} value={p.style || ''} onChange={(e) => update({ style: e.target.value })}>
              <option value="">–</option>
              <option>Altbau</option><option>Nachkriegsbau</option><option>Modern</option><option>Neubau</option><option>Loft</option>
            </Select>
          </Field>
          <Field theme={theme} label="Zustand">
            <Select theme={theme} value={p.condition || ''} onChange={(e) => update({ condition: e.target.value })}>
              <option value="">–</option>
              <option>Neuwertig</option><option>Gepflegt</option><option>Modernisiert</option><option>Sanierungsbedürftig</option>
            </Select>
          </Field>
        </div>

        <Field theme={theme} label="Geplanter Vermarktungsstart" hint="Wir priorisieren Anbieter mit freien Terminen vor diesem Datum.">
          <Input theme={theme} type="date" value={p.startDate || '2026-05-05'} onChange={(e) => update({ startDate: e.target.value })} />
        </Field>

        <div style={{ padding: 16, borderRadius: 14, background: theme.primarySoft, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <IHIcon name="sparkle" size={18} style={{ color: theme.primary, marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: theme.ink, lineHeight: 1.5 }}>
            <b>KI-Tipp:</b> Für Altbauten empfehlen wir Fotografie + 2D-Grundriss + Drohne. Das erhöht die Klickrate im Exposé nachweislich um 38 %.
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, alignItems: 'center' }}>
        <span style={{ fontSize: 12.5, color: theme.inkMute }}>Deine Daten bleiben privat und werden nur mit gebuchten Anbietern geteilt.</span>
        <Btn theme={theme} size="lg" onClick={onNext} iconRight="arrowRight" disabled={!canContinue}>Weiter zu den Medien</Btn>
      </div>
    </div>
  );
};

// ============ MEDIA / PACKAGE ============
const MediaIcon = ({ id, size = 20 }) => {
  const map = { photo: 'camera', drone: 'drone', tour360: 'sphere', video: 'play', plan2d: 'plan', plan3d: 'cube', matterport: 'scan', energy: 'bolt', copy: 'text' };
  return <IHIcon name={map[id] || 'package'} size={size} />;
};

const MediaScreen = ({ theme, copy, state, setState, onNext, onBack }) => {
  const toggle = (id) => {
    const s = new Set(state.mediaSel);
    s.has(id) ? s.delete(id) : s.add(id);
    setState({ mediaSel: [...s], bundleSel: null });
  };
  const pickBundle = (b) => setState({ bundleSel: b.id, mediaSel: b.items });
  const total = state.mediaSel.reduce((a, id) => a + (window.IH_MEDIA.find((m) => m.id === id)?.price || 0), 0);
  const bundleInfo = state.bundleSel ? window.IH_BUNDLES.find((b) => b.id === state.bundleSel) : null;
  const discount = bundleInfo ? Math.round(total * bundleInfo.save / 100) : 0;
  const finalTotal = total - discount;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 28px 120px' }}>
      <div style={{ fontSize: 13, color: theme.inkMute, marginBottom: 10 }}>Schritt 2 von 5</div>
      <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 46, margin: 0, color: theme.ink, letterSpacing: -0.8, fontWeight: 400, lineHeight: 1.05 }}>Welche Medien brauchst du?</h1>
      <p style={{ fontSize: 16, color: theme.inkSoft, marginTop: 12, marginBottom: 36 }}>Kombiniere einzelne Leistungen oder spare mit einem Paket.</p>

      {/* Bundles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 40 }}>
        {window.IH_BUNDLES.map((b) => {
          const active = state.bundleSel === b.id;
          const bTotal = b.items.reduce((a, id) => a + window.IH_MEDIA.find((m) => m.id === id).price, 0);
          const bFinal = Math.round(bTotal * (1 - b.save / 100));
          return (
            <button key={b.id} onClick={() => pickBundle(b)} style={{ textAlign: 'left', padding: 22, borderRadius: 18, border: `1.5px solid ${active ? theme.ink : b.recommended ? theme.primary : theme.line}`, background: active ? theme.primarySoft : theme.surface, cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {b.recommended && (
                <span style={{ position: 'absolute', top: -10, left: 20, background: theme.primary, color: theme.primaryInk, fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 500, letterSpacing: 0.3 }}>Empfehlung</span>
              )}
              <div>
                <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, color: theme.ink, letterSpacing: -0.3 }}>{b.name}</div>
                <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 2 }}>{b.tagline}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {b.items.map((id) => {
                  const m = window.IH_MEDIA.find((x) => x.id === id);
                  return (
                    <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, padding: '4px 9px', borderRadius: 999, background: theme.bgAlt, color: theme.ink }}>
                      <MediaIcon id={id} size={12} /> {m.name}
                    </span>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: theme.ink }}>{bFinal} €</div>
                <div style={{ fontSize: 13, color: theme.inkMute, textDecoration: 'line-through' }}>{bTotal} €</div>
                <div style={{ marginLeft: 'auto', fontSize: 11.5, padding: '3px 9px', background: theme.accent, color: '#fff', borderRadius: 999, fontWeight: 500 }}>–{b.save}%</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: theme.inkMute, marginBottom: 14 }}>Einzelne Leistungen</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {window.IH_MEDIA.map((m) => {
          const on = state.mediaSel.includes(m.id);
          return (
            <button key={m.id} onClick={() => toggle(m.id)} style={{ textAlign: 'left', padding: 16, borderRadius: 14, border: `1.5px solid ${on ? theme.ink : theme.line}`, background: on ? theme.surface : theme.surface, cursor: 'pointer', display: 'flex', gap: 13, alignItems: 'flex-start', position: 'relative' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: on ? theme.primary : theme.bgAlt, color: on ? theme.primaryInk : theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MediaIcon id={m.id} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>{m.name}</span>
                  {m.popular && <span style={{ fontSize: 10, padding: '2px 6px', background: theme.accentSoft, color: theme.accent, borderRadius: 4, fontWeight: 500 }}>beliebt</span>}
                </div>
                <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 3, lineHeight: 1.4 }}>{m.desc}</div>
                <div style={{ fontSize: 12.5, color: theme.ink, marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <b>ab {m.price} €</b><span style={{ color: theme.inkMute }}>·</span><span style={{ color: theme.inkSoft }}>{m.duration}</span>
                </div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${on ? theme.ink : theme.line}`, background: on ? theme.ink : 'transparent', color: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {on && <IHIcon name="check" size={13} stroke={2.5} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sticky summary */}
      <div style={{ position: 'sticky', bottom: 20, marginTop: 36, padding: 18, background: theme.ink, color: theme.bg, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 16px 40px rgba(0,0,0,.18)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>{state.mediaSel.length} Leistung{state.mediaSel.length === 1 ? '' : 'en'}{bundleInfo ? ` · ${bundleInfo.name}-Paket` : ''}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 26, fontWeight: 600 }}>{finalTotal} €</span>
            {discount > 0 && <><span style={{ fontSize: 14, opacity: 0.5, textDecoration: 'line-through' }}>{total} €</span><span style={{ fontSize: 12, padding: '2px 8px', background: theme.accent, borderRadius: 999 }}>du sparst {discount} €</span></>}
          </div>
        </div>
        <Btn theme={{ ...theme, ink: theme.bg, bg: theme.ink }} variant="secondary" onClick={onBack} icon="arrowLeft" style={{ borderColor: 'rgba(255,255,255,.2)', color: theme.bg }}>Zurück</Btn>
        <Btn theme={theme} size="lg" onClick={onNext} disabled={state.mediaSel.length === 0} iconRight="arrowRight" style={{ background: theme.bg, color: theme.ink }}>Anbieter finden</Btn>
      </div>
    </div>
  );
};

Object.assign(window, { HomeScreen, OnboardingScreen, MediaScreen, MediaIcon });
