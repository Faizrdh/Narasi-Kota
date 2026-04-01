"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// ── Category Badge — hitam polos ──────────────────────────────
function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-black border border-zinc-200">
      {category.name}
    </span>
  );
}

// ── Modal Form ────────────────────────────────────────────────
function CategoryModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: Category;
  onClose: () => void;
  onSaved: (cat: Category) => void;
}) {
  const [name,        setName]        = useState(initial?.name        ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Nama kategori wajib diisi"); return; }

    setLoading(true);
    try {
      const url    = mode === "edit" ? `/api/categories/${initial!.id}` : "/api/categories";
      const method = mode === "edit" ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, color: "zinc" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Terjadi kesalahan");
      onSaved(data.category);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h2 className="text-base font-bold text-black">
            {mode === "create" ? "Tambah Kategori Baru" : "Edit Kategori"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Nama */}
          <div>
            <label className="block text-sm font-semibold text-black mb-1.5">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Contoh: Ekonomi, Politik, Teknologi..."
              className="w-full px-3 py-2.5 text-sm text-black border-2 border-zinc-300 rounded-lg
                placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 bg-white transition-colors"
            />
            {name && (
              <p className="text-xs text-zinc-400 mt-1">
                Slug: <span className="font-mono text-zinc-600">
                  {name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")}
                </span>
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-black mb-1.5">
              Deskripsi <span className="text-zinc-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat kategori ini..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm text-black border-2 border-zinc-300 rounded-lg
                placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 bg-white
                resize-none transition-colors"
            />
          </div>

          {/* Preview badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Preview badge:</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-black border border-zinc-200">
              {name || "Nama Kategori"}
            </span>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border-2 border-zinc-300 rounded-lg text-sm font-semibold text-black
                hover:bg-zinc-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-bold
                hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Menyimpan...
                </>
              ) : mode === "create" ? "Tambah Kategori" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteModal({
  category,
  onClose,
  onDeleted,
}: {
  category: Category;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus");
      onDeleted(category.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-center text-black mb-1">Hapus Kategori?</h3>
        <p className="text-sm text-zinc-500 text-center mb-1">
          Kategori <strong className="text-black">{category.name}</strong> akan dihapus permanen.
        </p>
        <p className="text-xs text-zinc-400 text-center mb-5">
          Artikel yang sudah menggunakan kategori ini tidak terpengaruh.
        </p>

        {error && (
          <p className="mb-3 text-xs text-red-600 text-center font-medium">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-zinc-300 rounded-lg text-sm font-semibold
              text-black hover:bg-zinc-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold
              hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Menghapus...
              </>
            ) : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [modal,        setModal]        = useState<"create" | "edit" | null>(null);
  const [editTarget,   setEditTarget]   = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [toast,        setToast]        = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/categories", { credentials: "include" });
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      showToast("Gagal memuat data kategori", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleSaved = (cat: Category) => {
    if (modal === "create") {
      setCategories((prev) => [cat, ...prev]);
      showToast(`Kategori "${cat.name}" berhasil ditambahkan`, "success");
    } else {
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
      showToast(`Kategori "${cat.name}" berhasil diperbarui`, "success");
    }
    setModal(null);
    setEditTarget(null);
  };

  const handleDeleted = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
    showToast(`Kategori "${cat?.name}" berhasil dihapus`, "success");
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setModal("edit");
  };

  // ── Filter ─────────────────────────────────────────────────
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* Modals */}
      {(modal === "create" || modal === "edit") && (
        <CategoryModal
          mode={modal}
          initial={modal === "edit" ? editTarget ?? undefined : undefined}
          onClose={() => { setModal(null); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
          ${toast.type === "success"
            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
            : "bg-red-50 border border-red-200 text-red-800"
          }`}>
          {toast.type === "success" ? (
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-black">Kategori</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Kelola tag kategori berita yang tampil di artikel
            </p>
          </div>
          <button
            onClick={() => setModal("create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg
              text-sm font-bold hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kategori
          </button>
        </div>

        {/* ── Stats Row ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Kategori", value: categories.length,      icon: "🏷️" },
            { label: "Terbaru",        value: categories[0]?.name ?? "—", icon: "✨", small: true },
            { label: "Terakhir Diubah",
              value: categories[0]
                ? new Date(categories[0].updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                : "—",
              icon: "🕒", small: true,
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-zinc-200 p-4">
              <div className="text-xl mb-1">{stat.icon}</div>
              <p className={`font-bold text-black truncate ${stat.small ? "text-base" : "text-2xl"}`}>
                {stat.value}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search & List ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-zinc-200">

          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-zinc-100">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg
                  focus:outline-none focus:border-zinc-400 bg-zinc-50 text-black placeholder:text-zinc-400"
              />
            </div>
            <span className="text-xs text-zinc-400 font-medium ml-auto">
              {filtered.length} kategori
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="py-16 flex flex-col items-center gap-3 text-zinc-400">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-sm">Memuat kategori...</span>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-2xl">
                🏷️
              </div>
              <p className="text-sm font-semibold text-black">
                {search ? "Kategori tidak ditemukan" : "Belum ada kategori"}
              </p>
              <p className="text-xs text-zinc-400 text-center max-w-xs">
                {search
                  ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.`
                  : "Mulai tambahkan kategori untuk mengorganisir artikel berita Anda."}
              </p>
              {!search && (
                <button
                  onClick={() => setModal("create")}
                  className="mt-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-700 transition-colors"
                >
                  + Tambah Kategori Pertama
                </button>
              )}
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Kategori</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Slug</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden md:table-cell">Deskripsi</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden lg:table-cell">Dibuat</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filtered.map((cat) => (
                    <tr key={cat.id} className="hover:bg-zinc-50 transition-colors group">
                      {/* Badge — hitam polos */}
                      <td className="px-5 py-4">
                        <CategoryBadge category={cat} />
                      </td>
                      {/* Slug */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                          {cat.slug}
                        </span>
                      </td>
                      {/* Desc */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-zinc-500 text-xs line-clamp-1">
                          {cat.description || <span className="italic text-zinc-300">—</span>}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs text-zinc-400">
                          {new Date(cat.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                            title="Edit kategori"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                            title="Hapus kategori"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}