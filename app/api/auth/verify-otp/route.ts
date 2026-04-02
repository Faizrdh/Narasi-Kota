export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email dan OTP wajib diisi" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "OTP harus berupa 6 digit angka" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "Kode OTP tidak valid atau sudah kedaluwarsa" },
        { status: 400 }
      );
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: otpHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!resetToken) {
      return NextResponse.json(
        { success: false, message: "Kode OTP tidak valid atau sudah kedaluwarsa" },
        { status: 400 }
      );
    }

    const tempResetToken = crypto.randomBytes(32).toString("hex");
    const tempResetHash = crypto.createHash("sha256").update(tempResetToken).digest("hex");

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        token: `verified:${tempResetHash}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "OTP berhasil diverifikasi",
        resetToken: tempResetToken,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Verify OTP error:", error);
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