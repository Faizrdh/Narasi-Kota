// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logout berhasil" },
      { status: 200 }
    );

    // ── Hapus cookie accessToken ─────────────────────────────
    response.cookies.set("accessToken", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,   // ← langsung expired
      path: "/",
    });

    // ── Hapus cookie refreshToken ────────────────────────────
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal logout" },
      { status: 500 }
    );
  }
}