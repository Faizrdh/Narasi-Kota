import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "@/lib/jwt";

// ── Helper: ambil userId dari cookie (dengan auto-refresh) ───
async function getUserIdFromRequest(request: NextRequest): Promise<{
  userId: string;
  newAccessToken?: string;
} | null> {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) return { userId: payload.userId };
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
    email:  refreshPayload.email,
    role:   refreshPayload.role,
  });

  return { userId: refreshPayload.userId, newAccessToken };
}

// ── Helper: set cookie baru di response ──────────────────────
function setNewTokenCookie(response: NextResponse, token: string) {
  response.cookies.set("accessToken", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60,
    path: "/",
  });
}

// ── Helper: buat slug ────────────────────────────────────────
function createSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() +
    "-" +
    Date.now()
  );
}

// ── GET: Ambil artikel ───────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status   = searchParams.get("status");
    const category = searchParams.get("category");
    const slug     = searchParams.get("slug");
    const limit    = parseInt(searchParams.get("limit") || "10");
    const page     = parseInt(searchParams.get("page")  || "1");
    const skip     = (page - 1) * limit;

    if (slug) {
      const article = await prisma.article.findFirst({
        where: { slug, status: "publish" },
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
      await prisma.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      });
      return NextResponse.json({ success: true, data: article });
    }

    const where: Record<string, unknown> = {};
    if (status)   where.status   = status;
    if (category) where.category = category;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET articles error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil artikel" },
      { status: 500 }
    );
  }
}

// ── POST: Tambah artikel baru ────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const auth = await getUserIdFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid, silakan login ulang" },
        { status: 401 }
      );
    }

    // 2. Pastikan user masih aktif
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, isActive: true },
    });
    if (!user?.isActive) {
      return NextResponse.json(
        { success: false, message: "Akun tidak aktif" },
        { status: 403 }
      );
    }

    // 3. Validasi body
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
      scheduledAt,   // ← BARU: ISO string | null
    } = body;

    if (!title?.trim())
      return NextResponse.json({ success: false, message: "Judul wajib diisi" }, { status: 400 });
    if (!content?.trim())
      return NextResponse.json({ success: false, message: "Isi artikel wajib diisi" }, { status: 400 });
    if (!category)
      return NextResponse.json({ success: false, message: "Kategori wajib dipilih" }, { status: 400 });

    // Validasi scheduled
    if (status === "scheduled") {
      if (!scheduledAt) {
        return NextResponse.json(
          { success: false, message: "Jadwal publikasi wajib diisi" },
          { status: 400 }
        );
      }
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json(
          { success: false, message: "Format jadwal tidak valid" },
          { status: 400 }
        );
      }
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { success: false, message: "Jadwal harus di masa mendatang" },
          { status: 400 }
        );
      }
    }

    // 4. Simpan artikel
    const article = await prisma.article.create({
      data: {
        title:       title.trim(),
        slug:        createSlug(title),
        body:        content.trim(),
        excerpt:     excerpt?.trim() || content.trim().substring(0, 150) + "...",
        image:       image?.trim()       || null,
        detailImage: detailImage?.trim() || null,
        detailVideo: detailVideo?.trim() || null,
        category,
        status:      status || "draft",
        authorId:    auth.userId,
        publishedAt: status === "publish" ? new Date() : null,
        // scheduledAt disimpan jika status === "scheduled"
        // Pastikan field scheduledAt sudah ada di Prisma schema:
        // scheduledAt  DateTime?
        ...(status === "scheduled" && scheduledAt
          ? { scheduledAt: new Date(scheduledAt) }
          : {}),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    // 5. Response + set cookie baru jika token di-refresh
    const response = NextResponse.json(
      { success: true, message: "Artikel berhasil ditambahkan", data: article },
      { status: 201 }
    );

    if (auth.newAccessToken) {
      setNewTokenCookie(response, auth.newAccessToken);
    }

    return response;

  } catch (error) {
    console.error("POST article error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan artikel" },
      { status: 500 }
    );
  }
}