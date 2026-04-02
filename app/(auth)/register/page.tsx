"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   HOOK: Intersection Observer for scroll reveal
───────────────────────────────────────────────*/
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────────*/
const carouselCards = [
  {
    label: "Total Reward",
    value: "12.5K",
    unit: "poin",
    sub: "Dikumpulkan bulan ini",
    badge: null,
    extra: null,
    accent: "#B91C1C",
    accentLight: "#FEF2F2",
    tag: "Reward",
  },
  {
    label: "Status Kontributor",
    value: null,
    unit: null,
    sub: "Akun terverifikasi resmi",
    badge: "✓ Verified Contributor",
    extra: "Artikel terpublikasi: 48",
    accent: "#D97706",
    accentLight: "#FFFBEB",
    tag: "Status",
  },
  {
    label: "Jangkauan Konten",
    value: "84K",
    unit: "pembaca",
    sub: "Bulan ini · naik 23%",
    badge: null,
    extra: null,
    accent: "#059669",
    accentLight: "#ECFDF5",
    tag: "Jangkauan",
  },
];

const benefits = [
  {
    icon: "🏆",
    title: "Sistem Reward & Poin",
    desc: "Setiap kontribusi Anda menghasilkan poin yang bisa ditukarkan dengan hadiah eksklusif, saldo digital, atau benefit menarik lainnya.",
    color: "#B91C1C",
    items: ["Poin per artikel dipublikasikan", "Bonus poin artikel terpopuler", "Reward bulanan top kontributor"],
  },
  {
    icon: "🎖️",
    title: "Badge & Rekognisi",
    desc: "Raih badge eksklusif yang tampil di profil publik Anda. Semakin aktif berkontribusi, semakin bergengsi badge yang Anda dapatkan.",
    color: "#D97706",
    items: ["Badge Verified Contributor", "Leaderboard mingguan & bulanan", "Hall of Fame kontributor terbaik"],
  },
  {
    icon: "📈",
    title: "Portofolio Profesional",
    desc: "Bangun portofolio nyata yang dapat ditunjukkan kepada rekruter, klien, atau mitra. Setiap karya Anda tersimpan dan dapat diakses kapan saja.",
    color: "#059669",
    items: ["Profil kontributor publik", "Sertifikat kontribusi resmi", "Portofolio karya terverifikasi"],
  },
  {
    icon: "🤝",
    title: "Networking & Komunitas",
    desc: "Bergabung dengan komunitas jurnalis, editor, dan redaktur profesional. Perluas jaringan dan buka peluang kolaborasi yang nyata.",
    color: "#0369A1",
    items: ["Komunitas media profesional", "Webinar & event eksklusif", "Sesi behind-the-scenes tim inti"],
  },
  {
    icon: "💼",
    title: "Peluang Karier Nyata",
    desc: "Kontributor terbaik berpotensi direkrut ke tim inti atau menjalin kerja sama resmi sebagai mitra dan ambassador NarasiKota.",
    color: "#B91C1C",
    items: ["Peluang rekrutmen tim inti", "Program ambassador resmi", "Revenue sharing konten populer"],
  },
];

const stats = [
  { value: "40+", label: "Kontributor Aktif" },
  { value: "1K+", label: "Artikel Diterbitkan" },
  { value: "1M+", label: "Pembaca Bulanan" },
  { value: "98%", label: "Kepuasan Kontributor" },
];

const roles = [
  {
    icon: "📋",
    title: "Redaksi / Redaktur",
    desc: "Pengelola utama alur produksi konten. Bertanggung jawab atas perencanaan, pengawasan, dan kualitas keseluruhan berita.",
    age: "21 Tahun",
    tags: ["Leadership", "Editorial", "Manajemen Tim"],
    href: "/karier",
  },
  {
    icon: "🎙️",
    title: "Jurnalis / Reporter",
    desc: "Garda terdepan dalam mengumpulkan informasi, melakukan peliputan lapangan, dan menyusun berita yang faktual dan aktual.",
    age: "18 Tahun",
    tags: ["Liputan", "Wawancara", "Verifikasi Fakta"],
    href: "/karier",
  },
  {
    icon: "✏️",
    title: "Editor",
    desc: "Penjaga kualitas tulisan. Memastikan setiap naskah memenuhi standar jurnalistik dan siap dipublikasikan.",
    age: "20 Tahun",
    tags: ["Penyuntingan", "Fact-Checking", "SEO"],
    href: "/karier",
  },
];

const testimonials = [
  {
    name: "Rizky Firmansyah",
    role: "Jurnalis Aktif · 2 Tahun",
    avatar: "RF",
    quote: "Bergabung di NarasiKota adalah keputusan terbaik dalam karier saya. Portofolio saya berkembang pesat dan jaringan profesional saya semakin luas.",
  },
  {
    name: "Sari Dewi Putri",
    role: "Editor · 1.5 Tahun",
    avatar: "SD",
    quote: "Sistem reward yang transparan dan komunitas yang supportif membuat saya semakin termotivasi untuk terus berkontribusi setiap harinya.",
  },
  {
    name: "Ahmad Fauzi",
    role: "Redaktur · 3 Tahun",
    avatar: "AF",
    quote: "Dari kontributor lepas, kini saya menjadi bagian dari tim inti. NarasiKota benar-benar menghargai dan mengembangkan potensi kontributornya.",
  },
];

/* ─────────────────────────────────────────────
   CSS
───────────────────────────────────────────────*/
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .kr-wrap *, .kr-wrap *::before, .kr-wrap *::after { box-sizing: border-box; }

  .kr-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #F8F9FB;
    color: #1E2535;
    overflow-x: hidden;
  }

  /* ── NAVBAR ── */
  .kr-nav {
    background: #ffffff;
    border-bottom: 1px solid #EEF0F4;
    position: sticky; top: 0; z-index: 100;
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px;
  }
  .kr-nav-links { display: flex; gap: 32px; }
  .kr-nav-links a {
    text-decoration: none; font-size: 14px; font-weight: 500;
    color: #5A6478; transition: color .2s;
  }
  .kr-nav-links a:hover { color: #B91C1C; }
  .kr-nav-links a.active { color: #B91C1C; font-weight: 600; }
  .kr-nav-cta {
    background: #B91C1C; color: white;
    border: none; padding: 10px 22px;
    border-radius: 50px; font-size: 14px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: background .2s, transform .15s;
    text-decoration: none; font-family: 'DM Sans', sans-serif;
  }
  .kr-nav-cta:hover { background: #991B1B; transform: translateY(-1px); }

  /* ── HAMBURGER ── */
  .kr-hamburger {
    display: none; flex-direction: column; justify-content: center; align-items: center;
    gap: 5px; width: 40px; height: 40px;
    background: none; border: none; cursor: pointer; padding: 4px;
    border-radius: 8px; transition: background .2s;
  }
  .kr-hamburger:hover { background: #FEF2F2; }
  .kr-hamburger span {
    display: block; width: 22px; height: 2px;
    background: #1E2535; border-radius: 2px;
    transition: all .3s cubic-bezier(.4,0,.2,1); transform-origin: center;
  }
  .kr-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .kr-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .kr-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .kr-mobile-menu {
    display: none; position: fixed; top: 68px; left: 0; right: 0; z-index: 99;
    background: #ffffff; border-bottom: 1px solid #EEF0F4;
    box-shadow: 0 8px 24px rgba(0,0,0,.1);
    padding: 16px 24px 24px; flex-direction: column; gap: 4px;
    animation: krMenuSlide .25s ease;
  }
  .kr-mobile-menu.open { display: flex; }
  @keyframes krMenuSlide {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .kr-mobile-menu a {
    text-decoration: none; font-size: 15px; font-weight: 500;
    color: #5A6478; padding: 12px 8px; border-bottom: 1px solid #F4F5F8; transition: color .2s;
  }
  .kr-mobile-menu a:last-of-type { border-bottom: none; }
  .kr-mobile-menu a:hover { color: #B91C1C; }
  .kr-mobile-menu-cta {
    margin-top: 12px; background: #B91C1C; color: white;
    border: none; padding: 12px 22px; border-radius: 50px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    text-decoration: none; font-family: 'DM Sans', sans-serif; transition: background .2s;
  }
  .kr-mobile-menu-cta:hover { background: #991B1B; }

  /* ── BREADCRUMB ── */
  .kr-breadcrumb {
    padding: 14px 60px; display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #9AA3B2;
  }
  .kr-breadcrumb a { color: #B91C1C; text-decoration: none; font-weight: 500; }
  .kr-breadcrumb a:hover { text-decoration: underline; }
  .kr-breadcrumb-sep { color: #DDE1E9; }

  /* ── HERO ── */
  .kr-hero {
    position: relative; overflow: hidden;
    background: #ffffff;
    border-bottom: 1px solid #EEF0F4;
    padding: 80px 60px 90px;
  }
  .kr-hero-bg {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 60% 70% at 90% 50%, rgba(185,28,28,.05) 0%, transparent 60%),
      radial-gradient(ellipse 40% 50% at -10% 80%, rgba(185,28,28,.04) 0%, transparent 60%);
  }
  .kr-hero-grid {
    position: absolute; inset: 0; pointer-events: none; opacity: .03;
    background-image: linear-gradient(#B91C1C 1px, transparent 1px), linear-gradient(90deg, #B91C1C 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .kr-hero-inner {
    position: relative; max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .kr-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: #FEF2F2; color: #B91C1C;
    padding: 6px 14px; border-radius: 50px;
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px;
    margin-bottom: 20px;
  }
  .kr-hero-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #B91C1C; animation: krPulse 1.8s ease-in-out infinite;
  }
  @keyframes krPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: .5; transform: scale(1.4); }
  }
  .kr-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 52px; font-weight: 900; line-height: 1.1;
    color: #1E2535; margin-bottom: 20px;
  }
  .kr-hero-title em { font-style: italic; color: #B91C1C; }
  .kr-hero-desc {
    font-size: 16px; color: #5A6478; line-height: 1.8;
    margin-bottom: 32px; max-width: 480px;
  }
  .kr-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .kr-btn-primary {
    background: #B91C1C; color: white;
    border: none; padding: 14px 28px; border-radius: 50px;
    font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: background .2s, transform .2s, box-shadow .2s;
    box-shadow: 0 4px 18px rgba(185,28,28,.35);
    text-decoration: none;
  }
  .kr-btn-primary:hover { background: #991B1B; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(185,28,28,.45); }
  .kr-btn-secondary {
    background: transparent; color: #1E2535;
    border: 1.5px solid #DDE1E9; padding: 14px 28px; border-radius: 50px;
    font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: border-color .2s, color .2s, background .2s;
    text-decoration: none;
  }
  .kr-btn-secondary:hover { border-color: #B91C1C; color: #B91C1C; background: #FEF2F2; }

  /* ── CAROUSEL ── */
  .kr-hero-visual {
    display: flex; align-items: center; justify-content: center; position: relative;
  }
  .kr-carousel-wrap {
    width: 100%;
    display: flex; flex-direction: column; align-items: center; gap: 20px;
  }
  .kr-carousel-track {
    width: 100%; height: 320px; position: relative;
  }
  .kr-carousel-card {
    position: absolute; inset: 0;
    background: white; border-radius: 24px; padding: 36px 40px 32px;
    box-shadow: 0 20px 60px rgba(0,0,0,.10), 0 4px 16px rgba(0,0,0,.05);
    border: 1px solid #EEF0F4;
    display: flex; flex-direction: column; justify-content: space-between;
    overflow: hidden;
    transition: opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1);
    pointer-events: none;
  }
  .kr-carousel-card.active {
    opacity: 1; transform: translateX(0) scale(1); z-index: 2; pointer-events: auto;
  }
  .kr-carousel-card.prev {
    opacity: 0; transform: translateX(-50px) scale(.96); z-index: 1;
  }
  .kr-carousel-card.next {
    opacity: 0; transform: translateX(50px) scale(.96); z-index: 1;
  }

  /* Top row: label left, tag pill right */
  .kr-carousel-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px;
  }
  .kr-carousel-label {
    font-size: 12px; font-weight: 700; color: #9AA3B2;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .kr-carousel-tag {
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px;
    color: var(--c-accent); background: var(--c-accent-light);
    padding: 5px 12px; border-radius: 50px;
  }

  /* Main value */
  .kr-carousel-value-row {
    display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px;
  }
  .kr-carousel-value {
    font-family: 'Playfair Display', serif;
    font-size: 72px; font-weight: 900; color: #1E2535; line-height: 1;
  }
  .kr-carousel-unit {
    font-size: 20px; font-weight: 600; color: #9AA3B2;
  }

  /* Badge (status card) */
  .kr-carousel-badge {
    display: inline-flex; align-items: center;
    padding: 10px 20px; border-radius: 10px;
    font-size: 17px; font-weight: 700;
    background: var(--c-accent-light); color: var(--c-accent);
    margin-bottom: 10px; width: fit-content;
  }
  .kr-carousel-extra {
    font-size: 14px; color: #5A6478; font-weight: 500; margin-top: 6px;
  }

  /* Divider + sub */
  .kr-carousel-divider {
    height: 1px; background: #EEF0F4; margin: 18px 0 14px;
  }
  .kr-carousel-sub {
    font-size: 14px; font-weight: 500; color: #9AA3B2;
  }

  /* Bottom accent bar */
  .kr-carousel-bar {
    position: absolute; bottom: 0; left: 0; right: 0; height: 5px;
    background: var(--c-accent); border-radius: 0 0 24px 24px;
  }

  /* Dots — no progress bar */
  .kr-carousel-dots {
    display: flex; gap: 8px; align-items: center;
  }
  .kr-carousel-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #DDE1E9; border: none; cursor: pointer; padding: 0;
    transition: background .3s, width .3s, border-radius .3s;
  }
  .kr-carousel-dot.active {
    background: #B91C1C; width: 28px; border-radius: 4px;
  }
  .kr-carousel-dot:hover:not(.active) { background: #9AA3B2; }

  /* ── STATS BAR ── */
  .kr-stats-bar { background: #B91C1C; padding: 0 60px; }
  .kr-stats-inner {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr);
  }
  .kr-stat-item {
    padding: 28px 20px; text-align: center;
    border-right: 1px solid rgba(255,255,255,.15); transition: background .2s;
  }
  .kr-stat-item:last-child { border-right: none; }
  .kr-stat-item:hover { background: rgba(255,255,255,.08); }
  .kr-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 36px; font-weight: 900; color: white; line-height: 1; margin-bottom: 4px;
  }
  .kr-stat-label { font-size: 13px; color: rgba(255,255,255,.75); font-weight: 500; }

  /* ── SECTION COMMON ── */
  .kr-section { padding: 90px 60px; }
  .kr-section-inner { max-width: 1100px; margin: 0 auto; }
  .kr-section-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    background: #FEF2F2; color: #B91C1C;
    padding: 5px 14px; border-radius: 50px;
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px;
    margin-bottom: 14px;
  }
  .kr-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 40px; font-weight: 800; color: #1E2535; line-height: 1.15; margin-bottom: 14px;
  }
  .kr-section-desc {
    font-size: 15px; color: #5A6478; line-height: 1.75;
    max-width: 600px; margin-bottom: 56px;
  }
  .kr-section-head-center { text-align: center; }
  .kr-section-head-center .kr-section-desc { margin-left: auto; margin-right: auto; }

  /* ── SCROLL REVEAL ── */
  .kr-reveal {
    opacity: 0; transform: translateY(32px);
    transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1);
  }
  .kr-reveal.visible { opacity: 1; transform: translateY(0); }
  .kr-reveal-delay-1 { transition-delay: .1s; }
  .kr-reveal-delay-2 { transition-delay: .2s; }
  .kr-reveal-delay-3 { transition-delay: .3s; }
  .kr-reveal-delay-4 { transition-delay: .4s; }
  .kr-reveal-delay-5 { transition-delay: .5s; }

  /* ── BENEFITS ── */
  .kr-benefits-section { background: #ffffff; }
  .kr-benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .kr-benefit-card {
    background: #F8F9FB; border: 1px solid #EEF0F4;
    border-radius: 18px; padding: 30px 28px;
    position: relative; overflow: hidden;
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s, border-color .3s, background .3s;
    cursor: default;
  }
  .kr-benefit-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--card-color);
    transform: scaleX(0); transform-origin: left;
    transition: transform .35s cubic-bezier(.22,1,.36,1);
  }
  .kr-benefit-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,.1); border-color: #DDE1E9; background: white; }
  .kr-benefit-card:hover::before { transform: scaleX(1); }
  .kr-benefit-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: white; border: 1px solid #EEF0F4;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,.06); transition: transform .3s;
  }
  .kr-benefit-card:hover .kr-benefit-icon { transform: scale(1.1) rotate(-3deg); }
  .kr-benefit-title { font-size: 17px; font-weight: 700; color: #1E2535; margin-bottom: 10px; }
  .kr-benefit-desc { font-size: 13.5px; color: #5A6478; line-height: 1.7; margin-bottom: 18px; }
  .kr-benefit-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 7px; }
  .kr-benefit-items li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #5A6478; }
  .kr-benefit-items li::before {
    content: '✓'; color: var(--card-color); font-weight: 700;
    font-size: 13px; flex-shrink: 0; margin-top: 1px;
  }

  /* ── HOW IT WORKS ── */
  .kr-how-section { background: #F8F9FB; }
  .kr-steps {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative;
  }
  .kr-steps::before {
    content: ''; position: absolute;
    top: 40px; left: 12.5%; right: 12.5%; height: 2px;
    background: linear-gradient(90deg, #B91C1C, #EF4444, #B91C1C);
    background-size: 200% 100%; animation: krFlow 3s linear infinite; z-index: 0;
  }
  @keyframes krFlow {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
  }
  .kr-step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 20px; position: relative; z-index: 1; }
  .kr-step-num {
    width: 80px; height: 80px; border-radius: 50%;
    background: white; border: 3px solid #B91C1C;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 900; color: #B91C1C;
    margin-bottom: 20px; box-shadow: 0 4px 18px rgba(185,28,28,.2);
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;
  }
  .kr-step:hover .kr-step-num { transform: scale(1.1); box-shadow: 0 8px 28px rgba(185,28,28,.35); }
  .kr-step-title { font-size: 16px; font-weight: 700; color: #1E2535; margin-bottom: 8px; }
  .kr-step-desc { font-size: 13.5px; color: #5A6478; line-height: 1.65; }

  /* ── ROLES ── */
  .kr-roles-section { background: #ffffff; }
  .kr-roles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .kr-role-card {
    background: #F8F9FB; border: 1px solid #EEF0F4;
    border-radius: 18px; padding: 32px 28px;
    display: flex; flex-direction: column;
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s, background .3s;
    position: relative; overflow: hidden;
  }
  .kr-role-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px;
    background: #B91C1C;
    transform: scaleX(0); transform-origin: left;
    transition: transform .35s cubic-bezier(.22,1,.36,1);
  }
  .kr-role-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,.1); background: white; }
  .kr-role-card:hover::after { transform: scaleX(1); }
  .kr-role-icon { font-size: 36px; margin-bottom: 16px; transition: transform .3s; }
  .kr-role-card:hover .kr-role-icon { transform: scale(1.15) rotate(-5deg); }
  .kr-role-card-title { font-size: 19px; font-weight: 700; color: #1E2535; margin-bottom: 10px; }
  .kr-role-card-desc { font-size: 14px; color: #5A6478; line-height: 1.7; margin-bottom: 16px; flex: 1; }
  .kr-role-meta-row { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
  .kr-role-age-badge { background: #FEF2F2; color: #B91C1C; padding: 4px 10px; border-radius: 50px; font-size: 12px; font-weight: 700; }
  .kr-role-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 22px; }
  .kr-role-tag {
    background: #EEF0F4; color: #5A6478; padding: 4px 10px;
    border-radius: 50px; font-size: 12px; font-weight: 500;
    transition: background .2s, color .2s;
  }
  .kr-role-card:hover .kr-role-tag { background: #FEF2F2; color: #B91C1C; }
  .kr-role-link {
    display: flex; align-items: center; gap: 6px;
    color: #B91C1C; font-size: 14px; font-weight: 700;
    text-decoration: none; transition: gap .2s;
  }
  .kr-role-link:hover { gap: 10px; }
  .kr-role-link svg { width: 16px; height: 16px; }

  /* ── TESTIMONIALS ── */
  .kr-testi-section { background: #1E2535; overflow: hidden; position: relative; }
  .kr-testi-section::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(185,28,28,.12) 0%, transparent 60%);
  }
  .kr-testi-section .kr-section-eyebrow { background: rgba(185,28,28,.2); }
  .kr-testi-section .kr-section-title { color: white; }
  .kr-testi-section .kr-section-desc { color: rgba(255,255,255,.65); }
  .kr-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .kr-testi-card {
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
    border-radius: 18px; padding: 28px 26px;
    transition: background .3s, transform .3s, border-color .3s;
  }
  .kr-testi-card:hover { background: rgba(255,255,255,.09); transform: translateY(-4px); border-color: rgba(185,28,28,.4); }
  .kr-testi-quote {
    font-size: 14.5px; color: rgba(255,255,255,.8); line-height: 1.8;
    margin-bottom: 22px; font-style: italic;
    position: relative; padding-left: 18px;
  }
  .kr-testi-quote::before {
    content: '"'; position: absolute; left: 0; top: -6px;
    font-size: 48px; color: #B91C1C; font-family: 'Playfair Display', serif;
    line-height: 1; font-style: normal;
  }
  .kr-testi-author { display: flex; align-items: center; gap: 12px; }
  .kr-testi-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: #B91C1C; display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: white; flex-shrink: 0;
  }
  .kr-testi-name { font-size: 14px; font-weight: 700; color: white; }
  .kr-testi-role-label { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 2px; }

  /* ── CTA ── */
  .kr-cta-section {
    background: #ffffff; padding: 100px 60px;
    text-align: center; position: relative; overflow: hidden;
  }
  .kr-cta-section::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 50% 60% at 50% 100%, rgba(185,28,28,.06) 0%, transparent 60%);
  }
  .kr-cta-inner { position: relative; max-width: 700px; margin: 0 auto; }
  .kr-cta-title {
    font-family: 'Playfair Display', serif;
    font-size: 48px; font-weight: 900; color: #1E2535; line-height: 1.15; margin-bottom: 18px;
  }
  .kr-cta-title em { font-style: italic; color: #B91C1C; }
  .kr-cta-desc { font-size: 16px; color: #5A6478; line-height: 1.75; margin-bottom: 36px; }
  .kr-cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .kr-cta-note { font-size: 13px; color: #9AA3B2; margin-top: 18px; }

  /* ── FOOTER ── */
  .kr-page-footer {
    background: #F8F9FB; border-top: 1px solid #EEF0F4;
    padding: 30px 60px; text-align: center;
    font-size: 13px; color: #9AA3B2;
  }
  .kr-page-footer a { color: #B91C1C; text-decoration: none; font-weight: 600; }
  .kr-page-footer a:hover { text-decoration: underline; }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .kr-benefits-grid { grid-template-columns: repeat(2, 1fr); }
    .kr-roles-grid { grid-template-columns: repeat(2, 1fr); }
    .kr-testi-grid { grid-template-columns: repeat(2, 1fr); }
    .kr-hero-title { font-size: 42px; }
  }
  @media (max-width: 900px) {
    .kr-nav { padding: 0 20px; }
    .kr-nav-links { display: none; }
    .kr-nav-cta { display: none; }
    .kr-hamburger { display: flex; }
    .kr-hero { padding: 60px 24px 70px; }
    .kr-hero-inner { grid-template-columns: 1fr; gap: 40px; }
    .kr-hero-title { font-size: 36px; }
    .kr-hero-visual { display: none; }
    .kr-stats-inner { grid-template-columns: repeat(2, 1fr); }
    .kr-stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,.15); }
    .kr-stat-item:nth-child(odd) { border-right: 1px solid rgba(255,255,255,.15); }
    .kr-stat-item:nth-child(3), .kr-stat-item:nth-child(4) { border-bottom: none; }
    .kr-section { padding: 60px 24px; }
    .kr-breadcrumb { padding: 14px 24px; }
    .kr-steps { grid-template-columns: repeat(2, 1fr); gap: 32px; }
    .kr-steps::before { display: none; }
    .kr-section-title { font-size: 30px; }
    .kr-cta-section { padding: 70px 24px; }
    .kr-cta-title { font-size: 34px; }
    .kr-page-footer { padding: 24px 20px; }
    .kr-stats-bar { padding: 0 24px; }
  }
  @media (max-width: 640px) {
    .kr-benefits-grid { grid-template-columns: 1fr; }
    .kr-roles-grid { grid-template-columns: 1fr; }
    .kr-testi-grid { grid-template-columns: 1fr; }
    .kr-testi-card:last-child { display: none; }
    .kr-steps { grid-template-columns: 1fr; }
    .kr-hero-title { font-size: 30px; }
  }
`;

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────*/
function RevealDiv({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  const delayClass = delay ? `kr-reveal-delay-${delay}` : "";
  return (
    <div ref={ref} className={`kr-reveal ${delayClass} ${inView ? "visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────*/
export default function KarierPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % carouselCards.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = () => setMobileOpen(false);
    if (mobileOpen) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [mobileOpen]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="kr-wrap">

        {/* ── NAVBAR ── */}
        <nav className="kr-nav">
          <Link href="/" className="shrink-0">
            <Image
              src="/assets/NarasiKotaLogoBiru.webp"
              alt="NarasiKota"
              width={220} height={64}
              className="h-16 ml-6 w-auto object-contain"
              priority
            />
          </Link>
          <div className="kr-nav-links">
            <Link href="/tentang-kami">Tentang Kami</Link>
            <a href="/tim-kami">Tim Kami</a>
            <a href="/karier">Karier</a>
            <a href="#">Kontak</a>
          </div>
          <Link href="/kontributor" className="kr-nav-cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Daftar Kontributor
          </Link>
          <button
            className={`kr-hamburger${mobileOpen ? " open" : ""}`}
            onClick={(e) => { e.stopPropagation(); setMobileOpen(v => !v); }}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </nav>

        <div className={`kr-mobile-menu${mobileOpen ? " open" : ""}`} onClick={(e) => e.stopPropagation()}>
          <Link href="/tentang-kami" onClick={() => setMobileOpen(false)}>Tentang Kami</Link>
          <a href="/tim-kami" onClick={() => setMobileOpen(false)}>Tim Kami</a>
          <a href="/karier" onClick={() => setMobileOpen(false)}>Karier</a>
          <a href="#" onClick={() => setMobileOpen(false)}>Kontak</a>
          <Link href="/karier" className="kr-mobile-menu-cta" onClick={() => setMobileOpen(false)}>
            Daftar Kontributor
          </Link>
        </div>

        {/* ── BREADCRUMB ── */}
        <div className="kr-breadcrumb">
          <a href="">Beranda</a>
          <span className="kr-breadcrumb-sep">›</span>
          <span>Karier</span>
        </div>

        {/* ── HERO ── */}
        <section className="kr-hero">
          <div className="kr-hero-bg" />
          <div className="kr-hero-grid" />
          <div className="kr-hero-inner">

            {/* Left */}
            <div>
              <div className="kr-hero-eyebrow">
                <div className="kr-hero-eyebrow-dot" />
                Bergabung Bersama Kami
              </div>
              <h1 className="kr-hero-title">
                Jadilah Bagian dari<br />
                <em>Media Masa Depan</em>
              </h1>
              <p className="kr-hero-desc">
                NarasiKota membuka peluang bagi Anda untuk berkontribusi, berkembang,
                dan membangun karier di dunia jurnalisme digital. Bukan sekadar menulis —
                tapi menciptakan dampak nyata bagi jutaan pembaca.
              </p>
              <div className="kr-hero-actions">
                <Link href="/karier" className="kr-btn-primary">
                  Daftar Sekarang
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <a href="#benefits" className="kr-btn-secondary">
                  Lihat Keuntungan
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Carousel */}
            <div className="kr-hero-visual">
              <div className="kr-carousel-wrap">

                <div className="kr-carousel-track">
                  {carouselCards.map((card, i) => {
                    const prevIndex = (activeCard - 1 + carouselCards.length) % carouselCards.length;
                    const state = i === activeCard ? "active" : i === prevIndex ? "prev" : "next";
                    return (
                      <div
                        key={i}
                        className={`kr-carousel-card ${state}`}
                        style={{
                          "--c-accent": card.accent,
                          "--c-accent-light": card.accentLight,
                        } as React.CSSProperties}
                      >
                        {/* Top */}
                        <div className="kr-carousel-top">
                          <span className="kr-carousel-label">{card.label}</span>
                          <span className="kr-carousel-tag">{card.tag}</span>
                        </div>

                        {/* Main */}
                        <div>
                          {card.value && (
                            <div className="kr-carousel-value-row">
                              <span className="kr-carousel-value">{card.value}</span>
                              {card.unit && <span className="kr-carousel-unit">{card.unit}</span>}
                            </div>
                          )}
                          {card.badge && (
                            <div className="kr-carousel-badge">{card.badge}</div>
                          )}
                          {card.extra && (
                            <div className="kr-carousel-extra">{card.extra}</div>
                          )}
                        </div>

                        {/* Bottom */}
                        <div>
                          <div className="kr-carousel-divider" />
                          <span className="kr-carousel-sub">{card.sub}</span>
                        </div>

                        <div className="kr-carousel-bar" />
                      </div>
                    );
                  })}
                </div>

                {/* Dots only — no progress bar */}
                <div className="kr-carousel-dots">
                  {carouselCards.map((_, i) => (
                    <button
                      key={i}
                      className={`kr-carousel-dot ${i === activeCard ? "active" : ""}`}
                      onClick={() => setActiveCard(i)}
                      aria-label={`Tampilkan card ${i + 1}`}
                    />
                  ))}
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── STATS BAR ── */}
        <div className="kr-stats-bar">
          <div className="kr-stats-inner">
            {stats.map((s, i) => (
              <div key={i} className="kr-stat-item">
                <div className="kr-stat-value">{s.value}</div>
                <div className="kr-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BENEFITS ── */}
        <section className="kr-section kr-benefits-section" id="benefits">
          <div className="kr-section-inner">
            <RevealDiv>
              <div className="kr-section-head-center" style={{ textAlign: 'center' }}>
                <div className="kr-section-eyebrow">🎁 Keuntungan Kontributor</div>
                <h2 className="kr-section-title">Kenapa Harus Bergabung?</h2>
                <p className="kr-section-desc">
                  Lebih dari sekadar platform menulis — NarasiKota adalah ekosistem yang
                  dirancang untuk menghargai, mengembangkan, dan memajukan setiap kontributornya.
                </p>
              </div>
            </RevealDiv>
            <div className="kr-benefits-grid">
              {benefits.map((b, i) => (
                <RevealDiv key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                  <div className="kr-benefit-card" style={{ "--card-color": b.color } as React.CSSProperties}>
                    <div className="kr-benefit-icon">{b.icon}</div>
                    <div className="kr-benefit-title">{b.title}</div>
                    <p className="kr-benefit-desc">{b.desc}</p>
                    <ul className="kr-benefit-items">
                      {b.items.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  </div>
                </RevealDiv>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="kr-section kr-how-section">
          <div className="kr-section-inner">
            <RevealDiv>
              <div className="kr-section-head-center" style={{ textAlign: 'center' }}>
                <div className="kr-section-eyebrow">🗺️ Cara Bergabung</div>
                <h2 className="kr-section-title">Proses yang Mudah & Transparan</h2>
                <p className="kr-section-desc">
                  Hanya 4 langkah untuk mulai berkontribusi dan meraih keuntungan bersama NarasiKota.
                </p>
              </div>
            </RevealDiv>
            <RevealDiv delay={1}>
              <div className="kr-steps">
                {[
                  { n: "1", title: "Pilih Role", desc: "Tentukan peran yang sesuai dengan kemampuan Anda: Jurnalis, Editor, atau Redaktur." },
                  { n: "2", title: "Isi Formulir", desc: "Lengkapi formulir pendaftaran beserta portofolio dan motivasi bergabung Anda." },
                  { n: "3", title: "Seleksi Tim", desc: "Tim kami akan meninjau lamaran Anda dalam 3–7 hari kerja secara profesional." },
                  { n: "4", title: "Mulai Berkontribusi", desc: "Setelah diterima, akun aktif Anda akan dikirim via email dan siap digunakan." },
                ].map((step, i) => (
                  <div key={i} className="kr-step">
                    <div className="kr-step-num">{step.n}</div>
                    <div className="kr-step-title">{step.title}</div>
                    <p className="kr-step-desc">{step.desc}</p>
                  </div>
                ))}
              </div>
            </RevealDiv>
          </div>
        </section>

        {/* ── ROLES ── */}
        <section className="kr-section kr-roles-section">
          <div className="kr-section-inner">
            <RevealDiv>
              <div className="kr-section-head-center" style={{ textAlign: 'center' }}>
                <div className="kr-section-eyebrow">👥 Posisi Tersedia</div>
                <h2 className="kr-section-title">Temukan Role yang Tepat</h2>
                <p className="kr-section-desc">
                  Pilih posisi yang paling sesuai dengan keahlian dan passion Anda dalam dunia jurnalisme.
                </p>
              </div>
            </RevealDiv>
            <div className="kr-roles-grid">
              {roles.map((r, i) => (
                <RevealDiv key={i} delay={(i + 1) as 1 | 2 | 3}>
                  <div className="kr-role-card">
                    <div className="kr-role-icon">{r.icon}</div>
                    <div className="kr-role-card-title">{r.title}</div>
                    <p className="kr-role-card-desc">{r.desc}</p>
                    <div className="kr-role-meta-row">
                      <span className="kr-role-age-badge">Min. {r.age}</span>
                      <span style={{ fontSize: 12, color: '#9AA3B2' }}>• Remote / WFA</span>
                    </div>
                    <div className="kr-role-tags">
                      {r.tags.map((tag) => (
                        <span key={tag} className="kr-role-tag">{tag}</span>
                      ))}
                    </div>
                    <Link href={r.href} className="kr-role-link">
                      Lihat Detail & Daftar
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </Link>
                  </div>
                </RevealDiv>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="kr-section kr-testi-section">
          <div className="kr-section-inner">
            <RevealDiv>
              <div className="kr-section-head-center" style={{ textAlign: 'center' }}>
                <div className="kr-section-eyebrow">💬 Cerita Kontributor</div>
                <h2 className="kr-section-title">Kata Mereka yang Sudah Bergabung</h2>
                <p className="kr-section-desc">
                  Ribuan kontributor telah merasakan manfaat nyata bergabung bersama ekosistem NarasiKota.
                </p>
              </div>
            </RevealDiv>
            <div className="kr-testi-grid">
              {testimonials.map((t, i) => (
                <RevealDiv key={i} delay={(i + 1) as 1 | 2 | 3}>
                  <div className="kr-testi-card">
                    <p className="kr-testi-quote">{t.quote}</p>
                    <div className="kr-testi-author">
                      <div className="kr-testi-avatar">{t.avatar}</div>
                      <div>
                        <div className="kr-testi-name">{t.name}</div>
                        <div className="kr-testi-role-label">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </RevealDiv>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="kr-cta-section">
          <RevealDiv>
            <div className="kr-cta-inner">
              <h2 className="kr-cta-title">
                Siap untuk Mulai<br />
                <em>Berkontribusi?</em>
              </h2>
              <p className="kr-cta-desc">
                Bergabunglah dengan ratusan kontributor aktif NarasiKota. Daftarkan diri Anda sekarang dan
                jadilah bagian dari gerakan jurnalisme yang bermakna.
              </p>
              <div className="kr-cta-actions">
                <Link href="/karier" className="kr-btn-primary">
                  Daftar Sebagai Kontributor
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <a href="mailto:redaksi@narasikota.com" className="kr-btn-secondary">
                  Tanya Lebih Lanjut
                </a>
              </div>
              <p className="kr-cta-note">
                ⚠️ Pendaftaran melalui proses seleksi. Akun aktif dikirim via email setelah diterima.
              </p>
            </div>
          </RevealDiv>
        </section>

        {/* ── FOOTER ── */}
        <footer className="kr-page-footer">
          © 2025 NarasiKota. Sudah punya akun?{" "}
          <Link href="/login">Login di sini</Link>
          {" "}·{" "}
          <a href="#">Kebijakan Privasi</a>
          {" "}·{" "}
          <a href="#">Ketentuan Layanan</a>
        </footer>

      </div>
    </>
  );
}