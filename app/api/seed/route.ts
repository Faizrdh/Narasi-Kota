import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "User sudah ada!",
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        }
      });
    }

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "USER",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User berhasil dibuat!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({
      success: false,
      message: "Gagal membuat user",
      error: String(error),
    });
  }
}