"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

// ── Constants ─────────────────────────────────────────────────
const AUTOSAVE_KEY = "narasi_create_article_draft";
const AUTOSAVE_DELAY_MS = 1500;

const categories = ["Ekonomi", "Politik", "Teknologi", "Bisnis", "Keuangan"];

const categoryColor: Record<string, string> = {
  Ekonomi:   "bg-blue-100 text-blue-700",
  Teknologi: "bg-purple-100 text-purple-700",
  Politik:   "bg-orange-100 text-orange-700",
  Keuangan:  "bg-green-100 text-green-700",
  Bisnis:    "bg-pink-100 text-pink-700",
};

const navCategories = [
  { name: "Beranda" },
  { name: "Ekonomi" },
  { name: "Politik" },
  { name: "Teknologi" },
  { name: "Bisnis" },
  { name: "Keuangan" },
];

// Status badge config
const statusConfig: Record<string, { label: string; color: string }> = {
  draft:        { label: "Draft",         color: "bg-zinc-100 text-zinc-600" },
  review:       { label: "Review",        color: "bg-blue-100 text-blue-700" },
  revisi:       { label: "Revisi",        color: "bg-amber-100 text-amber-700" },
  siap_publish: { label: "Layak Publish", color: "bg-green-100 text-green-700" },
  publish:      { label: "Published",     color: "bg-emerald-100 text-emerald-700" },
  scheduled:    { label: "Terjadwal",     color: "bg-purple-100 text-purple-700" },
};

interface FormData {
  title: string;
  body: string;
  excerpt: string;
  image: string;
  detailImage: string;
  detailVideo: string;
  category: string;
}

// ── VideoEmbed ────────────────────────────────────────────────
function VideoEmbed({ url }: { url: string }) {
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0`}
          title="Video YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          title="Video Vimeo"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }
  return (
    <video controls className="w-full rounded-xl shadow-lg" preload="metadata">
      <source src={url} />
    </video>
  );
}

// ── PreviewArticleBody ────────────────────────────────────────
function PreviewArticleBody({
  body, detailImage, detailVideo, title,
}: {
  body: string; detailImage: string; detailVideo: string; title: string;
}) {
  const paragraphs  = body.split("\n").filter(Boolean);
  const insertAfter = Math.min(3, Math.floor(paragraphs.length / 2));
  const beforeMedia = paragraphs.slice(0, insertAfter);
  const afterMedia  = paragraphs.slice(insertAfter);

  return (
    <div>
      {beforeMedia.map((p, i) => (
        <p key={`b-${i}`} className="text-gray-700 text-lg leading-relaxed mb-5">{p}</p>
      ))}
      {detailImage && (
        <figure className="my-8">
          <div className="relative w-full rounded-xl overflow-hidden shadow-md border border-gray-100">
            <img
              src={detailImage}
              alt={`Ilustrasi: ${title}`}
              className="w-full object-cover max-h-[500px]"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
            />
          </div>
          <figcaption className="text-sm text-gray-400 text-center mt-2 italic">
            📷 Ilustrasi terkait artikel
          </figcaption>
        </figure>
      )}
      {detailVideo && (
        <div className="my-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-5 bg-red-600 rounded" />
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              🎬 Video Terkait
            </span>
          </div>
          <VideoEmbed url={detailVideo} />
        </div>
      )}
      {afterMedia.map((p, i) => (
        <p key={`a-${i}`} className="text-gray-700 text-lg leading-relaxed mb-5">{p}</p>
      ))}
    </div>
  );
}

// ── Article Preview Modal ─────────────────────────────────────
function ArticlePreviewModal({
  formData, onClose,
}: {
  formData: FormData; onClose: () => void;
}) {
  const now = new Date();
  const formattedDateLong = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const formattedDateShort = now.toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
  const cc        = categoryColor[formData.category] ?? "bg-gray-100 text-gray-700";
  const heroImage = formData.image || `https://picsum.photos/seed/preview/1200/600`;
  const displayExcerpt = formData.excerpt.trim() || formData.body.trim().substring(0, 200) + "...";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-50">
        <div className="h-0.5 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400" />
        <div className="flex items-center justify-between px-5 py-2.5
          bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1
              bg-gradient-to-r from-red-700 to-red-500 rounded-full shadow-sm">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                     9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-[11px] font-bold text-white tracking-wide uppercase">Mode Preview</span>
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">
              Tampilan ini mencerminkan halaman artikel yang sesungguhnya
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500
              hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg
              hover:bg-gray-100 border border-transparent hover:border-gray-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Tutup Preview
          </button>
        </div>
      </div>

      {/* Mock Site */}
      <div className="min-h-screen bg-gray-50 pb-14">
        <header className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
            <div className="shrink-0">
              <Image
                src="/assets/NarasiKotaLogoBiru.webp"
                alt="NarasiKota"
                width={220}
                height={64}
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 text-sm">🔍</span>
                <div className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                  bg-gray-50 text-gray-400 cursor-default select-none">
                  Pencarian berita...
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3 shrink-0">
              <span className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm cursor-default">MASUK</span>
              <span className="px-5 py-2 bg-red-700 text-white rounded-lg font-semibold text-sm cursor-default">JOIN KONTRIBUTOR</span>
            </div>
          </div>
        </header>

        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto">
              {navCategories.map((cat) => (
                <span
                  key={cat.name}
                  className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-[2px] cursor-default select-none transition-all
                    ${formData.category === cat.name ? "border-red-700 text-red-700" : "border-transparent text-gray-600"}`}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <span>Beranda</span><span>›</span>
            <span>{formData.category}</span><span>›</span>
            <span className="text-gray-700 line-clamp-1 max-w-xs">{formData.title || "Judul Artikel..."}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <article className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${cc}`}>
                  {formData.category}
                </span>
                <span className="text-gray-400 text-sm">{formattedDateLong}</span>
              </div>

              {formData.title ? (
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-5">{formData.title}</h1>
              ) : (
                <div className="space-y-2 mb-5">
                  <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse w-4/5" />
                </div>
              )}

              {formData.body && (
                <p className="text-xl text-gray-500 leading-relaxed mb-6 border-l-4 border-red-600 pl-4 italic">
                  {displayExcerpt}
                </p>
              )}

              <div className="relative w-full h-80 lg:h-[450px] rounded-xl overflow-hidden mb-8 shadow-lg bg-gray-200">
                <img
                  src={heroImage}
                  alt={formData.title || "Hero artikel"}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/preview/1200/600`; }}
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
                {formData.body ? (
                  <PreviewArticleBody
                    body={formData.body}
                    detailImage={formData.detailImage}
                    detailVideo={formData.detailVideo}
                    title={formData.title}
                  />
                ) : (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`h-5 bg-gray-100 rounded animate-pulse ${i === 5 ? "w-2/3" : "w-full"}`} />
                    ))}
                  </div>
                )}
              </div>
            </article>

            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-600 rounded" />
                  Info Artikel
                </h3>
                <div className="space-y-0 text-sm divide-y divide-gray-100">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500">Kategori</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cc}`}>{formData.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500">Publish</span>
                    <span className="font-medium text-gray-700">{formattedDateShort}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <footer className="bg-gray-900 text-white mt-12 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">© 2026 NarasiKota. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── Auto-save indicator ───────────────────────────────────────
function AutoSaveIndicator({ lastSaved }: { lastSaved: Date | null }) {
  if (!lastSaved) return null;
  const timeStr = lastSaved.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      <span>Tersimpan otomatis {timeStr}</span>
    </div>
  );
}

// ── Main Create Article Page ──────────────────────────────────
export default function CreateArticlePage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading, isEditor, isReporter } = useCurrentUser();

  const [isLoading,         setIsLoading]         = useState(false);
  const [error,             setError]             = useState("");
  const [success,           setSuccess]           = useState("");
  const [showPreview,       setShowPreview]       = useState(false);
  const [isScheduled,       setIsScheduled]       = useState(false);
  const [scheduledAt,       setScheduledAt]       = useState("");
  const [lastSaved,         setLastSaved]         = useState<Date | null>(null);
  const [autoSaveRestored,  setAutoSaveRestored]  = useState(false);
  const [isSavingIndicator, setIsSavingIndicator] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    body: "",
    excerpt: "",
    image: "",
    detailImage: "",
    detailVideo: "",
    category: "Ekonomi",
  });

  // ── Load auto-save on mount ─────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData?.title || parsed.formData?.body) {
          setFormData(parsed.formData);
          setIsScheduled(parsed.isScheduled ?? false);
          setScheduledAt(parsed.scheduledAt ?? "");
          setAutoSaveRestored(true);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // ── Auto-save on change (debounced) ────────────────────────
  useEffect(() => {
    if (!formData.title && !formData.body) return;
    setIsSavingIndicator(true);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          AUTOSAVE_KEY,
          JSON.stringify({ formData, isScheduled, scheduledAt })
        );
        setLastSaved(new Date());
      } catch { /* ignore */ }
      setIsSavingIndicator(false);
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [formData, isScheduled, scheduledAt]);

  const clearAutoSave = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
  }, []);

  const getMinDatetime = () => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleDismissAutoSave = () => {
    setAutoSaveRestored(false);
  };

  const handleClearSavedDraft = () => {
    clearAutoSave();
    setFormData({ title: "", body: "", excerpt: "", image: "", detailImage: "", detailVideo: "", category: "Ekonomi" });
    setIsScheduled(false);
    setScheduledAt("");
    setAutoSaveRestored(false);
    setLastSaved(null);
  };

  // ── Submit handler ──────────────────────────────────────────
  const handleSubmit = async (submitStatus: "publish" | "draft" | "scheduled" | "review") => {
    setError("");
    setSuccess("");

    if (!formData.title.trim()) { setError("Judul artikel wajib diisi"); return; }
    if (!formData.body.trim())  { setError("Isi artikel wajib diisi"); return; }
    if (!formData.category)     { setError("Kategori wajib dipilih"); return; }

    if (submitStatus === "scheduled") {
      if (!scheduledAt) { setError("Pilih tanggal & waktu jadwal publikasi"); return; }
      if (new Date(scheduledAt) <= new Date()) { setError("Jadwal harus di masa mendatang"); return; }
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title:       formData.title.trim(),
          body:        formData.body.trim(),
          excerpt:     formData.excerpt.trim()    || null,
          image:       formData.image.trim()       || null,
          detailImage: formData.detailImage.trim() || null,
          detailVideo: formData.detailVideo.trim() || null,
          category:    formData.category,
          status:      submitStatus === "scheduled" ? "scheduled" : submitStatus,
          scheduledAt: submitStatus === "scheduled" ? new Date(scheduledAt).toISOString() : null,
        }),
      });

      const data = await response.json();
      if (response.status === 401) throw new Error("Sesi login telah berakhir, silakan login ulang");
      if (!response.ok) throw new Error(data.message || "Gagal menyimpan artikel");

      const messages: Record<string, string> = {
        publish:   "✅ Artikel berhasil dipublish!",
        draft:     "✅ Artikel disimpan sebagai Draft.",
        review:    "✅ Artikel berhasil diajukan ke Editor untuk direview.",
        scheduled: `✅ Artikel dijadwalkan pada ${new Date(scheduledAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}.`,
      };
      setSuccess(messages[submitStatus]);

      // Hapus auto-save setelah submit berhasil
      clearAutoSave();

      setTimeout(() => router.push("/articles"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormEmpty = !formData.title.trim() && !formData.body.trim();

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      {showPreview && (
        <ArticlePreviewModal formData={formData} onClose={() => setShowPreview(false)} />
      )}

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/articles"
              className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-black">Tulis Artikel Baru</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                {isReporter
                  ? "Tulis dan ajukan artikel ke Editor untuk direview"
                  : "Artikel yang dipublish langsung tampil di halaman berita"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            {isSavingIndicator ? (
              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Menyimpan...
              </span>
            ) : (
              <AutoSaveIndicator lastSaved={lastSaved} />
            )}

            <button
              onClick={() => setShowPreview(true)}
              disabled={isFormEmpty}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-zinc-300
                text-sm font-semibold text-zinc-700
                hover:border-zinc-900 hover:text-zinc-900 hover:bg-zinc-50
                disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Artikel
            </button>
          </div>
        </div>

        {/* ── Auto-save restored banner ── */}
        {autoSaveRestored && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-800">Draft tersimpan ditemukan</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Kami memuat kembali pekerjaan Anda sebelumnya secara otomatis.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleClearSavedDraft}
                className="text-xs font-semibold text-blue-600 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
              >
                Hapus & Mulai Baru
              </button>
              <button
                onClick={handleDismissAutoSave}
                className="text-xs font-semibold text-blue-600 hover:text-blue-900 transition-colors px-2 py-1 rounded hover:bg-blue-100"
              >
                ✕ Tutup
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-emerald-700">{success}</p>
          </div>
        )}

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Kolom Kiri */}
          <div className="lg:col-span-2 space-y-4">

            {/* Title */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <label className="block text-sm font-bold text-black mb-2">
                Judul Artikel <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="Contoh: BI Rate Dipertahankan 6% di Tengah Tekanan Inflasi Global"
                className="w-full px-4 py-3 text-base font-medium text-black border-2 border-zinc-300 rounded-lg
                  placeholder:text-zinc-400 placeholder:font-normal
                  focus:outline-none focus:border-zinc-900 focus:ring-0 bg-white transition-colors"
              />
            </div>

            {/* Body */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <label className="block text-sm font-bold text-black mb-2">
                Isi Artikel <span className="text-red-500">*</span>
              </label>
              <textarea
                name="body" value={formData.body} onChange={handleChange}
                placeholder="Tulis isi artikel lengkap di sini..." rows={16}
                className="w-full px-4 py-3 text-sm text-black border-2 border-zinc-300 rounded-lg
                  placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-0
                  bg-white resize-none leading-relaxed transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-2 text-right">{formData.body.length} karakter</p>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <label className="block text-sm font-bold text-black mb-1">
                Ringkasan <span className="text-zinc-400 font-normal">(Opsional)</span>
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                Tampil sebagai deskripsi singkat di halaman berita.
              </p>
              <textarea
                name="excerpt" value={formData.excerpt} onChange={handleChange}
                placeholder="Tulis ringkasan singkat artikel..." rows={3}
                className="w-full px-4 py-3 text-sm text-black border-2 border-zinc-300 rounded-lg
                  placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-0
                  bg-white resize-none transition-colors"
              />
            </div>

            {/* Media */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <label className="block text-sm font-bold text-black mb-1">
                Media dalam Artikel <span className="text-zinc-400 font-normal">(Opsional)</span>
              </label>
              <p className="text-xs text-zinc-500 mb-5">
                Gambar dan video yang tampil di dalam konten detail artikel.
              </p>

              <div className="mb-5 pb-5 border-b border-zinc-100">
                <label className="text-xs font-semibold text-zinc-700 mb-2 block">URL Gambar Detail</label>
                <input
                  type="url" name="detailImage" value={formData.detailImage} onChange={handleChange}
                  placeholder="https://example.com/foto-dalam-artikel.jpg"
                  className="w-full px-3 py-2.5 text-sm text-black border-2 border-zinc-300 rounded-lg
                    placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-0
                    bg-white transition-colors"
                />
                {formData.detailImage && (
                  <div className="mt-3 rounded-lg overflow-hidden border-2 border-zinc-200">
                    <img src={formData.detailImage} alt="Preview gambar detail"
                      className="w-full h-40 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 mb-2 block">URL Video</label>
                <input
                  type="url" name="detailVideo" value={formData.detailVideo} onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=... atau https://vimeo.com/..."
                  className="w-full px-3 py-2.5 text-sm text-black border-2 border-zinc-300 rounded-lg
                    placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-0
                    bg-white transition-colors"
                />
                {formData.detailVideo && (
                  <div className="mt-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center gap-2.5">
                    <span className="text-xl shrink-0">🎬</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-700 mb-0.5">Video terlampir</p>
                      <p className="text-xs text-zinc-400 truncate">{formData.detailVideo}</p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-zinc-400 mt-2">Mendukung YouTube, Vimeo, atau link video langsung (.mp4)</p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">

            {/* ── PUBLIKASI ── Role-based ─────────────────── */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-black">Publikasi</h3>
                {/* Role badge */}
                {!userLoading && currentUser && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 uppercase tracking-wide">
                    {currentUser.role}
                  </span>
                )}
              </div>

              {/* ── REPORTER WORKFLOW ── */}
              {isReporter && (
                <>
                  {/* Info workflow */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-blue-800 mb-0.5">Alur Kerja Reporter</p>
                        <p className="text-xs text-blue-600 leading-relaxed">
                          Simpan sebagai Draft, atau Ajukan ke Editor untuk direview sebelum dipublish.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Workflow steps */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {[
                      { label: "Draft",  color: "bg-zinc-300" },
                      { label: "→",      color: "" },
                      { label: "Review", color: "bg-blue-400" },
                      { label: "→",      color: "" },
                      { label: "Publish",color: "bg-emerald-400" },
                    ].map((step, i) =>
                      step.label === "→" ? (
                        <span key={i} className="text-zinc-400 text-xs font-bold">→</span>
                      ) : (
                        <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${step.color}`}>
                          {step.label}
                        </span>
                      )
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Ajukan ke Editor */}
                    <button
                      type="button"
                      onClick={() => handleSubmit("review")}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold
                        hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>Menyimpan...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>Ajukan ke Editor →</>
                      )}
                    </button>

                    {/* Simpan Draft */}
                    <button
                      type="button"
                      onClick={() => handleSubmit("draft")}
                      disabled={isLoading}
                      className="w-full border-2 border-zinc-300 text-black py-3 rounded-lg text-sm font-semibold
                        hover:bg-zinc-50 hover:border-zinc-400 transition-colors disabled:opacity-50"
                    >
                      Simpan sebagai Draft
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-start gap-2">
                    <svg className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-xs text-zinc-500">
                      Artikel yang diajukan akan masuk ke antrian review Editor.
                    </p>
                  </div>
                </>
              )}

              {/* ── EDITOR / REDAKSI / SUPER_ADMIN WORKFLOW ── */}
              {(isEditor || (!isReporter && !userLoading)) && (
                <>
                  {/* Schedule toggle */}
                  <label className="flex items-center justify-between cursor-pointer mb-4 p-3 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-zinc-700">Jadwalkan Publikasi</span>
                    </div>
                    <div
                      onClick={() => { setIsScheduled(v => !v); if (isScheduled) setScheduledAt(""); }}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                        isScheduled ? "bg-zinc-900" : "bg-zinc-300"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        isScheduled ? "left-5" : "left-0.5"
                      }`} />
                    </div>
                  </label>

                  {isScheduled && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs font-semibold text-blue-700">Pilih tanggal & waktu publikasi</p>
                      </div>
                      <input
                        type="datetime-local" value={scheduledAt} min={getMinDatetime()}
                        onChange={(e) => { setScheduledAt(e.target.value); setError(""); }}
                        className="w-full px-3 py-2.5 text-sm text-black border-2 border-blue-300 rounded-lg
                          focus:outline-none focus:border-blue-600 focus:ring-0 bg-white transition-colors"
                      />
                      {scheduledAt && (
                        <p className="text-xs text-blue-700 font-medium">
                          Akan publish:{" "}
                          <strong>
                            {new Date(scheduledAt).toLocaleString("id-ID", {
                              weekday: "long", day: "numeric", month: "long",
                              year: "numeric", hour: "2-digit", minute: "2-digit",
                            })} WIB
                          </strong>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {isScheduled ? (
                      <button
                        type="button" onClick={() => handleSubmit("scheduled")}
                        disabled={isLoading || !scheduledAt}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold
                          hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                          flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>Menyimpan...</>
                        ) : (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>Jadwalkan Publikasi</>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button" onClick={() => handleSubmit("publish")} disabled={isLoading}
                        className="w-full bg-zinc-900 text-white py-3 rounded-lg text-sm font-bold
                          hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                          flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>Menyimpan...</>
                        ) : (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                          </svg>Publish Sekarang</>
                        )}
                      </button>
                    )}

                    <button
                      type="button" onClick={() => handleSubmit("draft")} disabled={isLoading}
                      className="w-full border-2 border-zinc-300 text-black py-3 rounded-lg text-sm font-semibold
                        hover:bg-zinc-50 hover:border-zinc-400 transition-colors disabled:opacity-50"
                    >
                      Simpan sebagai Draft
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-start gap-2">
                    <svg className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-xs text-zinc-500">
                      {isScheduled
                        ? "Artikel akan otomatis publish sesuai jadwal"
                        : "Artikel Publish langsung tampil di halaman berita utama"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Kategori */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <label className="block text-sm font-bold text-black mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="category" value={formData.category} onChange={handleChange}
                className="w-full px-3 py-3 text-sm font-medium text-black border-2 border-zinc-300 rounded-lg
                  focus:outline-none focus:border-zinc-900 focus:ring-0 bg-white transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Thumbnail */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <label className="block text-sm font-bold text-black mb-1">
                URL Gambar Thumbnail <span className="text-zinc-400 font-normal">(Opsional)</span>
              </label>
              <p className="text-xs text-zinc-500 mb-3">Gambar kecil yang tampil di kartu berita.</p>
              <input
                type="url" name="image" value={formData.image} onChange={handleChange}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full px-3 py-3 text-sm text-black border-2 border-zinc-300 rounded-lg
                  placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-0
                  bg-white transition-colors"
              />
              {formData.image && (
                <div className="mt-3 rounded-lg overflow-hidden border-2 border-zinc-200">
                  <img src={formData.image} alt="Preview thumbnail"
                    className="w-full h-32 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <p className="text-xs text-zinc-500 mt-2">Kosong = gambar otomatis digenerate dari sistem</p>
            </div>

            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
              <p className="text-xs font-semibold text-black mb-2">Setelah publish, artikel tampil di:</p>
              <Link href="/" target="_blank"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                localhost:3000 — Halaman Berita Utama
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}