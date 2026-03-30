
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type RoleKey = "redaksi" | "jurnalis" | "editor";

interface RoleData {
  sidebarTitle: string;
  sidebarAge: string;
  bcRole: string;
  badge: string;
  mainTitle: string;
  mainDesc: string;
  descPeran: string;
  tanggungJawab: string[];
  persyaratan: string[];
  kualifikasi: string[];
  badges: string[];
  modalBadge: string;
  labelPengalaman: string;
  labelSpesialisasi: string;
  placeholderSpesialisasi: string;
}

interface FormState {
  namaLengkap: string;
  nomorHP: string;
  email: string;
  tanggalLahir: string;
  jenisKelamin: string;
  pengalaman: string;
  spesialisasi: string;
  motivasi: string;
  portofolioLink: string;
  cvFile: File | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE DATA
// ─────────────────────────────────────────────────────────────────────────────
const roles: Record<RoleKey, RoleData> = {
  redaksi: {
    sidebarTitle: "Redaksi / Redaktur",
    sidebarAge: "21 Tahun",
    bcRole: "Redaksi / Redaktur",
    badge: " Redaksi & Redaktur",
    mainTitle: "Bergabung sebagai<br/>Redaksi / Redaktur",
    mainDesc:
      "Jadilah pengelola utama alur produksi konten yang bertanggung jawab atas perencanaan, pengawasan, dan kualitas keseluruhan berita yang dipublikasikan oleh tim kami.",
    descPeran:
      "Redaksi atau Redaktur merupakan pengelola utama alur produksi konten yang bertanggung jawab terhadap perencanaan, pengawasan, serta kualitas keseluruhan berita yang dipublikasikan. Posisi ini membutuhkan kepemimpinan yang kuat, pemahaman mendalam tentang jurnalistik, serta kemampuan pengambilan keputusan yang cepat dan tepat.",
    tanggungJawab: [
      "Menentukan agenda dan topik editorial harian/mingguan",
      "Mengarahkan penugasan kepada jurnalis",
      "Melakukan review akhir terhadap konten sebelum tayang",
      "Menjaga konsistensi gaya bahasa dan standar media",
      "Mengawasi akurasi, keseimbangan, dan kelayakan berita",
    ],
    persyaratan: [
      "Minimal usia 21 tahun",
      "Memiliki pengalaman di bidang jurnalistik/media minimal 2 tahun",
      "Memahami prinsip jurnalistik secara menyeluruh (5W+1H, cover both sides, nilai berita)",
      "Memiliki kemampuan leadership dan manajemen tim",
      "Mampu mengambil keputusan editorial secara objektif dan profesional",
      "Menguasai tata bahasa Indonesia dengan sangat baik",
      "Melampirkan portofolio karya atau pengalaman di media",
    ],
    kualifikasi: [
      "Pernah menjabat sebagai redaktur di media",
      "Memahami manajemen konten digital dan workflow redaksi",
      "Memiliki wawasan luas terhadap isu nasional maupun lokal",
    ],
    badges: ["Manajemen Konten Digital", "Workflow Redaksi", "Isu Nasional", "5W+1H", "Leadership"],
    modalBadge: "Redaksi / Redaktur",
    labelPengalaman: "Pengalaman di Media/Jurnalistik",
    labelSpesialisasi: "Topik Editorial yang Dikuasai",
    placeholderSpesialisasi: "e.g. Politik, Ekonomi, Isu Lokal...",
  },
  jurnalis: {
    sidebarTitle: "Jurnalis / Reporter",
    sidebarAge: "18 Tahun",
    bcRole: "Jurnalis / Reporter",
    badge: "Peliputan & Berita",
    mainTitle: "Bergabung sebagai<br/>Jurnalis / Reporter",
    mainDesc:
      "Jadilah garda terdepan dalam mengumpulkan informasi, melakukan peliputan lapangan, dan menyusun berita yang faktual, aktual, dan dapat dipertanggungjawabkan.",
    descPeran:
      "Jurnalis bertugas melakukan peliputan, pengumpulan informasi, serta menyusun berita yang faktual, aktual, dan dapat dipertanggungjawabkan. Anda akan menjadi mata dan telinga lapangan yang menghubungkan peristiwa dengan pembaca melalui tulisan yang jernih dan berimbang.",
    tanggungJawab: [
      "Melakukan riset dan peliputan di lapangan atau secara daring",
      "Mengumpulkan data melalui observasi dan wawancara",
      "Menulis berita sesuai kaidah jurnalistik",
      "Menyajikan informasi secara objektif, berimbang, dan akurat",
      "Mengirimkan naskah sesuai deadline yang ditentukan",
    ],
    persyaratan: [
      "Minimal usia 18 tahun",
      "Memiliki kemampuan menulis berita dasar yang baik",
      "Memahami prinsip dasar jurnalistik (5W+1H dan etika pers)",
      "Mampu melakukan riset dan verifikasi informasi",
      "Memiliki perangkat kerja (laptop/smartphone dan akses internet)",
      "Bersedia melakukan peliputan jika dibutuhkan",
      "Melampirkan minimal 1-2 contoh tulisan berita",
    ],
    kualifikasi: [
      "Memiliki pengalaman liputan atau wawancara",
      "Memiliki jaringan narasumber",
      "Aktif mengikuti isu terkini",
      "Memahami dasar fotografi atau videografi jurnalistik",
    ],
    badges: ["Liputan Lapangan", "Wawancara", "Verifikasi Fakta", "Fotografi Dasar", "Videografi"],
    modalBadge: "Jurnalis / Reporter",
    labelPengalaman: "Pengalaman Peliputan",
    labelSpesialisasi: "Isu / Topik yang Diminati",
    placeholderSpesialisasi: "e.g. Sosial, Hukum, Pendidikan...",
  },
  editor: {
    sidebarTitle: "Editor",
    sidebarAge: "20 Tahun",
    bcRole: "Editor",
    badge: "Penyunting",
    mainTitle: "Bergabung sebagai<br/>Editor",
    mainDesc:
      "Jadilah penjaga kualitas tulisan dengan memastikan setiap naskah memenuhi standar jurnalistik, bebas kesalahan, dan siap untuk dipublikasikan kepada pembaca.",
    descPeran:
      "Editor bertanggung jawab dalam proses penyuntingan naskah untuk memastikan kualitas tulisan, akurasi data, serta kesesuaian dengan standar jurnalistik sebelum dipublikasikan. Peran ini menuntut ketelitian tinggi, kemampuan analitis, dan pemahaman mendalam terhadap struktur penulisan.",
    tanggungJawab: [
      "Menyunting dan memperbaiki naskah dari jurnalis/redaksi",
      "Memastikan struktur, bahasa, dan alur tulisan sesuai standar",
      "Melakukan pengecekan fakta (fact-checking)",
      "Memberikan masukan konstruktif kepada penulis",
      "Menjamin konten bebas dari kesalahan dan layak tayang",
    ],
    persyaratan: [
      "Minimal usia 20 tahun",
      "Memiliki pengalaman menulis atau mengedit minimal 1 tahun",
      "Menguasai tata bahasa Indonesia secara baik dan benar",
      "Teliti, detail, dan memiliki kemampuan analisis tinggi",
      "Memahami struktur penulisan berita dan feature",
      "Melampirkan portofolio tulisan atau hasil editing",
    ],
    kualifikasi: [
      "Berpengalaman sebagai editor media",
      "Memahami SEO untuk artikel berita digital",
      "Terbiasa menggunakan CMS atau platform publishing",
    ],
    badges: ["Fact-Checking", "SEO Artikel", "CMS Publishing", "Tata Bahasa Indonesia", "Penyuntingan"],
    modalBadge: "Editor",
    labelPengalaman: "Pengalaman Menulis / Editing",
    labelSpesialisasi: "Bidang Keahlian Editing",
    placeholderSpesialisasi: "e.g. Berita Hard News, Feature, Opini...",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS — mirrors original HTML stylesheet 1:1, prefixed with "rd-" to avoid
// conflicts with Tailwind / global styles in Next.js
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .rd-wrap *, .rd-wrap *::before, .rd-wrap *::after { box-sizing: border-box; }

  .rd-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #F8F9FB;
    color: #1E2535;
    min-height: 100vh;
  }

  /* ── NAVBAR ── */
  .rd-nav {
    background: #ffffff;
    border-bottom: 1px solid #EEF0F4;
    position: sticky; top: 0; z-index: 100;
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px;
  }
  .rd-nav-logo {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none;
  }
  .rd-nav-logo-icon {
    width: 36px; height: 36px;
    background: #0057FF; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .rd-nav-logo-icon svg { width: 20px; height: 20px; fill: white; }
  .rd-nav-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 800;
    color: #1E2535; letter-spacing: -.3px;
  }
  .rd-nav-logo-text span { color: #0057FF; }
  .rd-nav-links { display: flex; gap: 32px; }
  .rd-nav-links a {
    text-decoration: none; font-size: 14px; font-weight: 500;
    color: #5A6478; transition: color .2s;
  }
  .rd-nav-links a:hover { color: #0057FF; }
  .rd-nav-cta {
    background: #0057FF; color: white;
    border: none; padding: 10px 22px;
    border-radius: 50px; font-size: 14px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: background .2s, transform .15s;
    text-decoration: none; font-family: 'DM Sans', sans-serif;
  }
  .rd-nav-cta:hover { background: #0041CC; transform: translateY(-1px); }
  .rd-nav-cta svg { width: 16px; height: 16px; }

  /* ── BREADCRUMB ── */
  .rd-breadcrumb {
    padding: 14px 60px;
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #9AA3B2;
  }
  .rd-breadcrumb a { color: #0057FF; text-decoration: none; font-weight: 500; }
  .rd-breadcrumb a:hover { text-decoration: underline; }
  .rd-breadcrumb-sep { color: #DDE1E9; }

  /* ── MAIN LAYOUT ── */
  .rd-main-wrap {
    max-width: 1180px; margin: 0 auto;
    padding: 0 40px 80px;
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 32px;
  }

  /* ── SIDEBAR ── */
  .rd-sidebar { position: sticky; top: 88px; height: fit-content; }
  .rd-sidebar-card {
    background: #ffffff; border-radius: 16px;
    padding: 28px 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,.08);
    border: 1px solid #EEF0F4;
  }
  .rd-role-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 800;
    color: #0057FF; line-height: 1.2; margin-bottom: 24px;
  }
  .rd-role-meta { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
  .rd-meta-item { display: flex; align-items: center; gap: 12px; }
  .rd-meta-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: #E8F0FF;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .rd-meta-icon svg {
    width: 18px; height: 18px; stroke: #0057FF; fill: none;
    stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
  }
  .rd-meta-label { font-size: 11px; color: #9AA3B2; font-weight: 500; text-transform: uppercase; letter-spacing: .5px; }
  .rd-meta-value { font-size: 14px; font-weight: 600; color: #1E2535; }
  .rd-apply-btn {
    width: 100%; padding: 14px;
    background: #FF5A1F; color: white;
    border: none; border-radius: 50px;
    font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 4px 14px rgba(255,90,31,.3);
    margin-bottom: 20px;
  }
  .rd-apply-btn:hover { background: #E04A10; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,90,31,.4); }
  .rd-apply-btn svg { width: 18px; height: 18px; }
  .rd-selection-notice {
    background: #E8F0FF; border-left: 3px solid #0057FF;
    border-radius: 8px; padding: 12px 14px;
    font-size: 12.5px; color: #5A6478; line-height: 1.6;
  }
  .rd-selection-notice strong { color: #0057FF; }
  .rd-role-switcher { margin-top: 20px; }
  .rd-role-switcher-label {
    font-size: 11px; color: #9AA3B2; font-weight: 600;
    text-transform: uppercase; letter-spacing: .6px; margin-bottom: 10px;
  }
  .rd-role-btn-group { display: flex; flex-direction: column; gap: 8px; }
  .rd-role-tab {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid #DDE1E9; background: #ffffff;
    cursor: pointer; font-size: 13px; font-weight: 500; color: #5A6478;
    transition: all .2s; text-align: left; font-family: 'DM Sans', sans-serif;
  }
  .rd-role-tab:hover { border-color: #0057FF; color: #0057FF; background: #E8F0FF; }
  .rd-role-tab.active { border-color: #0057FF; background: #0057FF; color: white; }
  .rd-tab-icon { font-size: 16px; }

  /* ── MAIN CONTENT ── */
  .rd-content-area { padding-top: 4px; }
  .rd-section-head { margin-bottom: 32px; }
  .rd-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #E8F0FF; color: #0057FF;
    padding: 5px 12px; border-radius: 50px;
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px;
    margin-bottom: 12px;
  }
  .rd-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 38px; font-weight: 800;
    color: #1E2535; line-height: 1.15; margin-bottom: 14px;
  }
  .rd-page-desc { font-size: 15px; color: #5A6478; line-height: 1.7; max-width: 660px; }
  .rd-content-card {
    background: #ffffff; border-radius: 16px;
    padding: 32px; margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,.08);
    border: 1px solid #EEF0F4;
    animation: rdFadeIn .35s ease;
  }
  @keyframes rdFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rd-card-section-title {
    font-size: 17px; font-weight: 700; color: #1E2535;
    margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
  }
  .rd-card-section-title::before {
    content: ''; display: block;
    width: 4px; height: 18px;
    background: #0057FF; border-radius: 4px;
  }
  .rd-role-desc { font-size: 15px; color: #5A6478; line-height: 1.75; }
  .rd-spec-list { list-style: none; display: flex; flex-direction: column; gap: 9px; padding: 0; margin: 0; }
  .rd-spec-list li {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 14px; color: #5A6478; line-height: 1.6;
  }
  .rd-spec-list li::before {
    content: ''; min-width: 7px; height: 7px;
    background: #0057FF; border-radius: 50%;
    margin-top: 7px; flex-shrink: 0;
  }
  .rd-extra-badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .rd-extra-badge {
    background: #F8F9FB; border: 1px solid #DDE1E9;
    color: #5A6478; padding: 5px 12px;
    border-radius: 50px; font-size: 12.5px; font-weight: 500;
  }
  .rd-divider { height: 1px; background: #EEF0F4; margin: 20px 0; }
  .rd-footer-link {
    text-align: center; font-size: 14px; color: #9AA3B2; margin-top: 24px;
  }
  .rd-footer-link a { color: #0057FF; font-weight: 600; text-decoration: none; }
  .rd-footer-link a:hover { text-decoration: underline; }

  /* ── MODAL ── */
  .rd-modal-overlay {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(10,15,30,.55); backdrop-filter: blur(4px);
    display: none; align-items: center; justify-content: center; padding: 20px;
  }
  .rd-modal-overlay.open { display: flex; }
  .rd-modal {
    background: #ffffff; border-radius: 20px;
    width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0,0,0,.14);
    animation: rdModalIn .3s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes rdModalIn {
    from { opacity: 0; transform: scale(.92) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .rd-modal-header {
    padding: 28px 32px 0;
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .rd-modal-role-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #E8F0FF; color: #0057FF;
    padding: 5px 12px; border-radius: 50px;
    font-size: 12px; font-weight: 700; margin-bottom: 8px;
  }
  .rd-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 800; color: #1E2535; line-height: 1.2;
  }
  .rd-modal-close {
    background: #EEF0F4; border: none; width: 36px; height: 36px; border-radius: 50%;
    cursor: pointer; font-size: 18px; color: #5A6478;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, color .2s; flex-shrink: 0; margin-left: 16px;
    font-family: 'DM Sans', sans-serif;
  }
  .rd-modal-close:hover { background: #DDE1E9; color: #1E2535; }
  .rd-modal-notice {
    margin: 16px 32px;
    background: #FFF8EC; border: 1px solid #FFD970;
    border-radius: 10px; padding: 12px 16px;
    font-size: 13px; color: #7A5800; line-height: 1.6;
    display: flex; gap: 10px; align-items: flex-start;
  }
  .rd-modal-notice-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .rd-modal-body { padding: 0 32px 0; }
  .rd-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .rd-form-group { display: flex; flex-direction: column; gap: 6px; }
  .rd-form-group.full { grid-column: 1 / -1; }
  .rd-form-label { font-size: 13px; font-weight: 600; color: #1E2535; }
  .rd-form-label span { color: #FF5A1F; }
  .rd-form-input, .rd-form-select, .rd-form-textarea {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid #DDE1E9; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1E2535;
    background: #ffffff; transition: border-color .2s, box-shadow .2s; outline: none;
  }
  .rd-form-input:focus, .rd-form-select:focus, .rd-form-textarea:focus {
    border-color: #0057FF; box-shadow: 0 0 0 3px rgba(0,87,255,.1);
  }
  .rd-form-textarea { resize: vertical; min-height: 90px; }
  .rd-upload-area {
    border: 2px dashed #DDE1E9; border-radius: 10px;
    padding: 20px; text-align: center; cursor: pointer;
    transition: border-color .2s, background .2s; position: relative;
  }
  .rd-upload-area:hover { border-color: #0057FF; background: #E8F0FF; }
  .rd-upload-area input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .rd-upload-icon { font-size: 28px; margin-bottom: 6px; }
  .rd-upload-text { font-size: 13px; color: #5A6478; }
  .rd-upload-text strong { color: #0057FF; }
  .rd-upload-hint { font-size: 12px; color: #9AA3B2; margin-top: 3px; }
  .rd-modal-footer {
    padding: 16px 32px 28px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .rd-submit-btn {
    width: 100%; padding: 14px;
    background: #FF5A1F; color: white; border: none; border-radius: 50px;
    font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background .2s, transform .15s;
    box-shadow: 0 4px 14px rgba(255,90,31,.3);
  }
  .rd-submit-btn:hover { background: #E04A10; transform: translateY(-1px); }
  .rd-submit-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }
  .rd-form-terms { font-size: 12.5px; color: #9AA3B2; text-align: center; line-height: 1.6; }
  .rd-form-terms a { color: #0057FF; text-decoration: none; }
  .rd-form-terms a:hover { text-decoration: underline; }

  /* Success */
  .rd-success-modal { text-align: center; padding: 48px 32px; }
  .rd-success-icon {
    width: 72px; height: 72px; background: #E8FFF0; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px; font-size: 32px;
  }
  .rd-success-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 800; color: #1E2535; margin-bottom: 10px;
  }
  .rd-success-desc { font-size: 14px; color: #5A6478; line-height: 1.7; margin-bottom: 24px; }
  .rd-success-close {
    background: #0057FF; color: white; border: none;
    padding: 12px 28px; border-radius: 50px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: background .2s;
  }
  .rd-success-close:hover { background: #0041CC; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .rd-main-wrap { grid-template-columns: 1fr; padding: 0 20px 60px; }
    .rd-sidebar { position: static; }
    .rd-nav { padding: 0 20px; }
    .rd-breadcrumb { padding: 14px 20px; }
    .rd-page-title { font-size: 28px; }
    .rd-form-grid { grid-template-columns: 1fr; }
    .rd-nav-links { display: none; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ApplicationModal({
  isOpen,
  onClose,
  currentRole,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentRole: RoleKey;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [form, setForm] = useState<FormState>({
    namaLengkap: "", nomorHP: "", email: "", tanggalLahir: "",
    jenisKelamin: "", pengalaman: "", spesialisasi: "",
    motivasi: "", portofolioLink: "", cvFile: null,
  });

  const role = roles[currentRole];

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setFileName("");
      setForm({
        namaLengkap: "", nomorHP: "", email: "", tanggalLahir: "",
        jenisKelamin: "", pengalaman: "", spesialisasi: "",
        motivasi: "", portofolioLink: "", cvFile: null,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, cvFile: file }));
    setFileName(file?.name ?? "");
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const body = new FormData();
    (Object.keys(form) as Array<keyof FormState>).forEach((k) => {
      const v = form[k];
      if (v !== null) body.append(k, v as string | Blob);
    });
    body.append("role", currentRole);

    const res = await fetch("/api/contributor/apply", { method: "POST", body });
    const json = await res.json();

    if (!res.ok || !json.success) {
      // Tampilkan error ke user
      alert(json.message ?? "Gagal mengirim lamaran. Coba lagi.");
      setIsSubmitting(false);
      return;
    }

    // Hanya tampilkan sukses jika benar-benar berhasil
    setIsSuccess(true);
  } catch (err) {
    console.error("Submit error:", err);
    alert("Terjadi kesalahan jaringan. Periksa koneksi Anda.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div
      className={`rd-modal-overlay${isOpen ? " open" : ""}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="rd-modal">

        {/* ── SUCCESS ── */}
        {isSuccess && (
          <div className="rd-success-modal">
            <div className="rd-success-icon">✅</div>
            <div className="rd-success-title">Lamaran Terkirim!</div>
            <p className="rd-success-desc">
              Terima kasih telah mendaftar sebagai kontributor.<br />
              Tim kami akan meninjau aplikasi Anda. Jika lolos seleksi,{" "}
              <strong>email beserta password akses</strong> akan dikirimkan ke email yang Anda daftarkan.
            </p>
            <button className="rd-success-close" onClick={onClose}>Tutup</button>
          </div>
        )}

        {/* ── FORM ── */}
        {!isSuccess && (
          <>
            <div className="rd-modal-header">
              <div>
                <div className="rd-modal-role-badge">{role.modalBadge}</div>
                <div className="rd-modal-title">
                  Formulir Pendaftaran<br />Kontributor
                </div>
              </div>
              <button className="rd-modal-close" onClick={onClose}>x</button>
            </div>

            <div className="rd-modal-notice">
              <span className="rd-modal-notice-icon"></span>
              <span>
                Pendaftaran ini <strong>bukan langsung aktif</strong>. Anda akan melalui proses seleksi.
                Jika diterima, akun beserta password akan dikirim ke email Anda.
              </span>
            </div>

            <div className="rd-modal-body">
              <form id="rd-apply-form" onSubmit={handleSubmit}>
                <div className="rd-form-grid">

                  {/* Nama */}
                  <div className="rd-form-group">
                    <label className="rd-form-label">Nama Lengkap <span>*</span></label>
                    <input
                      className="rd-form-input" name="namaLengkap" value={form.namaLengkap}
                      onChange={handleChange} type="text" placeholder="Nama lengkap Anda" required
                    />
                  </div>

                  {/* HP */}
                  <div className="rd-form-group">
                    <label className="rd-form-label">Nomor HP / WA <span>*</span></label>
                    <input
                      className="rd-form-input" name="nomorHP" value={form.nomorHP}
                      onChange={handleChange} type="tel" placeholder="08xx-xxxx-xxxx" required
                    />
                  </div>

                  {/* Email */}
                  <div className="rd-form-group full">
                    <label className="rd-form-label">Alamat Email <span>*</span></label>
                    <input
                      className="rd-form-input" name="email" value={form.email}
                      onChange={handleChange} type="email" placeholder="contoh@email.com" required
                    />
                  </div>

                  {/* Tgl Lahir */}
                  <div className="rd-form-group">
                    <label className="rd-form-label">Tanggal Lahir <span>*</span></label>
                    <input
                      className="rd-form-input" name="tanggalLahir" value={form.tanggalLahir}
                      onChange={handleChange} type="date" required
                    />
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="rd-form-group">
                    <label className="rd-form-label">Jenis Kelamin</label>
                    <select
                      className="rd-form-select" name="jenisKelamin" value={form.jenisKelamin}
                      onChange={handleChange}
                    >
                      <option value="">Pilih...</option>
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </div>

                  {/* Pengalaman */}
                  <div className="rd-form-group full">
                    <label className="rd-form-label">{role.labelPengalaman} <span>*</span></label>
                    <select
                      className="rd-form-select" name="pengalaman" value={form.pengalaman}
                      onChange={handleChange} required
                    >
                      <option value="">Pilih pengalaman...</option>
                      <option>Kurang dari 1 tahun</option>
                      <option>1–2 tahun</option>
                      <option>2–5 tahun</option>
                      <option>Lebih dari 5 tahun</option>
                    </select>
                  </div>

                  {/* Spesialisasi */}
                  <div className="rd-form-group full">
                    <label className="rd-form-label">{role.labelSpesialisasi} <span>*</span></label>
                    <input
                      className="rd-form-input" name="spesialisasi" value={form.spesialisasi}
                      onChange={handleChange} type="text"
                      placeholder={role.placeholderSpesialisasi} required
                    />
                  </div>

                  {/* Motivasi */}
                  <div className="rd-form-group full">
                    <label className="rd-form-label">Motivasi Bergabung <span>*</span></label>
                    <textarea
                      className="rd-form-textarea" name="motivasi" value={form.motivasi}
                      onChange={handleChange}
                      placeholder="Ceritakan motivasi Anda bergabung sebagai kontributor..."
                      required
                    />
                  </div>

                  {/* Portofolio */}
                  <div className="rd-form-group full">
                    <label className="rd-form-label">Link Portofolio / Tulisan</label>
                    <input
                      className="rd-form-input" name="portofolioLink" value={form.portofolioLink}
                      onChange={handleChange} type="url" placeholder="https://..."
                    />
                  </div>

                  {/* Upload CV */}
                  <div className="rd-form-group full">
                    <label className="rd-form-label">Upload CV / Portofolio</label>
                    <div className="rd-upload-area">
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} />
                      <div className="rd-upload-icon">📎</div>
                      <div className="rd-upload-text">
                        {fileName
                          ? <strong>{fileName}</strong>
                          : <><strong>Klik untuk upload</strong> atau seret file ke sini</>
                        }
                      </div>
                      <div className="rd-upload-hint">PDF, DOC, DOCX · Maks. 5 MB</div>
                    </div>
                  </div>

                </div>
              </form>
            </div>

            <div className="rd-modal-footer">
              <button
                className="rd-submit-btn"
                form="rd-apply-form"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mengirim..." : "Kirim Lamaran"}
                {!isSubmitting && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
              <p className="rd-form-terms">
                Dengan mendaftar, Anda menyetujui{" "}
                <a href="#">Kebijakan Privasi</a> dan <a href="#">Ketentuan Kontributor</a> kami.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [currentRole, setCurrentRole] = useState<RoleKey>("redaksi");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const role = roles[currentRole];

  const roleTabs: { key: RoleKey; icon: string; label: string }[] = [
    { key: "redaksi", icon: "", label: "Redaksi / Redaktur" },
    { key: "jurnalis", icon: "", label: "Jurnalis / Reporter" },
    { key: "editor", icon: "", label: "Editor" },
  ];

  const handleSwitchRole = (r: RoleKey) => {
    setCurrentRole(r);
    setTimeout(() => {
      document.querySelector(".rd-content-area")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <>
      {/* Inject scoped CSS */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="rd-wrap">

        {/* ── NAVBAR ── */}
        <nav className="rd-nav">
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

        <div className="rd-nav-links">
        <Link href="/tentang-kami">Tentang Kami</Link>   {/* ← pakai Link Next.js */}
        <a href="/tim-kami">Tim Kami</a>
        <a href="#">Karier</a>
        <a href="#">Kontak</a>
      </div>

          <button className="rd-nav-cta" onClick={() => setIsModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Daftar Kontributor
          </button>
        </nav>

        {/* ── BREADCRUMB ── */}
        <div className="rd-breadcrumb">
          <a href="#">Beranda</a>
          <span className="rd-breadcrumb-sep">›</span>
          <a href="#">Kontributor</a>
          <span className="rd-breadcrumb-sep">›</span>
          <span>{role.bcRole}</span>
        </div>

        {/* ── MAIN WRAP ── */}
        <div className="rd-main-wrap">

          {/* ── SIDEBAR ── */}
          <aside className="rd-sidebar">
            <div className="rd-sidebar-card">
              <div className="rd-role-title">{role.sidebarTitle}</div>

              <div className="rd-role-meta">
                {/* Tipe */}
                <div className="rd-meta-item">
                  <div className="rd-meta-icon">
                    <svg viewBox="0 0 24 24">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                  </div>
                  <div>
                    <div className="rd-meta-label">Tipe</div>
                    <div className="rd-meta-value">Kontributor Lepas</div>
                  </div>
                </div>
                {/* Divisi */}
                <div className="rd-meta-item">
                  <div className="rd-meta-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <div className="rd-meta-label">Divisi</div>
                    <div className="rd-meta-value">Tim Redaksi</div>
                  </div>
                </div>
                {/* Min. Usia */}
                <div className="rd-meta-item">
                  <div className="rd-meta-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div className="rd-meta-label">Min. Usia</div>
                    <div className="rd-meta-value">{role.sidebarAge}</div>
                  </div>
                </div>
                {/* Sistem Kerja */}
                <div className="rd-meta-item">
                  <div className="rd-meta-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="rd-meta-label">Sistem Kerja</div>
                    <div className="rd-meta-value">Remote / WFA</div>
                  </div>
                </div>
              </div>

              <button className="rd-apply-btn" onClick={() => setIsModalOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 8 16 12 12 16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Ajukan Lamaran
              </button>

              <div className="rd-selection-notice">
                ⚠️{" "}
                <strong>Pendaftaran melalui seleksi.</strong>{" "}
                Anda tidak langsung mendapat akses. Jika lolos seleksi, email &amp; password akan dikirim ke email Anda.
              </div>

              {/* Role Switcher */}
              <div className="rd-role-switcher">
                <div className="rd-role-switcher-label">Pilih Role Lain</div>
                <div className="rd-role-btn-group">
                  {roleTabs.map(({ key, icon, label }) => (
                    <button
                      key={key}
                      className={`rd-role-tab${currentRole === key ? " active" : ""}`}
                      onClick={() => handleSwitchRole(key)}
                    >
                      <span className="rd-tab-icon">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="rd-content-area">
            <div className="rd-section-head">
              <div className="rd-badge">{role.badge}</div>
              <h1
                className="rd-page-title"
                dangerouslySetInnerHTML={{ __html: role.mainTitle }}
              />
              <p className="rd-page-desc">{role.mainDesc}</p>
            </div>

            {/* Tentang Peran */}
            <div className="rd-content-card">
              <div className="rd-card-section-title">Tentang Peran</div>
              <p className="rd-role-desc">{role.descPeran}</p>
            </div>

            {/* Tanggung Jawab */}
            <div className="rd-content-card">
              <div className="rd-card-section-title">Tanggung Jawab</div>
              <ul className="rd-spec-list">
                {role.tanggungJawab.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>

            {/* Persyaratan */}
            <div className="rd-content-card">
              <div className="rd-card-section-title">Persyaratan</div>
              <ul className="rd-spec-list">
                {role.persyaratan.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>

            {/* Kualifikasi Tambahan */}
            <div className="rd-content-card">
              <div className="rd-card-section-title">Kualifikasi Tambahan (Diutamakan)</div>
              <ul className="rd-spec-list">
                {role.kualifikasi.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <div className="rd-divider" />
              <div className="rd-extra-badge-row">
                {role.badges.map((b) => (
                  <span key={b} className="rd-extra-badge">{b}</span>
                ))}
              </div>
            </div>

            {/* Footer link */}
            <p className="rd-footer-link">
              Sudah punya akun?{" "}
              <Link href="/login">Login di sini</Link>
            </p>
          </main>
        </div>
      </div>

      {/* ── MODAL ── */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentRole={currentRole}
      />
    </>
  );
}