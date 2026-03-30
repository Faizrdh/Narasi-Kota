import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test koneksi dan ambil semua users
    const users = await prisma.user.findMany();
    
    return NextResponse.json({
      success: true,
      message: "Database connected!",
      database_url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@"), // sensor password
      userCount: users.length,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Database error",
      error: String(error)
    });
  }
}