import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // ── Debug log — bisa dihapus setelah konfirmasi berjalan ──
    console.log("[pelamar API] user from token:", user);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid atau tidak ditemukan" },
        { status: 401 }
      );
    }

    // Normalisasi role — handle "SUPER_ADMIN", "super_admin", dll
    const normalizedRole = user.role?.toUpperCase().replace(/[-\s]/g, "_");
    if (normalizedRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: `Akses ditolak. Role Anda: ${user.role}` },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") ?? "";
    const role   = searchParams.get("role")   ?? "";
    const search = searchParams.get("search") ?? "";
    const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit  = 10;

    // ── Build filter ─────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;
    if (role)   where.role   = role;
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search, mode: "insensitive" } },
        { email:       { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, applications] = await Promise.all([
      prisma.contributorApplication.count({ where }),
      prisma.contributorApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const [totalAll, totalPending, totalDiterima, totalDitolak] = await Promise.all([
      prisma.contributorApplication.count(),
      prisma.contributorApplication.count({ where: { status: "pending"  } }),
      prisma.contributorApplication.count({ where: { status: "diterima" } }),
      prisma.contributorApplication.count({ where: { status: "ditolak"  } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        applications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
        stats: {
          total: totalAll,
          pending: totalPending,
          diterima: totalDiterima,
          ditolak: totalDitolak,
        },
      },
    });
  } catch (error) {
    console.error("[contributor/applications] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server", detail: String(error) },
      { status: 500 }
    );
  }
}