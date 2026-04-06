import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Interface untuk request body
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RegisterRequest = await request.json();
    const { name, email, password } = body;

    // Validasi input - semua field wajib diisi
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua field wajib diisi",
        },
        { status: 400 }
      );
    }

    // Validasi nama minimal 3 karakter
    if (name.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama minimal 3 karakter",
        },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format email tidak valid",
        },
        { status: 400 }
      );
    }

    // Validasi password minimal 8 karakter
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 8 karakter",
        },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
        },
        { status: 400 }
      );
    }

    // Hash password dengan bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Simpan user baru ke database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "USER",
        isActive: true,
      },
    });

    // Response sukses (tanpa mengembalikan password)
    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil! Silakan login.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Register error:", error);

    // Handle Prisma specific errors
    if (error instanceof Error) {
      // Unique constraint violation (email sudah ada)
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            success: false,
            message: "Email sudah terdaftar",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}

// Handle method yang tidak diizinkan
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Method tidak diizinkan",
    },
    { status: 405 }
  );
}