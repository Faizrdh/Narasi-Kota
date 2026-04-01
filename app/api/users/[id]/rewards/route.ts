// app/api/users/[id]/rewards/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const TIERS = [
  { id: "master",  label: "Master Narasi",      icon: "💎", minLikes: 500 },
  { id: "bintang", label: "Jurnalis Bintang",    icon: "🏆", minLikes: 200 },
  { id: "pilihan", label: "Kontributor Pilihan", icon: "⭐", minLikes: 50  },
  { id: "aktif",   label: "Penulis Aktif",       icon: "🔥", minLikes: 1  },
  { id: "baru",    label: "Penulis Baru",        icon: "🌱", minLikes: 0   },
] as const;

function getTier(totalLikes: number) {
  return TIERS.find((t) => totalLikes >= t.minLikes) ?? TIERS[TIERS.length - 1];
}

function getNextTier(totalLikes: number) {
  const idx = TIERS.findIndex((t) => t.id === getTier(totalLikes).id);
  return idx > 0 ? TIERS[idx - 1] : null;
}

function getProgress(totalLikes: number): number {
  const current = getTier(totalLikes);
  const next    = getNextTier(totalLikes);
  if (!next) return 100;
  return Math.min(
    Math.max(Math.round(((totalLikes - current.minLikes) / (next.minLikes - current.minLikes)) * 100), 0),
    100,
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // ✅ FIX: pakai Prisma ORM biasa, bukan raw SQL
    // Hitung total likes dari semua artikel publish milik user ini
    const totalLikes = await prisma.articleLike.count({
      where: {
        article: {
          authorId: id,
          status: "publish",
        },
      },
    });

    return NextResponse.json({
      totalLikes,
      currentTier: getTier(totalLikes),
      nextTier:    getNextTier(totalLikes),
      progress:    getProgress(totalLikes),
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[GET /api/users/[id]/rewards]", msg);
    // ✅ FIX: kembalikan data default (0 likes) bukan error 500
    // supaya badge "Penulis Baru" tetap tampil meski DB bermasalah
    return NextResponse.json({
      totalLikes:  0,
      currentTier: TIERS[TIERS.length - 1],
      nextTier:    TIERS[TIERS.length - 2],
      progress:    0,
    });
  }
}