import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") ?? "";
    const role   = searchParams.get("role") ?? "";
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

    // ── Stats ringkasan ──────────────────────────────────────
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
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        stats: { total: totalAll, pending: totalPending, diterima: totalDiterima, ditolak: totalDitolak },
      },
    });
  } catch (error) {
    console.error("[contributor/applications] Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const application = await prisma.contributorApplication.create({
      data: {
        namaLengkap:    body.namaLengkap,
        nomorHP:        body.nomorHP,
        email:          body.email,
        tanggalLahir:   new Date(body.tanggalLahir),
        jenisKelamin:   body.jenisKelamin ?? null,
        role:           body.role,
        pengalaman:     body.pengalaman,
        spesialisasi:   body.spesialisasi,
        motivasi:       body.motivasi,
        portofolioLink: body.portofolioLink ?? null,
        cvFileUrl:      body.cvFileUrl ?? null,
        status:         "pending",
      },
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error("[POST /contributor/applications]", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan lamaran", detail: String(error) },
      { status: 500 }
    );
  }
}