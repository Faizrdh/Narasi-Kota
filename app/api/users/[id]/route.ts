import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_ROLES = ["SUPER_ADMIN", "REDAKSI", "EDITOR", "REPORTER", "USER"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

// ── PATCH /api/users/[id] ─────────────────────────────────────────────────────
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();
    const { role, isActive } = body;

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    const rows = await prisma.$queryRawUnsafe<unknown[]>(
      `UPDATE users 
       SET role = $1::"UserRole",
           "isActive" = $2,
           "updatedAt" = NOW()
       WHERE id = $3
       RETURNING id, name, email, role::text, "isActive"`,
      role,
      Boolean(isActive),
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(serialize(rows[0]));

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[PATCH /api/users/[id]]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── GET /api/users/[id] ───────────────────────────────────────────────────────
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rows = await prisma.$queryRawUnsafe<unknown[]>(
      `SELECT id, name, email, role::text, image, "isActive", "createdAt"
       FROM users WHERE id = $1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(serialize(rows[0]));

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}