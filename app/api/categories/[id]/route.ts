import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth-server";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ← await params
  try {
    const actor = await getCurrentUser();
    if (!actor) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!["SUPER_ADMIN", "REDAKSI"].includes(actor.role)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, description, color } = body;

    if (!name?.trim()) return NextResponse.json({ message: "Nama kategori wajib diisi" }, { status: 400 });

    const slug = name.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const conflict = await prisma.category.findFirst({
      where: { AND: [{ id: { not: id } }, { OR: [{ name: name.trim() }, { slug }] }] },
    });
    if (conflict) return NextResponse.json({ message: "Nama kategori sudah digunakan" }, { status: 409 });

    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim(), slug, description: description?.trim() || null, color: color || "zinc" },
    });

    return NextResponse.json({ category, message: "Kategori berhasil diperbarui" });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") return NextResponse.json({ message: "Kategori tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ message: "Gagal memperbarui kategori" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ← await params
  try {
    const actor = await getCurrentUser();
    if (!actor) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!["SUPER_ADMIN", "REDAKSI"].includes(actor.role)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") return NextResponse.json({ message: "Kategori tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ message: "Gagal menghapus kategori" }, { status: 500 });
  }
}