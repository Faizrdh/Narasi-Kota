import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
 
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageViewId, timeSpent } = body;
 
    if (!pageViewId || typeof timeSpent !== "number") {
      return NextResponse.json(
        { success: false, message: "pageViewId dan timeSpent wajib diisi" },
        { status: 400 }
      );
    }
 
    // Batasi maksimal 1 jam (3600 detik) untuk menghindari data tidak valid
    const clampedTime = Math.min(Math.max(timeSpent, 0), 3600);
 
    await prisma.pageView.update({
      where: { id: pageViewId },
      data: { timeSpent: clampedTime },
    });
 
    return NextResponse.json({ success: true });
  } catch (error) {
    // Jangan log error 404 (normal jika pageView sudah dihapus atau ID tidak valid)
    if (error instanceof Error && !error.message.includes("Record to update not found")) {
      console.error("PageView PATCH error:", error);
    }
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui durasi baca" },
      { status: 500 }
    );
  }
}