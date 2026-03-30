// app/page.tsx — Portal Berita NarasiKota — IDX-inspired layout
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────
interface Author {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  image: string | null;
  category: string;
  status: string;
  views: number;
  author: Author;
  publishedAt: string | null;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────
function getArticleImage(article: Article) {
  return article.image || `https://picsum.photos/seed/${article.id}/800/500`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date}, ${time}`;
}

const categoryColor: Record<string, string> = {
  Ekonomi: "text-blue-600",
  Teknologi: "text-purple-600",
  Politik: "text-orange-600",
  Keuangan: "text-green-600",
  Bisnis: "text-pink-600",
};

const categories = [
  { name: "Beranda", icon: "🏠" },
  { name: "Ekonomi", icon: "📊" },
  { name: "Politik", icon: "🏛️" },
  { name: "Teknologi", icon: "💻" },
  { name: "Bisnis", icon: "💼" },
  { name: "Keuangan", icon: "💰" },
];

// ── LiveClock ─────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return (
    <span className="text-sm text-gray-500 font-medium tracking-wide">
      {dateStr}&nbsp;|&nbsp;<span className="text-gray-500 font-medium">{timeStr} WIB</span>
    </span>
  );
}

// ── Carousel ──────────────────────────────────────────────────
function HeroCarousel({ articles }: { articles: Article[] }) {
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setCurrent((c) => (c + 1) % articles.length), 5000);
  };

  useEffect(() => {
    if (!articles.length) return;
    resetTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [articles.length]);

  if (!articles.length) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-lg" style={{ height: 420 }}>
      {articles.map((a, i) => (
        <Link key={a.id} href={`/berita/${a.slug}`}>
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            <Image
              src={getArticleImage(a)}
              alt={a.title}
              fill
              className="object-cover"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <span className="inline-block bg-red-700 text-white text-xs font-bold px-3 py-1 rounded mb-2 uppercase tracking-widest">
                {a.category}
              </span>
              <h2 className="text-white text-2xl font-bold leading-snug line-clamp-2 mb-2 drop-shadow">
                {a.title}
              </h2>
              <p className="text-gray-300 text-sm line-clamp-2 max-w-2xl">
                {a.excerpt || a.body}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span>{a.author.name}</span>
                <span>•</span>
                <span>{a.publishedAt ? formatDate(a.publishedAt) : formatDate(a.createdAt)}</span>
                <span>•</span>
                <span>👁 {a.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}

      <button
        onClick={() => { setCurrent((c) => (c - 1 + articles.length) % articles.length); resetTimer(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow transition"
        aria-label="Previous"
      >‹</button>
      <button
        onClick={() => { setCurrent((c) => (c + 1) % articles.length); resetTimer(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow transition"
        aria-label="Next"
      >›</button>

      <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
        {articles.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            className={`rounded-full transition-all duration-300 ${i === current ? "bg-red-600 w-5 h-2" : "bg-white/60 w-2 h-2"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── KatadataNewsItem — horizontal list style ──────────────────
function KatadataNewsItem({ article, showDivider }: { article: Article; showDivider: boolean }) {
  const dateStr = article.publishedAt
    ? formatDateTime(article.publishedAt)
    : formatDateTime(article.createdAt);

  const colorClass = categoryColor[article.category] ?? "text-gray-500";

  return (
    <>
      <Link href={`/berita/${article.slug}`}>
        <article className="flex gap-4 py-4 group hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-colors">
          {/* Thumbnail */}
          <div className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={getArticleImage(article)}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category + date */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${colorClass}`}>
                {article.category}
              </span>
              <span className="text-gray-300 text-[11px]">•</span>
              <span className="text-[11px] text-gray-400">{dateStr}</span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors mb-1.5">
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
              {article.excerpt || article.body}
            </p>
          </div>
        </article>
      </Link>
      {showDivider && <div className="border-b border-gray-100" />}
    </>
  );
}

// ── Fetchers (client-side) ────────────────────────────────────
async function fetchArticles(): Promise<Article[]> {
  try {
    const res = await fetch("/api/articles?status=publish&limit=20", { next: { revalidate: 30 } } as RequestInit);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

async function fetchContributors() {
  try {
    const res = await fetch("/api/users?limit=5", { next: { revalidate: 60 } } as RequestInit);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [contributors, setContributors] = useState<(Author & { _count?: { articles: number } })[]>([]);
  const [activeCategory, setActiveCategory] = useState("Beranda");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchArticles(), fetchContributors()]).then(([arts, contribs]) => {
      setArticles(arts);
      setContributors(contribs);
      setLoading(false);
    });
  }, []);

  const filteredArticles = articles.filter((a) => {
    const matchCat = activeCategory === "Beranda" || a.category === activeCategory;
    const matchSearch = searchQuery === "" || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const carouselArticles  = filteredArticles.slice(0, 5);
  const sideArticles      = filteredArticles.slice(0, 4);
  // All articles after index 4 go into the Katadata-style list (directly below carousel)
  const latestArticles    = filteredArticles.slice(5);
  const trendingArticles  = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50 font-sans">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link href="/" className="shrink-0">
            <Image
              src="/assets/NarasiKotaLogoBiru.webp"
              alt="NarasiKota"
              width={220}
              height={64}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Pencarian berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-gray-50 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 shrink-0">
            <Link href="/login"
              className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all duration-200">
              MASUK
            </Link>
            <Link href="/register"
              className="px-5 py-2 bg-red-700 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md hover:bg-red-800 active:scale-95 transition-all duration-200">
              JOIN KONTRIBUTOR
            </Link>
          </div>
        </div>
      </header>

      {/* ── Category Nav ───────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px]
                  ${activeCategory === cat.name
                    ? "border-red-700 text-red-700"
                    : "border-transparent text-gray-600 hover:text-red-700"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Quick Links Bar ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {["Breaking News", "Pasar Modal", "Emiten", "Analisis", "Opini", "Infografis", "Video"].map((item) => (
              <Link key={item} href="#"
                className="px-5 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap hover:text-red-700 transition border-r border-gray-100">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-700 rounded-full animate-spin mb-4" />
            <p className="text-sm">Memuat berita...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-6xl mb-4">📰</p>
            <p className="text-xl font-semibold">Belum ada artikel</p>
            <p className="text-sm mt-2">Tambahkan artikel melalui Dashboard CMS</p>
          </div>
        ) : (
          <>
            {/* ── Main 3-column grid ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── LEFT: Carousel + mini row + Berita Terkini ── */}
              <div className="lg:col-span-2 space-y-0">

                {/* Hero Carousel */}
                <HeroCarousel articles={carouselArticles} />

                {/* Small featured row — flush below carousel */}
                {sideArticles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {sideArticles.map((article) => (
                      <Link key={article.id} href={`/berita/${article.slug}`}>
                        <article className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition h-full border border-gray-100">
                          <div className="relative h-24 overflow-hidden">
                            <Image
                              src={getArticleImage(article)}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-2.5">
                            <span className={`text-[10px] font-bold ${categoryColor[article.category] ?? "text-gray-600"}`}>
                              {article.category}
                            </span>
                            <h4 className="text-xs font-semibold text-gray-800 mt-0.5 line-clamp-2 group-hover:text-red-600 transition leading-snug">
                              {article.title}
                            </h4>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}

                {/* ── BERITA TERKINI — Katadata style, no gap ── */}
                {latestArticles.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
                    {/* Section header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-1 h-5 bg-red-700 rounded-full" />
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Berita Terbaru Lainnya
                        </h2>
                      </div>
                      <Link
                        href="#"
                        className="text-xs font-semibold text-blue-600 hover:text-red-700 transition-colors flex items-center gap-1"
                      >
                        Indeks berita »
                      </Link>
                    </div>

                    {/* Katadata-style list */}
                    <div className="px-5 divide-y divide-gray-100">
                      {latestArticles.map((article, idx) => (
                        <KatadataNewsItem
                          key={article.id}
                          article={article}
                          showDivider={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT Sidebar ──────────────────────────── */}
              <div className="space-y-5">

                {/* Trending */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-red-700 text-white px-4 py-3 flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-wide uppercase">Trending</h3>
                    <Link href="#" className="ml-auto text-red-200 text-xs hover:text-white font-medium">
                      Lihat Semua →
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {trendingArticles.map((article, idx) => (
                      <Link key={article.id} href={`/berita/${article.slug}`}
                        className="flex gap-3 p-3 hover:bg-gray-50 transition group">
                        <span className="text-2xl font-black text-red-100 w-8 shrink-0 leading-none mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-red-600 transition leading-snug">
                            {article.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Contributors */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-800 text-white px-4 py-3 flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-wide uppercase">Kontributor</h3>
                    <Link href="/user" className="ml-auto text-gray-400 text-xs hover:text-white font-medium">
                      Lihat Semua →
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {contributors.length > 0 ? contributors.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                        <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                          <p className="text-[11px] text-gray-400">📝 {user._count?.articles ?? 0} artikel</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-400 text-center py-6">Belum ada kontributor</p>
                    )}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-gray-900">Newsletter</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    Dapatkan berita terkini langsung ke email Anda setiap hari
                  </p>
                  <input type="email" placeholder="Masukkan email Anda"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm mb-2.5 focus:outline-none focus:border-red-400 placeholder-gray-400" />
                  <button className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 rounded-lg text-sm transition">
                    Berlangganan Gratis
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-[#f4f4f5] border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="block mb-4">
                <Image
                  src="/assets/NarasiKotaLogoBiru.webp"
                  alt="NarasiKota"
                  width={260}
                  height={60}
                  className="h-18 w-auto object-contain"
                />
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Portal berita terpercaya untuk informasi ekonomi, bisnis, dan keuangan Indonesia.
              </p>
              <p className="text-xs text-gray-400">part of <span className="font-bold text-gray-600">Narasi Kota Network</span></p>
              <div className="flex gap-2 mt-4">
                {["f", "𝕏", "in"].map((icon) => (
                  <a key={icon} href="#"
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-red-700 hover:text-white text-gray-600 flex items-center justify-center text-xs font-bold transition">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm">Kategori</h4>
              <ul className="space-y-2">
                {["Ekonomi", "Politik", "Teknologi", "Bisnis", "Keuangan", "Infografis"].map((item) => (
                  <li key={item}>
                    <Link href={`/?category=${item}`} className="text-xs text-gray-500 hover:text-red-700 transition">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm">Layanan</h4>
              <ul className="space-y-2">
                {["Newsletter", "RSS Feed", "Pengumuman", "Laporan", "Iklan", "Press Release"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-gray-500 hover:text-red-700 transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm">Informasi</h4>
              <ul className="space-y-2">
                {["Tentang Kami", "Redaksi", "Pedoman Media Siber", "Karir", "Disclaimer", "Kebijakan Privasi"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-gray-500 hover:text-red-700 transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm">Jaringan Media</h4>
              <ul className="space-y-2">
                {["CNN Indonesia", "CNBC Indonesia", "Detik Network", "Kompas", "Tempo", "Bisnis.com"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-gray-500 hover:text-red-700 transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">© 2026 NarasiKota. All rights reserved.</p>
            <p className="text-xs text-gray-400">
              Konten bersifat informatif, untuk kepentingan informasi.
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}