// app/api/articles/impression/route.ts
// POST → catat unique impression per (articleId, visitorId)
// Dengan @@unique([articleId, visitorId]) di schema + skipDuplicates: true,
// visitor yang sama tidak akan double-count pada artikel yang sama.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { articleId, articleIds, visitorId } = body;
    const ids: string[] = articleIds
      ? articleIds
      : articleId
      ? [articleId]
      : [];

    if (!ids.length) {
      return NextResponse.json(
        { success: false, message: "articleId atau articleIds diperlukan" },
        { status: 400 }
      );
    }

    // ── PERBAIKAN: visitorId wajib ada untuk tracking yang akurat ──────────
    // Tanpa visitorId, kita tidak bisa deduplicate → tolak request
    if (!visitorId || typeof visitorId !== "string" || visitorId.trim() === "") {
      return NextResponse.json(
        { success: false, message: "visitorId diperlukan untuk impression tracking" },
        { status: 400 }
      );
    }

    // Validasi: hanya catat untuk artikel publish yang benar-benar ada
    const validArticles = await prisma.article.findMany({
      where: { id: { in: ids }, status: "publish" },
      select: { id: true },
    });

    if (!validArticles.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // ── PERBAIKAN: skipDuplicates: true + @@unique di schema ──────────────
    // → Jika (articleId, visitorId) sudah ada, baris baru di-skip secara otomatis
    // → Tidak perlu SELECT dulu, lebih efisien
    const result = await prisma.articleImpression.createMany({
      data: validArticles.map((a) => ({
        articleId: a.id,
        visitorId,           // selalu diisi, tidak pernah null
      })),
      skipDuplicates: true,  // ← andalkan @@unique constraint
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Impression POST error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mencatat impression" },
      { status: 500 }
    );
  }
}