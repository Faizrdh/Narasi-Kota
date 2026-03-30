// app/api/statistics/pageview/route.ts
// POST  → buat record PageView baru, kembalikan id-nya
// (id ini digunakan oleh PageViewTracker untuk PATCH nanti)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, visitorId } = body;

    if (!articleId || !visitorId) {
      return NextResponse.json(
        { success: false, message: "articleId dan visitorId diperlukan" },
        { status: 400 }
      );
    }

    // Pastikan artikel ada dan sudah publish
    const article = await prisma.article.findFirst({
      where: { id: articleId, status: "publish" },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    const pageView = await prisma.pageView.create({
      data: {
        articleId,
        visitorId,
        timeSpent:   0,
        scrollDepth: 0,
        completed:   false,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, data: { id: pageView.id } });
  } catch (error) {
    console.error("PageView POST error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mencatat kunjungan" },
      { status: 500 }
    );
  }
}