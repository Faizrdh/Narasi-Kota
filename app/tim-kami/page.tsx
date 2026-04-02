"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// CSS — Red palette (selaras dengan tentang-kami page)
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .tm-wrap *, .tm-wrap *::before, .tm-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tm-wrap {
    font-family: 'Inter', sans-serif;
    background: #F8F9FB;
    color: #1E2535;
    min-height: 100vh;
  }

  /* ── NAVBAR ── */
  .tm-nav {
    background: #ffffff;
    border-bottom: 1px solid #EEF0F4;
    position: sticky; top: 0; z-index: 100;
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px;
  }
  .tm-nav-links { display: flex; gap: 32px; }
  .tm-nav-links a {
    text-decoration: none; font-size: 14px; font-weight: 500;
    color: #5A6478; transition: color .2s;
  }
  .tm-nav-links a:hover, .tm-nav-links a.active { color: #B91C1C; }
  .tm-nav-cta {
    background: #B91C1C; color: white; border: none; padding: 10px 22px;
    border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    transition: background .2s, transform .15s;
    text-decoration: none; font-family: 'Inter', sans-serif;
  }
  .tm-nav-cta:hover { background: #991B1B; transform: translateY(-1px); }

  /* ── BREADCRUMB ── */
  .tm-breadcrumb {
    padding: 14px 60px; display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #9AA3B2;
  }
  .tm-breadcrumb a { color: #B91C1C; text-decoration: none; font-weight: 500; }
  .tm-breadcrumb a:hover { text-decoration: underline; }
  .tm-breadcrumb-sep { color: #DDE1E9; }

  /* ── HERO ── */
  .tm-hero {
    background: linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%);
    padding: 80px 60px 90px; position: relative; overflow: hidden;
  }
  .tm-hero::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .tm-hero-inner {
    max-width: 1100px; margin: 0 auto; position: relative; z-index: 1;
  }
  .tm-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.15); color: #ffffff; padding: 5px 14px; border-radius: 50px;
    font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase;
    margin-bottom: 20px; border: 1px solid rgba(255,255,255,.2);
  }
  .tm-hero-title {
    font-size: 52px; font-weight: 900; color: #ffffff;
    line-height: 1.1; margin-bottom: 20px; letter-spacing: -2px;
  }
  .tm-hero-title span { color: #FCA5A5; }
  .tm-hero-desc {
    font-size: 15px; color: rgba(255,255,255,.82); line-height: 1.8;
    max-width: 600px; font-weight: 400;
  }

  /* ── SCROLL REVEAL ── */
  .tm-reveal {
    opacity: 0; transform: translateY(30px);
    transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1);
  }
  .tm-reveal.visible { opacity: 1; transform: translateY(0); }
  .tm-reveal-d1 { transition-delay: .06s; }
  .tm-reveal-d2 { transition-delay: .13s; }
  .tm-reveal-d3 { transition-delay: .20s; }
  .tm-reveal-d4 { transition-delay: .27s; }

  /* ── MAIN ── */
  .tm-main { max-width: 1100px; margin: 0 auto; padding: 72px 40px 100px; }

  /* ── SECTION LABEL ── */
  .tm-section-label {
    display: inline-flex; align-items: center; gap: 6px; background: #FEF2F2; color: #B91C1C;
    padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .8px; margin-bottom: 12px;
  }
  .tm-section-title {
    font-size: 30px; font-weight: 800; color: #1E2535;
    line-height: 1.2; margin-bottom: 14px; letter-spacing: -.6px;
  }
  .tm-section-body { font-size: 15px; color: #5A6478; line-height: 1.8; margin-bottom: 12px; font-weight: 400; }

  /* ── PROFILE CARD ── */
  .tm-profile-section { margin-bottom: 80px; }
  .tm-profile-wrapper {
    display: grid; grid-template-columns: 320px 1fr; gap: 48px; align-items: start; margin-top: 32px;
  }

  /* Avatar card */
  .tm-avatar-card {
    background: #ffffff; border-radius: 24px; padding: 36px 28px;
    border: 1px solid #EEF0F4; box-shadow: 0 4px 20px rgba(0,0,0,.07);
    display: flex; flex-direction: column; align-items: center; text-align: center;
    position: sticky; top: 90px;
    transition: box-shadow .3s, transform .3s;
  }
  .tm-avatar-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(185,28,28,.12); }

  .tm-avatar-ring {
    width: 120px; height: 120px; border-radius: 50%;
    background: linear-gradient(135deg, #B91C1C, #EF4444);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px; position: relative;
    box-shadow: 0 8px 32px rgba(185,28,28,.3);
    animation: tm-pulse-ring 3s ease-in-out infinite;
  }
  @keyframes tm-pulse-ring {
    0%, 100% { box-shadow: 0 8px 32px rgba(185,28,28,.3); }
    50% { box-shadow: 0 8px 48px rgba(185,28,28,.55); }
  }
  .tm-avatar-initials {
    font-size: 38px; font-weight: 900; color: #ffffff; letter-spacing: -2px; line-height: 1;
  }
  .tm-avatar-online {
    position: absolute; bottom: 6px; right: 6px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #12C264; border: 3px solid #ffffff;
    animation: tm-blink 2.5s ease-in-out infinite;
  }
  @keyframes tm-blink {
    0%, 100% { opacity: 1; } 50% { opacity: .4; }
  }

  .tm-avatar-name { font-size: 18px; font-weight: 800; color: #1E2535; letter-spacing: -.4px; margin-bottom: 4px; }
  .tm-avatar-role {
    font-size: 12px; font-weight: 600; color: #B91C1C; text-transform: uppercase;
    letter-spacing: .8px; margin-bottom: 20px;
  }
  .tm-avatar-divider { width: 100%; height: 1px; background: #EEF0F4; margin-bottom: 20px; }

  .tm-avatar-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: #FEF2F2; color: #B91C1C; padding: 5px 12px; border-radius: 50px;
    font-size: 11px; font-weight: 600; margin: 3px;
    transition: background .2s, transform .2s, color .2s;
    cursor: default;
  }
  .tm-avatar-tag:hover { background: #B91C1C; color: #fff; transform: scale(1.05); }
  .tm-avatar-tags { display: flex; flex-wrap: wrap; justify-content: center; margin-bottom: 20px; }

  .tm-avatar-status {
    display: flex; align-items: center; gap: 8px;
    background: #E8FAF0; border-radius: 50px; padding: 8px 16px;
    font-size: 12px; font-weight: 600; color: #0C9E52; width: 100%; justify-content: center;
  }
  .tm-avatar-status-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #12C264;
    flex-shrink: 0; animation: tm-blink 2s ease-in-out infinite;
  }

  /* Bio section */
  .tm-bio-section { display: flex; flex-direction: column; gap: 24px; }

  .tm-bio-card {
    background: #ffffff; border-radius: 20px; padding: 30px;
    border: 1px solid #EEF0F4; box-shadow: 0 2px 10px rgba(0,0,0,.05);
    transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s, border-color .2s;
    position: relative; overflow: hidden;
  }
  .tm-bio-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,.09); border-color: #FECACA; }
  .tm-bio-card-accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #B91C1C, #EF4444); }

  .tm-bio-card-label {
    font-size: 11px; font-weight: 700; color: #B91C1C; text-transform: uppercase;
    letter-spacing: .8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
  }
  .tm-bio-card-text { font-size: 14px; color: #5A6478; line-height: 1.8; font-weight: 400; }
  .tm-bio-card-text + .tm-bio-card-text { margin-top: 10px; }

  /* Approach list */
  .tm-approach-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
  .tm-approach-item {
    display: flex; align-items: center; gap: 14px;
    background: #F8F9FB; border-radius: 12px; padding: 12px 16px;
    font-size: 14px; color: #1E2535; font-weight: 500;
    border: 1px solid #EEF0F4;
    transition: background .2s, border-color .2s, transform .2s;
    cursor: default;
  }
  .tm-approach-item:hover { background: #FFF5F5; border-color: #FECACA; transform: translateX(4px); }
  .tm-approach-icon {
    width: 32px; height: 32px; border-radius: 9px; background: #FEF2F2;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: background .2s;
  }
  .tm-approach-item:hover .tm-approach-icon { background: #B91C1C; }
  .tm-approach-item:hover .tm-approach-icon svg { stroke: #ffffff !important; }

  /* ── STACK ── */
  .tm-stack-section { margin-bottom: 80px; }
  .tm-stack-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 28px; }
  .tm-stack-card {
    background: #ffffff; border-radius: 16px; padding: 20px;
    border: 1px solid #EEF0F4; box-shadow: 0 1px 6px rgba(0,0,0,.04);
    display: flex; flex-direction: column; align-items: flex-start; gap: 12px;
    transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s, border-color .2s;
    cursor: default; position: relative; overflow: hidden;
  }
  .tm-stack-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: var(--accent); transform: scaleX(0); transform-origin: left;
    transition: transform .3s cubic-bezier(.22,1,.36,1);
  }
  .tm-stack-card:hover { transform: translateY(-5px); box-shadow: 0 14px 32px rgba(0,0,0,.1); border-color: #FECACA; }
  .tm-stack-card:hover::after { transform: scaleX(1); }
  .tm-stack-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    background: var(--icon-bg);
    transition: transform .25s;
  }
  .tm-stack-card:hover .tm-stack-icon { transform: scale(1.08) rotate(-3deg); }
  .tm-stack-name { font-size: 13px; font-weight: 700; color: #1E2535; }
  .tm-stack-desc { font-size: 12px; color: #9AA3B2; line-height: 1.5; font-weight: 400; }

  /* ── NOTE ── */
  .tm-note {
    background: linear-gradient(135deg, #FFF5F5 0%, #FEF2F2 100%);
    border-radius: 20px; padding: 36px 40px;
    border: 1px solid #FECACA; margin-bottom: 44px;
    display: flex; align-items: flex-start; gap: 20px;
    box-shadow: 0 4px 16px rgba(185,28,28,.08);
    transition: transform .25s, box-shadow .25s;
  }
  .tm-note:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(185,28,28,.13); }
  .tm-note-icon {
    width: 48px; height: 48px; border-radius: 14px; background: #B91C1C; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 18px rgba(185,28,28,.3);
  }
  .tm-note-title { font-size: 16px; font-weight: 700; color: #1E2535; margin-bottom: 8px; letter-spacing: -.2px; }
  .tm-note-text { font-size: 14px; color: #5A6478; line-height: 1.8; font-weight: 400; }

  /* ── CTA ── */
  .tm-cta-banner {
    background: linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%);
    border-radius: 20px; padding: 48px;
    display: flex; align-items: center; justify-content: space-between; gap: 32px;
    box-shadow: 0 8px 32px rgba(185,28,28,.3);
  }
  .tm-cta-title { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 6px; letter-spacing: -.4px; }
  .tm-cta-desc { font-size: 15px; color: rgba(255,255,255,.8); font-weight: 400; }
  .tm-cta-btn {
    background: #ffffff; color: #B91C1C; border: none; padding: 13px 30px; border-radius: 50px;
    font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif;
    white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
    transition: transform .15s, box-shadow .2s; box-shadow: 0 4px 14px rgba(0,0,0,.15);
  }
  .tm-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }

  /* ── FOOTER ── */
  .tm-footer {
    border-top: 1px solid #EEF0F4; background: #ffffff; padding: 28px 60px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px; color: #9AA3B2; font-weight: 400;
  }
  .tm-footer a { color: #B91C1C; text-decoration: none; font-weight: 500; }
  .tm-footer a:hover { text-decoration: underline; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .tm-nav { padding: 0 20px; }
    .tm-breadcrumb { padding: 14px 20px; }
    .tm-hero { padding: 52px 20px 60px; }
    .tm-hero-title { font-size: 36px; }
    .tm-main { padding: 48px 20px 80px; }
    .tm-profile-wrapper { grid-template-columns: 1fr; }
    .tm-avatar-card { position: static; }
    .tm-stack-grid { grid-template-columns: 1fr 1fr; }
    .tm-cta-banner { flex-direction: column; text-align: center; padding: 36px 24px; }
    .tm-footer { flex-direction: column; gap: 8px; text-align: center; padding: 24px 20px; }
    .tm-nav-links { display: none; }
    .tm-note { flex-direction: column; }
  }
  @media (max-width: 560px) {
    .tm-stack-grid { grid-template-columns: 1fr; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface IconProps {
  size?: number;
  color?: string;
}

interface ApproachItem {
  icon: React.ReactNode;
  label: string;
}

interface StackItem {
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
  name: string;
  desc: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Ico = {
  Users: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  UserPlus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  Arrow: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Code: ({ size = 18, color = "#B91C1C" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Server: ({ size = 18, color = "#EA580C" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  Monitor: ({ size = 18, color = "#B91C1C" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Layout: ({ size = 18, color = "#12C264" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  Database: ({ size = 18, color = "#B91C1C" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  Globe: ({ size = 18, color = "#B91C1C" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Layers: ({ size = 18, color = "#B91C1C" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Zap: ({ size = 18, color = "#12C264" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  FileText: ({ size = 18, color = "#B91C1C" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Settings: ({ size = 18, color = "#9B5CF6" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Info: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const tags: string[] = [
  "Web Development",
  "UI/UX Design",
  "Backend Systems",
  "CMS",
  "React / Next.js",
];

const approachItems: ApproachItem[] = [
  { icon: <Ico.Layers size={16} color="#B91C1C" />, label: "Struktur sistem yang terorganisir" },
  { icon: <Ico.Monitor size={16} color="#B91C1C" />, label: "Pengalaman pengguna (UX) yang optimal" },
  { icon: <Ico.Layout size={16} color="#B91C1C" />, label: "Desain antarmuka yang modern dan responsif" },
  { icon: <Ico.Database size={16} color="#B91C1C" />, label: "Efisiensi dalam pengelolaan data dan konten" },
];

const stackItems: StackItem[] = [
  {
    icon: <Ico.Globe size={20} color="#B91C1C" />,
    iconBg: "#FEF2F2",
    accent: "#B91C1C",
    name: "Frontend",
    desc: "React, Next.js, Tailwind CSS, HTML/CSS",
  },
  {
    icon: <Ico.Server size={20} color="#EA580C" />,
    iconBg: "#FFF7ED",
    accent: "#EA580C",
    name: "Backend",
    desc: "Node.js, REST API, Database Management",
  },
  {
    icon: <Ico.Layout size={20} color="#12C264" />,
    iconBg: "#E8FAF0",
    accent: "#12C264",
    name: "UI/UX Design",
    desc: "Figma, Prototyping, Responsive Design",
  },
  {
    icon: <Ico.Settings size={20} color="#9B5CF6" />,
    iconBg: "#F0EBFF",
    accent: "#9B5CF6",
    name: "CMS & System",
    desc: "Content Management, Admin Panel, Workflow",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function TimKamiPage(): React.JSX.Element {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".tm-reveal");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tm-wrap">

        {/* NAVBAR */}
        <nav className="tm-nav">
          <Link href="/" className="shrink-0">
            <Image
              src="/assets/NarasiKotaLogoBiru.webp"
              alt="NarasiKota"
              width={220}
              height={64}
              className="h-16 ml-6 w-auto object-contain"
              priority
            />
          </Link>
          <div className="tm-nav-links">
            <a href="/tentang-kami">Tentang Kami</a>
            <a href="/tim-kami" className="active">Tim Kami</a>
            <a href="/karier">Karier</a>
            <a href="#">Kontak</a>
          </div>
          <Link href="/register" className="tm-nav-cta">
            <Ico.UserPlus />
            Daftar Kontributor
          </Link>
        </nav>

        {/* BREADCRUMB */}
        <div className="tm-breadcrumb">
          <a href="">Beranda</a>
          <span className="tm-breadcrumb-sep">›</span>
          <span>Tim Kami</span>
        </div>

        {/* HERO */}
        <section className="tm-hero">
          <div className="tm-hero-inner">
            <div className="tm-hero-eyebrow">
              <Ico.Users /> Orang di Balik Platform
            </div>
            <h1 className="tm-hero-title">
              Tim <span>NarasiKota</span>
            </h1>
            <p className="tm-hero-desc">
              NarasiKota dikembangkan dan dikelola secara mandiri — dibangun dengan dedikasi
              penuh sebagai ekosistem media digital modern yang dirancang untuk pertumbuhan
              dan kolaborasi di masa mendatang.
            </p>
          </div>
        </section>

        {/* MAIN */}
        <main className="tm-main">

          {/* PROFILE SECTION */}
          <section className="tm-profile-section">
            <div className="tm-reveal">
              <div className="tm-section-label">Pengembang Utama</div>
              <h2 className="tm-section-title">Dikembangkan Secara Mandiri</h2>
            </div>

            <div className="tm-profile-wrapper">

              {/* AVATAR CARD */}
              <div className="tm-avatar-card tm-reveal tm-reveal-d1">
                <div className="tm-avatar-ring">
                  <span className="tm-avatar-initials">FR</span>
                  <span className="tm-avatar-online" />
                </div>
                <div className="tm-avatar-name">Faiz Ridho Utomo</div>
                <div className="tm-avatar-role">Pengembang NarasiKota</div>
                <div className="tm-avatar-divider" />
                <div className="tm-avatar-tags">
                  {tags.map((tag) => (
                    <span key={tag} className="tm-avatar-tag">{tag}</span>
                  ))}
                </div>
                <div className="tm-avatar-divider" />
                <div className="tm-avatar-status">
                  <span className="tm-avatar-status-dot" />
                  Aktif Mengembangkan
                </div>
              </div>

              {/* BIO CARDS */}
              <div className="tm-bio-section">

                <div className="tm-bio-card tm-reveal tm-reveal-d1">
                  <div className="tm-bio-card-accent" />
                  <div className="tm-bio-card-label">
                    <Ico.Code size={14} color="#B91C1C" /> Tentang
                  </div>
                  <p className="tm-bio-card-text">
                    Sebagai pengembang utama di balik NarasiKota, saya bertanggung jawab penuh atas
                    perancangan, pengembangan, hingga implementasi sistem platform ini. Dengan latar
                    belakang di bidang teknologi informasi, saya memiliki fokus pada pengembangan
                    aplikasi web — khususnya dalam membangun sistem yang terstruktur, efisien, dan
                    mudah digunakan.
                  </p>
                  <p className="tm-bio-card-text">
                    NarasiKota merupakan representasi dari dedikasi dan eksplorasi saya dalam
                    mengembangkan sebuah platform media digital modern. Mulai dari perancangan
                    antarmuka pengguna (UI), pengelolaan sistem backend, hingga pengembangan fitur
                    manajemen konten (CMS), seluruh proses dilakukan secara mandiri sebagai bagian
                    dari penguatan kompetensi di bidang rekayasa perangkat lunak.
                  </p>
                </div>

                <div className="tm-bio-card tm-reveal tm-reveal-d2">
                  <div className="tm-bio-card-accent" />
                  <div className="tm-bio-card-label">
                    <Ico.Zap size={14} color="#12C264" /> Pendekatan Pengembangan
                  </div>
                  <ul className="tm-approach-list">
                    {approachItems.map((item) => (
                      <li key={item.label} className="tm-approach-item">
                        <div className="tm-approach-icon">{item.icon}</div>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tm-bio-card tm-reveal tm-reveal-d3">
                  <div className="tm-bio-card-accent" />
                  <div className="tm-bio-card-label">
                    <Ico.FileText size={14} color="#B91C1C" /> Visi Pengembang
                  </div>
                  <p className="tm-bio-card-text">
                    Melalui NarasiKota, saya tidak hanya membangun sebuah platform, tetapi juga
                    menciptakan sebuah ekosistem digital yang mencerminkan bagaimana teknologi
                    dapat digunakan untuk menyampaikan informasi secara efektif dan bermakna.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* TECH STACK */}
          <section className="tm-stack-section">
            <div className="tm-reveal">
              <div className="tm-section-label">Teknologi</div>
              <h2 className="tm-section-title">Area Keahlian</h2>
              <p className="tm-section-body" style={{ maxWidth: 520 }}>
                Kompetensi teknis yang digunakan dalam membangun dan mengelola seluruh
                aspek platform NarasiKota.
              </p>
            </div>
            <div className="tm-stack-grid">
              {stackItems.map((s, i) => (
                <div
                  key={s.name}
                  className={`tm-stack-card tm-reveal tm-reveal-d${i + 1}`}
                  style={
                    {
                      "--accent": s.accent,
                      "--icon-bg": s.iconBg,
                    } as React.CSSProperties
                  }
                >
                  <div className="tm-stack-icon">{s.icon}</div>
                  <div>
                    <div className="tm-stack-name">{s.name}</div>
                    <div className="tm-stack-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* NOTE */}
          <div className="tm-note tm-reveal">
            <div className="tm-note-icon">
              <Ico.Info />
            </div>
            <div>
              <div className="tm-note-title">Catatan</div>
              <p className="tm-note-text">
                Meskipun NarasiKota saat ini dikembangkan secara mandiri, platform ini dirancang
                dengan standar dan struktur yang memungkinkan untuk dikembangkan lebih lanjut
                menjadi sistem yang lebih besar dan kolaboratif di masa mendatang.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="tm-cta-banner tm-reveal">
            <div>
              <div className="tm-cta-title">Tertarik Bergabung?</div>
              <div className="tm-cta-desc">
                Jadilah bagian dari tim kontributor NarasiKota dan mulai berkontribusi hari ini.
              </div>
            </div>
            <Link href="/register" className="tm-cta-btn">
              Daftar Sekarang <Ico.Arrow />
            </Link>
          </div>

        </main>

        {/* FOOTER */}
        <footer className="tm-footer">
          <span>© 2026 NarasiKota. Proyek portofolio mandiri.</span>
          <span>
            <a href="/register">Daftar Kontributor</a>{" · "}
            <a href="#">Kebijakan Privasi</a>{" · "}
            <a href="#">Ketentuan Layanan</a>
          </span>
        </footer>

      </div>
    </>
  );
}