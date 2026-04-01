"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .tk-wrap *, .tk-wrap *::before, .tk-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tk-wrap {
    font-family: 'Inter', sans-serif;
    background: #F8F9FB;
    color: #1E2535;
    min-height: 100vh;
  }

  /* ── NAVBAR ── */
  .tk-nav {
    background: #ffffff;
    border-bottom: 1px solid #EEF0F4;
    position: sticky; top: 0; z-index: 100;
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px;
  }
  .tk-nav-links { display: flex; gap: 32px; }
  .tk-nav-links a {
    text-decoration: none; font-size: 14px; font-weight: 500;
    color: #5A6478; transition: color .2s;
  }
  .tk-nav-links a:hover, .tk-nav-links a.active { color: #B91C1C; }
  .tk-nav-cta {
    background: #B91C1C; color: white; border: none; padding: 10px 22px;
    border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    transition: background .2s, transform .15s;
    text-decoration: none; font-family: 'Inter', sans-serif;
  }
  .tk-nav-cta:hover { background: #991B1B; transform: translateY(-1px); }

  /* ── HAMBURGER ── */
  .tk-hamburger {
    display: none;
    flex-direction: column; justify-content: center; align-items: center;
    gap: 5px; width: 40px; height: 40px;
    background: none; border: none; cursor: pointer; padding: 4px;
    border-radius: 8px; transition: background .2s;
  }
  .tk-hamburger:hover { background: #FEF2F2; }
  .tk-hamburger span {
    display: block; width: 22px; height: 2px;
    background: #1E2535; border-radius: 2px;
    transition: all .3s cubic-bezier(.4,0,.2,1);
    transform-origin: center;
  }
  .tk-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .tk-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .tk-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* ── MOBILE MENU ── */
  .tk-mobile-menu {
    display: none;
    position: fixed; top: 68px; left: 0; right: 0; z-index: 99;
    background: #ffffff; border-bottom: 1px solid #EEF0F4;
    box-shadow: 0 8px 24px rgba(0,0,0,.1);
    padding: 16px 24px 24px;
    flex-direction: column; gap: 4px;
    animation: tkMenuSlide .25s ease;
  }
  .tk-mobile-menu.open { display: flex; }
  @keyframes tkMenuSlide {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .tk-mobile-menu a {
    text-decoration: none; font-size: 15px; font-weight: 500;
    color: #5A6478; padding: 12px 8px;
    border-bottom: 1px solid #F4F5F8;
    transition: color .2s;
  }
  .tk-mobile-menu a:last-of-type { border-bottom: none; }
  .tk-mobile-menu a:hover, .tk-mobile-menu a.active { color: #B91C1C; }
  .tk-mobile-menu-cta {
    margin-top: 12px;
    background: #B91C1C; color: white;
    border: none; padding: 12px 22px;
    border-radius: 50px; font-size: 14px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    text-decoration: none; font-family: 'Inter', sans-serif;
    transition: background .2s;
  }
  .tk-mobile-menu-cta:hover { background: #991B1B; }

  /* ── BREADCRUMB ── */
  .tk-breadcrumb {
    padding: 14px 60px; display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #9AA3B2;
  }
  .tk-breadcrumb a { color: #B91C1C; text-decoration: none; font-weight: 500; }
  .tk-breadcrumb a:hover { text-decoration: underline; }
  .tk-breadcrumb-sep { color: #DDE1E9; }

  /* ── HERO ── */
  .tk-hero {
    background: linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%);
    padding: 80px 60px 90px; position: relative; overflow: hidden;
  }
  .tk-hero::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .tk-hero-inner {
    max-width: 1100px; margin: 0 auto; position: relative; z-index: 1;
    display: grid; grid-template-columns: 1fr 340px; gap: 60px; align-items: center;
  }
  .tk-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.15); color: #ffffff; padding: 5px 14px; border-radius: 50px;
    font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase;
    margin-bottom: 20px; border: 1px solid rgba(255,255,255,.2);
  }
  .tk-hero-title {
    font-size: 52px; font-weight: 900; color: #ffffff;
    line-height: 1.1; margin-bottom: 20px; letter-spacing: -2px;
  }
  .tk-hero-title span { color: #FCA5A5; }
  .tk-hero-desc {
    font-size: 15px; color: rgba(255,255,255,.82); line-height: 1.8; max-width: 560px; font-weight: 400;
  }
  .tk-hero-card {
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18);
    border-radius: 20px; padding: 28px 24px; backdrop-filter: blur(8px);
  }
  .tk-hero-card-title {
    font-size: 11px; font-weight: 700; color: rgba(255,255,255,.6);
    text-transform: uppercase; letter-spacing: .8px; margin-bottom: 20px;
  }
  .tk-hero-stat { margin-bottom: 16px; }
  .tk-hero-stat:last-child { margin-bottom: 0; }
  .tk-hero-stat-num { font-size: 38px; font-weight: 900; color: #FCA5A5; line-height: 1; letter-spacing: -2px; }
  .tk-hero-stat-label { font-size: 13px; color: rgba(255,255,255,.65); margin-top: 4px; font-weight: 400; }
  .tk-hero-divider { height: 1px; background: rgba(255,255,255,.12); margin: 16px 0; }

  /* ── MAIN ── */
  .tk-main { max-width: 1100px; margin: 0 auto; padding: 72px 40px 100px; }

  /* ── SECTION LABEL ── */
  .tk-section-label {
    display: inline-flex; align-items: center; gap: 6px; background: #FEF2F2; color: #B91C1C;
    padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .8px; margin-bottom: 12px;
  }
  .tk-section-title {
    font-size: 30px; font-weight: 800; color: #1E2535;
    line-height: 1.2; margin-bottom: 14px; letter-spacing: -.6px;
  }
  .tk-section-body { font-size: 15px; color: #5A6478; line-height: 1.8; margin-bottom: 12px; font-weight: 400; }

  /* ── SCROLL REVEAL ── */
  .tk-reveal {
    opacity: 0; transform: translateY(30px);
    transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1);
  }
  .tk-reveal.visible { opacity: 1; transform: translateY(0); }
  .tk-reveal-d1 { transition-delay: .06s; }
  .tk-reveal-d2 { transition-delay: .13s; }
  .tk-reveal-d3 { transition-delay: .20s; }
  .tk-reveal-d4 { transition-delay: .27s; }

  /* ── INTRO ── */
  .tk-intro { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; margin-bottom: 80px; }
  .tk-intro-right {
    background: #ffffff; border-radius: 20px; padding: 32px;
    border: 1px solid #EEF0F4; box-shadow: 0 2px 16px rgba(0,0,0,.05);
  }
  .tk-intro-right-title {
    font-size: 11px; font-weight: 700; color: #B91C1C;
    text-transform: uppercase; letter-spacing: .8px; margin-bottom: 8px;
  }

  /* ── FEATURE ITEMS ── */
  .tk-feature-item {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 14px 12px; border-radius: 12px;
    transition: background .2s, transform .2s; cursor: default;
  }
  .tk-feature-item:hover { background: #FFF5F5; transform: translateX(4px); }
  .tk-feature-icon {
    width: 42px; height: 42px; border-radius: 12px; background: #FEF2F2;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: background .2s, box-shadow .2s;
  }
  .tk-feature-item:hover .tk-feature-icon {
    background: #B91C1C; box-shadow: 0 6px 16px rgba(185,28,28,.25);
  }
  .tk-feature-icon svg { transition: stroke .2s; }
  .tk-feature-item:hover .tk-feature-icon svg { stroke: #ffffff !important; }
  .tk-feature-name { font-size: 14px; font-weight: 600; color: #1E2535; margin-bottom: 3px; }
  .tk-feature-desc { font-size: 13px; color: #9AA3B2; line-height: 1.5; font-weight: 400; }

  /* ── VALUES ── */
  .tk-values-section { margin-bottom: 80px; }
  .tk-values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 28px; }
  .tk-value-card {
    background: #ffffff; border-radius: 18px; padding: 28px 22px;
    border: 1px solid #EEF0F4; box-shadow: 0 2px 8px rgba(0,0,0,.04);
    transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s, border-color .2s;
    position: relative; overflow: hidden; cursor: default;
  }
  .tk-value-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,.1); border-color: #FECACA; }
  .tk-value-card:nth-child(2):hover { border-color: #FED7AA; box-shadow: 0 16px 36px rgba(234,88,12,.12); }
  .tk-value-card:nth-child(3):hover { border-color: #C0F0D8; box-shadow: 0 16px 36px rgba(18,194,100,.1); }
  .tk-value-card:nth-child(4):hover { border-color: #DDD0FF; box-shadow: 0 16px 36px rgba(155,92,246,.1); }
  .tk-value-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
  .tk-value-card:nth-child(1) .tk-value-bar { background: #B91C1C; }
  .tk-value-card:nth-child(2) .tk-value-bar { background: #EA580C; }
  .tk-value-card:nth-child(3) .tk-value-bar { background: #12C264; }
  .tk-value-card:nth-child(4) .tk-value-bar { background: #9B5CF6; }
  .tk-value-icon-wrap {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 18px;
    transition: transform .25s;
  }
  .tk-value-card:hover .tk-value-icon-wrap { transform: scale(1.08); }
  .tk-value-card:nth-child(1) .tk-value-icon-wrap { background: #FEF2F2; }
  .tk-value-card:nth-child(2) .tk-value-icon-wrap { background: #FFF7ED; }
  .tk-value-card:nth-child(3) .tk-value-icon-wrap { background: #E8FAF0; }
  .tk-value-card:nth-child(4) .tk-value-icon-wrap { background: #F0EBFF; }
  .tk-value-name { font-size: 16px; font-weight: 700; color: #1E2535; margin-bottom: 8px; letter-spacing: -.2px; }
  .tk-value-desc { font-size: 13px; color: #5A6478; line-height: 1.65; font-weight: 400; }

  /* ── VISI MISI ── */
  .tk-vismis { margin-bottom: 80px; }
  .tk-vismis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
  .tk-vismis-card {
    border-radius: 20px; padding: 36px; border: 1px solid #EEF0F4;
    box-shadow: 0 2px 10px rgba(0,0,0,.05);
    transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s;
  }
  .tk-vismis-card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(0,0,0,.1); }
  .tk-vismis-card.visi { background: linear-gradient(140deg, #B91C1C 0%, #7F1D1D 100%); }
  .tk-vismis-card.misi { background: #ffffff; }
  .tk-vismis-label {
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px;
    margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
  }
  .tk-vismis-card.visi .tk-vismis-label { color: rgba(255,255,255,.6); }
  .tk-vismis-card.misi .tk-vismis-label { color: #B91C1C; }
  .tk-vismis-label-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .tk-vismis-card.visi .tk-vismis-content {
    font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.6; letter-spacing: -.3px;
  }
  .tk-misi-list { list-style: none; display: flex; flex-direction: column; gap: 14px; }
  .tk-misi-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #5A6478; line-height: 1.65; font-weight: 400; }
  .tk-misi-num {
    width: 22px; height: 22px; border-radius: 50%; background: #FEF2F2; color: #B91C1C;
    font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px;
  }

  /* ── FOCUS CHIPS ── */
  .tk-focus-section { margin-bottom: 80px; }
  .tk-focus-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 28px; }
  .tk-focus-chip {
    background: #ffffff; border: 1px solid #EEF0F4; border-radius: 14px;
    padding: 18px 20px; display: flex; align-items: center; gap: 14px;
    font-size: 14px; font-weight: 500; color: #1E2535;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
    transition: border-color .2s, transform .2s, box-shadow .2s, background .2s; cursor: default;
  }
  .tk-focus-chip:hover {
    border-color: #B91C1C; transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(185,28,28,.1); background: #FFF5F5;
  }
  .tk-focus-chip-icon {
    width: 38px; height: 38px; border-radius: 10px; background: #FEF2F2;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: background .2s, box-shadow .2s;
  }
  .tk-focus-chip:hover .tk-focus-chip-icon { background: #B91C1C; box-shadow: 0 4px 12px rgba(185,28,28,.3); }
  .tk-focus-chip:hover .tk-focus-chip-icon svg { stroke: #ffffff !important; }

  /* ── DISCLAIMER ── */
  .tk-disclaimer {
    background: #ffffff; border-radius: 20px; padding: 40px;
    border: 1px solid #EEF0F4; box-shadow: 0 2px 10px rgba(0,0,0,.05); margin-bottom: 44px;
  }
  .tk-disclaimer-head {
    display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
    padding-bottom: 24px; border-bottom: 1px solid #EEF0F4;
  }
  .tk-disclaimer-icon-wrap {
    width: 46px; height: 46px; border-radius: 13px; background: #FFF8EC;
    border: 1px solid #FFE9A0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .tk-disclaimer-title { font-size: 18px; font-weight: 700; color: #1E2535; letter-spacing: -.2px; }
  .tk-disclaimer-subtitle { font-size: 13px; color: #9AA3B2; margin-top: 3px; font-weight: 400; }
  .tk-disclaimer-item {
    display: grid; grid-template-columns: 36px 1fr; gap: 0 18px;
    padding: 16px 0; border-bottom: 1px solid #F4F5F8;
  }
  .tk-disclaimer-item:last-child { border-bottom: none; padding-bottom: 0; }
  .tk-di-num { font-size: 22px; font-weight: 900; color: #E4E6EB; line-height: 1; padding-top: 3px; letter-spacing: -1px; }
  .tk-di-name { font-size: 14px; font-weight: 600; color: #1E2535; margin-bottom: 5px; }
  .tk-di-text { font-size: 13px; color: #5A6478; line-height: 1.7; font-weight: 400; }

  /* ── CTA BANNER ── */
  .tk-cta-banner {
    background: linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%);
    border-radius: 20px; padding: 48px;
    display: flex; align-items: center; justify-content: space-between; gap: 32px;
    box-shadow: 0 8px 32px rgba(185,28,28,.3);
  }
  .tk-cta-title { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 6px; letter-spacing: -.4px; }
  .tk-cta-desc { font-size: 15px; color: rgba(255,255,255,.8); font-weight: 400; }
  .tk-cta-btn {
    background: #ffffff; color: #B91C1C; border: none; padding: 13px 30px; border-radius: 50px;
    font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif;
    white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
    transition: transform .15s, box-shadow .2s; box-shadow: 0 4px 14px rgba(0,0,0,.15);
  }
  .tk-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }

  /* ── FOOTER ── */
  .tk-footer {
    border-top: 1px solid #EEF0F4; background: #ffffff; padding: 28px 60px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px; color: #9AA3B2; font-weight: 400;
  }
  .tk-footer a { color: #B91C1C; text-decoration: none; font-weight: 500; }
  .tk-footer a:hover { text-decoration: underline; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .tk-nav { padding: 0 20px; }
    .tk-breadcrumb { padding: 14px 20px; }
    .tk-hero { padding: 52px 20px 60px; }
    .tk-hero-inner { grid-template-columns: 1fr; }
    .tk-hero-card { display: none; }
    .tk-hero-title { font-size: 36px; }
    .tk-main { padding: 48px 20px 80px; }
    .tk-intro { grid-template-columns: 1fr; gap: 24px; }
    .tk-values-grid { grid-template-columns: 1fr 1fr; }
    .tk-vismis-grid { grid-template-columns: 1fr; }
    .tk-focus-grid { grid-template-columns: 1fr 1fr; }
    .tk-cta-banner { flex-direction: column; text-align: center; padding: 36px 24px; }
    .tk-footer { flex-direction: column; gap: 8px; text-align: center; padding: 24px 20px; }
    .tk-nav-links { display: none; }
    .tk-nav-cta { display: none; }
    .tk-hamburger { display: flex; }
  }
  @media (max-width: 560px) {
    .tk-values-grid { grid-template-columns: 1fr; }
    .tk-focus-grid { grid-template-columns: 1fr; }
  }
`;

const Ico = {
  Target: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Pen: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  ),
  Chart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Monitor: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Shield: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Eye: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Zap: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12C264" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Newspaper: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
      <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  Cpu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
      <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
      <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Mic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  UserPlus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  ),
  Star: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

const features = [
  { icon: <Ico.Target />, name: "Kontekstual & Relevan", desc: "Sesuai kondisi sosial dan perkembangan zaman terkini." },
  { icon: <Ico.Pen />, name: "Ringkas Namun Bermakna", desc: "Mudah dipahami oleh berbagai kalangan pembaca." },
  { icon: <Ico.Chart />, name: "Berbasis Data & Narasi", desc: "Menggabungkan fakta dengan storytelling yang kuat." },
  { icon: <Ico.Monitor />, name: "Adaptif & Modern", desc: "Tampilan responsif dan platform digital yang canggih." },
];

const values = [
  { icon: <Ico.Shield />, name: "Akurasi", desc: "Mengutamakan kebenaran dan validitas informasi dalam setiap konten yang diterbitkan." },
  { icon: <Ico.Eye />, name: "Independensi", desc: "Menjaga objektivitas tanpa intervensi dari pihak manapun." },
  { icon: <Ico.Zap />, name: "Kreativitas", desc: "Menyajikan konten dengan pendekatan inovatif dan segar." },
  { icon: <Ico.CheckCircle />, name: "Tanggung Jawab", desc: "Memahami dampak informasi yang disebarkan bagi publik." },
];

const misiList = [
  "Menyajikan berita dan informasi yang akurat, berimbang, dan dapat dipertanggungjawabkan.",
  "Mengembangkan platform digital yang modern, responsif, dan mudah diakses oleh semua kalangan.",
  "Menjadi ruang bagi narasi publik yang edukatif, inspiratif, dan informatif.",
  "Mengedepankan integritas dalam setiap proses produksi dan distribusi konten.",
];

const focusTopics = [
  { icon: <Ico.Newspaper />, label: "Berita Terkini Nasional" },
  { icon: <Ico.MapPin />, label: "Isu & Berita Lokal" },
  { icon: <Ico.TrendingUp />, label: "Ekonomi & Bisnis" },
  { icon: <Ico.Cpu />, label: "Teknologi & Inovasi" },
  { icon: <Ico.Users />, label: "Gaya Hidup & Sosial" },
  { icon: <Ico.Mic />, label: "Opini & Analisis" },
];

const disclaimerItems = [
  { name: "Proyek Mandiri (Portofolio)", text: "NarasiKota merupakan proyek mandiri yang dikembangkan secara independen sebagai bagian dari pengembangan portofolio pribadi. Platform ini tidak berafiliasi dengan institusi media resmi manapun." },
  { name: "Tujuan Pengembangan", text: "Seluruh fitur, tampilan, dan konten yang tersedia bertujuan untuk simulasi dan pengembangan sistem media digital, serta sebagai representasi kemampuan dalam membangun aplikasi berbasis web." },
  { name: "Konten dan Informasi", text: "Informasi yang ditampilkan dapat berupa hasil pengolahan, simulasi, atau adaptasi dari berbagai sumber dengan tujuan pembelajaran. Akurasi tetap diupayakan, namun tidak menjamin kesempurnaan data." },
  { name: "Hak Pengelolaan Konten", text: "Pengelola berhak untuk menambah, mengubah, atau menghapus konten yang tersedia tanpa pemberitahuan sebelumnya, sesuai dengan kebutuhan pengembangan sistem." },
  { name: "Tanggung Jawab Penggunaan", text: "Penggunaan informasi dari platform ini sepenuhnya menjadi tanggung jawab pengguna. NarasiKota tidak bertanggung jawab atas segala bentuk kerugian yang mungkin timbul." },
  { name: "Hak Cipta dan Aset", text: "Seluruh desain, sistem, dan elemen yang dikembangkan merupakan bagian dari karya pengembangan mandiri dan digunakan untuk tujuan non-komersial (portofolio)." },
];

export default function TentangKamiPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const els = document.querySelectorAll(".tk-reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = () => setIsMobileMenuOpen(false);
    if (isMobileMenuOpen) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isMobileMenuOpen]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tk-wrap">

        {/* NAVBAR */}
        <nav className="tk-nav">
          <Link href="/" className="shrink-0">
            <Image src="/assets/NarasiKotaLogoBiru.webp" alt="NarasiKota" width={220} height={64}
              className="h-16 ml-6 w-auto object-contain" priority />
          </Link>

          <div className="tk-nav-links">
            <a href="/tentang-kami" className="active">Tentang Kami</a>
            <a href="/tim-kami">Tim Kami</a>
            <a href="#">Karier</a>
            <a href="#">Kontak</a>
          </div>

          <Link href="/register" className="tk-nav-cta">
            <Ico.UserPlus />
            Daftar Kontributor
          </Link>

          {/* Hamburger */}
          <button
            className={`tk-hamburger${isMobileMenuOpen ? " open" : ""}`}
            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen((v) => !v); }}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`tk-mobile-menu${isMobileMenuOpen ? " open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <a href="/tentang-kami" className="active" onClick={() => setIsMobileMenuOpen(false)}>Tentang Kami</a>
          <a href="/tim-kami" onClick={() => setIsMobileMenuOpen(false)}>Tim Kami</a>
          <a href="#" onClick={() => setIsMobileMenuOpen(false)}>Karier</a>
          <a href="#" onClick={() => setIsMobileMenuOpen(false)}>Kontak</a>
          <Link href="/register" className="tk-mobile-menu-cta" onClick={() => setIsMobileMenuOpen(false)}>
            Daftar Kontributor
          </Link>
        </div>

        {/* BREADCRUMB */}
        <div className="tk-breadcrumb">
          <a href="">Beranda</a>
          <span className="tk-breadcrumb-sep">›</span>
          <span>Tentang Kami</span>
        </div>

        {/* HERO */}
        <section className="tk-hero">
          <div className="tk-hero-inner">
            <div>
              <div className="tk-hero-eyebrow"><Ico.Star /> Platform Media Digital</div>
              <h1 className="tk-hero-title">Tentang <span>NarasiKota</span></h1>
              <p className="tk-hero-desc">
                NarasiKota adalah platform media digital yang berfokus pada penyajian informasi,
                berita, dan cerita dari berbagai dinamika kehidupan masyarakat modern — hadir
                sebagai ruang eksplorasi informasi yang membangun pemahaman mendalam melalui
                sudut pandang yang relevan dan kontekstual.
              </p>
            </div>
            <div className="tk-hero-card">
              <div className="tk-hero-card-title">Platform dalam Angka</div>
              <div className="tk-hero-stat">
                <div className="tk-hero-stat-num">4+</div>
                <div className="tk-hero-stat-label">Nilai utama yang kami jaga</div>
              </div>
              <div className="tk-hero-divider" />
              <div className="tk-hero-stat">
                <div className="tk-hero-stat-num">6</div>
                <div className="tk-hero-stat-label">Kategori fokus konten</div>
              </div>
              <div className="tk-hero-divider" />
              <div className="tk-hero-stat">
                <div className="tk-hero-stat-num">3</div>
                <div className="tk-hero-stat-label">Peran kontributor tersedia</div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN */}
        <main className="tk-main">

          {/* INTRO */}
          <section className="tk-intro">
            <div className="tk-reveal">
              <div className="tk-section-label">Siapa Kami</div>
              <h2 className="tk-section-title">Media yang Lebih dari<br />Sekadar Berita</h2>
              <p className="tk-section-body">
                Di tengah arus informasi yang semakin cepat dan kompleks, NarasiKota berupaya
                menjadi media yang mampu menjembatani kebutuhan masyarakat akan informasi yang
                tidak hanya aktual, tetapi juga berkualitas.
              </p>
              <p className="tk-section-body">
                Kami percaya bahwa setiap peristiwa memiliki nilai untuk dipahami, bukan sekadar
                diketahui. NarasiKota juga berperan mendorong literasi informasi, pemikiran kritis,
                dan kesadaran publik terhadap isu-isu yang berkembang.
              </p>
            </div>
            <div className="tk-intro-right tk-reveal tk-reveal-d2">
              <div className="tk-intro-right-title">Apa yang Kami Hadirkan</div>
              {features.map((f) => (
                <div key={f.name} className="tk-feature-item">
                  <div className="tk-feature-icon">{f.icon}</div>
                  <div>
                    <div className="tk-feature-name">{f.name}</div>
                    <div className="tk-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* NILAI UTAMA */}
          <section className="tk-values-section">
            <div className="tk-reveal">
              <div className="tk-section-label">Nilai Utama</div>
              <h2 className="tk-section-title">Prinsip yang Memandu Kami</h2>
              <p className="tk-section-body" style={{ maxWidth: 520 }}>
                Empat nilai inti yang menjadi fondasi setiap keputusan editorial dan
                pengembangan platform NarasiKota.
              </p>
            </div>
            <div className="tk-values-grid">
              {values.map((v, i) => (
                <div key={v.name} className={`tk-value-card tk-reveal tk-reveal-d${i + 1}`}>
                  <div className="tk-value-bar" />
                  <div className="tk-value-icon-wrap">{v.icon}</div>
                  <div className="tk-value-name">{v.name}</div>
                  <div className="tk-value-desc">{v.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* VISI MISI */}
          <section className="tk-vismis">
            <div className="tk-reveal">
              <div className="tk-section-label">Arah Kami</div>
              <h2 className="tk-section-title">Visi &amp; Misi</h2>
            </div>
            <div className="tk-vismis-grid">
              <div className="tk-vismis-card visi tk-reveal tk-reveal-d1">
                <div className="tk-vismis-label"><span className="tk-vismis-label-dot" />Visi</div>
                <div className="tk-vismis-content">
                  Menjadi media digital yang kredibel, adaptif, dan mampu menyajikan
                  informasi yang bernilai bagi masyarakat luas di era transformasi digital.
                </div>
              </div>
              <div className="tk-vismis-card misi tk-reveal tk-reveal-d2">
                <div className="tk-vismis-label"><span className="tk-vismis-label-dot" />Misi</div>
                <ul className="tk-misi-list">
                  {misiList.map((item, i) => (
                    <li key={i} className="tk-misi-item">
                      <span className="tk-misi-num">{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* FOKUS KONTEN */}
          <section className="tk-focus-section">
            <div className="tk-reveal">
              <div className="tk-section-label">Konten</div>
              <h2 className="tk-section-title">Fokus Konten Kami</h2>
              <p className="tk-section-body" style={{ maxWidth: 520 }}>
                NarasiKota menyajikan berbagai kategori informasi yang relevan dengan kebutuhan pembaca masa kini.
              </p>
            </div>
            <div className="tk-focus-grid">
              {focusTopics.map((t, i) => (
                <div key={t.label} className={`tk-focus-chip tk-reveal tk-reveal-d${(i % 3) + 1}`}>
                  <div className="tk-focus-chip-icon">{t.icon}</div>
                  {t.label}
                </div>
              ))}
            </div>
          </section>

          {/* DISCLAIMER */}
          <section className="tk-disclaimer tk-reveal">
            <div className="tk-disclaimer-head">
              <div className="tk-disclaimer-icon-wrap"><Ico.AlertTriangle /></div>
              <div>
                <div className="tk-disclaimer-title">Pernyataan Penting (Disclaimer)</div>
                <div className="tk-disclaimer-subtitle">Harap baca sebelum menggunakan platform ini</div>
              </div>
            </div>
            <div>
              {disclaimerItems.map((d, i) => (
                <div key={i} className="tk-disclaimer-item">
                  <div className="tk-di-num">0{i + 1}</div>
                  <div>
                    <div className="tk-di-name">{d.name}</div>
                    <div className="tk-di-text">{d.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="tk-cta-banner tk-reveal">
            <div>
              <div className="tk-cta-title">Tertarik Bergabung?</div>
              <div className="tk-cta-desc">Jadilah bagian dari tim kontributor NarasiKota dan mulai berkontribusi hari ini.</div>
            </div>
            <Link href="/register" className="tk-cta-btn">
              Daftar Sekarang <Ico.Arrow />
            </Link>
          </div>

        </main>

        {/* FOOTER */}
        <footer className="tk-footer">
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