import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080b12;
    --bg2: #0d1117;
    --bg3: #141922;
    --card: #181f2e;
    --border: #1e2a3a;
    --accent: #00e5a0;
    --accent2: #ff6b6b;
    --accent3: #ffd93d;
    --accent4: #6c63ff;
    --text: #e8edf5;
    --muted: #7a8899;
    --sidebar-w: 260px;
    --font-display: 'Syne', sans-serif;
    --font-mono: 'Space Mono', monospace;
    --font-body: 'DM Sans', sans-serif;
  }

  .light {
    --bg: #f0f4ff;
    --bg2: #ffffff;
    --bg3: #e8edf8;
    --card: #ffffff;
    --border: #d0d8ee;
    --text: #0d1117;
    --muted: #5a6a82;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeLeft {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,229,160,0.0); }
    50%      { box-shadow: 0 0 18px 4px rgba(0,229,160,0.18); }
  }
  @keyframes heartbeat {
    0%,100% { transform: scale(1); }
    14%     { transform: scale(1.18); }
    28%     { transform: scale(1); }
    42%     { transform: scale(1.1); }
    56%     { transform: scale(1); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-8px); }
  }
  @keyframes slideInSection {
    from { opacity: 0; transform: translateY(40px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes slideInSidebar {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
  }

  .docs-root {
    display: flex; min-height: 100vh;
    background: var(--bg); font-family: var(--font-body);
    transition: background 0.4s, color 0.4s;
  }

  /* ── SIDEBAR OVERLAY (mobile) ── */
  .sidebar-overlay {
    display: none;
    position: fixed; inset: 0; z-index: 99;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
  .sidebar-overlay.open { display: block; }

  .sidebar {
    width: var(--sidebar-w); min-height: 100vh;
    background: var(--bg2); border-right: 1px solid var(--border);
    position: fixed; top: 0; left: 0; bottom: 0;
    overflow-y: auto; z-index: 100;
    animation: fadeLeft 0.5s ease both;
    display: flex; flex-direction: column;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .sidebar-logo { padding: 28px 20px 20px; border-bottom: 1px solid var(--border); }
  .logo-badge { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--accent), var(--accent4));
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-size: 18px; animation: heartbeat 2.5s infinite; flex-shrink: 0;
  }
  .logo-name {
    font-family: var(--font-display); font-size: 22px; font-weight: 800;
    background: linear-gradient(90deg, var(--accent), var(--accent4));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .logo-version {
    font-family: var(--font-mono); font-size: 10px; color: var(--muted);
    background: var(--bg3); border-radius: 4px; padding: 2px 7px; letter-spacing: 1px;
  }
  .logo-tagline { font-size: 11px; color: var(--muted); font-style: italic; margin-top: 4px; }

  /* Close button inside sidebar (mobile only) */
  .sidebar-close {
    display: none;
    position: absolute; top: 16px; right: 16px;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 8px; width: 32px; height: 32px;
    align-items: center; justify-content: center;
    font-size: 18px; cursor: pointer; color: var(--muted);
    transition: color 0.2s, border-color 0.2s;
    z-index: 101;
  }
  .sidebar-close:hover { color: var(--accent2); border-color: var(--accent2); }

  .sidebar-nav { padding: 16px 0; flex: 1; }
  .nav-group-label {
    font-family: var(--font-mono); font-size: 10px; color: var(--muted);
    letter-spacing: 2px; text-transform: uppercase; padding: 12px 20px 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 20px; font-size: 13.5px; font-weight: 500; color: var(--muted);
    cursor: pointer; border-left: 3px solid transparent; transition: all 0.2s;
    border-radius: 0 6px 6px 0; margin: 1px 8px 1px 0;
  }
  .nav-item:hover { color: var(--text); background: var(--bg3); }
  .nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(0,229,160,0.07); }

  .sidebar-footer {
    padding: 16px 20px; border-top: 1px solid var(--border);
    font-size: 11px; color: var(--muted); text-align: center;
  }

  .main { margin-left: var(--sidebar-w); flex: 1; min-height: 100vh; }

  .topbar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,11,18,0.85); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border); padding: 14px 40px;
    display: flex; align-items: center; justify-content: space-between;
    animation: fadeDown 0.4s ease both;
  }
  .light .topbar { background: rgba(240,244,255,0.85); }
  .topbar-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--muted); letter-spacing: 1px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  /* Hamburger button — hidden on desktop */
  .hamburger {
    display: none;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 10px; cursor: pointer;
    font-size: 18px; color: var(--text); line-height: 1;
    transition: border-color 0.2s, color 0.2s;
    flex-shrink: 0;
  }
  .hamburger:hover { border-color: var(--accent); color: var(--accent); }

  .theme-toggle {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 20px; padding: 6px 14px; cursor: pointer;
    font-size: 13px; color: var(--text); font-family: var(--font-body); font-weight: 500; transition: all 0.3s;
  }
  .theme-toggle:hover { border-color: var(--accent); color: var(--accent); }

  .version-chip {
    font-family: var(--font-mono); font-size: 11px; color: var(--accent);
    background: rgba(0,229,160,0.1); border: 1px solid rgba(0,229,160,0.25);
    border-radius: 12px; padding: 4px 10px; animation: pulse-glow 3s infinite;
    white-space: nowrap;
  }

  .content { padding: 48px 56px 80px; max-width: 860px; }
  .section { margin-bottom: 64px; animation: slideInSection 0.6s ease both; }

  .section-tag {
    font-family: var(--font-mono); font-size: 10px; color: var(--accent);
    letter-spacing: 3px; text-transform: uppercase; margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-tag::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .section-title {
    font-family: var(--font-display); font-size: 32px; font-weight: 800;
    color: var(--text); line-height: 1.2; margin-bottom: 14px;
  }
  .section-title span {
    background: linear-gradient(90deg, var(--accent), var(--accent4));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .section-desc { font-size: 15px; color: var(--muted); line-height: 1.75; margin-bottom: 28px; max-width: 640px; }

  .hero-banner {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #0d1117 0%, #0f1e2e 50%, #0d1117 100%);
    border: 1px solid var(--border); border-radius: 16px; padding: 44px 40px;
    margin-bottom: 32px; animation: fadeUp 0.7s 0.1s ease both;
  }
  .hero-banner::before {
    content: ''; position: absolute; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,160,0.02) 2px, rgba(0,229,160,0.02) 4px);
    pointer-events: none;
  }
  .hero-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 40px 40px; opacity: 0.15; pointer-events: none;
  }
  .hero-content { position: relative; z-index: 1; }
  .hero-title { font-family: var(--font-display); font-size: 52px; font-weight: 800; line-height: 1.1; margin-bottom: 16px; }
  .hero-title .accent { color: var(--accent); }
  .hero-title .accent2 { color: var(--accent4); }
  .hero-subtitle { font-size: 16px; color: var(--muted); line-height: 1.7; max-width: 520px; margin-bottom: 28px; }
  .hero-chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .chip { font-family: var(--font-mono); font-size: 11px; padding: 5px 12px; border-radius: 20px; border: 1px solid; letter-spacing: 0.5px; }
  .chip-green  { color: var(--accent);  border-color: rgba(0,229,160,0.3);   background: rgba(0,229,160,0.07); }
  .chip-purple { color: var(--accent4); border-color: rgba(108,99,255,0.3);  background: rgba(108,99,255,0.07); }
  .chip-red    { color: var(--accent2); border-color: rgba(255,107,107,0.3); background: rgba(255,107,107,0.07); }
  .chip-yellow { color: var(--accent3); border-color: rgba(255,217,61,0.3);  background: rgba(255,217,61,0.07); }

  .code-block {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden; margin: 20px 0;
    animation: fadeUp 0.5s ease both; box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  }
  .code-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 16px; background: var(--bg3); border-bottom: 1px solid var(--border);
  }
  .code-dots { display: flex; gap: 6px; }
  .code-dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-r { background: #ff5f57; } .dot-y { background: #febc2e; } .dot-g { background: #28c840; }
  .code-lang { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 1px; }
  .code-body { padding: 20px 24px; font-family: var(--font-mono); font-size: 13px; line-height: 2; overflow-x: auto; white-space: pre; }

  .c-keyword { color: #c792ea; }
  .c-desi    { color: var(--accent); font-weight: 700; }
  .c-cardio  { color: var(--accent2); font-weight: 700; }
  .c-string  { color: #c3e88d; }
  .c-comment { color: #546e7a; font-style: italic; }
  .c-number  { color: var(--accent3); }
  .c-op      { color: var(--accent2); }

  .kw-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  .kw-table th {
    font-family: var(--font-mono); font-size: 11px; color: var(--muted);
    letter-spacing: 2px; text-transform: uppercase; padding: 10px 16px;
    text-align: left; border-bottom: 2px solid var(--border);
  }
  .kw-table td { padding: 11px 16px; font-size: 13.5px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .kw-table tr:last-child td { border-bottom: none; }
  .kw-table tr { transition: background 0.15s; }
  .kw-table tr:hover td { background: var(--bg3); }
  .kw-badge { font-family: var(--font-mono); font-size: 12px; padding: 3px 10px; border-radius: 6px; display: inline-block; }
  .kw-std    { background: rgba(108,99,255,0.12); color: var(--accent4); border: 1px solid rgba(108,99,255,0.2); }
  .kw-desi   { background: rgba(0,229,160,0.10);  color: var(--accent);  border: 1px solid rgba(0,229,160,0.2); }
  .kw-cardio { background: rgba(255,107,107,0.10);color: var(--accent2); border: 1px solid rgba(255,107,107,0.2); }
  .kw-meaning { color: var(--muted); font-size: 12px; font-style: italic; }

  .info-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 24px 28px; margin: 16px 0;
    position: relative; overflow: hidden; animation: fadeUp 0.5s ease both;
  }
  .info-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
  .card-accent::before  { background: var(--accent); }
  .card-purple::before  { background: var(--accent4); }
  .card-red::before     { background: var(--accent2); }
  .info-card-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .info-card p { font-size: 14px; color: var(--muted); line-height: 1.7; }

  .roast-box {
    background: linear-gradient(135deg, rgba(255,107,107,0.08), rgba(255,217,61,0.05));
    border: 1px solid rgba(255,107,107,0.25); border-radius: 16px; padding: 32px;
    margin: 20px 0; position: relative; overflow: hidden;
  }
  .roast-box::after { content: '🔥'; position: absolute; right: 24px; top: 24px; font-size: 48px; opacity: 0.15; animation: float 3s ease-in-out infinite; }
  .roast-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--accent2); margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
  .roast-example { background: var(--bg2); border-radius: 8px; padding: 14px 18px; margin-top: 16px; font-family: var(--font-mono); font-size: 12px; color: var(--accent2); border: 1px solid rgba(255,107,107,0.2); line-height: 1.8; }

  .stages { display: flex; align-items: center; gap: 0; margin: 24px 0; flex-wrap: wrap; }
  .stage { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 18px; text-align: center; min-width: 110px; animation: fadeUp 0.4s ease both; transition: transform 0.2s, border-color 0.2s; }
  .stage:hover { transform: translateY(-4px); border-color: var(--accent); }
  .stage-icon { font-size: 22px; margin-bottom: 6px; }
  .stage-name { font-family: var(--font-mono); font-size: 11px; color: var(--accent); font-weight: 700; }
  .stage-label { font-size: 11px; color: var(--muted); margin-top: 3px; }
  .stage-arrow { color: var(--border); font-size: 18px; padding: 0 4px; }

  .types-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 20px 0; }
  .type-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; transition: all 0.2s; }
  .type-card:hover { border-color: var(--accent); transform: translateY(-2px); }
  .type-name { font-family: var(--font-mono); font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .type-example { font-family: var(--font-mono); font-size: 11px; color: var(--muted); }

  .divider { height: 1px; background: var(--border); margin: 48px 0; position: relative; }
  .divider::after { content: '◆'; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: var(--bg); color: var(--border); padding: 0 12px; font-size: 10px; }

  .main::-webkit-scrollbar { width: 6px; }
  .main::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* ═══════════════════════════════════════
     MOBILE RESPONSIVE  (≤ 768px)
  ═══════════════════════════════════════ */
  @media (max-width: 768px) {

    /* Sidebar: off-screen by default, slides in when .open */
    .sidebar {
      transform: translateX(-100%);
      animation: none;
      width: min(var(--sidebar-w), 80vw);
      box-shadow: 4px 0 32px rgba(0,0,0,0.4);
    }
    .sidebar.open {
      transform: translateX(0);
      animation: slideInSidebar 0.3s cubic-bezier(0.4,0,0.2,1) both;
    }
    .sidebar-close { display: flex; }

    /* Main takes full width */
    .main { margin-left: 0; }

    /* Topbar */
    .topbar { padding: 12px 16px; gap: 8px; }
    .topbar-title { font-size: 12px; letter-spacing: 0.5px; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hamburger { display: flex; align-items: center; justify-content: center; }
    .version-chip { display: none; }

    /* Action buttons — smaller on mobile */
    .theme-toggle { padding: 5px 10px; font-size: 12px; gap: 5px; }

    /* Content padding */
    .content { padding: 24px 16px 60px; }

    /* Hero banner */
    .hero-banner { padding: 28px 20px; border-radius: 12px; }
    .hero-title { font-size: 30px; }
    .hero-subtitle { font-size: 14px; margin-bottom: 20px; }
    .hero-chips { gap: 8px; }
    .chip { font-size: 10px; padding: 4px 10px; }

    /* Section titles */
    .section-title { font-size: 24px; }
    .section-desc { font-size: 14px; margin-bottom: 20px; }
    .section { margin-bottom: 48px; }

    /* Types grid: 2 columns on mobile */
    .types-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .type-card { padding: 12px 14px; }
    .type-name { font-size: 12px; }
    .type-example { font-size: 10px; }

    /* Keyword table — make it scrollable */
    .kw-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 8px; }
    .kw-table { min-width: 480px; }
    .kw-table th { padding: 8px 12px; font-size: 10px; }
    .kw-table td { padding: 9px 12px; font-size: 12px; }
    .kw-badge { font-size: 11px; padding: 2px 8px; }

    /* Code blocks */
    .code-body { font-size: 11px; padding: 14px 16px; line-height: 1.8; }
    .code-header { padding: 8px 12px; }

    /* Info cards */
    .info-card { padding: 18px 16px; }
    .info-card-title { font-size: 14px; }
    .info-card p { font-size: 13px; }

    /* Roast box */
    .roast-box { padding: 22px 18px; }
    .roast-box::after { font-size: 36px; right: 14px; top: 14px; }
    .roast-title { font-size: 20px; }
    .roast-example { font-size: 11px; padding: 10px 14px; }

    /* Pipeline stages — wrap nicely */
    .stages { gap: 8px; justify-content: center; }
    .stage { min-width: 80px; padding: 10px 12px; }
    .stage-icon { font-size: 18px; }
    .stage-name { font-size: 10px; }
    .stage-label { font-size: 10px; }
    .stage-arrow { font-size: 14px; padding: 0 2px; }

    /* Divider */
    .divider { margin: 32px 0; }

    /* Story footer */
    .section:last-child > div:last-child { font-size: 12px; }
  }

  /* ── Very small phones (≤ 380px) ── */
  @media (max-width: 380px) {
    .hero-title { font-size: 24px; }
    .section-title { font-size: 20px; }
    .types-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .theme-toggle { padding: 5px 8px; font-size: 11px; }
    .topbar-right { gap: 6px; }
  }
`;

const SECTIONS = [
  { id: "intro",    label: "Introduction",     emoji: "💡", group: "Getting Started" },
  { id: "install",  label: "Quick Start",       emoji: "⚡", group: "Getting Started" },
  { id: "types",    label: "Data Types",        emoji: "🧬", group: "Language" },
  { id: "keywords", label: "Keywords",          emoji: "🔑", group: "Language" },
  { id: "desi",     label: "Hindi Keywords",     emoji: "🇮🇳", group: "Language" },
  { id: "cardio",   label: "Cardio Keywords",   emoji: "❤️", group: "Language" },
  { id: "syntax",   label: "Syntax & Examples", emoji: "📝", group: "Language" },
  { id: "roast",    label: "Roast Mode",        emoji: "🔥", group: "Features" },
  { id: "pipeline", label: "Compiler Pipeline", emoji: "⚙️", group: "Internals" },
  { id: "story",    label: "The Story",         emoji: "🫀", group: "About" },
];

function CodeBlock({ lang = "cordex", children }) {
  return (
    <div className="code-block">
      <div className="code-header">
        <div className="code-dots">
          <div className="code-dot dot-r" />
          <div className="code-dot dot-y" />
          <div className="code-dot dot-g" />
        </div>
        <span className="code-lang">{lang}</span>
      </div>
      <div className="code-body" dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  );
}

function SectionTag({ children }) {
  return <div className="section-tag">{children}</div>;
}

export default function CordexDocs() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");
  const [active, setActive] = useState("intro");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { threshold: 0.3, rootMargin: "-80px 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false); // close sidebar on mobile after nav
  };

  const groups = [...new Set(SECTIONS.map((s) => s.group))];

  return (
    <>
      <style>{styles}</style>
      <div className={`docs-root ${theme === "light" ? "light" : ""}`}>

        {/* Mobile overlay */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          {/* Mobile close button */}
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

          <div className="sidebar-logo">
            <div className="logo-badge">
              <div className="logo-icon">🫀</div>
              <span className="logo-name">Cordex</span>
              <span className="logo-version">v0.1</span>
            </div>
            <div className="logo-tagline">A language with a heartbeat 💚</div>
          </div>
          <nav className="sidebar-nav">
            {groups.map((group) => (
              <div key={group}>
                <div className="nav-group-label">{group}</div>
                {SECTIONS.filter((s) => s.group === group).map((s) => (
                  <div key={s.id} className={`nav-item ${active === s.id ? "active" : ""}`} onClick={() => scrollTo(s.id)}>
                    <span>{s.emoji}</span>{s.label}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">Built with 🫀 by Praveen</div>
        </aside>

        <main className="main">
          <div className="topbar">
            {/* Hamburger — only visible on mobile via CSS */}
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
              ☰
            </button>
            <span className="topbar-title">CORDEX DOCS</span>
            <div className="topbar-right">
              <span className="version-chip">v0.1 — BETA</span>
              <button className="theme-toggle" onClick={() => navigate("/")}>
                🧪 Open Editor
              </button>
              <button className="theme-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
                {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>

          <div className="content">

            {/* ── INTRO ── */}
            <section id="intro" ref={el => sectionRefs.current.intro = el} className="section">
              <div className="hero-banner">
                <div className="hero-grid" />
                <div className="hero-content">
                  <div className="hero-title">
                    <span className="accent">Cordex</span> —<br />
                    <span className="accent2">Code</span> that breathes.
                  </div>
                  <div className="hero-subtitle">
                    A dynamically-typed, cardiology-themed programming language with Desi-Indian flavor.
                    Write code in English, Hindi, or medical jargon — Cordex understands it all.
                  </div>
                  <div className="hero-chips">
                    <span className="chip chip-green">Dynamically Typed</span>
                    <span className="chip chip-purple">Curly Brace Syntax</span>
                    <span className="chip chip-red">🔥 Roast Mode</span>
                    <span className="chip chip-yellow">With Hindi Keywords</span>
                    <span className="chip chip-red">❤️ Cardio Keywords</span>
                  </div>
                </div>
              </div>
              <div className="info-card card-accent">
                <div className="info-card-title">💡 What is Cordex?</div>
                <p>
                  Cordex is a custom-built interpreted programming language created as a portfolio project.
                  It features a 5-stage compiler pipeline (Lexer → Parser → Semantic Analyzer → Interpreter → ML Error Suggester),
                  three keyword styles (standard English, Hindi/Desi, and cardiology-themed), and a unique
                  <strong style={{color:"var(--accent2)"}}> Roast Mode</strong> powered by Groq AI that humorously critiques your code errors.
                </p>
              </div>
            </section>

            <div className="divider" />

            {/* ── QUICK START ── */}
            <section id="install" ref={el => sectionRefs.current.install = el} className="section">
              <SectionTag>Getting Started</SectionTag>
              <div className="section-title">Quick <span>Start</span></div>
              <div className="section-desc">Write your first Cordex program in under a minute.</div>

              <CodeBlock lang="cordex">
{`<span class="c-comment"># Standard style</span>
<span class="c-keyword">let</span> name <span class="c-op">=</span> <span class="c-string">"Cordex"</span>
<span class="c-keyword">print</span>(<span class="c-string">"Welcome to "</span> <span class="c-op">+</span> name <span class="c-op">+</span> <span class="c-string">"!"</span>)

<span class="c-comment"># Desi style 😎</span>
<span class="c-desi">rakho</span> naam <span class="c-op">=</span> <span class="c-string">"Cordex"</span>
<span class="c-desi">bol</span>(<span class="c-string">"Swagat hai "</span> <span class="c-op">+</span> naam <span class="c-op">+</span> <span class="c-string">" mein!"</span>)

<span class="c-comment"># Cardio style ❤️</span>
<span class="c-cardio">monitor</span>(<span class="c-string">"Welcome to "</span> <span class="c-op">+</span> name <span class="c-op">+</span> <span class="c-string">"!"</span>)`}
              </CodeBlock>

              <div className="info-card card-purple">
                <div className="info-card-title">⚡ Run via API</div>
                <p>Send your code to <code style={{color:"var(--accent)", fontFamily:"var(--font-mono)"}}>POST /Cordex/Interpreter/api/compile/</code> with <code style={{color:"var(--accent4)", fontFamily:"var(--font-mono)"}}>{"{ source, roast_mode }"}</code> as JSON body.</p>
              </div>
            </section>

            <div className="divider" />

            {/* ── TYPES ── */}
            <section id="types" ref={el => sectionRefs.current.types = el} className="section">
              <SectionTag>Language</SectionTag>
              <div className="section-title">Data <span>Types</span></div>
              <div className="section-desc">Cordex is dynamically typed — no type declarations needed. Just assign and go.</div>
              <div className="types-grid">
                {[
                  { name: "int",    example: "let x = 42",       color: "var(--accent3)" },
                  { name: "float",  example: "let pi = 3.14",    color: "var(--accent3)" },
                  { name: "string", example: 'let s = "hello"',  color: "#c3e88d" },
                  { name: "bool",   example: "let ok = true",    color: "var(--accent)" },
                  { name: "array",  example: "let arr = [1,2,3]",color: "var(--accent4)" },
                  { name: "null",   example: "let x = null",     color: "var(--accent2)" },
                ].map(t => (
                  <div className="type-card" key={t.name}>
                    <div className="type-name" style={{color: t.color}}>{t.name}</div>
                    <div className="type-example">{t.example}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="divider" />

            {/* ── STANDARD KEYWORDS ── */}
            <section id="keywords" ref={el => sectionRefs.current.keywords = el} className="section">
              <SectionTag>Language</SectionTag>
              <div className="section-title">Standard <span>Keywords</span></div>
              <div className="section-desc">Classic English keywords — always available.</div>
              <div className="kw-table-wrap">
                <table className="kw-table">
                  <thead>
                    <tr><th>Keyword</th><th>Type</th><th>Usage</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ["let",      "Declaration",  "Declare a variable"],
                      ["if",       "Control Flow", "Conditional branch"],
                      ["else",     "Control Flow", "Alternate branch"],
                      ["while",    "Control Flow", "Loop while condition is true"],
                      ["for",      "Control Flow", "Iterate over a range / array"],
                      ["in",       "Control Flow", "Used with for loops"],
                      ["break",    "Loop Control", "Exit a loop"],
                      ["continue", "Loop Control", "Skip to next iteration"],
                      ["print",    "Output",       "Print to output"],
                      ["true",     "Literal",      "Boolean true"],
                      ["false",    "Literal",      "Boolean false"],
                      ["null",     "Literal",      "Null / no value"],
                    ].map(([kw, type, desc]) => (
                      <tr key={kw}>
                        <td><span className="kw-badge kw-std">{kw}</span></td>
                        <td style={{color:"var(--muted)", fontSize:"12px"}}>{type}</td>
                        <td style={{color:"var(--muted)", fontSize:"13px"}}>{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="divider" />

            {/* ── DESI KEYWORDS ── */}
            <section id="desi" ref={el => sectionRefs.current.desi = el} className="section">
              <SectionTag>Language</SectionTag>
              <div className="section-title">🇮🇳 Desi <span>Keywords</span></div>
              <div className="section-desc">
                Cordex speaks Hindi! Use these Desi-style keywords as 1:1 aliases for standard ones.
                Mix and match — the compiler normalizes both automatically.
              </div>
              <div className="kw-table-wrap">
                <table className="kw-table">
                  <thead>
                    <tr><th>Desi Keyword</th><th>Meaning</th><th>Standard Alias</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ["rakho",     "keep / store",      "let"],
                      ["agar",      "if",                "if"],
                      ["warna",     "otherwise",         "else"],
                      ["ya_phir",   "or else if",        "else if"],
                      ["jab_tak",   "as long as",        "while"],
                      ["baar_baar", "again and again",   "for"],
                      ["bas",       "enough / stop",     "break"],
                      ["aage_badh", "move forward",      "continue"],
                      ["bol",       "say / speak",       "print"],
                      ["sunao",     "tell me",           "print"],
                      ["sach",      "truth",             "true"],
                      ["jhooth",    "lie",               "false"],
                      ["kuch_nahi", "nothing",           "null"],
                    ].map(([kw, meaning, std]) => (
                      <tr key={kw}>
                        <td><span className="kw-badge kw-desi">{kw}</span></td>
                        <td><span className="kw-meaning">"{meaning}"</span></td>
                        <td><span className="kw-badge kw-std">{std}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <CodeBlock lang="cordex — desi style">
{`<span class="c-desi">rakho</span> score <span class="c-op">=</span> <span class="c-number">95</span>

<span class="c-desi">agar</span> (score<span class="c-op">&gt;</span> <span class="c-number">90)</span> {
    <span class="c-desi">bol</span>(<span class="c-string">"Ekdum fatafat! 🔥"</span>)
} <span class="c-desi">ya_phir</span> (score <span class="c-op">&gt;</span> <span class="c-number">75)</span> {
    <span class="c-desi">bol</span>(<span class="c-string">"Theek hai yaar"</span>)
} <span class="c-desi">warna</span> {
    <span class="c-desi">bol</span>(<span class="c-string">"Padhai kar bhai 😂"</span>)
}`}
              </CodeBlock>
            </section>

            <div className="divider" />

            {/* ── CARDIO KEYWORDS ── */}
            <section id="cardio" ref={el => sectionRefs.current.cardio = el} className="section">
              <SectionTag>Language</SectionTag>
              <div className="section-title">❤️ Cardiology <span>Keywords</span></div>
              <div className="section-desc">
                Cordex's heartbeat — medical-themed keywords fully implemented in the lexer,
                normalized to their standard equivalents before parsing.
              </div>
              <div className="kw-table-wrap">
                <table className="kw-table">
                  <thead>
                    <tr><th>Cardio Keyword</th><th>Cardio Meaning</th><th>Standard Alias</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ["diagnose",   "Initial diagnosis",    "if"],
                      ["rediagnose", "Re-examine",           "else"],
                      ["bypass",     "Bypass surgery",       "continue"],
                      ["pulse",      "Check pulse",          "true"],
                      ["monitor",    "Patient monitor",      "print"],
                      ["scan",       "Cardiac scan",         "for"],
                      ["beating",    "Heart is beating",     "while"],
                      ["flatline",   "Flatline / no signal", "null"],
                    ].map(([kw, med, std]) => (
                      <tr key={kw}>
                        <td><span className="kw-badge kw-cardio">{kw}</span></td>
                        <td><span className="kw-meaning">{med}</span></td>
                        <td><span className="kw-badge kw-std">{std}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <CodeBlock lang="cordex — cardio style">
{`<span class="c-keyword">let</span> i <span class="c-op">=</span> <span class="c-number">0</span>

<span class="c-comment"># beating = while,  monitor = print</span>
<span class="c-cardio">beating</span>(i <span class="c-op">&lt;</span> <span class="c-number">5)</span> {
    <span class="c-cardio">monitor</span>(i)
    i++;
}

<span class="c-comment"># diagnose = if,  rediagnose = else</span>
<span class="c-keyword">let</span> bp <span class="c-op">=</span> <span class="c-number">120</span>
<span class="c-cardio">diagnose</span> (bp <span class="c-op">&gt;</span> <span class="c-number">140)</span> {
    <span class="c-cardio">monitor</span>(<span class="c-string">"High BP! ⚠️"</span>)
} <span class="c-cardio">rediagnose</span> {
    <span class="c-cardio">monitor</span>(<span class="c-string">"All clear ✅"</span>)
}

`}
              </CodeBlock>
            </section>

            <div className="divider" />

            {/* ── SYNTAX ── */}
            <section id="syntax" ref={el => sectionRefs.current.syntax = el} className="section">
              <SectionTag>Language</SectionTag>
              <div className="section-title">Syntax & <span>Examples</span></div>

              <div className="section-desc">Variables</div>
              <CodeBlock>
{`<span class="c-keyword">let</span> age <span class="c-op">=</span> <span class="c-number">21</span>
<span class="c-keyword">let</span> name <span class="c-op">=</span> <span class="c-string">"Praveen"</span>
<span class="c-keyword">let</span> skills <span class="c-op">=</span> [<span class="c-string">"Python"</span>, <span class="c-string">"React"</span>, <span class="c-string">"Cordex"</span>]`}
              </CodeBlock>

              <div className="section-desc">If / Else</div>
              <CodeBlock>
{`<span class="c-keyword">let</span> x <span class="c-op">=</span> <span class="c-number">10</span>
<span class="c-keyword">if</span> (x <span class="c-op">&gt;</span> <span class="c-number">5)</span> {
    <span class="c-keyword">print</span>(<span class="c-string">"Big number!"</span>)
} <span class="c-keyword">else</span> {
    <span class="c-keyword">print</span>(<span class="c-string">"Small number"</span>)
}`}
              </CodeBlock>

              <div className="section-desc">Loops</div>
              <CodeBlock>
{`<span class="c-comment"># While loop</span>
<span class="c-keyword">let</span> i <span class="c-op">=</span> <span class="c-number">0</span>
<span class="c-keyword">while</span>(i <span class="c-op">&lt;</span> <span class="c-number">5)</span> {
    <span class="c-keyword">print</span>(i)
    i <span class="c-op">=</span> i++;
}

<span class="c-comment"># For loop</span>
<span class="c-keyword">let</span> nums = [<span class="c-number">1</span>, <span class="c-number">2</span>, <span class="c-number">3</span>]
<span class="c-keyword">for</span>(x <span class="c-keyword">in</span> nums) {
    <span class="c-keyword">print</span>(x)
}`}
              </CodeBlock>

              <div className="section-desc">Comments</div>
              <CodeBlock>
{`<span class="c-comment"># This is a single-line comment in Cordex
# Hash-style, like Python</span>
<span class="c-keyword">let</span> x <span class="c-op">=</span> <span class="c-number">42</span>  <span class="c-comment"># inline comment too!</span>`}
              </CodeBlock>
            </section>

            <div className="divider" />

            {/* ── ROAST MODE ── */}
            <section id="roast" ref={el => sectionRefs.current.roast = el} className="section">
              <SectionTag>Features</SectionTag>
              <div className="section-title">🔥 Roast <span>Mode</span></div>
              <div className="roast-box">
                <div className="roast-title">🔥 Roast Mode</div>
                <p style={{color:"var(--muted)", fontSize:"14px", lineHeight:1.7}}>
                  Enable <strong style={{color:"var(--accent2)"}}>Roast Mode</strong> and Cordex won't just tell you there's an error —
                  it will <em>roast you for it</em>. Powered by <strong>Groq AI</strong>, the ML error suggester
                  generates hilariously brutal, context-aware error messages to keep you humble and entertained.
                </p>
                <div className="roast-example">
                  ❌ Error: Undefined variable 'scre' at line 4<br /><br />
                  🔥 Roast: "Bhai, 'scre'?? Did your keyboard also give up on you?
                  Maybe try finishing your words before asking the compiler to run them.
                  Even autocorrect is embarrassed for you right now. 😂"
                </div>
              </div>
              <div className="info-card card-red">
                <div className="info-card-title">⚙️ How it works</div>
                <p>When <code style={{fontFamily:"var(--font-mono)", color:"var(--accent2)"}}>roast_mode: true</code> is sent with the compile request,
                the error is passed to the Groq API which returns a funny, personalized roast message alongside the technical error.</p>
              </div>
            </section>

            <div className="divider" />

            {/* ── PIPELINE ── */}
            <section id="pipeline" ref={el => sectionRefs.current.pipeline = el} className="section">
              <SectionTag>Internals</SectionTag>
              <div className="section-title">Compiler <span>Pipeline</span></div>
              <div className="section-desc">Cordex source code passes through 5 stages before producing output.</div>
              <div className="stages">
                {[
                  { icon: "🔤", name: "LEXER",     label: "Tokenizer" },
                  { icon: "🌳", name: "PARSER",    label: "AST Builder" },
                  { icon: "🔍", name: "SEMANTIC",  label: "Analyzer" },
                  { icon: "⚙️", name: "INTERPRET", label: "Executor" },
                  { icon: "🤖", name: "ML ROAST",  label: "AI Errors" },
                ].map((s, i, arr) => (
                  <>
                    <div className="stage" key={s.name} style={{animationDelay: `${i*0.1}s`}}>
                      <div className="stage-icon">{s.icon}</div>
                      <div className="stage-name">{s.name}</div>
                      <div className="stage-label">{s.label}</div>
                    </div>
                    {i < arr.length - 1 && <div className="stage-arrow" key={`arrow-${i}`}>→</div>}
                  </>
                ))}
              </div>
              <div className="info-card card-accent" style={{marginTop:20}}>
                <div className="info-card-title">📁 File Structure</div>
                <p style={{fontFamily:"var(--font-mono)", fontSize:"12px", lineHeight:2, color:"var(--muted)"}}>
                  backend/cordex/compiler/<br/>
                  &nbsp;&nbsp;├── lexer.py &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Tokenizes + normalizes all keyword aliases<br/>
                  &nbsp;&nbsp;├── parser.py &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Builds AST<br/>
                  &nbsp;&nbsp;├── semantic.py &nbsp;&nbsp;&nbsp;→ Validates semantics<br/>
                  &nbsp;&nbsp;├── interpreter.py → Executes AST<br/>
                  &nbsp;&nbsp;├── roast.py &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Groq AI roaster<br/>
                  &nbsp;&nbsp;└── pipeline.py &nbsp;&nbsp;&nbsp;→ Orchestrates all stages
                </p>
              </div>
            </section>

            <div className="divider" />

            {/* ── STORY ── */}
            <section id="story" ref={el => sectionRefs.current.story = el} className="section">
              <SectionTag>About</SectionTag>
              <div className="section-title">The <span>Story</span> 🫀</div>
              <div className="info-card card-purple">
                <div className="info-card-title">🫀 Why Cordex?</div>
                <p>
                  Cordex was born as a portfolio project to demonstrate full compiler construction from scratch —
                  lexer to interpreter — using pure Python. The cardiology theme was chosen to make the language
                  feel alive, like a beating heart. Every keyword, every error message, every stage of the pipeline
                  is designed with intentionality. The Desi-Indian keyword layer was added to make Cordex truly unique —
                  a language that speaks the developer's mother tongue. Roast Mode was added because debugging shouldn't
                  be boring. Cordex is not just a compiler — it's a statement. 💚
                </p>
              </div>
              <div style={{marginTop:24, textAlign:"center", color:"var(--muted)", fontSize:"13px", fontFamily:"var(--font-mono)"}}>
                <div style={{fontSize:32, marginBottom:8, animation:"heartbeat 2s infinite"}}>🫀</div>
                Made with love, Hindi, and way too much caffeine.<br/>
                <span style={{color:"var(--accent)"}}>— Praveen</span>
              </div>
            </section>

          </div>
        </main>
      </div>
    </>
  );
}
