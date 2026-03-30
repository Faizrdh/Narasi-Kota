// app/api/statistics/pageview/patch/route.ts
// Dipanggil via sendBeacon saat user meninggalkan halaman.
// Memperbarui: timeSpent, scrollDepth, completed

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageViewId, timeSpent, scrollDepth, completed } = body;

    if (!pageViewId) {
      return NextResponse.json(
        { success: false, message: "pageViewId diperlukan" },
        { status: 400 }
      );
    }

    // Sanitasi nilai
    const sanitizedTimeSpent   = Math.max(0, Math.round(Number(timeSpent)   || 0));
    const sanitizedScrollDepth = Math.min(100, Math.max(0, Math.round(Number(scrollDepth) || 0)));
    const sanitizedCompleted   = Boolean(completed) || sanitizedScrollDepth >= 90;

    await prisma.pageView.update({
      where: { id: pageViewId },
      data: {
        timeSpent:   sanitizedTimeSpent,
        scrollDepth: sanitizedScrollDepth,
        completed:   sanitizedCompleted,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Jangan log error jika record tidak ditemukan (bisa terjadi jika artikel dihapus)
    if ((error as { code?: string }).code !== "P2025") {
      console.error("PageView PATCH error:", error);
    }
    return NextResponse.json({ success: false }, { status: 500 });
  }
}