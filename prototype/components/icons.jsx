// Line-icon set for ImmoHero. Thin strokes, rounded caps.
const Icon = ({ name, size = 20, stroke = 1.6, ...rest }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', ...rest };
  const P = (d) => <path d={d} />;
  const paths = {
    camera: <>{P('M4 8h3l2-2h6l2 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z')}<circle cx="12" cy="13" r="3.5" /></>,
    drone: <>{P('M6 6l3 3')}{P('M18 6l-3 3')}{P('M6 18l3-3')}{P('M18 18l-3-3')}<circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />{P('M9 9h6v6H9z')}</>,
    sphere: <><circle cx="12" cy="12" r="9" />{P('M3 12h18')}{P('M12 3c2.8 3 2.8 15 0 18')}{P('M12 3c-2.8 3-2.8 15 0 18')}</>,
    play: <>{P('M8 5l12 7-12 7V5Z')}</>,
    plan: <>{P('M4 4h16v16H4z')}{P('M4 10h10')}{P('M14 10v10')}{P('M14 15h6')}</>,
    cube: <>{P('M12 3l9 5v8l-9 5-9-5V8l9-5Z')}{P('M3 8l9 5 9-5')}{P('M12 13v10')}</>,
    scan: <>{P('M4 8V5a1 1 0 0 1 1-1h3')}{P('M20 8V5a1 1 0 0 0-1-1h-3')}{P('M4 16v3a1 1 0 0 0 1 1h3')}{P('M20 16v3a1 1 0 0 1-1 1h-3')}{P('M7 12h10')}</>,
    bolt: <>{P('M13 3L5 14h6l-1 7 8-11h-6l1-7Z')}</>,
    text: <>{P('M5 6h14')}{P('M5 12h14')}{P('M5 18h9')}</>,
    check: <>{P('M5 12l5 5 9-11')}</>,
    plus: <>{P('M12 5v14')}{P('M5 12h14')}</>,
    minus: <>{P('M5 12h14')}</>,
    arrowRight: <>{P('M5 12h14')}{P('M13 6l6 6-6 6')}</>,
    arrowLeft: <>{P('M19 12H5')}{P('M11 18l-6-6 6-6')}</>,
    star: <>{P('M12 3l2.6 5.6 6 .7-4.5 4.2 1.2 6-5.3-3.1-5.3 3.1 1.2-6-4.5-4.2 6-.7L12 3Z')}</>,
    pin: <>{P('M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z')}<circle cx="12" cy="9" r="2.5" /></>,
    clock: <><circle cx="12" cy="12" r="9" />{P('M12 7v5l3 2')}</>,
    calendar: <>{P('M4 6h16v14H4z')}{P('M4 10h16')}{P('M8 3v4')}{P('M16 3v4')}</>,
    chat: <>{P('M4 5h16v10H9l-5 4V5Z')}</>,
    shield: <>{P('M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z')}{P('M9 12l2 2 4-4')}</>,
    spark: <>{P('M12 3v4')}{P('M12 17v4')}{P('M3 12h4')}{P('M17 12h4')}{P('M5.6 5.6l2.8 2.8')}{P('M15.6 15.6l2.8 2.8')}{P('M5.6 18.4l2.8-2.8')}{P('M15.6 8.4l2.8-2.8')}</>,
    home: <>{P('M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z')}</>,
    user: <><circle cx="12" cy="8" r="4" />{P('M4 20c1.5-4 5-6 8-6s6.5 2 8 6')}</>,
    chevronDown: <>{P('M6 9l6 6 6-6')}</>,
    chevronRight: <>{P('M9 6l6 6-6 6')}</>,
    close: <>{P('M6 6l12 12')}{P('M18 6L6 18')}</>,
    filter: <>{P('M4 6h16')}{P('M7 12h10')}{P('M10 18h4')}</>,
    heart: <>{P('M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z')}</>,
    download: <>{P('M12 4v11')}{P('M7 10l5 5 5-5')}{P('M5 20h14')}</>,
    upload: <>{P('M12 20V9')}{P('M7 14l5-5 5 5')}{P('M5 4h14')}</>,
    eye: <>{P('M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z')}<circle cx="12" cy="12" r="3" /></>,
    sun: <><circle cx="12" cy="12" r="4" />{P('M12 3v2')}{P('M12 19v2')}{P('M3 12h2')}{P('M19 12h2')}{P('M5.6 5.6l1.4 1.4')}{P('M17 17l1.4 1.4')}{P('M5.6 18.4L7 17')}{P('M17 7l1.4-1.4')}</>,
    moon: <>{P('M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z')}</>,
    sliders: <>{P('M4 6h10')}{P('M18 6h2')}{P('M4 12h4')}{P('M12 12h8')}{P('M4 18h12')}{P('M20 18h0')}<circle cx="15" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
    package: <>{P('M3 7l9-4 9 4v10l-9 4-9-4V7Z')}{P('M3 7l9 4 9-4')}{P('M12 11v10')}</>,
    sparkle: <>{P('M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z')}{P('M19 17l.6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z')}</>,
    badge: <>{P('M12 3l2.5 2 3 .3L18 8l2 2-2 2 -.5 2.7-3 .3L12 17l-2.5-2-3-.3L6 12l-2-2 2-2 .5-2.7 3-.3L12 3Z')}{P('M9 12l2 2 4-4')}</>,
  };
  return <svg {...common}>{paths[name] || null}</svg>;
};

window.IHIcon = Icon;
