

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Kategori lama dari hardcode + warna yang sesuai dengan colorOptions di categories page
const SEED_CATEGORIES = [
  {
    name: "Ekonomi",
    slug: "ekonomi",
    color: "blue",          // sebelumnya: bg-blue-100 text-blue-700
    description: "Berita seputar ekonomi makro, mikro, dan kebijakan fiskal Indonesia",
  },
  {
    name: "Politik",
    slug: "politik",
    color: "orange",        // sebelumnya: bg-orange-100 text-orange-700
    description: "Perkembangan politik dalam dan luar negeri",
  },
  {
    name: "Teknologi",
    slug: "teknologi",
    color: "purple",        // sebelumnya: bg-purple-100 text-purple-700
    description: "Inovasi teknologi, startup, dan transformasi digital",
  },
  {
    name: "Bisnis",
    slug: "bisnis",
    color: "pink",          // sebelumnya: bg-pink-100 text-pink-700
    description: "Dunia bisnis, korporasi, dan pengusaha Indonesia",
  },
  {
    name: "Keuangan",
    slug: "keuangan",
    color: "green",         // sebelumnya: bg-green-100 text-green-700
    description: "Pasar modal, investasi, perbankan, dan keuangan pribadi",
  },
];

async function main() {
  console.log("🌱 Seeding categories...\n");

  for (const cat of SEED_CATEGORIES) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        // Hanya update color & description jika belum di-set
        color:       cat.color,
        description: cat.description,
      },
      create: cat,
    });

    console.log(`  ✅ ${result.name} (${result.color}) — id: ${result.id}`);
  }

  console.log("\n✨ Selesai! Semua kategori berhasil di-seed.");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });