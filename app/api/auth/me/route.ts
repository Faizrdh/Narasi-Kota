// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Coba access token dulu
    const accessToken = request.cookies.get("accessToken")?.value;
    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, name: true, email: true, role: true, image: true, isActive: true },
        });
        if (user?.isActive) {
          return NextResponse.json({ success: true, data: user });
        }
      }
    }

    // 2. Fallback ke refresh token
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const refreshPayload = verifyRefreshToken(refreshToken);
    if (!refreshPayload) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" },
        { status: 401 }
      );
    }

    const storedToken = await prisma.refreshToken.findFirst({
      where: { token: refreshToken, userId: refreshPayload.userId },
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "Sesi telah kadaluarsa" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: refreshPayload.userId },
      select: { id: true, name: true, email: true, role: true, image: true, isActive: true },
    });
    if (!user?.isActive) {
      return NextResponse.json(
        { success: false, message: "Akun tidak aktif" },
        { status: 403 }
      );
    }

    // Terbitkan access token baru
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, data: user });
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}