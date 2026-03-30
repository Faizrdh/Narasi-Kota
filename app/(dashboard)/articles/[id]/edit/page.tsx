"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

const categories = ["Ekonomi", "Politik", "Teknologi", "Bisnis", "Keuangan"];

// Status display config
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft:        { label: "Draft",          color: "text-zinc-600",   bg: "bg-zinc-100" },
  review:       { label: "Review",         color: "text-blue-700",   bg: "bg-blue-100" },
  revisi:       { label: "Revisi",         color: "text-amber-700",  bg: "bg-amber-100" },
  siap_publish: { label: "Layak Publish",  color: "text-green-700",  bg: "bg-green-100" },
  publish:      { label: "Published",      color: "text-emerald-700",bg: "bg-emerald-100" },
  scheduled:    { label: "Terjadwal",      color: "text-purple-700", bg: "bg-purple-100" },
};

interface FormData {
  title: string;
  body: string;
  excerpt: string;
  image: string;
  detailImage: string;
  detailVideo: string;
  category: string;
  status: string;
}

export default function EditArticlePage() {
  const router   = useRouter();
  const params   = useParams();
  const id       = params?.id as string;
  const { user: currentUser, loading: userLoading, isEditor, isReporter } = useCurrentUser();

  const [isLoading,  setIsLoading]  = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [revisiNote, setRevisiNote] = useState("");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    body: "",
    excerpt: "",
    image: "",
    detailImage: "",
    detailVideo: "",
    category: "Ekonomi",
    status: "draft",
  });

  // Fetch article
  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${id}?noView=1`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Artikel tidak ditemukan");
        const a = data.data ?? data;
        setFormData({
          title:       a.title       ?? "",
          body:        a.body        ?? "",
          excerpt:     a.excerpt     ?? "",
          image:       a.image       ?? "",
          detailImage: a.detailImage ?? "",
          detailVideo: a.detailVideo ?? "",
          category:    a.category    ?? "Ekonomi",
          status:      a.status      ?? "draft",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat artikel");
      } finally {
        setIsFetching(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Generic submit with any status
  const handleSubmit = async (newStatus: string) => {
    setError("");
    setSuccess("");

    if (!formData.title.trim()) { setError("Judul artikel wajib diisi"); return; }
    if (!formData.body.trim())  { setError("Isi artikel wajib diisi"); return; }
    if (!formData.category)     { setError("Kategori wajib dipilih"); return; }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
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
          status:      newStatus,
          ...(newStatus === "revisi" && revisiNote ? { revisiNote } : {}),
        }),
      });

      const data = await res.json();
      if (res.status === 401) throw new Error("Sesi login telah berakhir, silakan login ulang");
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui artikel");

      setSuccess(data.message || "✅ Artikel berhasil diperbarui");
      setFormData((prev) => ({ ...prev, status: newStatus }));
      setTimeout(() => router.push("/articles"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────
  if (isFetching) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-100 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-100 rounded-xl h-28" />
            <div className="bg-zinc-100 rounded-xl h-80" />
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-100 rounded-xl h-52" />
            <div className="bg-zinc-100 rounded-xl h-24" />
          </div>
        </div>
      </div>
    );
  }

  const currentStatusCfg = statusConfig[formData.status] ?? statusConfig.draft;

  // Determine if article needs revision (reporter sees this)
  const isRevisi = formData.status === "revisi";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/articles"
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-black">Edit Artikel</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Perbarui konten artikel yang sudah ada</p>
        </div>
        {/* Current status badge */}
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${currentStatusCfg.bg} ${currentStatusCfg.color}`}>
          {currentStatusCfg.label}
        </span>
      </div>

      {/* Revisi banner for reporter */}
      {isReporter && isRevisi && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <p className="text-sm font-bold text-amber-800">Artikel Dikembalikan untuk Revisi</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Editor meminta Anda memperbaiki artikel ini. Setelah selesai, ajukan kembali ke Editor.
            </p>
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

        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-4">

          {/* Title */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <label className="block text-sm font-bold text-black mb-2">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="Judul artikel..."
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
            <div className="mt-4 mb-5 pb-5 border-b border-zinc-100">
              <label className="text-xs font-semibold text-zinc-700 mb-2 block">URL Gambar Detail</label>
              <input
                type="url" name="detailImage" value={formData.detailImage} onChange={handleChange}
                placeholder="https://example.com/foto.jpg"
                className="w-full px-3 py-2.5 text-sm text-black border-2 border-zinc-300 rounded-lg
                  placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-0 bg-white transition-colors"
              />
              {formData.detailImage && (
                <div className="mt-3 rounded-lg overflow-hidden border-2 border-zinc-200">
                  <img src={formData.detailImage} alt="Preview" className="w-full h-40 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-2 block">URL Video</label>
              <input
                type="url" name="detailVideo" value={formData.detailVideo} onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2.5 text-sm text-black border-2 border-zinc-300 rounded-lg
                  placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-0 bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-4">

          {/* ── EDITOR WORKFLOW PANEL ── */}
          {isEditor && (
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-blue-900">Panel Editor</h3>
              </div>
              <p className="text-xs text-blue-600 mb-4">
                Status saat ini:{" "}
                <span className={`font-bold px-1.5 py-0.5 rounded ${currentStatusCfg.bg} ${currentStatusCfg.color}`}>
                  {currentStatusCfg.label}
                </span>
              </p>

              {/* Workflow visual */}
              <div className="flex items-center gap-1 mb-5 flex-wrap">
                {["draft","review","revisi","siap_publish","publish"].map((s, i, arr) => {
                  const cfg = statusConfig[s];
                  const isActive = formData.status === s;
                  return (
                    <div key={s} className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all
                        ${isActive ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ring-current` : "bg-zinc-100 text-zinc-400"}`}>
                        {cfg.label}
                      </span>
                      {i < arr.length - 1 && <span className="text-zinc-300 text-[10px]">→</span>}
                    </div>
                  );
                })}
              </div>

              {/* Review actions: shown when article is in review */}
              {formData.status === "review" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-700 mb-2">Artikel menunggu keputusan Anda:</p>

                  {/* Approve */}
                  <button
                    type="button"
                    onClick={() => handleSubmit("siap_publish")}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-bold
                      hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>Memproses...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                      </svg>✅ Setujui — Layak Publish</>
                    )}
                  </button>

                  {/* Publish langsung */}
                  <button
                    type="button"
                    onClick={() => handleSubmit("publish")}
                    disabled={isLoading}
                    className="w-full bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-semibold
                      hover:bg-zinc-700 transition-colors disabled:opacity-50
                      flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                    </svg>
                    Publish Langsung
                  </button>

                  {/* Revisi section */}
                  <div className="pt-3 border-t border-zinc-100">
                    <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">
                      Catatan Revisi <span className="text-zinc-400 font-normal">(Opsional)</span>
                    </label>
                    <textarea
                      value={revisiNote}
                      onChange={(e) => setRevisiNote(e.target.value)}
                      placeholder="Tulis catatan untuk reporter, mis: Tolong perjelas paragraf kedua..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-xs text-black border-2 border-amber-200 rounded-lg
                        placeholder:text-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-0
                        bg-amber-50 resize-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleSubmit("revisi")}
                      disabled={isLoading}
                      className="w-full mt-2 border-2 border-amber-400 bg-amber-50 text-amber-800 py-2.5 rounded-lg
                        text-sm font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50
                        flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      ↩ Kembalikan untuk Revisi
                    </button>
                  </div>
                </div>
              )}

              {/* siap_publish → publish */}
              {formData.status === "siap_publish" && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-800">✅ Artikel telah disetujui</p>
                    <p className="text-xs text-green-600 mt-0.5">Siap untuk dipublish ke halaman berita.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSubmit("publish")}
                    disabled={isLoading}
                    className="w-full bg-zinc-900 text-white py-3 rounded-lg text-sm font-bold
                      hover:bg-zinc-700 transition-colors disabled:opacity-50
                      flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    Publish Sekarang
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit("revisi")}
                    disabled={isLoading}
                    className="w-full border-2 border-amber-300 text-amber-800 py-2.5 rounded-lg text-sm font-semibold
                      hover:bg-amber-50 transition-colors disabled:opacity-50"
                  >
                    ↩ Revisi Ulang
                  </button>
                </div>
              )}

              {/* Other statuses for editor: just show save buttons */}
              {!["review", "siap_publish"].includes(formData.status) && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSubmit("publish")}
                    disabled={isLoading}
                    className="w-full bg-zinc-900 text-white py-3 rounded-lg text-sm font-bold
                      hover:bg-zinc-700 transition-colors disabled:opacity-50
                      flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    Simpan & Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit("draft")}
                    disabled={isLoading}
                    className="w-full border-2 border-zinc-300 text-black py-2.5 rounded-lg text-sm font-semibold
                      hover:bg-zinc-50 transition-colors disabled:opacity-50"
                  >
                    Simpan sebagai Draft
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── REPORTER WORKFLOW PANEL ── */}
          {isReporter && (
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h3 className="text-sm font-bold text-black mb-1">Perbarui Artikel</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Status saat ini:{" "}
                <span className={`font-semibold px-1.5 py-0.5 rounded ${currentStatusCfg.bg} ${currentStatusCfg.color}`}>
                  {currentStatusCfg.label}
                </span>
              </p>
              <div className="space-y-3">
                {/* Reporter can re-submit if draft/revisi */}
                {["draft", "revisi"].includes(formData.status) && (
                  <button
                    type="button"
                    onClick={() => handleSubmit("review")}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold
                      hover:bg-blue-700 transition-colors disabled:opacity-50
                      flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Menyimpan..." : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>{formData.status === "revisi" ? "Ajukan Ulang ke Editor" : "Ajukan ke Editor"}</>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSubmit("draft")}
                  disabled={isLoading || formData.status === "review"}
                  className="w-full border-2 border-zinc-300 text-black py-3 rounded-lg text-sm font-semibold
                    hover:bg-zinc-50 hover:border-zinc-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formData.status === "review" ? "Sedang dalam Review Editor" : "Simpan sebagai Draft"}
                </button>
              </div>

              {formData.status === "review" && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800">🔍 Sedang direview oleh Editor</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Artikel Anda sedang diperiksa. Harap tunggu keputusan Editor.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Fallback untuk USER biasa ── */}
          {!isEditor && !isReporter && !userLoading && (
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h3 className="text-sm font-bold text-black mb-4">Perbarui Artikel</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSubmit("publish")}
                  disabled={isLoading}
                  className="w-full bg-zinc-900 text-white py-3 rounded-lg text-sm font-bold
                    hover:bg-zinc-700 transition-colors disabled:opacity-50
                    flex items-center justify-center gap-2"
                >
                  {isLoading ? "Menyimpan..." : "Simpan & Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit("draft")}
                  disabled={isLoading}
                  className="w-full border-2 border-zinc-300 text-black py-3 rounded-lg text-sm font-semibold
                    hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  Simpan sebagai Draft
                </button>
              </div>
            </div>
          )}

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

          {/* Image URL */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <label className="block text-sm font-bold text-black mb-2">
              URL Gambar <span className="text-zinc-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="url" name="image" value={formData.image} onChange={handleChange}
              placeholder="https://example.com/gambar.jpg"
              className="w-full px-3 py-3 text-sm text-black border-2 border-zinc-300 rounded-lg
                placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-0
                bg-white transition-colors"
            />
            {formData.image && (
              <div className="mt-3 rounded-lg overflow-hidden border-2 border-zinc-200">
                <img src={formData.image} alt="Preview thumbnail" className="w-full h-32 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}