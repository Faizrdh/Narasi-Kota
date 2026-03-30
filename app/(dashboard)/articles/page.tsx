"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Author { id: string; name: string; }
interface Article {
  id: string; title: string; category: string; status: string;
  views: number; author: Author; createdAt: string; publishedAt: string | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  publish:      { label: "Publish",     className: "bg-emerald-50 text-emerald-700" },
  draft:        { label: "Draft",       className: "bg-zinc-100 text-zinc-500" },
  review:       { label: "Review",      className: "bg-amber-50 text-amber-700" },
  scheduled:    { label: "Terjadwal",   className: "bg-purple-50 text-purple-700" },  // ← TAMBAH
  revisi:       { label: "Revisi",      className: "bg-orange-50 text-orange-700" },  // ← TAMBAH
  siap_publish: { label: "Layak Publish", className: "bg-blue-50 text-blue-700" },   // ← TAMBAH
};

const categoryColors: Record<string, string> = {
  Ekonomi: "bg-blue-50 text-blue-700", Teknologi: "bg-purple-50 text-purple-700",
  Politik: "bg-orange-50 text-orange-700", Keuangan: "bg-green-50 text-green-700",
  Bisnis: "bg-pink-50 text-pink-700",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filterStatus !== "all")   params.set("status", filterStatus);
      if (filterCategory !== "all") params.set("category", filterCategory);
      const res  = await fetch(`/api/articles?${params}`);
      const data = await res.json();
      if (data.success) { setArticles(data.data); setTotal(data.pagination.total); }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [filterStatus, filterCategory]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res  = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setArticles(p => p.filter(a => a.id !== id)); setTotal(p => p - 1); }
      else alert(data.message);
    } catch { alert("Gagal menghapus"); }
    finally { setDeletingId(null); }
  };

  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Manajemen Artikel</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{total} artikel di database</p>
        </div>
        <Link href="/articles/create"
          className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tulis Artikel
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul artikel..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white text-zinc-600">
          <option value="all">Semua Status</option>
          <option value="publish">Publish</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="scheduled">Terjadwal</option>  
          <option value="revisi">Revisi</option>  
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white text-zinc-600">
          <option value="all">Semua Kategori</option>
          {["Ekonomi","Teknologi","Politik","Keuangan","Bisnis"].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-zinc-400">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="text-sm">Memuat dari database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  {["JUDUL","KATEGORI","PENULIS","STATUS","VIEWS","TANGGAL","AKSI"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-zinc-400 px-4 py-3 first:px-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-sm text-zinc-400">
                    <p className="text-4xl mb-3">📰</p>
                    {search ? "Artikel tidak ditemukan." : "Belum ada artikel. Klik Tulis Artikel!"}
                  </td></tr>
                ) : filtered.map(article => {
                  const s  = statusConfig[article.status] ?? statusConfig.draft;
                  const cc = categoryColors[article.category] ?? "bg-zinc-100 text-zinc-600";
                  return (
                    <tr key={article.id} className={`hover:bg-zinc-50/50 transition-colors ${deletingId === article.id ? "opacity-40" : ""}`}>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm font-medium text-zinc-900 line-clamp-2">{article.title}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex text-xs px-2 py-1 rounded-md font-medium ${cc}`}>{article.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                            {article.author?.name?.charAt(0) ?? "?"}
                          </div>
                          <span className="text-sm text-zinc-500">{article.author?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex text-xs px-2 py-1 rounded-md font-medium ${s.className}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-4"><span className="text-sm text-zinc-400">{article.views > 0 ? article.views.toLocaleString() : "—"}</span></td>
                      <td className="px-4 py-4"><span className="text-sm text-zinc-400 whitespace-nowrap">{formatDate(article.publishedAt || article.createdAt)}</span></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/articles/${article.id}/edit`} className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">Edit</Link>
                          <button onClick={() => handleDelete(article.id, article.title)}
                            disabled={deletingId === article.id}
                            className="text-xs text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50">
                            {deletingId === article.id ? "..." : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100">
            <p className="text-xs text-zinc-400">Menampilkan {filtered.length} dari {total} artikel</p>
            <Link href="/" target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              Lihat halaman berita →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}