// app/api/seed-roles/route.ts
// ⚠️  HAPUS FILE INI SETELAH DIPAKAI DI PRODUCTION!
// Endpoint ini hanya untuk setup awal role user.

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  // Hanya bisa dijalankan di development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Tidak tersedia di production" }, { status: 403 });
  }

  try {
    const password = await bcrypt.hash("Password123!", 10);

    // Buat/update user dengan berbagai role
    const usersToSeed = [
      {
        name:  "Super Admin",
        email: "superadmin@narasikota.id",
        role:  "SUPER_ADMIN" as const,
      },
      {
        name:  "Tim Redaksi",
        email: "redaksi@narasikota.id",
        role:  "REDAKSI" as const,
      },
      {
        name:  "Budi Santoso",
        email: "budi.editor@narasikota.id",
        role:  "EDITOR" as const,
      },
      {
        name:  "Siti Rahayu",
        email: "siti.editor@narasikota.id",
        role:  "EDITOR" as const,
      },
      {
        name:  "Faiz Ridho",
        email: "faizridho649@gmail.com",        // email yang sudah ada
        role:  "REPORTER" as const,
      },
      {
        name:  "Sari Dewi",
        email: "sari.reporter@narasikota.id",
        role:  "REPORTER" as const,
      },
      {
        name:  "Andi Kurniawan",
        email: "andi.reporter@narasikota.id",
        role:  "REPORTER" as const,
      },
      {
        name:  "Doni Hermawan",
        email: "doni.reporter@narasikota.id",
        role:  "REPORTER" as const,
      },
    ];

    const results = [];

    for (const userData of usersToSeed) {
      const user = await prisma.user.upsert({
        where:  { email: userData.email },
        update: { role: userData.role, name: userData.name },  // update role jika sudah ada
        create: {
          name:     userData.name,
          email:    userData.email,
          password: password,
          role:     userData.role,
          isActive: true,
        },
        select: { id: true, name: true, email: true, role: true },
      });
      results.push(user);
    }

    return NextResponse.json({
      message: `✅ Berhasil seed ${results.length} user dengan roles`,
      users: results,
    });

  } catch (error) {
    console.error("[POST /api/seed-roles]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}