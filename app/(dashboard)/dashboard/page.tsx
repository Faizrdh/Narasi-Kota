"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────
interface DashboardStats {
  totalArticles: number;
  publishedToday: number;
  publishedYesterdayDiff: number;
  totalCategories: number;
  totalContributors: number;
}

interface CategoryItem {
  name: string;
  count: number;
}

interface RecentArticle {
  id: string;
  title: string;
  category: string;
  status: string;
  author: string;
  date: string;
}

interface DashboardData {
  stats: DashboardStats;
  categoryDistribution: CategoryItem[];
  recentArticles: RecentArticle[];
}

// ── Helpers ───────────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  Ekonomi:   "bg-blue-50 text-blue-700",
  Teknologi: "bg-purple-50 text-purple-700",
  Politik:   "bg-orange-50 text-orange-700",
  Keuangan:  "bg-green-50 text-green-700",
  Bisnis:    "bg-pink-50 text-pink-700",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  publish: { label: "Publish",  className: "bg-emerald-50 text-emerald-700" },
  draft:   { label: "Draft",    className: "bg-zinc-100 text-zinc-500" },
  review:  { label: "Review",   className: "bg-amber-50 text-amber-700" },
};

// ── Skeleton ──────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 animate-pulse">
      <div className="w-9 h-9 bg-zinc-100 rounded-lg mb-4" />
      <div className="h-7 w-16 bg-zinc-200 rounded mb-2" />
      <div className="h-4 w-24 bg-zinc-100 rounded mb-2" />
      <div className="h-3 w-20 bg-zinc-100 rounded" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { credentials: "include" });
      if (!res.ok) throw new Error("Gagal mengambil data");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ── Susun stats dari data real ────────────────────────────
  const stats = data
    ? [
        {
          label:    "Total Artikel",
          value:    data.stats.totalArticles.toLocaleString("id-ID"),
          change:   `${data.stats.totalArticles} artikel publish`,
          positive: true,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          ),
        },
        {
          label:    "Publish Hari Ini",
          value:    data.stats.publishedToday.toLocaleString("id-ID"),
          change:
            data.stats.publishedYesterdayDiff === 0
              ? "Sama seperti kemarin"
              : data.stats.publishedYesterdayDiff > 0
              ? `+${data.stats.publishedYesterdayDiff} dari kemarin`
              : `${data.stats.publishedYesterdayDiff} dari kemarin`,
          positive: data.stats.publishedYesterdayDiff >= 0,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        },
        {
          label:    "Total Kategori",
          value:    data.stats.totalCategories.toLocaleString("id-ID"),
          change:   `${data.stats.totalCategories} kategori aktif`,
          positive: true,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          ),
        },
        {
          label:    "Total Kontributor",
          value:    data.stats.totalContributors.toLocaleString("id-ID"),
          change:   `${data.stats.totalContributors} kontributor aktif`,
          positive: true,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ]
    : [];

  // Hitung persentase distribusi kategori untuk progress bar
  const totalCatArticles = data?.categoryDistribution.reduce((s, c) => s + c.count, 0) ?? 1;

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Selamat datang kembali di NarasiKota 👋
          </p>
        </div>
        <Link
          href="/articles/create"
          className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tulis Artikel
        </Link>
      </div>

      {/* ── Stats Grid ────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error} —{" "}
          <button onClick={fetchDashboard} className="underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              <p className="text-sm text-zinc-500 mt-0.5">{stat.label}</p>
              <p className={`text-xs mt-2 ${stat.positive ? "text-emerald-600" : "text-red-500"}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent Articles ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">Artikel Terbaru</h2>
          <Link href="/articles" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
            Lihat semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-zinc-50 rounded-lg" />
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-xs font-medium text-zinc-400 px-6 py-3">JUDUL</th>
                  <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">KATEGORI</th>
                  <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">PENULIS</th>
                  <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">STATUS</th>
                  <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">TANGGAL</th>
                  <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {(data?.recentArticles ?? []).map((article) => {
                  const status   = statusConfig[article.status] ?? { label: article.status, className: "bg-zinc-100 text-zinc-500" };
                  const catColor = categoryColors[article.category] ?? "bg-zinc-100 text-zinc-600";
                  return (
                    <tr key={article.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-zinc-900 line-clamp-1 max-w-xs">
                          {article.title}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex text-xs px-2 py-1 rounded-md font-medium ${catColor}`}>
                          {article.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-zinc-500">{article.author}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex text-xs px-2 py-1 rounded-md font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-zinc-400">{article.date}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/articles/${article.id}/edit`}
                            className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                          >
                            Edit
                          </Link>
                          <span className="text-zinc-200">|</span>
                          <button className="text-xs text-zinc-400 hover:text-red-600 transition-colors">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && data?.recentArticles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-400">
                      Belum ada artikel
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Bottom Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/articles/create", label: "Tulis Artikel Baru", icon: "✏️" },
              { href: "/categories",      label: "Kelola Kategori",    icon: "🏷️" },
              { href: "/users",           label: "Tambah Penulis",     icon: "👤" },
              { href: "/articles",        label: "Artikel Draft",      icon: "📋" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 p-3 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-sm text-zinc-600"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Distribusi Kategori — data real */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Distribusi Artikel per Kategori</h2>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <div className="h-3 w-20 bg-zinc-100 rounded" />
                    <div className="h-3 w-12 bg-zinc-100 rounded" />
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.categoryDistribution ?? []).map((cat) => {
                const pct = Math.round((cat.count / totalCatArticles) * 100);
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-600">{cat.name}</span>
                      <span className="text-zinc-400">{cat.count} artikel</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {!loading && data?.categoryDistribution.length === 0 && (
                <p className="text-xs text-zinc-400 text-center py-4">
                  Belum ada artikel yang dipublish
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}