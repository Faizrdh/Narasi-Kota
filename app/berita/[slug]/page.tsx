// app/berita/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PageViewTracker from "./_components/PageViewTracker";

const categoryColor: Record<string, string> = {
  Ekonomi:   "bg-blue-100 text-blue-700",
  Teknologi: "bg-purple-100 text-purple-700",
  Politik:   "bg-orange-100 text-orange-700",
  Keuangan:  "bg-green-100 text-green-700",
  Bisnis:    "bg-pink-100 text-pink-700",
};

const categoryColorText: Record<string, string> = {
  Ekonomi:   "text-blue-600",
  Teknologi: "text-purple-600",
  Politik:   "text-orange-600",
  Keuangan:  "text-green-600",
  Bisnis:    "text-pink-600",
};

const categories = [
  { name: "Beranda",   icon: "🏠" },
  { name: "Ekonomi",   icon: "📊" },
  { name: "Politik",   icon: "🏛️" },
  { name: "Teknologi", icon: "💻" },
  { name: "Bisnis",    icon: "💼" },
  { name: "Keuangan",  icon: "💰" },
];

function formatDate(dateStr: string | Date) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateShort(dateStr: string | Date) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── VideoEmbed: YouTube / Vimeo / mp4 ────────────────────────
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
      <p className="text-sm text-gray-500 text-center py-4">
        Browser Anda tidak mendukung pemutar video.{" "}
        <a href={url} className="text-blue-600 underline">Unduh video</a>
      </p>
    </video>
  );
}

// ── Render body dengan media disisipkan di TENGAH ─────────────
function ArticleBody({
  body,
  detailImage,
  detailVideo,
  title,
}: {
  body: string;
  detailImage: string | null;
  detailVideo: string | null;
  title: string;
}) {
  const paragraphs = body.split("\n").filter(Boolean);
  const insertAfter = Math.min(3, Math.floor(paragraphs.length / 2));
  const beforeMedia = paragraphs.slice(0, insertAfter);
  const afterMedia  = paragraphs.slice(insertAfter);

  return (
    <div>
      {beforeMedia.map((p, i) => (
        <p key={`before-${i}`} className="text-gray-700 text-lg leading-relaxed mb-5">
          {p}
        </p>
      ))}

      {detailImage && (
        <figure className="my-8">
          <div className="relative w-full rounded-xl overflow-hidden shadow-md border border-gray-100">
            <img
              src={detailImage}
              alt={`Ilustrasi: ${title}`}
              className="w-full object-cover max-h-[500px]"
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
        <p key={`after-${i}`} className="text-gray-700 text-lg leading-relaxed mb-5">
          {p}
        </p>
      ))}
    </div>
  );
}

// ── Metadata ──────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "publish" },
  });
  if (!article) return { title: "Artikel Tidak Ditemukan" };
  return {
    title: `${article.title} | Berita Indonesia`,
    description: article.excerpt || article.body.slice(0, 160),
  };
}

// ── Main Page ─────────────────────────────────────────────────
export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findFirst({
    where: { slug, status: "publish" },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  if (!article) notFound();

  // Increment views (Total Views All Time)
  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  // Artikel terkait
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: "publish",
      category: article.category,
      NOT: { id: article.id },
    },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const publishDate  = article.publishedAt || article.createdAt;
  const articleImage = article.image || `https://picsum.photos/seed/${article.id}/1200/600`;
  const baseUrl      = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── TRACKING ── */}
      <PageViewTracker articleId={article.id} />

      {/* ══════════════════════════════════════════════════════
          HEADER — sama persis dengan page.tsx (main page)
      ══════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">

          {/* Logo */}
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

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Pencarian berita..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-gray-50 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Auth */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all duration-200"
            >
              MASUK
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-red-700 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md hover:bg-red-800 active:scale-95 transition-all duration-200"
            >
              DAFTAR
            </Link>
          </div>
        </div>
      </header>

      {/* ── Category Nav — sama dengan page.tsx ─────────────── */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.name === "Beranda" ? "/" : `/?category=${cat.name}`}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px]
                  ${article.category === cat.name
                    ? "border-red-700 text-red-700"
                    : "border-transparent text-gray-600 hover:text-red-700"
                  }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Quick Links Bar — sama dengan page.tsx ──────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {["Breaking News", "Pasar Modal", "Emiten", "Analisis", "Opini", "Infografis", "Video"].map((item) => (
              <Link
                key={item}
                href="#"
                className="px-5 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap hover:text-red-700 transition border-r border-gray-100"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-red-600 transition">Beranda</Link>
          <span>›</span>
          <Link href={`/?category=${article.category}`} className="hover:text-red-600 transition">
            {article.category}
          </Link>
          <span>›</span>
          <span className="text-gray-700 line-clamp-1 max-w-xs">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Konten Artikel ─────────────────────────────── */}
          <article className="lg:col-span-2">

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${categoryColor[article.category] ?? "bg-gray-100 text-gray-700"}`}>
                {article.category}
              </span>
              <span className="text-gray-400 text-sm">{formatDate(publishDate)}</span>
              <span className="text-gray-400 text-sm">
                👁️ {(article.views + 1).toLocaleString("id-ID")} views
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-5">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-gray-500 leading-relaxed mb-6 border-l-4 border-red-600 pl-4 italic">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {article.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{article.author.name}</p>
                  <p className="text-xs text-gray-400">Penulis • {formatDateShort(publishDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 hidden sm:block">Bagikan:</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${baseUrl}/berita/${article.slug}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-blue-600"
                  title="Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                  </svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${baseUrl}/berita/${article.slug}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 transition text-sky-500"
                  title="X / Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(article.title + " " + `${baseUrl}/berita/${article.slug}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-green-50 hover:bg-green-100 transition text-green-600"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="relative w-full h-80 lg:h-[450px] rounded-xl overflow-hidden mb-8 shadow-lg">
              <Image
                src={articleImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
              <ArticleBody
                body={article.body}
                detailImage={article.detailImage ?? null}
                detailVideo={article.detailVideo ?? null}
                title={article.title}
              />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <span className="text-sm font-semibold text-gray-600">Tag:</span>
              <Link
                href={`/?category=${article.category}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${categoryColor[article.category] ?? "bg-gray-100 text-gray-700"} hover:opacity-80 transition`}
              >
                #{article.category}
              </Link>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-red-600 hover:text-red-600 transition"
              >
                ← Kembali ke Beranda
              </Link>
              <Link
                href={`/?category=${article.category}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition"
              >
                Lihat Lebih Banyak {article.category} →
              </Link>
            </div>
          </article>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="lg:col-span-1 space-y-6">

            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-600 rounded" />
                  Berita Terkait
                </h3>
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <Link key={related.id} href={`/berita/${related.slug}`} className="block group">
                      <div className="flex gap-3">
                        <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={related.image || `https://picsum.photos/seed/${related.id}/200/150`}
                            alt={related.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition leading-snug">
                            {related.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDateShort(related.publishedAt || related.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Info Artikel (tanpa baris Media) ─────────── */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-600 rounded" />
                Info Artikel
              </h3>
              <div className="space-y-0 text-sm divide-y divide-gray-100">
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Penulis</span>
                  <span className="font-semibold text-gray-900">{article.author.name}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Kategori</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${categoryColor[article.category] ?? "bg-gray-100 text-gray-700"}`}>
                    {article.category}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Publish</span>
                  <span className="font-medium text-gray-700">{formatDateShort(publishDate)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Views</span>
                  <span className="font-semibold text-gray-900">
                    👁️ {(article.views + 1).toLocaleString("id-ID")}
                  </span>
                </div>
                {/* Baris Media dihapus */}
              </div>
            </div>

            {/* Newsletter card dihapus */}

          </aside>
        </div>
      </div>

      <footer className="bg-gray-900 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© 2026 NarasiKota. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}