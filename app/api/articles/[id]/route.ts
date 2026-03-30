// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
} from "@/lib/jwt";

// ── Role & status helpers ────────────────────────────────────

type Role = "SUPER_ADMIN" | "REDAKSI" | "EDITOR" | "REPORTER" | "USER";

// Transisi status yang boleh dilakukan per role
const ALLOWED_STATUSES: Record<Role, string[]> = {
  SUPER_ADMIN: ["draft", "review", "revisi", "siap_publish", "publish", "scheduled"],
  REDAKSI:     ["draft", "review", "revisi", "siap_publish", "publish", "scheduled"],
  EDITOR:      ["draft", "review", "revisi", "siap_publish", "publish"],
  REPORTER:    ["draft", "review"],
  USER:        ["draft"],
};

// ── Auth helper ──────────────────────────────────────────────
async function getAuthFromRequest(request: NextRequest): Promise<{
  userId: string;
  role: Role;
  newAccessToken?: string;
} | null> {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      return { userId: payload.userId, role: payload.role as Role };
    }
  }

  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken) return null;

  const refreshPayload = verifyRefreshToken(refreshToken);
  if (!refreshPayload) return null;

  const storedToken = await prisma.refreshToken.findFirst({
    where: { token: refreshToken, userId: refreshPayload.userId },
  });
  if (!storedToken || storedToken.expiresAt < new Date()) return null;

  const newAccessToken = generateAccessToken({
    userId: refreshPayload.userId,
    email: refreshPayload.email,
    role: refreshPayload.role,
  });

  return {
    userId: refreshPayload.userId,
    role: refreshPayload.role as Role,
    newAccessToken,
  };
}

function setNewTokenCookie(response: NextResponse, token: string) {
  response.cookies.set("accessToken", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60,
    path: "/",
  });
}

// ── GET ──────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const noView = request.nextUrl.searchParams.get("noView");

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!noView) {
      await prisma.article.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("GET article error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil artikel" },
      { status: 500 }
    );
  }
}

// ── PUT ──────────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Auth
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid, silakan login ulang" },
        { status: 401 }
      );
    }

    // 2. Cek artikel ada
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Cek kepemilikan: reporter hanya bisa edit artikelnya sendiri,
    //    kecuali editor+ bisa edit semua
    const editorRoles: Role[] = ["EDITOR", "REDAKSI", "SUPER_ADMIN"];
    const isEditor = editorRoles.includes(auth.role);

    if (!isEditor && existing.authorId !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki izin untuk mengubah artikel ini" },
        { status: 403 }
      );
    }

    // 4. Parse body
    const body = await request.json();
    const {
      title,
      body: content,
      excerpt,
      image,
      detailImage,
      detailVideo,
      category,
      status,
      scheduledAt,
      revisiNote, // ← catatan revisi dari editor
    } = body;

    // 5. Validasi transisi status berdasarkan role
    if (status) {
      const allowed = ALLOWED_STATUSES[auth.role] ?? ["draft"];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: `Role Anda (${auth.role}) tidak diizinkan mengubah ke status "${status}"`,
          },
          { status: 403 }
        );
      }
    }

    // 6. Validasi scheduled
    if (status === "scheduled") {
      if (!scheduledAt) {
        return NextResponse.json(
          { success: false, message: "Jadwal publikasi wajib diisi" },
          { status: 400 }
        );
      }
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        return NextResponse.json(
          { success: false, message: "Jadwal harus di masa mendatang" },
          { status: 400 }
        );
      }
    }

    // 7. Update artikel
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title       !== undefined && { title }),
        ...(content     !== undefined && { body: content }),
        ...(excerpt     !== undefined && { excerpt }),
        ...(image       !== undefined && { image }),
        ...(detailImage !== undefined && { detailImage }),
        ...(detailVideo !== undefined && { detailVideo }),
        ...(category    !== undefined && { category }),
        ...(status      !== undefined && { status }),
        // Set publishedAt saat pertama kali dipublish
        ...(status === "publish" && !existing.publishedAt
          ? { publishedAt: new Date() }
          : {}),
        // Set scheduledAt
        ...(status === "scheduled" && scheduledAt
          ? { scheduledAt: new Date(scheduledAt) }
          : {}),
        // Hapus scheduledAt jika status berubah ke selain scheduled
        ...(status && status !== "scheduled"
          ? { scheduledAt: null }
          : {}),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    // Pesan sukses berdasarkan status baru
    const statusMessages: Record<string, string> = {
      draft:        "Artikel disimpan sebagai Draft",
      review:       "Artikel berhasil diajukan untuk Review oleh Editor",
      revisi:       "Artikel dikembalikan untuk Revisi",
      siap_publish: "Artikel disetujui — Layak Publish",
      publish:      "Artikel berhasil dipublish",
      scheduled:    "Artikel dijadwalkan untuk publish",
    };

    const response = NextResponse.json({
      success: true,
      message: statusMessages[article.status] ?? "Artikel berhasil diupdate",
      data: article,
    });

    if (auth.newAccessToken) {
      setNewTokenCookie(response, auth.newAccessToken);
    }

    return response;
  } catch (error) {
    console.error("PUT article error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate artikel" },
      { status: 500 }
    );
  }
}

// ── DELETE ───────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid" },
        { status: 401 }
      );
    }

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hanya pemilik atau editor+ yang bisa delete
    const editorRoles: Role[] = ["EDITOR", "REDAKSI", "SUPER_ADMIN"];
    if (!editorRoles.includes(auth.role) && existing.authorId !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Tidak memiliki izin" },
        { status: 403 }
      );
    }

    await prisma.article.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE article error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus artikel" },
      { status: 500 }
    );
  }
}