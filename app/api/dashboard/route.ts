// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "@/lib/jwt";

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
    email: refreshPayload.email,
    role: refreshPayload.role,
  });
  return { userId: refreshPayload.userId, newAccessToken };
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

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserIdFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid, silakan login ulang" },
        { status: 401 }
      );
    }

    const now = new Date();
    // Awal hari ini jam 00:00:00
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    // Kemarin jam 00:00:00
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    const [
      totalArticles,
      publishedToday,
      publishedYesterday,
      categoryGroups,
      totalContributors,
      recentArticles,
    ] = await Promise.all([
      // Total seluruh artikel yang sudah publish
      prisma.article.count({ where: { status: "publish" } }),

      // Artikel yang di-publish hari ini (sejak 00:00)
      prisma.article.count({
        where: {
          status: "publish",
          publishedAt: { gte: todayStart },
        },
      }),

      // Artikel yang di-publish kemarin (untuk perbandingan "+X dari kemarin")
      prisma.article.count({
        where: {
          status: "publish",
          publishedAt: { gte: yesterdayStart, lt: todayStart },
        },
      }),

      // Jumlah kategori unik dari artikel published
      prisma.article.groupBy({
        by: ["category"],
        where: { status: "publish" },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Total kontributor aktif (semua role kecuali USER)
      prisma.user.count({
        where: {
          isActive: true,
          role: { not: "USER" },
        },
      }),

      // 5 artikel terbaru untuk tabel
      prisma.article.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      }),
    ]);

    const diffToday = publishedToday - publishedYesterday;

    const response = NextResponse.json({
      success: true,
      data: {
        stats: {
          totalArticles,
          publishedToday,
          publishedYesterdayDiff: diffToday, // positif = naik, negatif = turun
          totalCategories: categoryGroups.length,
          totalContributors,
        },
        categoryDistribution: categoryGroups.map((c) => ({
          name: c.category,
          count: c._count.id,
        })),
        recentArticles: recentArticles.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          status: a.status,
          author: a.author.name,
          date: (a.publishedAt || a.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        })),
      },
    });

    if (auth.newAccessToken) setNewTokenCookie(response, auth.newAccessToken);
    return response;
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data dashboard" },
      { status: 500 }
    );
  }
}