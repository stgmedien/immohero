// Shared UI primitives for ImmoHero
const { useState, useEffect, useRef, useMemo } = React;

// Striped placeholder for imagery
const Placeholder = ({ label, ratio = '4/3', tone = 'warm', style = {} }) => {
  const tones = {
    warm: ['#E8DFC9', '#DCCFB2'],
    cool: ['#D5DED0', '#B9C6B2'],
    sky: ['#CFDAE0', '#B5C5CE'],
    dusk: ['#C9B8A8', '#A89684'],
    green: ['#B8C9A8', '#94A886'],
    terra: ['#E4C4B1', '#C99978'],
    dark: ['#3A3F34', '#2A2E26'],
  };
  const [a, b] = tones[tone] || tones.warm;
  const pid = `ph-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div style={{ aspectRatio: ratio, width: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'inherit', ...style }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, display: 'block' }}>
        <defs>
          <pattern id={pid} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="14" height="14" fill={a} />
            <rect width="7" height="14" fill={b} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pid})`} />
      </svg>
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10.5, letterSpacing: 0.4, color: '#1E2319', background: 'rgba(244,242,236,.82)', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
};

// Score ring (SVG)
const MatchRing = ({ score, size = 56, stroke = 4, color, bg, label }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.26, fontWeight: 600, letterSpacing: -0.3, color }}>
        {score}
      </div>
      {label && <div style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translate(-50%, 4px)', fontSize: 10, color, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>}
    </div>
  );
};

// Score bar
const MatchBar = ({ score, color, bg, height = 6, width = 80 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width, height, background: bg, borderRadius: height, overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: height, transition: 'width .8s cubic-bezier(.22,1,.36,1)' }} />
    </div>
    <span style={{ fontSize: 13, fontWeight: 600, color }}>{score}</span>
  </div>
);

// Score badge
const MatchBadge = ({ score, color, bg, inkOn }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 8px', background: color, color: inkOn, borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /></svg>
    {score}% Match
  </div>
);

// Avatar
const Avatar = ({ initials, size = 40, color, bg, ring }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, letterSpacing: 0.3, flexShrink: 0, boxShadow: ring ? `0 0 0 2px ${ring}` : 'none' }}>
    {initials}
  </div>
);

// Segmented control
const Segmented = ({ value, onChange, options, theme }) => (
  <div style={{ display: 'inline-flex', padding: 3, background: theme.bgAlt, borderRadius: 999, border: `1px solid ${theme.line}` }}>
    {options.map((o) => (
      <button key={o.value} onClick={() => onChange(o.value)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, border: 'none', background: value === o.value ? theme.surface : 'transparent', color: value === o.value ? theme.ink : theme.inkSoft, cursor: 'pointer', transition: 'all .18s', boxShadow: value === o.value ? '0 1px 2px rgba(0,0,0,.08)' : 'none' }}>
        {o.label}
      </button>
    ))}
  </div>
);

// Toggle pill
const Pill = ({ active, onClick, children, theme }) => (
  <button onClick={onClick} style={{ padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, border: `1px solid ${active ? theme.ink : theme.line}`, background: active ? theme.ink : 'transparent', color: active ? theme.bg : theme.inkSoft, cursor: 'pointer', transition: 'all .15s' }}>
    {children}
  </button>
);

// Primary button
const Btn = ({ children, onClick, variant = 'primary', size = 'md', icon, iconRight, theme, disabled, full, style = {} }) => {
  const sz = size === 'sm' ? { h: 34, px: 14, fs: 13 } : size === 'lg' ? { h: 52, px: 22, fs: 15 } : { h: 42, px: 18, fs: 14 };
  const variants = {
    primary: { bg: theme.ink, color: theme.bg, border: 'none' },
    accent: { bg: theme.accent, color: '#fff', border: 'none' },
    secondary: { bg: 'transparent', color: theme.ink, border: `1px solid ${theme.line}` },
    ghost: { bg: 'transparent', color: theme.ink, border: 'none' },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{ height: sz.h, padding: `0 ${sz.px}px`, borderRadius: 999, fontSize: sz.fs, fontWeight: 500, letterSpacing: 0.1, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: full ? '100%' : 'auto', transition: 'all .18s', ...v, ...style }}>
      {icon && <IHIcon name={icon} size={16} />}
      {children}
      {iconRight && <IHIcon name={iconRight} size={16} />}
    </button>
  );
};

// Card
const Card = ({ children, theme, pad = 20, style = {} }) => (
  <div style={{ background: theme.surface, border: `1px solid ${theme.line}`, borderRadius: 18, padding: pad, ...style }}>
    {children}
  </div>
);

// Field
const Field = ({ label, children, theme, hint }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    <span style={{ fontSize: 12.5, fontWeight: 500, color: theme.inkSoft, letterSpacing: 0.1 }}>{label}</span>
    {children}
    {hint && <span style={{ fontSize: 11.5, color: theme.inkMute }}>{hint}</span>}
  </label>
);

const Input = ({ theme, ...props }) => (
  <input {...props} style={{ height: 44, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.line}`, background: theme.surface, color: theme.ink, fontSize: 14, fontFamily: 'inherit', outline: 'none', transition: 'border .15s', ...(props.style || {}) }} onFocus={(e) => (e.target.style.borderColor = theme.ink)} onBlur={(e) => (e.target.style.borderColor = theme.line)} />
);

const Select = ({ theme, children, ...props }) => (
  <select {...props} style={{ height: 44, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.line}`, background: theme.surface, color: theme.ink, fontSize: 14, fontFamily: 'inherit', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='${encodeURIComponent(theme.inkSoft)}' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36, ...(props.style || {}) }}>
    {children}
  </select>
);

// Rating
const Rating = ({ value, count, theme, small }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: small ? 12 : 13, color: theme.inkSoft }}>
    <svg width={small ? 11 : 13} height={small ? 11 : 13} viewBox="0 0 24 24" fill={theme.accent}><path d="M12 3l2.6 5.6 6 .7-4.5 4.2 1.2 6-5.3-3.1-5.3 3.1 1.2-6-4.5-4.2 6-.7L12 3Z" /></svg>
    <b style={{ color: theme.ink, fontWeight: 600 }}>{value}</b>
    {count != null && <span>({count})</span>}
  </span>
);

// Status dot
const Dot = ({ color, size = 6 }) => (
  <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0 }} />
);

Object.assign(window, { Placeholder, MatchRing, MatchBar, MatchBadge, Avatar, Segmented, Pill, Btn, Card, Field, Input, Select, Rating, Dot });
