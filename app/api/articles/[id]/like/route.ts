// app/api/articles/[id]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ── GET: cek status like + total like artikel ────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const visitorId = req.nextUrl.searchParams.get("visitorId");

    const [likeCount, hasLiked] = await Promise.all([
      prisma.articleLike.count({ where: { articleId } }),
      visitorId
        ? prisma.articleLike.findFirst({ where: { articleId, visitorId } })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({ likeCount, hasLiked: !!hasLiked });
  } catch (err) {
    console.error("[LIKE GET]", err);
    return NextResponse.json({ likeCount: 0, hasLiked: false });
  }
}

// ── POST: toggle like ────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const body = await req.json();
    const { visitorId } = body as { visitorId: string };

    if (!visitorId?.trim()) {
      return NextResponse.json(
        { error: "visitorId diperlukan" },
        { status: 400 }
      );
    }

    // Pastikan artikel ada
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });
    if (!article) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    // Toggle
    const existing = await prisma.articleLike.findFirst({
      where: { articleId, visitorId },
    });

    if (existing) {
      // Unlike
      await prisma.articleLike.delete({ where: { id: existing.id } });
    } else {
      // Like
      await prisma.articleLike.create({ data: { articleId, visitorId } });
    }

    const likeCount = await prisma.articleLike.count({ where: { articleId } });
    return NextResponse.json({ liked: !existing, likeCount });
  } catch (err) {
    console.error("[LIKE POST]", err);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}