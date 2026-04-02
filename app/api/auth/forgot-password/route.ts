export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

//forgotpassword
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5; // Maks request OTP per jam per email

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // ── Validasi ──────────────────────────────────────────────
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email wajib diisi" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // ── Cari user ─────────────────────────────────────────────
    // NOTE: Kita tidak memberi tahu apakah email terdaftar atau tidak
    // untuk alasan keamanan (prevent email enumeration)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Selalu kirim respon sukses meski email tidak ditemukan (security)
    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: true,
          message: "Jika email terdaftar, kode OTP telah dikirimkan",
        },
        { status: 200 }
      );
    }

    // ── Rate limiting: maks 5 request per jam ─────────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequests = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentRequests >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak permintaan OTP. Coba lagi dalam 1 jam.",
        },
        { status: 429 }
      );
    }

    // ── Hapus OTP lama yang belum digunakan ───────────────────
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // ── Generate OTP 6 digit ──────────────────────────────────
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash OTP sebelum disimpan ke database (keamanan)
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // ── Simpan ke database ────────────────────────────────────
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: otpHash,
        expiresAt,
      },
    });

    // ── Kirim email ───────────────────────────────────────────
    await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Jika email terdaftar, kode OTP telah dikirimkan",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method tidak diizinkan" },
    { status: 405 }
  );
}