// App shell: top nav, step indicator, Tweaks panel
const { useState: useStateA, useEffect: useEffectA } = React;

const Logo = ({ theme }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width="28" height="28" viewBox="0 0 32 32">
      <path d="M4 16 L16 5 L28 16 L28 28 L20 28 L20 20 L12 20 L12 28 L4 28 Z" fill={theme.primary} />
      <circle cx="23" cy="9" r="3" fill={theme.accent} />
    </svg>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, color: theme.ink, letterSpacing: -0.3, fontWeight: 400 }}>ImmoHero</span>
    </div>
  </div>
);

const TopNav = ({ theme, stepIdx, steps, onNav, onHome }) => (
  <header style={{ position: 'sticky', top: 0, zIndex: 40, background: `${theme.bg}ee`, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.line}` }}>
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 28 }}>
      <button onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <Logo theme={theme} />
      </button>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}>
        {steps.map((s, i) => {
          const done = i < stepIdx;
          const active = i === stepIdx;
          return (
            <React.Fragment key={s.key}>
              {i > 0 && <div style={{ width: 18, height: 1, background: done ? theme.ink : theme.line }} />}
              <button onClick={() => onNav(i)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 999, background: active ? theme.ink : 'transparent', color: active ? theme.bg : done ? theme.ink : theme.inkMute, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, transition: 'all .2s' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: active ? theme.bg : done ? theme.ink : 'transparent', border: done || active ? 'none' : `1px solid ${theme.line}`, color: active ? theme.ink : done ? theme.bg : theme.inkMute, fontSize: 10.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {done ? <IHIcon name="check" size={10} stroke={2.4} /> : i + 1}
                </span>
                <span style={{ display: window.innerWidth > 920 ? 'inline' : 'none' }}>{s.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials="MK" size={34} color={theme.bg} bg={theme.primary} />
      </div>
    </div>
  </header>
);

const TweaksPanel = ({ visible, state, setState, onClose }) => {
  if (!visible) return null;
  const theme = window.IH_PALETTES[state.palette];
  return (
    <div style={{ position: 'fixed', bottom: 22, right: 22, width: 300, background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: 18, padding: 18, boxShadow: '0 20px 50px rgba(0,0,0,.15), 0 2px 6px rgba(0,0,0,.06)', zIndex: 100, fontSize: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IHIcon name="sliders" size={16} />
          <b style={{ fontSize: 14, color: theme.ink }}>Tweaks</b>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.inkSoft, padding: 4 }}>
          <IHIcon name="close" size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11.5, color: theme.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Farbschema</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.entries(window.IH_PALETTES).map(([k, v]) => (
              <button key={k} onClick={() => setState({ palette: k })} style={{ flex: 1, padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${state.palette === k ? theme.ink : theme.line}`, background: v.bg, color: v.ink, fontSize: 11.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.primary }} />
                {v.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: theme.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Match-Score Stil</div>
          <Segmented theme={theme} value={state.scoreStyle} onChange={(v) => setState({ scoreStyle: v })} options={[{ value: 'ring', label: 'Ring' }, { value: 'badge', label: 'Badge' }, { value: 'bar', label: 'Balken' }]} />
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: theme.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Dichte</div>
          <Segmented theme={theme} value={state.density} onChange={(v) => setState({ density: v })} options={[{ value: 'compact', label: 'Kompakt' }, { value: 'cozy', label: 'Normal' }, { value: 'airy', label: 'Luftig' }]} />
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: theme.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Copy-Ton</div>
          <Segmented theme={theme} value={state.tone} onChange={(v) => setState({ tone: v })} options={[{ value: 'friendly', label: 'Freundlich' }, { value: 'pro', label: 'Sachlich' }]} />
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Logo, TopNav, TweaksPanel });
