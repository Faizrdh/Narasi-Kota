import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
 
// ── POST: Catat kunjungan baru ───────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, visitorId } = body;
 
    if (!articleId || !visitorId) {
      return NextResponse.json(
        { success: false, message: "articleId dan visitorId wajib diisi" },
        { status: 400 }
      );
    }
 
    // Cek artikel ada dan sudah publish
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    });
 
    if (!article || article.status !== "publish") {
      return NextResponse.json(
        { success: false, message: "Artikel tidak ditemukan atau belum dipublish" },
        { status: 404 }
      );
    }
 
    // Buat record pageview baru
    // → Ini yang menyebabkan viewsToday & uniqueVisitors bertambah di statistik
    const pageView = await prisma.pageView.create({
      data: {
        articleId,
        visitorId,
        timeSpent: 0,
      },
    });
 
    return NextResponse.json(
      { success: true, data: { id: pageView.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("PageView POST error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mencatat kunjungan" },
      { status: 500 }
    );
  }
}