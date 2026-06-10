import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #09090C; --surface: #111116; --card: #16161C;
    --border: rgba(255,255,255,0.07); --border-h: rgba(255,255,255,0.14);
    --text: #F0EEE9; --muted: #7A7870; --muted2: #4A4A42;
    --accent: #C8FF57; --accent-dim: rgba(200,255,87,0.10); --accent-b: rgba(200,255,87,0.22);
    --teal: #4ECFB3; --red: #FF6B57;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; font-weight: 400; line-height: 1.6; overflow-x: hidden; cursor: none; }

  /* CURSOR */
  .cursor { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999; transform: translate(-50%,-50%); transition: width .2s, height .2s; mix-blend-mode: difference; }
  .cursor-ring { width: 32px; height: 32px; border: 1px solid rgba(200,255,87,0.35); border-radius: 50%; position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9998; transform: translate(-50%,-50%); transition: transform .18s cubic-bezier(.25,.46,.45,.94); }
  body:has(a:hover) .cursor, body:has(button:hover) .cursor { width: 18px; height: 18px; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(200,255,87,0.25); border-radius: 2px; }

  /* NAV */
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 18px 56px; display: flex; align-items: center; justify-content: space-between; background: rgba(9,9,12,0.65); backdrop-filter: blur(24px); border-bottom: 1px solid var(--border); }
  .nav-logo { font-family: 'Instrument Serif', serif; font-size: 1.25rem; color: var(--text); text-decoration: none; display: flex; align-items: center; gap: 7px; cursor: none; }
  .logo-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .nav-login { color: var(--muted); font-size: 0.82rem; font-weight: 500; text-decoration: none; letter-spacing: 0.03em; transition: color .2s; cursor: none; padding: 8px 4px; }
  .nav-login:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: var(--bg); padding: 8px 22px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; text-decoration: none; cursor: none; transition: opacity .2s, transform .2s; white-space: nowrap; }
  .nav-cta:hover { opacity: 0.9; transform: translateY(-1px); }
  @media (max-width: 768px) { .nav { padding: 16px 20px; } .nav-login { display: none; } }

  /* ── HERO — asymmetric two-column ── */
  .hero {
    min-height: 100vh;
    padding: 0 56px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 0;
    position: relative;
    overflow: hidden;
  }
  .hero-grid { position: absolute; inset: 0; z-index: 0; background-image: linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px); background-size: 52px 52px; mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%); }
  .hero-orb { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
  .hero-orb-1 { width: 560px; height: 360px; background: rgba(200,255,87,0.045); top: -120px; right: -80px; }
  .hero-orb-2 { width: 380px; height: 380px; background: rgba(78,207,179,0.04); bottom: -80px; left: -60px; }

  .hero-left { position: relative; z-index: 1; padding-top: 100px; padding-bottom: 60px; padding-right: 60px; }
  .hero-right { position: relative; z-index: 1; padding-top: 100px; padding-bottom: 60px; display: flex; flex-direction: column; justify-content: center; border-left: 1px solid var(--border); padding-left: 60px; }

  /* Eyebrow chip */
  .hero-chip { display: inline-flex; align-items: center; gap: 8px; background: var(--accent-dim); border: 1px solid var(--accent-b); color: var(--accent); font-size: 0.7rem; font-weight: 600; padding: 5px 14px; border-radius: 100px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 32px; animation: fadeUp .6s .1s both; }
  .chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }

  /* Main heading — editorial, left-aligned */
  .hero-heading { font-family: 'Instrument Serif', serif; font-size: clamp(3rem, 5.5vw, 5rem); font-weight: 400; line-height: 1.0; letter-spacing: -0.025em; margin-bottom: 28px; animation: fadeUp .6s .2s both; }
  .hero-heading .line-muted { color: var(--muted); display: block; }
  .hero-heading .line-accent { color: var(--accent); font-style: italic; display: block; }

  .hero-desc { font-size: 1rem; color: var(--muted); line-height: 1.75; max-width: 420px; margin-bottom: 40px; animation: fadeUp .6s .3s both; }
  .hero-desc strong { color: var(--text); font-weight: 500; }

  .hero-cta { animation: fadeUp .6s .4s both; }
  .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: var(--bg); padding: 13px 30px; border-radius: 9px; font-size: 0.9rem; font-weight: 600; text-decoration: none; cursor: none; transition: transform .2s, box-shadow .3s; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(200,255,87,0.2); }
  .btn-secondary { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--text); padding: 13px 30px; border-radius: 9px; font-size: 0.9rem; font-weight: 500; border: 1px solid var(--border-h); text-decoration: none; cursor: none; transition: border-color .2s, transform .2s; margin-left: 12px; }
  .btn-secondary:hover { border-color: rgba(255,255,255,0.25); transform: translateY(-2px); }

  /* Right column — large numbers */
  .hero-stats { display: flex; flex-direction: column; gap: 0; animation: fadeUp .6s .35s both; }
  .hero-stat-row { padding: 28px 0; border-bottom: 1px solid var(--border); display: flex; align-items: baseline; gap: 16px; }
  .hero-stat-row:last-child { border-bottom: none; }
  .stat-big { font-family: 'Instrument Serif', serif; font-size: clamp(2.8rem, 5vw, 4.2rem); color: var(--text); line-height: 1; flex-shrink: 0; }
  .stat-big .acc { color: var(--accent); }
  .stat-text { display: flex; flex-direction: column; gap: 3px; }
  .stat-label { font-size: 0.88rem; font-weight: 500; color: var(--text); }
  .stat-sub { font-size: 0.75rem; color: var(--muted); line-height: 1.5; max-width: 200px; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  /* Responsive hero */
  @media (max-width: 1024px) {
    .hero { grid-template-columns: 1fr; padding: 0 32px; }
    .hero-left { padding-right: 0; padding-top: 120px; }
    .hero-right { border-left: none; border-top: 1px solid var(--border); padding-left: 0; padding-top: 32px; }
    .hero-stats { flex-direction: row; gap: 0; }
    .hero-stat-row { flex: 1; flex-direction: column; gap: 6px; border-bottom: none; border-right: 1px solid var(--border); padding: 20px 16px; }
    .hero-stat-row:last-child { border-right: none; }
    .stat-big { font-size: 2.4rem; }
  }
  @media (max-width: 640px) {
    .hero { padding: 0 20px; }
    .hero-heading { font-size: 2.6rem; }
    .hero-stats { flex-direction: column; }
    .hero-stat-row { border-right: none; border-bottom: 1px solid var(--border); padding: 16px 0; }
    .hero-stat-row:last-child { border-bottom: none; }
    .btn-secondary { display: none; }
  }

  /* ── HOW IT WORKS — editorial numbered list ── */
  .section { padding: 100px 56px; max-width: 1240px; margin: 0 auto; }
  .section-eyebrow { font-size: 0.68rem; font-weight: 600; color: var(--accent); letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
  .section-eyebrow::before { content: ''; width: 24px; height: 1px; background: var(--accent); }
  .section-title { font-family: 'Instrument Serif', serif; font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 400; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 60px; }
  .section-title em { color: var(--accent); font-style: italic; }

  /* Features — asymmetric: big feature left + list right */
  .features-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
  .feature-main { padding: 52px 48px; border-right: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between; background: var(--surface); position: relative; overflow: hidden; }
  .feature-main::before { content: ''; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: rgba(200,255,87,0.05); border-radius: 50%; filter: blur(60px); }
  .feat-num { font-family: 'Instrument Serif', serif; font-size: 5rem; font-weight: 400; color: rgba(200,255,87,0.12); line-height: 1; margin-bottom: 20px; }
  .feat-main-title { font-family: 'Instrument Serif', serif; font-size: 1.7rem; font-weight: 400; color: var(--text); line-height: 1.2; margin-bottom: 16px; }
  .feat-main-desc { font-size: 0.9rem; color: var(--muted); line-height: 1.75; }
  .feat-tag { display: inline-flex; align-items: center; gap: 6px; margin-top: 28px; font-size: 0.72rem; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; }
  .feat-tag::before { content: ''; width: 16px; height: 1px; background: var(--accent); }

  .feature-list { background: var(--bg); }
  .feature-item { padding: 28px 40px; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: start; transition: background .2s; cursor: default; }
  .feature-item:last-child { border-bottom: none; }
  .feature-item:hover { background: var(--surface); }
  .feat-item-num { font-family: 'Instrument Serif', serif; font-size: 1rem; color: var(--muted2); width: 24px; padding-top: 2px; }
  .feat-item-title { font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .feat-item-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.6; }

  @media (max-width: 768px) {
    .features-wrap { grid-template-columns: 1fr; }
    .feature-main { border-right: none; border-bottom: 1px solid var(--border); padding: 36px 28px; }
    .feature-item { padding: 20px 28px; }
    .section { padding: 72px 20px; }
  }

  /* ── MOCK PREVIEW ── */
  .preview-section { padding: 0 56px 100px; max-width: 1240px; margin: 0 auto; }
  .preview-label { font-size: 0.68rem; font-weight: 600; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 28px; display: flex; align-items: center; gap: 12px; }
  .preview-label::before, .preview-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .mock { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; box-shadow: 0 32px 100px rgba(0,0,0,0.5); }
  .mock-bar { display: flex; align-items: center; gap: 6px; padding: 12px 18px; background: var(--card); border-bottom: 1px solid var(--border); }
  .mock-dot { width: 9px; height: 9px; border-radius: 50%; }
  .mock-url { flex: 1; display: flex; justify-content: center; }
  .mock-url span { background: rgba(255,255,255,0.04); border-radius: 5px; padding: 3px 14px; font-size: 0.65rem; color: var(--muted); }
  .mock-body { display: grid; grid-template-columns: 180px 1fr; }
  .mock-sidebar { background: var(--card); border-right: 1px solid var(--border); padding: 16px 12px; }
  .mock-sidebar-label { font-size: 0.6rem; color: var(--muted2); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; padding: 0 10px; }
  .mock-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 7px; font-size: 0.72rem; font-weight: 500; color: var(--muted); margin-bottom: 2px; cursor: pointer; transition: all .15s; border: 1px solid transparent; }
  .mock-item:hover { background: rgba(255,255,255,0.03); color: var(--text); }
  .mock-item.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent-b); }
  .mock-icon { width: 12px; height: 12px; border-radius: 3px; background: currentColor; opacity: 0.4; flex-shrink: 0; }
  .mock-item.active .mock-icon { opacity: 1; }
  .mock-content { padding: 20px; }
  .mock-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .mock-hd-title { font-size: 0.82rem; font-weight: 600; color: var(--text); }
  .mock-badge { font-size: 0.62rem; font-weight: 600; padding: 3px 10px; border-radius: 100px; background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent-b); }
  .mock-row { display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center; padding: 10px 14px; border-radius: 9px; background: var(--card); border: 1px solid var(--border); margin-bottom: 7px; }
  .mock-row:hover { border-color: var(--border-h); }
  .mock-ev-name { font-size: 0.75rem; font-weight: 500; color: var(--text); margin-bottom: 2px; }
  .mock-ev-meta { font-size: 0.65rem; color: var(--muted); }
  .mock-prog { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .mock-prog-bar { width: 70px; height: 3px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
  .mock-prog-fill { height: 100%; border-radius: 2px; }
  .mock-prog-pct { font-size: 0.62rem; color: var(--muted); }
  .mock-status { font-size: 0.62rem; font-weight: 600; padding: 3px 9px; border-radius: 100px; }
  .s-active { background: rgba(78,207,179,0.12); color: var(--teal); }
  .s-planned { background: rgba(255,255,255,0.06); color: var(--muted); }
  .s-urgent { background: rgba(255,107,87,0.12); color: var(--red); }
  @media (max-width: 640px) { .mock-body { grid-template-columns: 1fr; } .mock-sidebar { display: none; } .preview-section { padding: 0 20px 60px; } }

  /* ── CTA SECTION — bold editorial ── */
  .cta-section { margin: 0 56px 100px; position: relative; overflow: hidden; }
  .cta-inner { border: 1px solid var(--border); border-radius: 20px; padding: 72px 72px; display: grid; grid-template-columns: 1fr auto; gap: 60px; align-items: center; background: var(--surface); overflow: hidden; }
  .cta-inner::before { content: ''; position: absolute; top: -80px; left: -80px; width: 300px; height: 300px; background: rgba(200,255,87,0.05); border-radius: 50%; filter: blur(80px); }
  .cta-eyebrow { font-size: 0.68rem; font-weight: 600; color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; }
  .cta-heading { font-family: 'Instrument Serif', serif; font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 400; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 16px; }
  .cta-heading em { color: var(--accent); font-style: italic; }
  .cta-sub { font-size: 0.92rem; color: var(--muted); line-height: 1.7; max-width: 440px; }
  .cta-right { flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; align-items: flex-end; position: relative; z-index: 1; }
  .cta-note { font-size: 0.72rem; color: var(--muted2); text-align: right; }
  @media (max-width: 768px) { .cta-section { margin: 0 20px 60px; } .cta-inner { grid-template-columns: 1fr; padding: 40px 28px; gap: 32px; } .cta-right { align-items: flex-start; } }

  /* ── FOOTER ── */
  .footer { border-top: 1px solid var(--border); padding: 28px 56px; display: flex; align-items: center; justify-content: space-between; }
  .footer-logo { font-family: 'Instrument Serif', serif; font-size: 1.1rem; color: var(--muted); text-decoration: none; display: flex; align-items: center; gap: 6px; cursor: none; }
  .footer p { font-size: 0.75rem; color: var(--muted2); }
  .footer p span { color: var(--muted); }
  @media (max-width: 640px) { .footer { padding: 20px; flex-direction: column; gap: 12px; text-align: center; } }

  /* SCROLL REVEAL */
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.25,.46,.45,.94), transform .7s cubic-bezier(.25,.46,.45,.94); }
  .reveal.visible { opacity: 1; transform: translateY(0); }
`;

const FEATURES_SECONDARY = [
  { num: "02", title: "Task & Delegasi Tim", desc: "Bagi tugas ke anggota, set deadline, pantau status penyelesaian dalam satu tampilan." },
  { num: "03", title: "Monitoring Budget", desc: "Input anggaran per event, catat pengeluaran, dan dapatkan peringatan saat mendekati batas." },
  { num: "04", title: "Guest List & RSVP", desc: "Kelola daftar peserta, konfirmasi kehadiran, dan ekspor data kapan saja." },
  { num: "05", title: "Multi-event Sekaligus", desc: "Tidak perlu berpindah file — kelola puluhan event paralel dari satu dashboard." },
];

const MOCK_EVENTS = [
  { name: "Tech Summit 2025", meta: "25 Jun · 3 hari lagi", progress: 72, status: "active" },
  { name: "Workshop UI/UX", meta: "12 Jul · Drafting", progress: 30, status: "planned" },
  { name: "Hackathon Nasional", meta: "3 Jul · Perlu perhatian", progress: 15, status: "urgent" },
];

const PROG_COLORS = { active: "#C8FF57", planned: "rgba(255,255,255,0.2)", urgent: "#FF6B57" };

export default function Landing() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0);
  const rx = useRef(0), ry = useRef(0);
  const [activeNav, setActiveNav] = useState("dashboard");

  useEffect(() => {
    const onMove = (e) => {
      mx.current = e.clientX; my.current = e.clientY;
      if (cursorRef.current) { cursorRef.current.style.left = e.clientX + "px"; cursorRef.current.style.top = e.clientY + "px"; }
    };
    document.addEventListener("mousemove", onMove);
    let raf;
    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.1;
      ry.current += (my.current - ry.current) * 0.1;
      if (ringRef.current) { ringRef.current.style.left = rx.current + "px"; ringRef.current.style.top = ry.current + "px"; }
      raf = requestAnimationFrame(animate);
    };
    animate();
    const reveals = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }), { threshold: 0.1 });
    reveals.forEach((r) => io.observe(r));
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo"><div className="logo-dot" />EventFlow</a>
        <div className="nav-right">
          <a href="/login" className="nav-login">Sudah punya akun?</a>
          <a href="/login" className="nav-cta">Mulai Gratis →</a>
        </div>
      </nav>

      {/* ── HERO — asymmetric ── */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="hero-left">
          <div className="hero-chip"><div className="chip-dot" />Untuk Koordinator Event</div>
          <h1 className="hero-heading">
            Satu tempat<br />
            untuk semua<br />
            <span className="line-accent">event kamu.</span>
          </h1>
          <p className="hero-desc">
            Kelola event dari awal sampai selesai — tanpa chat yang berserakan,
            spreadsheet yang membingungkan, atau informasi yang tercecer.
            <strong> Semua ada di sini.</strong>
          </p>
          <div className="hero-cta">
            <a href="/login" className="btn-primary">
              Mulai Sekarang
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#preview" className="btn-secondary">Lihat Demo</a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-stats">
            {[
              { num: "9", acc: "+", label: "Halaman & Fitur", sub: "Dashboard, event, task, budget, guest, settings" },
              { num: "15", acc: "+", label: "API Endpoint", sub: "Auth, CRUD events, tasks, guests, budget" },
              { num: "4", acc: "", label: "Tech Layer", sub: "React · Node.js · PostgreSQL · Prisma ORM" },
            ].map((s, i) => (
              <div className="hero-stat-row" key={i} style={{ animationDelay: i * 0.08 + "s" }}>
                <div className="stat-big">{s.num}<span className="acc">{s.acc}</span></div>
                <div className="stat-text">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS / FEATURES — editorial ── */}
      <section className="section" id="how-it-works">
        <div className="section-eyebrow reveal">Cara Kerja</div>
        <div className="section-title reveal">
          Fitur yang dibangun<br />dari <em>kebutuhan nyata.</em>
        </div>
        <div className="features-wrap reveal">
          <div className="feature-main">
            <div>
              <div className="feat-num">01</div>
              <div className="feat-main-title">Dashboard Event Terpusat</div>
              <div className="feat-main-desc">
                Lihat semua event aktif, progress task, dan anggaran terpakai dalam satu halaman.
                Tidak perlu buka banyak file atau tanya satu per satu ke anggota tim.
              </div>
            </div>
            <div className="feat-tag">Fitur Utama</div>
          </div>
          <div className="feature-list">
            {FEATURES_SECONDARY.map((f) => (
              <div className="feature-item" key={f.num}>
                <div className="feat-item-num">{f.num}</div>
                <div>
                  <div className="feat-item-title">{f.title}</div>
                  <div className="feat-item-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREVIEW ── */}
      <div className="preview-section" id="preview">
        <p className="preview-label reveal">Tampilan Dashboard</p>
        <div className="mock reveal">
          <div className="mock-bar">
            <div className="mock-dot" style={{ background: "#FF5F57" }} />
            <div className="mock-dot" style={{ background: "#FFBD2E" }} />
            <div className="mock-dot" style={{ background: "#28CA41" }} />
            <div className="mock-url"><span>eventflow.app/dashboard</span></div>
          </div>
          <div className="mock-body">
            <div className="mock-sidebar">
              <div className="mock-sidebar-label">Menu</div>
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "events",    label: "Event" },
                { id: "tasks",     label: "Task" },
                { id: "guests",    label: "Tamu" },
                { id: "budget",    label: "Anggaran" },
              ].map((item) => (
                <div key={item.id} className={"mock-item" + (activeNav === item.id ? " active" : "")} onClick={() => setActiveNav(item.id)}>
                  <div className="mock-icon" />
                  {item.label}
                </div>
              ))}
            </div>
            <div className="mock-content">
              <div className="mock-hd">
                <div className="mock-hd-title">Event Aktif</div>
                <div className="mock-badge">3 Event</div>
              </div>
              {MOCK_EVENTS.map((ev, i) => (
                <div className="mock-row" key={i}>
                  <div><div className="mock-ev-name">{ev.name}</div><div className="mock-ev-meta">{ev.meta}</div></div>
                  <div className="mock-prog">
                    <div className="mock-prog-bar"><div className="mock-prog-fill" style={{ width: ev.progress + "%", background: PROG_COLORS[ev.status] }} /></div>
                    <div className="mock-prog-pct">{ev.progress}%</div>
                  </div>
                  <div className={"mock-status s-" + ev.status}>
                    {ev.status === "active" ? "Aktif" : ev.status === "planned" ? "Draft" : "Urgent"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA — bold editorial, two column ── */}
      <div className="cta-section">
        <div className="cta-inner reveal">
          <div>
            <div className="cta-eyebrow">Siap digunakan</div>
            <h2 className="cta-heading">
              Dari koordinasi<br />
              <em>berantakan,</em><br />
              ke satu dashboard.
            </h2>
            <p className="cta-sub">
              Coba langsung — daftar gratis dan buat event pertama kamu dalam hitungan menit.
            </p>
          </div>
          <div className="cta-right">
            <a href="/login" className="btn-primary">
              Coba Sekarang
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <div className="cta-note">Daftar gratis · Langsung bisa dipakai</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <a href="/" className="footer-logo"><div className="logo-dot" />EventFlow</a>
        <p>Dibangun oleh <span>Jeremy Trystan</span> · {new Date().getFullYear()}</p>
      </footer>
    </>
  );
}