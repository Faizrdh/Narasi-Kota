export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, resetToken, newPassword } = await request.json();

    // ── Validasi input ─────────────────────────────────────────
    if (!email || !resetToken || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, message: "Password harus mengandung minimal 1 huruf kapital" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, message: "Password harus mengandung minimal 1 angka" },
        { status: 400 }
      );
    }

    // ── Cari user ──────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid atau sudah kedaluwarsa" },
        { status: 400 }
      );
    }

    // ── Verifikasi reset token ─────────────────────────────────
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    const savedToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: `verified:${tokenHash}`,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!savedToken) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid atau sudah kedaluwarsa. Silakan ulangi proses reset password." },
        { status: 400 }
      );
    }

    // ── Pastikan password baru beda dengan yang lama ───────────
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, message: "Password baru tidak boleh sama dengan password lama" },
        { status: 400 }
      );
    }

    // ── Hash password baru ─────────────────────────────────────
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // ── Update password & tandai token sudah dipakai ──────────
    await prisma.$transaction([
      // Update password user
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }),

      // Tandai reset token sebagai sudah dipakai
      prisma.passwordResetToken.update({
        where: { id: savedToken.id },
        data: { usedAt: new Date() },
      }),

      // Hapus semua refresh token (paksa login ulang di semua perangkat)
      prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      }),

      // Hapus semua session aktif
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Password berhasil diperbarui. Silakan masuk dengan password baru.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password error:", error);
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