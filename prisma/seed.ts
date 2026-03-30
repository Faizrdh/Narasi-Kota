// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. Users ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@narasikota.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@narasikota.id",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@narasikota.id" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "editor@narasikota.id",
      password: hashedPassword,
      role: "EDITOR",
      isActive: true,
    },
  });

  const reporter1 = await prisma.user.upsert({
    where: { email: "reporter1@narasikota.id" },
    update: {},
    create: {
      name: "Siti Rahayu",
      email: "reporter1@narasikota.id",
      password: hashedPassword,
      role: "REPORTER",
      isActive: true,
    },
  });

  const reporter2 = await prisma.user.upsert({
    where: { email: "reporter2@narasikota.id" },
    update: {},
    create: {
      name: "Ahmad Fauzi",
      email: "reporter2@narasikota.id",
      password: hashedPassword,
      role: "REPORTER",
      isActive: true,
    },
  });

  console.log("✅ Users created");

  // ── 2. Articles ───────────────────────────────────────────
  const articlesData = [
    {
      title: "Ledakan AI 2026: Teknologi Agentic dan Inovasi Game Jadi Sorotan Dunia Digital",
      slug: "ledakan-ai-2026-teknologi-agentic",
      category: "Teknologi",
      authorId: reporter1.id,
      views: 1240,
      daysAgo: 2,
    },
    {
      title: "Bisnis di Era Digital 2026: Bertahan Saja Tidak Cukup, Anda Harus Berani Beradaptasi",
      slug: "bisnis-era-digital-2026-adaptasi",
      category: "Ekonomi",
      authorId: reporter1.id,
      views: 980,
      daysAgo: 3,
    },
    {
      title: "Harga Komoditas Melejit 2026, Sektor Tambang Diprediksi Jadi Mesin Cuan Baru Dunia",
      slug: "harga-komoditas-melejit-2026-sektor-tambang",
      category: "Bisnis",
      authorId: reporter2.id,
      views: 856,
      daysAgo: 5,
    },
    {
      title: "Trump Beri Sinyal Perang dengan Iran Segera Berakhir, Harga Minyak Anjlok",
      slug: "trump-sinyal-perang-iran-berakhir-minyak-anjlok",
      category: "Politik",
      authorId: reporter2.id,
      views: 2100,
      daysAgo: 1,
    },
    {
      title: "IHSG Anjlok Lebih dari 4% di Sesi Perdagangan, Tekanan Global dan Aksi Jual Investor",
      slug: "ihsg-anjlok-4-persen-tekanan-global",
      category: "Ekonomi",
      authorId: reporter1.id,
      views: 1560,
      daysAgo: 1,
    },
    {
      title: "Transformasi Digital UMKM Indonesia: Melejit Bersama Platform Ekonomi Nasional",
      slug: "transformasi-digital-umkm-indonesia",
      category: "Ekonomi",
      authorId: reporter2.id,
      views: 430,
      daysAgo: 7,
    },
    {
      title: "Gempa M 6.2 Guncang Sulawesi Tengah, Warga Berhamburan Keluar Rumah",
      slug: "gempa-m62-sulawesi-tengah",
      category: "Bencana",
      authorId: reporter1.id,
      views: 3200,
      daysAgo: 4,
    },
    {
      title: "Pilkada Surabaya 2026: Tiga Kandidat Kuat Mulai Unjuk Gigi di Media Sosial",
      slug: "pilkada-surabaya-2026-tiga-kandidat",
      category: "Politik",
      authorId: reporter2.id,
      views: 780,
      daysAgo: 6,
    },
    {
      title: "Startup Lokal Raih Pendanaan 50 Juta Dolar dari Investor Asia Tenggara",
      slug: "startup-lokal-pendanaan-50-juta-dolar",
      category: "Bisnis",
      authorId: reporter1.id,
      views: 620,
      daysAgo: 8,
    },
    {
      title: "Kurikulum Merdeka Belajar Dinilai Berhasil, Kemendikbud Perluas Program ke 2027",
      slug: "kurikulum-merdeka-belajar-berhasil-2027",
      category: "Pendidikan",
      authorId: reporter2.id,
      views: 340,
      daysAgo: 10,
    },
    // Draft articles
    {
      title: "Rencana Pembangunan MRT Surabaya Fase 2 Memasuki Tahap Kajian",
      slug: "mrt-surabaya-fase-2-kajian",
      category: "Infrastruktur",
      authorId: reporter1.id,
      views: 0,
      daysAgo: 1,
      isDraft: true,
    },
    {
      title: "Tren Wisata Lokal 2026: Destinasi Tersembunyi Jawa Timur Mulai Ramai Dikunjungi",
      slug: "wisata-lokal-2026-jawa-timur",
      category: "Wisata",
      authorId: reporter2.id,
      views: 0,
      daysAgo: 2,
      isDraft: true,
    },
  ];

  const createdArticles = [];

  for (const data of articlesData) {
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - data.daysAgo);

    const article = await prisma.article.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        title: data.title,
        slug: data.slug,
        body: `<p>Ini adalah konten artikel dummy untuk keperluan testing dashboard NarasiKota. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>`,
        excerpt: `Ringkasan artikel: ${data.title}`,
        category: data.category,
        status: data.isDraft ? "draft" : "publish",
        views: data.views,
        authorId: data.authorId,
        publishedAt: data.isDraft ? null : publishedAt,
      },
    });

    if (!data.isDraft) createdArticles.push(article);
  }

  console.log(`✅ ${articlesData.length} articles created`);

  // ── 3. PageViews (untuk engagement metrics & trend) ───────
  const visitorIds = Array.from({ length: 20 }, (_, i) =>
    `visitor-dummy-${String(i + 1).padStart(3, "0")}`
  );

  const pageViewsData = [];
  for (const article of createdArticles) {
    const viewCount = Math.min(article.views, 15); // max 15 pageviews dummy per artikel
    for (let i = 0; i < viewCount; i++) {
      const visitorId = visitorIds[i % visitorIds.length];
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
      createdAt.setHours(Math.floor(Math.random() * 24));

      const timeSpent   = Math.floor(Math.random() * 180) + 10; // 10–190 detik
      const scrollDepth = Math.floor(Math.random() * 100) + 1;  // 1–100%
      const completed   = scrollDepth >= 90;

      pageViewsData.push({
        articleId:   article.id,
        visitorId,
        timeSpent,
        scrollDepth,
        completed,
        createdAt,
      });
    }
  }

  await prisma.pageView.createMany({ data: pageViewsData });
  console.log(`✅ ${pageViewsData.length} pageviews created`);

  // ── 4. Impressions (unique per visitor per artikel) ────────
  const impressionData: Array<{
    articleId: string;
    visitorId: string;
    createdAt: Date;
  }> = [];

  for (const article of createdArticles) {
    // Setiap artikel dapat 5–15 unique impressions
    const impressionCount = Math.floor(Math.random() * 10) + 5;
    const usedVisitors    = new Set<string>();

    for (let i = 0; i < impressionCount; i++) {
      const visitorId = visitorIds[i % visitorIds.length];
      if (usedVisitors.has(visitorId)) continue; // jaga uniqueness
      usedVisitors.add(visitorId);

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

      impressionData.push({ articleId: article.id, visitorId, createdAt });
    }
  }

  await prisma.articleImpression.createMany({
    data: impressionData,
    skipDuplicates: true,
  });

  console.log(`✅ ${impressionData.length} impressions created`);
  console.log("🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });