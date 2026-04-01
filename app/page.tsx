// app/page.tsx — Portal Berita NarasiKota — Fully Responsive (Mobile · Tablet · Desktop)
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────
interface Author {
  id: string; name: string; email: string; image: string | null;
}
interface Article {
  id: string; title: string; slug: string; body: string;
  excerpt: string | null; image: string | null; category: string;
  status: string; views: number; author: Author;
  publishedAt: string | null; createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────
function getArticleImage(article: Article) {
  return article.image || `https://picsum.photos/seed/${article.id}/800/500`;
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
function formatDateTime(dateStr: string) {
  const d    = new Date(dateStr);
  const date = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

function getOrCreateVisitorId(): string {
  const key = "nk_visitor_id";
  try {
    let id = localStorage.getItem(key);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
    return id;
  } catch { return crypto.randomUUID(); }
}

const categoryColor: Record<string, string> = {
  Ekonomi: "text-blue-600", Teknologi: "text-purple-600",
  Politik: "text-orange-600", Keuangan: "text-green-600", Bisnis: "text-pink-600",
};
void categoryColor;

const categories = [
  { name: "Beranda", icon: "🏠" }, { name: "Ekonomi", icon: "📊" },
  { name: "Politik", icon: "🏛️" }, { name: "Teknologi", icon: "💻" },
  { name: "Bisnis", icon: "💼" },  { name: "Keuangan", icon: "💰" },
];

// ── ImpressionWrapper ─────────────────────────────────────────
function ImpressionWrapper({ articleId, children }: { articleId: string; children: React.ReactNode }) {
  const ref     = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || tracked.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !tracked.current) {
        tracked.current = true;
        observer.disconnect();
        try {
          const visitorId = getOrCreateVisitorId();
          fetch("/api/articles/impression", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ articleId, visitorId }),
          }).catch(() => {});
        } catch { /* ignore */ }
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [articleId]);
  return <div ref={ref}>{children}</div>;
}

// ── HeroCarousel ──────────────────────────────────────────────
function HeroCarousel({ articles }: { articles: Article[] }) {
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setCurrent((c) => (c + 1) % articles.length), 5000);
  };

  useEffect(() => {
    if (!articles.length) return;
    resetTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [articles.length]); // eslint-disable-line

  if (!articles.length) return null;

  return (
    /* Mobile: 240px · Tablet (sm): 320px · Desktop (lg): 420px */
    <div className="relative w-full overflow-hidden rounded-xl shadow-lg h-[240px] sm:h-[320px] lg:h-[420px]">
      {articles.map((a, i) => (
        <Link key={a.id} href={`/berita/${a.slug}`}>
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            <Image src={getArticleImage(a)} alt={a.title} fill className="object-cover" priority={i === 0} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6 z-10">
              <span className="inline-block bg-red-700 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded mb-1.5 sm:mb-2 uppercase tracking-widest">
                {a.category}
              </span>
              <h2 className="text-white text-base sm:text-xl lg:text-2xl font-bold leading-snug line-clamp-2 mb-1.5 sm:mb-2 drop-shadow">
                {a.title}
              </h2>
              {/* Hide excerpt on mobile to save space */}
              <p className="hidden sm:block text-gray-300 text-xs sm:text-sm line-clamp-2 max-w-2xl">
                {a.excerpt || a.body}
              </p>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400 flex-wrap">
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

      {/* Prev / Next */}
      <button
        onClick={() => { setCurrent((c) => (c - 1 + articles.length) % articles.length); resetTimer(); }}
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center shadow transition text-sm sm:text-base"
        aria-label="Previous"
      >‹</button>
      <button
        onClick={() => { setCurrent((c) => (c + 1) % articles.length); resetTimer(); }}
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center shadow transition text-sm sm:text-base"
        aria-label="Next"
      >›</button>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 sm:right-6 z-20 flex gap-1.5">
        {articles.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); resetTimer(); }}
            className={`rounded-full transition-all duration-300 ${i === current ? "bg-red-600 w-4 sm:w-5 h-2" : "bg-white/60 w-2 h-2"}`} />
        ))}
      </div>
    </div>
  );
}

// ── KatadataNewsItem ──────────────────────────────────────────
function KatadataNewsItem({ article }: { article: Article }) {
  const dateStr = article.publishedAt ? formatDateTime(article.publishedAt) : formatDateTime(article.createdAt);
  return (
    <Link href={`/berita/${article.slug}`}>
      <article className="flex gap-3 sm:gap-4 py-3 sm:py-4 group hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-colors">
        <div className="relative w-20 h-16 sm:w-28 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={getArticleImage(article)} alt={article.title} fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-zinc-100 text-black border border-zinc-200 uppercase tracking-wide">
              {article.category}
            </span>
            <span className="text-gray-300 text-[10px]">•</span>
            <span className="text-[9px] sm:text-[11px] text-gray-400 truncate">{dateStr}</span>
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors mb-1">
            {article.title}
          </h3>
          <p className="hidden sm:block text-xs text-gray-500 leading-relaxed line-clamp-2">
            {article.excerpt || article.body}
          </p>
        </div>
      </article>
    </Link>
  );
}

// ── MobileTrendingBar — shown only on mobile below carousel ───
function MobileTrendingBar({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <div className="lg:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-red-700 text-white px-4 py-2.5 flex items-center justify-between">
        <h3 className="font-bold text-xs tracking-widest uppercase">🔥 Trending</h3>
        <Link href="#" className="text-red-200 text-[11px] hover:text-white font-medium">Lihat Semua →</Link>
      </div>
      <div className="divide-y divide-gray-50">
        {articles.slice(0, 3).map((article, idx) => (
          <Link key={article.id} href={`/berita/${article.slug}`} className="flex gap-3 p-3 hover:bg-gray-50 transition group">
            <span className="text-xl font-black text-red-100 w-6 shrink-0 leading-none mt-0.5">{idx + 1}</span>
            <div>
              <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-red-600 transition leading-snug">{article.title}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Fetchers ──────────────────────────────────────────────────
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
  const [articles, setArticles]         = useState<Article[]>([]);
  const [contributors, setContributors] = useState<(Author & { _count?: { articles: number } })[]>([]);
  const [activeCategory, setActiveCategory] = useState("Beranda");
  const [searchQuery, setSearchQuery]   = useState("");
  const [loading, setLoading]           = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);

  useEffect(() => {
    Promise.all([fetchArticles(), fetchContributors()]).then(([arts, contribs]) => {
      setArticles(arts);
      setContributors(contribs);
      setLoading(false);
    });
  }, []);

  const filteredArticles = articles.filter((a) => {
    const matchCat    = activeCategory === "Beranda" || a.category === activeCategory;
    const matchSearch = searchQuery === "" || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const carouselArticles = filteredArticles.slice(0, 5);
  const sideArticles     = filteredArticles.slice(0, 4);
  const latestArticles   = filteredArticles.slice(5);
  const trendingArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50 font-sans">

      {/* ══════════════════════════════════════════════════════
          HEADER
          Mobile  : Logo + Search icon + Hamburger
          Tablet  : Logo + Search bar + Hamburger
          Desktop : Logo + Search bar + Buttons
      ══════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">

          {/* Top row */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Logo */}
            <Link href="/" className="shrink-0">
              <Image
                src="/assets/NarasiKotaLogoBiru.webp" alt="NarasiKota"
                width={180} height={52}
                className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
                priority
              />
            </Link>

            {/* Search bar — hidden on mobile (shows via icon), visible md+ */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                <input
                  type="text" placeholder="Pencarian berita..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">

              {/* Search icon — mobile only */}
              <button
                onClick={() => setMobileSearchOpen((v) => !v)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                aria-label="Toggle search"
              >
                🔍
              </button>

              {/* CTA buttons — hidden on mobile, shown on md+ */}
              <Link href="/login"
                className="hidden sm:inline-flex px-4 py-1.5 border border-gray-200 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all duration-200">
                MASUK
              </Link>
              <Link href="/register"
                className="hidden sm:inline-flex px-4 py-1.5 bg-red-700 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md hover:bg-red-800 active:scale-95 transition-all duration-200">
                <span className="hidden md:inline">JOIN KONTRIBUTOR</span>
                <span className="md:hidden">JOIN</span>
              </Link>

              {/* Hamburger — mobile only for CTA links */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="sm:hidden flex flex-col gap-1 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                aria-label="Menu"
              >
                <span className="block w-5 h-0.5 bg-gray-600" />
                <span className="block w-5 h-0.5 bg-gray-600" />
                <span className="block w-5 h-0.5 bg-gray-600" />
              </button>
            </div>
          </div>

          {/* Mobile search bar — collapsible */}
          {mobileSearchOpen && (
            <div className="md:hidden mt-2 pb-1">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                <input
                  autoFocus
                  type="text" placeholder="Pencarian berita..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-2 pb-2 flex gap-2 border-t border-gray-100 pt-2">
              <Link href="/login"
                className="flex-1 text-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
                onClick={() => setMobileMenuOpen(false)}>
                MASUK
              </Link>
              <Link href="/register"
                className="flex-1 text-center px-4 py-2 bg-red-700 text-white rounded-lg font-semibold text-sm hover:bg-red-800 transition"
                onClick={() => setMobileMenuOpen(false)}>
                JOIN
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          CATEGORY NAV — scrollable on all screen sizes
      ══════════════════════════════════════════════════════ */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
                className={`px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px]
                  ${activeCategory === cat.name ? "border-red-700 text-red-700" : "border-transparent text-gray-600 hover:text-red-700"}`}>
                <span className="sm:hidden mr-1">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Quick Links Bar ───────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {["Breaking News", "Pasar Modal", "Emiten", "Analisis", "Opini", "Infografis", "Video"].map((item) => (
              <Link key={item} href="#"
                className="px-3 sm:px-5 py-2 text-[10px] sm:text-xs font-semibold text-gray-500 whitespace-nowrap hover:text-red-700 transition border-r border-gray-100">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-gray-400">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-700 rounded-full animate-spin mb-4" />
            <p className="text-sm">Memuat berita...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16 sm:py-24 text-gray-400">
            <p className="text-5xl sm:text-6xl mb-4">📰</p>
            <p className="text-lg sm:text-xl font-semibold">Belum ada artikel</p>
            <p className="text-sm mt-2">Tambahkan artikel melalui Dashboard CMS</p>
          </div>
        ) : (
          <>
            {/* ── Main Grid ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

              {/* ── LEFT COL (2/3 on desktop) ──────────────── */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">

                {/* Impression wrappers for carousel articles */}
                {carouselArticles.map((a) => (
                  <ImpressionWrapper key={a.id} articleId={a.id}>
                    <span className="hidden" />
                  </ImpressionWrapper>
                ))}

                {/* Hero Carousel */}
                <HeroCarousel articles={carouselArticles} />

                {/* Mobile Trending — visible only below lg */}
                <MobileTrendingBar articles={trendingArticles} />

                {/* Small featured grid
                    Mobile: 2 cols · Tablet: 2 cols · Desktop: 4 cols */}
                {sideArticles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    {sideArticles.map((article) => (
                      <ImpressionWrapper key={article.id} articleId={article.id}>
                        <Link href={`/berita/${article.slug}`}>
                          <article className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition h-full border border-gray-100">
                            <div className="relative h-20 sm:h-24 overflow-hidden">
                              <Image
                                src={getArticleImage(article)} alt={article.title} fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-2 sm:p-2.5">
                              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-zinc-100 text-black border border-zinc-200">
                                {article.category}
                              </span>
                              <h4 className="text-[11px] sm:text-xs font-semibold text-gray-800 mt-0.5 line-clamp-2 group-hover:text-red-600 transition leading-snug">
                                {article.title}
                              </h4>
                            </div>
                          </article>
                        </Link>
                      </ImpressionWrapper>
                    ))}
                  </div>
                )}

                {/* Berita Terbaru */}
                {latestArticles.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-1 h-4 sm:h-5 bg-red-700 rounded-full" />
                        <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">Berita Terbaru Lainnya</h2>
                      </div>
                      <Link href="#" className="text-xs font-semibold text-blue-600 hover:text-red-700 transition-colors flex items-center gap-1">
                        Indeks berita »
                      </Link>
                    </div>
                    <div className="px-3 sm:px-5 divide-y divide-gray-100">
                      {latestArticles.map((article) => (
                        <ImpressionWrapper key={article.id} articleId={article.id}>
                          <KatadataNewsItem article={article} />
                        </ImpressionWrapper>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT SIDEBAR (1/3 on desktop, hidden on mobile — trending shown inline) ── */}
              <div className="hidden lg:flex flex-col gap-5">

                {/* Trending */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-red-700 text-white px-4 py-3 flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-wide uppercase">Trending</h3>
                    <Link href="#" className="ml-auto text-red-200 text-xs hover:text-white font-medium">Lihat Semua →</Link>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {trendingArticles.map((article, idx) => (
                      <ImpressionWrapper key={article.id} articleId={article.id}>
                        <Link href={`/berita/${article.slug}`} className="flex gap-3 p-3 hover:bg-gray-50 transition group">
                          <span className="text-2xl font-black text-red-100 w-8 shrink-0 leading-none mt-0.5">{idx + 1}</span>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-red-600 transition leading-snug">
                              {article.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                            </p>
                          </div>
                        </Link>
                      </ImpressionWrapper>
                    ))}
                  </div>
                </div>

                {/* Contributors */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-800 text-white px-4 py-3 flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-wide uppercase">Kontributor</h3>
                    <Link href="/user" className="ml-auto text-gray-400 text-xs hover:text-white font-medium">Lihat Semua →</Link>
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

            {/* ── Mobile/Tablet: Contributors + Newsletter shown below main content ── */}
            <div className="lg:hidden mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Contributors */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-3 flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-wide uppercase">Kontributor</h3>
                  <Link href="/user" className="ml-auto text-gray-400 text-xs hover:text-white font-medium">Lihat Semua →</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {contributors.length > 0 ? contributors.slice(0, 4).map((user) => (
                    <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col justify-center">
                <h3 className="font-bold text-gray-900 mb-2">Newsletter</h3>
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
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          FOOTER
          Mobile  : single column stacked
          Tablet  : 2 columns
          Desktop : 5 columns
      ══════════════════════════════════════════════════════ */}
      <footer className="bg-[#f4f4f5] border-t border-gray-200 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">

            {/* Brand — full width on mobile */}
            <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1">
              <Link href="/" className="block mb-3">
                <Image
                  src="/assets/NarasiKotaLogoBiru.webp" alt="NarasiKota"
                  width={200} height={56}
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Portal berita terpercaya untuk informasi ekonomi, bisnis, dan keuangan Indonesia.
              </p>
              <p className="text-xs text-gray-400">part of <span className="font-bold text-gray-600">Narasi Kota Network</span></p>
              <div className="flex gap-2 mt-3">
                {["f", "𝕏", "in"].map((icon) => (
                  <a key={icon} href="#"
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-red-700 hover:text-white text-gray-600 flex items-center justify-center text-xs font-bold transition">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Kategori */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 text-sm">Kategori</h4>
              <ul className="space-y-2">
                {["Ekonomi", "Politik", "Teknologi", "Bisnis", "Keuangan", "Infografis"].map((item) => (
                  <li key={item}>
                    <Link href={`/?category=${item}`} className="text-xs text-gray-500 hover:text-red-700 transition">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Layanan */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 text-sm">Layanan</h4>
              <ul className="space-y-2">
                {["Newsletter", "RSS Feed", "Pengumuman", "Laporan", "Iklan", "Press Release"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-gray-500 hover:text-red-700 transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informasi */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 text-sm">Informasi</h4>
              <ul className="space-y-2">
                {["Tentang Kami", "Redaksi", "Pedoman Media Siber", "Karir", "Disclaimer", "Kebijakan Privasi"].map((item) => (
                  <li key={item}>
                    <a href="/tentang-kami" className="text-xs text-gray-500 hover:text-red-700 transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 sm:mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">© 2026 NarasiKota. All rights reserved.</p>
            <p className="text-xs text-gray-400 text-center sm:text-right">Konten bersifat informatif, untuk kepentingan informasi.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}