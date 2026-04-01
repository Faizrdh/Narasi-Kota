// app/api/users/[id]/rewards/route.ts
// Hitung total like yang diterima seorang penulis dari semua artikelnya
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const REWARD_TIERS = [
  {
    id: "master",
    label: "Master Narasi",
    icon: "💎",
    minLikes: 500,
    color: "#7c3aed",
    bg: "from-violet-600 to-purple-700",
    badge: "bg-violet-100 text-violet-700",
    description: "Penulis legendaris NarasiKota",
  },
  {
    id: "bintang",
    label: "Jurnalis Bintang",
    icon: "🏆",
    minLikes: 200,
    color: "#d97706",
    bg: "from-amber-500 to-yellow-600",
    badge: "bg-amber-100 text-amber-700",
    description: "Artikel-artikelnya sangat disukai pembaca",
  },
  {
    id: "pilihan",
    label: "Kontributor Pilihan",
    icon: "⭐",
    minLikes: 50,
    color: "#0284c7",
    bg: "from-sky-500 to-blue-600",
    badge: "bg-sky-100 text-sky-700",
    description: "Kontribusi konsisten dan berkualitas tinggi",
  },
  {
    id: "aktif",
    label: "Penulis Aktif",
    icon: "🔥",
    minLikes: 10,
    color: "#ea580c",
    bg: "from-orange-500 to-red-500",
    badge: "bg-orange-100 text-orange-700",
    description: "Mulai mendapatkan apresiasi pembaca",
  },
  {
    id: "baru",
    label: "Penulis Baru",
    icon: "🌱",
    minLikes: 0,
    color: "#16a34a",
    bg: "from-green-500 to-emerald-600",
    badge: "bg-green-100 text-green-700",
    description: "Baru bergabung di NarasiKota",
  },
] as const;

export function getTier(totalLikes: number) {
  return (
    REWARD_TIERS.find((t) => totalLikes >= t.minLikes) ??
    REWARD_TIERS[REWARD_TIERS.length - 1]
  );
}

export function getNextTier(totalLikes: number) {
  const tiers = [...REWARD_TIERS].reverse(); // ascending
  return tiers.find((t) => t.minLikes > totalLikes) ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Ambil semua artikel milik user
    const articles = await prisma.article.findMany({
      where: { authorId: userId },
      select: { id: true },
    });

    const articleIds = articles.map((a) => a.id);

    const totalLikes = await prisma.articleLike.count({
      where: { articleId: { in: articleIds } },
    });

    const tier     = getTier(totalLikes);
    const nextTier = getNextTier(totalLikes);
    const progress = nextTier
      ? Math.round(((totalLikes - tier.minLikes) / (nextTier.minLikes - tier.minLikes)) * 100)
      : 100;

    return NextResponse.json({
      totalLikes,
      tier,
      nextTier,
      progress,
      articlesCount: articleIds.length,
    });
  } catch (err) {
    console.error("[REWARDS GET]", err);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}