// Hero flow: matching results with intelligent scoring + comparison + provider profile
const { useState: useMS, useEffect: useME, useMemo: useMM } = React;

const ScoreDisplay = ({ score, style, theme, size = 'md' }) => {
  if (style === 'ring') {
    return <MatchRing score={score} size={size === 'lg' ? 68 : 52} stroke={4} color={theme.primary} bg={theme.primarySoft} />;
  }
  if (style === 'badge') {
    return <MatchBadge score={score} color={theme.primary} inkOn={theme.primaryInk} />;
  }
  return <MatchBar score={score} color={theme.primary} bg={theme.primarySoft} width={size === 'lg' ? 120 : 90} />;
};

// ============ MATCHING RESULTS ============
const MatchingScreen = ({ theme, copy, state, setState, onSelect, onBack, scoreStyle }) => {
  const [sort, setSort] = useMS('match');
  const [filters, setFilters] = useMS({ maxDist: 50, spec: 'all' });
  const [computing, setComputing] = useMS(true);

  useME(() => {
    setComputing(true);
    const t = setTimeout(() => setComputing(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const providers = useMM(() => {
    let list = [...window.IH_PROVIDERS];
    list = list.filter((p) => p.distance <= filters.maxDist);
    if (filters.spec !== 'all') list = list.filter((p) => p.specialties.some((s) => s.toLowerCase().includes(filters.spec.toLowerCase())));
    list.sort((a, b) => sort === 'match' ? b.matchScore - a.matchScore : sort === 'price' ? a.price - b.price : sort === 'distance' ? a.distance - b.distance : b.rating - a.rating);
    return list;
  }, [sort, filters]);

  const top3 = providers.slice(0, 3);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 28px 100px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.inkSoft, fontSize: 13, padding: 0, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IHIcon name="arrowLeft" size={14} /> Zurück zu den Medien
      </button>
      <div style={{ fontSize: 13, color: theme.inkMute, marginBottom: 10 }}>Schritt 3 von 5</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 46, margin: 0, color: theme.ink, letterSpacing: -0.8, fontWeight: 400, lineHeight: 1.05 }}>{copy.matchLead}</h1>
          <p style={{ fontSize: 15, color: theme.inkSoft, marginTop: 10 }}>{copy.matchSub}</p>
        </div>
        {!computing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: theme.primarySoft, color: theme.primary, borderRadius: 999, fontSize: 12.5, fontWeight: 500 }}>
            <IHIcon name="spark" size={14} />
            {providers.length} Anbieter · sortiert in 0,4 Sek.
          </div>
        )}
      </div>

      {computing ? <MatchingLoader theme={theme} /> : (
        <>
          {/* Top 3 compare */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: theme.inkMute, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IHIcon name="sparkle" size={13} /> Top 3 für dein Objekt
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {top3.map((p, i) => (
                <TopCard key={p.id} p={p} theme={theme} rank={i + 1} scoreStyle={scoreStyle} onSelect={() => onSelect(p)} />
              ))}
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '14px 0', borderTop: `1px solid ${theme.line}`, borderBottom: `1px solid ${theme.line}`, marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: theme.inkSoft, marginRight: 4 }}>Sortieren:</span>
            <Segmented theme={theme} value={sort} onChange={setSort} options={[{ value: 'match', label: 'Match' }, { value: 'price', label: 'Preis' }, { value: 'distance', label: 'Nähe' }, { value: 'rating', label: 'Bewertung' }]} />
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, color: theme.inkSoft }}>Radius ≤ {filters.maxDist} km</span>
              <input type="range" min="5" max="60" step="5" value={filters.maxDist} onChange={(e) => setFilters({ ...filters, maxDist: +e.target.value })} style={{ accentColor: theme.primary, width: 120 }} />
            </div>
          </div>

          {/* Full list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {providers.map((p) => (
              <ProviderRow key={p.id} p={p} theme={theme} scoreStyle={scoreStyle} onSelect={() => onSelect(p)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const MatchingLoader = ({ theme }) => {
  const [step, setStep] = useMS(0);
  const steps = ['PLZ-Umkreis prüfen', 'Spezialisierungen abgleichen', 'Verfügbarkeiten scannen', 'Preisfenster berechnen', 'Portfolio-Fit bewerten'];
  useME(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 260);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, border: `1px solid ${theme.line}`, borderRadius: 22, background: theme.surface }}>
      <MatchRing score={Math.round((step + 1) / steps.length * 100)} size={80} stroke={5} color={theme.primary} bg={theme.primarySoft} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, color: theme.ink, letterSpacing: -0.4 }}>Wir suchen gerade die besten Profis für dich…</div>
        <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 8 }}>Gewichtung: Nähe 30 % · Spezialisierung 30 % · Verfügbarkeit 20 % · Preis 15 % · Bewertung 5 %</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 340 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: i <= step ? theme.ink : theme.inkMute, transition: 'color .2s' }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: i <= step ? theme.primary : 'transparent', border: i <= step ? 'none' : `1.5px solid ${theme.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primaryInk }}>
              {i <= step && <IHIcon name="check" size={10} stroke={2.5} />}
            </span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

const TopCard = ({ p, theme, rank, scoreStyle, onSelect }) => (
  <div style={{ padding: 18, borderRadius: 20, border: `1px solid ${rank === 1 ? theme.ink : theme.line}`, background: theme.surface, position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
    {rank === 1 && (
      <span style={{ position: 'absolute', top: -10, left: 18, background: theme.ink, color: theme.bg, fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 500, letterSpacing: 0.3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <IHIcon name="sparkle" size={11} /> Beste Passung
      </span>
    )}
    <div style={{ borderRadius: 12, overflow: 'hidden' }}>
      <Placeholder ratio="4/3" tone={rank === 1 ? 'green' : rank === 2 ? 'warm' : 'dusk'} label={`${p.studio} · portfolio`} />
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: theme.ink }}>{p.name}</div>
        <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 2 }}>{p.studio} · {p.location}</div>
      </div>
      <ScoreDisplay score={p.matchScore} style={scoreStyle} theme={theme} />
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {p.specialties.slice(0, 3).map((s) => (
        <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: theme.bgAlt, color: theme.ink }}>{s}</span>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: theme.inkSoft, padding: '10px 0', borderTop: `1px solid ${theme.line}`, borderBottom: `1px solid ${theme.line}` }}>
      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><IHIcon name="pin" size={12} /> {p.distance} km</span>
      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><IHIcon name="clock" size={12} /> ~{p.responseHr} Std.</span>
      <Rating value={p.rating} count={p.reviews} theme={theme} small />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 11, color: theme.inkMute }}>ab</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: theme.ink }}>{p.price} €</div>
      </div>
      <Btn theme={theme} onClick={onSelect} variant={rank === 1 ? 'primary' : 'secondary'} iconRight="arrowRight">Profil</Btn>
    </div>
  </div>
);

const ProviderRow = ({ p, theme, scoreStyle, onSelect }) => (
  <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${theme.line}`, background: theme.surface, display: 'grid', gridTemplateColumns: '56px 1fr auto auto', gap: 16, alignItems: 'center' }}>
    <Avatar initials={p.avatar} size={48} color={theme.bg} bg={theme.primary} />
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>{p.name}</span>
        <span style={{ fontSize: 12.5, color: theme.inkSoft }}>{p.studio}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 12.5, color: theme.inkSoft, marginTop: 4, flexWrap: 'wrap' }}>
        <span><IHIcon name="pin" size={11} style={{ verticalAlign: -1 }} /> {p.location} · {p.distance} km</span>
        <Rating value={p.rating} count={p.reviews} theme={theme} small />
        <span><IHIcon name="clock" size={11} style={{ verticalAlign: -1 }} /> antwortet in ~{p.responseHr} Std.</span>
        <span>{p.specialties.slice(0, 2).join(' · ')}</span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: theme.inkMute, textAlign: 'right' }}>ab</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: theme.ink }}>{p.price} €</div>
      </div>
      <ScoreDisplay score={p.matchScore} style={scoreStyle} theme={theme} />
    </div>
    <Btn theme={theme} size="sm" variant="secondary" onClick={onSelect}>Ansehen</Btn>
  </div>
);

// ============ PROVIDER PROFILE ============
const ProviderProfile = ({ p, theme, state, onBook, onBack, scoreStyle }) => {
  if (!p) return null;
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 28px 100px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.inkSoft, fontSize: 13, padding: 0, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IHIcon name="arrowLeft" size={14} /> Zurück zu den Ergebnissen
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 36 }}>
        <div>
          {/* Header */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <Avatar initials={p.avatar} size={72} color={theme.bg} bg={theme.primary} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 38, margin: 0, color: theme.ink, letterSpacing: -0.6, fontWeight: 400, lineHeight: 1 }}>{p.name}</h1>
                <ScoreDisplay score={p.matchScore} style={scoreStyle} theme={theme} />
              </div>
              <div style={{ fontSize: 14, color: theme.inkSoft, marginTop: 6 }}>{p.studio} · {p.location} · {p.distance} km</div>
            </div>
          </div>

          {/* Portfolio */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
            {['warm', 'green', 'dusk', 'terra'].map((t, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden' }}>
                <Placeholder ratio="1/1" tone={t} label={`work ${i + 1}`} />
              </div>
            ))}
          </div>

          {/* Match reasoning */}
          <Card theme={theme} pad={22} style={{ marginBottom: 20, background: theme.primarySoft, border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <IHIcon name="sparkle" size={15} style={{ color: theme.primary }} />
              <b style={{ fontSize: 13.5, color: theme.primary, textTransform: 'uppercase', letterSpacing: 0.8 }}>Warum diese·r Profi?</b>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {p.matchReasons.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: theme.surface, borderRadius: 10 }}>
                  <IHIcon name="check" size={14} style={{ color: theme.primary, flexShrink: 0 }} stroke={2.4} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: theme.ink }}>{r.label}</div>
                  </div>
                  <span style={{ fontSize: 10.5, color: theme.inkMute, textTransform: 'uppercase', letterSpacing: 0.4 }}>{r.weight}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* About */}
          <Card theme={theme} pad={22} style={{ marginBottom: 20 }}>
            <b style={{ fontSize: 13, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>Über</b>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: theme.ink, margin: '10px 0 18px', textWrap: 'pretty' }}>{p.bio}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11.5, color: theme.inkMute, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Spezialisierungen</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {p.specialties.map((s) => <span key={s} style={{ fontSize: 12, padding: '4px 9px', borderRadius: 999, background: theme.bgAlt, color: theme.ink }}>{s}</span>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: theme.inkMute, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Zertifizierungen</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {p.certs.map((c) => (
                    <span key={c} style={{ fontSize: 12.5, color: theme.ink, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <IHIcon name="badge" size={13} style={{ color: theme.primary }} /> {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Reviews */}
          <Card theme={theme} pad={22}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
              <b style={{ fontSize: 13, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>Bewertungen</b>
              <Rating value={p.rating} count={p.reviews} theme={theme} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { n: 'Sabine R.', t: 'Absolut pünktlich und die Bilder haben meine Wohnung doppelt so groß wirken lassen. 4 Wochen später verkauft.', r: 5, d: 'vor 3 Wochen' },
                { n: 'Julian B.', t: 'Unkompliziert, freundlich, top Qualität. Lieferung am nächsten Tag.', r: 5, d: 'vor 2 Monaten' },
              ].map((rv) => (
                <div key={rv.n} style={{ paddingBottom: 14, borderBottom: `1px solid ${theme.line}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Avatar initials={rv.n.split(' ').map(x => x[0]).join('')} size={28} color={theme.ink} bg={theme.bgAlt} />
                    <b style={{ fontSize: 13, color: theme.ink }}>{rv.n}</b>
                    <Rating value={rv.r} theme={theme} small />
                    <span style={{ fontSize: 11.5, color: theme.inkMute, marginLeft: 'auto' }}>{rv.d}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: theme.inkSoft, margin: 0, lineHeight: 1.55, textWrap: 'pretty' }}>{rv.t}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Booking sidebar */}
        <div style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
          <Card theme={theme} pad={24}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: theme.inkSoft }}>Paketpreis</span>
              <span style={{ fontSize: 12, color: theme.inkMute }}>{p.priceRange}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: theme.ink, letterSpacing: -0.5, marginBottom: 18 }}>{p.price} €</div>

            <div style={{ fontSize: 12, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Verfügbare Termine</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {p.availability.slice(0, 3).map((d) => {
                const date = new Date(d);
                const label = date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' });
                return (
                  <div key={d} style={{ padding: '10px 12px', border: `1px solid ${theme.line}`, borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IHIcon name="calendar" size={14} style={{ color: theme.primary }} />
                    {label}
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: theme.inkMute }}>2 Slots</span>
                  </div>
                );
              })}
            </div>

            <Btn theme={theme} full size="lg" onClick={onBook} iconRight="arrowRight">Termin auswählen</Btn>
            <button style={{ marginTop: 10, width: '100%', padding: 10, background: 'none', border: `1px solid ${theme.line}`, borderRadius: 999, fontSize: 13, color: theme.ink, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <IHIcon name="chat" size={13} /> Nachricht senden
            </button>
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: theme.bgAlt, fontSize: 11.5, color: theme.inkSoft, display: 'flex', gap: 8 }}>
              <IHIcon name="shield" size={14} style={{ color: theme.primary, flexShrink: 0, marginTop: 1 }} />
              <span>Käuferschutz: Volle Rückerstattung bei Terminproblemen oder Qualitätsmängeln.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { MatchingScreen, ProviderProfile, ScoreDisplay });
