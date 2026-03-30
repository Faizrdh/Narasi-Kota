import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Endpoint ini dipanggil secara terjadwal oleh Vercel Cron
// Authorization pakai CRON_SECRET di environment variable
export async function GET(request: NextRequest) {
  // Verifikasi request berasal dari cron Vercel (bukan sembarang orang)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Cari semua artikel scheduled yang sudah waktunya publish
    const articlesToPublish = await prisma.article.findMany({
      where: {
        status: "scheduled",
        scheduledAt: {
          lte: now, // scheduledAt <= sekarang
        },
      },
      select: { id: true, title: true, scheduledAt: true },
    });

    if (articlesToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada artikel yang perlu dipublish",
        published: 0,
      });
    }

    // Update semua artikel tersebut ke status publish
    const ids = articlesToPublish.map((a) => a.id);
    await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "publish",
        publishedAt: now,
        scheduledAt: null, // bersihkan scheduledAt setelah publish
      },
    });

    console.log(`[CRON] Published ${ids.length} scheduled article(s):`, ids);

    return NextResponse.json({
      success: true,
      message: `${ids.length} artikel berhasil dipublish`,
      published: ids.length,
      articles: articlesToPublish.map((a) => ({
        id: a.id,
        title: a.title,
        scheduledAt: a.scheduledAt,
      })),
    });
  } catch (error) {
    console.error("[CRON] Error publishing scheduled articles:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses artikel terjadwal" },
      { status: 500 }
    );
  }
}