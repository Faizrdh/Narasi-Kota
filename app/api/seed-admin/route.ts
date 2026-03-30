// app/api/seed-admin/route.ts
// Akses via browser: http://localhost:3000/api/seed-admin
// ⚠️ HAPUS FILE INI setelah akun admin berhasil dibuat!

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const email    = "admin@narasikota.com";
    const password = "Admin@123";
    const name     = "Admin NarasiKota";

    // ── Cek apakah admin sudah ada ───────────────────────────
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Jika ada tapi role-nya bukan admin → upgrade
      if (existing.role !== "admin") {
        await prisma.user.update({
          where: { email },
          data: { role: "admin", isActive: true },
        });
        return NextResponse.json({
          success: true,
          message: `Role user ${email} diupgrade ke admin!`,
          login: { email, password: "(password lama tidak berubah)" },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Admin sudah ada, tidak perlu dibuat ulang.",
        login: { email, password },
      });
    }

    // ── Buat admin baru ──────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin",      // ← role admin
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "✅ Akun admin berhasil dibuat!",
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      login: { email, password },
      warning: "⚠️ Segera hapus file ini setelah login berhasil!",
    });

  } catch (error) {
    console.error("Seed admin error:", error);
    return NextResponse.json({
      success: false,
      message: "Gagal membuat admin",
      error: String(error),
    });
  }
}