import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from "@/lib/jwt";

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password, rememberMe = false } = body;

    // ── Validasi input ──────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi" },
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

    // ── Cari user di database ───────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Akun Anda tidak aktif. Silakan hubungi admin." },
        { status: 403 }
      );
    }

    // ── Verifikasi password ─────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // ── Generate token ──────────────────────────────────────────
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload, rememberMe);

    // ── Simpan refresh token ke database ───────────────────────
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + (rememberMe ? 30 : 7));

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    });

    // ── Simpan session ke database ──────────────────────────────
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setMinutes(sessionExpiresAt.getMinutes() + 15);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        expiresAt: sessionExpiresAt,
      },
    });

    // ── Buat response JSON ──────────────────────────────────────
    const response = NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      },
      { status: 200 }
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // ← 600 detik = 10 menit (sebelumnya 1 hari)
      path: "/",
    });

    // ── Set cookie refreshToken (HTTP-only, lebih aman) ─────────
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // ← 600 detik = 10 menit (sebelumnya 1 hari)
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

// Tolak method selain POST
export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method tidak diizinkan" },
    { status: 405 }
  );
}