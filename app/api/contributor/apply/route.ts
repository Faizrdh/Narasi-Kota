// src/app/api/contributor/apply/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const namaLengkap    = formData.get("namaLengkap") as string | null;
    const nomorHP        = formData.get("nomorHP") as string | null;
    const email          = formData.get("email") as string | null;
    const tanggalLahir   = formData.get("tanggalLahir") as string | null;
    const jenisKelamin   = formData.get("jenisKelamin") as string | null;
    const role           = formData.get("role") as string | null;
    const pengalaman     = formData.get("pengalaman") as string | null;
    const spesialisasi   = formData.get("spesialisasi") as string | null;
    const motivasi       = formData.get("motivasi") as string | null;
    const portofolioLink = formData.get("portofolioLink") as string | null;
    const cvFile         = formData.get("cvFile") as File | null;

    // Validasi field wajib
    if (!namaLengkap || !nomorHP || !email || !tanggalLahir || !role || !pengalaman || !spesialisasi || !motivasi) {
      return NextResponse.json(
        { success: false, message: "Field wajib tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Opsional: simpan nama file CV (tanpa upload ke storage dulu)
    const cvFileUrl = cvFile && cvFile.size > 0 ? cvFile.name : null;

    const application = await prisma.contributorApplication.create({
      data: {
        namaLengkap,
        nomorHP,
        email,
        tanggalLahir:   new Date(tanggalLahir),
        jenisKelamin:   jenisKelamin || null,
        role,
        pengalaman,
        spesialisasi,
        motivasi,
        portofolioLink: portofolioLink || null,
        cvFileUrl,
        status:         "pending",
      },
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });

  } catch (error) {
    console.error("[POST /api/contributor/apply]", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan lamaran", detail: String(error) },
      { status: 500 }
    );
  }
}