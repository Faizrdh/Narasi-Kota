import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Tidak terautentikasi" }, { status: 401 });
    }

    const normalizedRole = user.role?.toUpperCase().replace(/[-\s]/g, "_");
    if (normalizedRole !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json() as { status: string; catatanAdmin?: string };
    const { status, catatanAdmin } = body;

    const validStatuses = ["pending", "diterima", "ditolak"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Status tidak valid" }, { status: 400 });
    }

    const application = await prisma.contributorApplication.findUnique({ where: { id } });
    if (!application) {
      return NextResponse.json({ success: false, message: "Lamaran tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.contributorApplication.update({
      where: { id },
      data: {
        status,
        catatanAdmin: catatanAdmin ?? application.catatanAdmin,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status diperbarui menjadi ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error("[contributor/applications/[id] PATCH] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Tidak terautentikasi" }, { status: 401 });
    }

    const normalizedRole = user.role?.toUpperCase().replace(/[-\s]/g, "_");
    if (normalizedRole !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    const application = await prisma.contributorApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ success: false, message: "Tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error("[contributor/applications/[id] GET] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}