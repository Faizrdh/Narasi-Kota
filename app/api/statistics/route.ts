// src/app/api/statistics/route.ts
//
// ── CHANGELOG ─────────────────────────────────────────────────
// v3 → v4:
//   1. Tambah period "12m" (12 bulan terakhir dengan date-filter)
//   2. Tambah `ctrData` → CTR & Headline Performance per artikel
//      - impressions: berapa kali artikel muncul di feed
//      - clicks: berapa kali artikel diklik (= pageViews)
//      - ctr: clicks / impressions × 100%
//   3. Tambah `engagementMetrics` → metrik keterlibatan pembaca
//      - bounceRate: % yang keluar < 15 detik
//      - avgScrollDepth: rata-rata scroll (0–100%)
//      - completionRate: % yang membaca sampai ≥ 90%

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
} from "@/lib/jwt";

type Period = "today" | "7d" | "30d" | "90d" | "12m" | "all";

// ── Auth helper ───────────────────────────────────────────────
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

function getPeriodDates(period: Period, now: Date) {
  const currentEnd = new Date(now);

  if (period === "all") {
    return { currentStart: null, currentEnd, prevStart: null, prevEnd: null };
  }

  if (period === "today") {
    const currentStart = new Date(
      now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0
    );
    const prevStart = new Date(currentStart);
    prevStart.setDate(prevStart.getDate() - 1);
    const prevEnd = new Date(currentStart);
    prevEnd.setMilliseconds(-1);
    return { currentStart, currentEnd, prevStart, prevEnd };
  }

  // ── 12m: 12 bulan terakhir ────────────────────────────────
  if (period === "12m") {
    const currentStart = new Date(now);
    currentStart.setFullYear(currentStart.getFullYear() - 1);
    currentStart.setHours(0, 0, 0, 0);

    const prevEnd = new Date(currentStart);
    prevEnd.setMilliseconds(-1);

    const prevStart = new Date(prevEnd);
    prevStart.setFullYear(prevStart.getFullYear() - 1);
    prevStart.setHours(0, 0, 0, 0);

    return { currentStart, currentEnd, prevStart, prevEnd };
  }

  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[period];

  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - days);
  currentStart.setHours(0, 0, 0, 0);

  const prevEnd = new Date(currentStart);
  prevEnd.setMilliseconds(-1);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - days + 1);
  prevStart.setHours(0, 0, 0, 0);

  return { currentStart, currentEnd, prevStart, prevEnd };
}

// ── Delta ABSOLUT ─────────────────────────────────────────────
function calcDelta(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return null;
  return current - previous;
}

// ── Build trend data ──────────────────────────────────────────
function buildTrendData(
  pvDates: Date[],
  period: Period,
  now: Date
): Array<{ date: string; views: number; label: string }> {
  const countMap = new Map<string, number>();

  const getKey = (d: Date): string => {
    if (period === "today") {
      return String(d.getHours()).padStart(2, "0") + ":00";
    }
    if (period === "90d") {
      const copy = new Date(d);
      copy.setDate(copy.getDate() - copy.getDay());
      return copy.toISOString().split("T")[0];
    }
    // all & 12m → per bulan
    if (period === "all" || period === "12m") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
    return d.toISOString().split("T")[0];
  };

  pvDates.forEach((d) => {
    const key = getKey(d);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  });

  let labels: string[] = [];

  if (period === "today") {
    labels = Array.from({ length: 24 }, (_, i) =>
      String(i).padStart(2, "0") + ":00"
    );
  } else if (period === "7d") {
    labels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
  } else if (period === "30d") {
    labels = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });
  } else if (period === "90d") {
    const seen = new Set<string>();
    labels = [];
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      d.setDate(d.getDate() - d.getDay());
      const key = d.toISOString().split("T")[0];
      if (!seen.has(key)) {
        seen.add(key);
        labels.push(key);
      }
    }
  } else {
    // all & 12m → 12 bulan terakhir
    labels = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - i));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
  }

  const monthNames = [
    "Jan","Feb","Mar","Apr","Mei","Jun",
    "Jul","Ags","Sep","Okt","Nov","Des",
  ];

  const formatLabel = (key: string): string => {
    if (period === "today") return key;
    if (period === "all" || period === "12m") {
      const [year, month] = key.split("-");
      return `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`;
    }
    const d = new Date(key + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return labels.map((key) => ({
    date: key,
    views: countMap.get(key) ?? 0,
    label: formatLabel(key),
  }));
}

// ── GET: Statistik ────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // 1. Auth
    const auth = await getUserIdFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid, silakan login ulang" },
        { status: 401 }
      );
    }

    // 2. Period param
    const url = new URL(request.url);
    const periodParam = url.searchParams.get("period") ?? "all";
    const period = (
      ["today", "7d", "30d", "90d", "12m", "all"].includes(periodParam)
        ? periodParam
        : "all"
    ) as Period;

    const now = new Date();
    const { currentStart, currentEnd, prevStart, prevEnd } =
      getPeriodDates(period, now);

    const pvFilter = currentStart
      ? { createdAt: { gte: currentStart, lte: currentEnd } }
      : {};
    const pvPrevFilter =
      prevStart && prevEnd
        ? { createdAt: { gte: prevStart, lte: prevEnd } }
        : null;

    const articlePublishFilter = currentStart
      ? { status: "publish", publishedAt: { gte: currentStart, lte: currentEnd } }
      : { status: "publish" };

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);
    const lastWeekEnd = new Date(now);
    lastWeekEnd.setDate(now.getDate() - 7);

    // Filter trend: "all" → 12 bulan terakhir; "12m" → sama saja sudah filtered
    const trendPvFilter =
      period === "all"
        ? { createdAt: { gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) } }
        : pvFilter;

    // 3. Semua query paralel ────────────────────────────────────
    const [
      totalArticles,
      publishedCount,
      draftCount,
      publishedInPeriod,
      publishedInPrevPeriod,
      viewsInPeriod,
      viewsInPrevPeriod,
      uniqueVisitorsData,
      uniqueVisitorsPrevData,
      avgTimeData,
      avgTimePrevData,
      thisWeekPublished,
      lastWeekPublished,
      topPageViewsData,
      articlesByCategory,
      allPeriodViewsRaw,
      trendRaw,
      // ── BARU: Engagement ─────────────────────────────────
      bounceCount,
      scrollDepthAgg,
      completedCount,
      totalWithScrollData,
      // ── BARU: Impressions per artikel ────────────────────
      impressionsByArticle,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "publish" } }),
      prisma.article.count({ where: { status: "draft" } }),

      prisma.article.count({ where: articlePublishFilter }),
      pvPrevFilter && prevStart && prevEnd
        ? prisma.article.count({
            where: currentStart
              ? { status: "publish", publishedAt: { gte: prevStart, lte: prevEnd } }
              : { status: "publish" },
          })
        : Promise.resolve(0),

      prisma.pageView.count({ where: pvFilter }),
      pvPrevFilter
        ? prisma.pageView.count({ where: pvPrevFilter })
        : Promise.resolve(0),

      prisma.pageView.groupBy({
        by: ["visitorId"],
        where: pvFilter,
        _count: { visitorId: true },
      }),
      pvPrevFilter
        ? prisma.pageView.groupBy({
            by: ["visitorId"],
            where: pvPrevFilter,
            _count: { visitorId: true },
          })
        : Promise.resolve([]),

      prisma.pageView.aggregate({
        _avg: { timeSpent: true },
        where: { ...pvFilter, timeSpent: { gt: 0 } },
      }),
      pvPrevFilter
        ? prisma.pageView.aggregate({
            _avg: { timeSpent: true },
            where: { ...pvPrevFilter, timeSpent: { gt: 0 } },
          })
        : Promise.resolve({ _avg: { timeSpent: null } }),

      prisma.article.count({
        where: { status: "publish", publishedAt: { gte: thisWeekStart } },
      }),
      prisma.article.count({
        where: {
          status: "publish",
          publishedAt: { gte: lastWeekStart, lt: lastWeekEnd },
        },
      }),

      prisma.pageView.groupBy({
        by: ["articleId"],
        where: pvFilter,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      prisma.article.groupBy({
        by: ["category"],
        where: articlePublishFilter,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      period !== "all"
        ? prisma.pageView.groupBy({
            by: ["articleId"],
            where: pvFilter,
            _count: { id: true },
          })
        : Promise.resolve([]),

      prisma.pageView.findMany({
        where: trendPvFilter,
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),

      // ── Engagement: Bounce (timeSpent < 15s, tapi sudah di-update / > 0) ──
      prisma.pageView.count({
        where: { ...pvFilter, timeSpent: { gt: 0, lt: 15 } },
      }),

      // ── Engagement: Rata-rata scroll depth ───────────────
      prisma.pageView.aggregate({
        _avg: { scrollDepth: true },
        where: { ...pvFilter, scrollDepth: { gt: 0 } },
      }),

      // ── Engagement: Completed count ───────────────────────
      prisma.pageView.count({
        where: { ...pvFilter, completed: true },
      }),

      // ── Engagement: Total yang sudah update data (timeSpent > 0) ─
      prisma.pageView.count({
        where: { ...pvFilter, timeSpent: { gt: 0 } },
      }),

      // ── CTR: Impressions per artikel dalam periode ─────────
      prisma.articleImpression.groupBy({
        by: ["articleId"],
        where: pvFilter, // filter tanggal yang sama
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }),
    ]);

    // 4. Build trend data ──────────────────────────────────────
    const trendData = buildTrendData(
      trendRaw.map((pv) => pv.createdAt),
      period,
      now
    );

    // 5. Author Performance ────────────────────────────────────
    const allPublishedArticles = await prisma.article.findMany({
      where: { status: "publish" },
      select: {
        id: true,
        authorId: true,
        views: true,
        author: { select: { id: true, name: true } },
      },
    });

    const periodViewsMap =
      period !== "all"
        ? new Map(
            (
              allPeriodViewsRaw as Array<{
                articleId: string;
                _count: { id: number };
              }>
            ).map((d) => [d.articleId, d._count.id])
          )
        : new Map<string, number>();

    const authorMap = new Map<
      string,
      { name: string; articles: number; views: number }
    >();

    for (const article of allPublishedArticles) {
      const views =
        period === "all"
          ? article.views
          : (periodViewsMap.get(article.id) ?? 0);
      const existing = authorMap.get(article.authorId) ?? {
        name: article.author.name,
        articles: 0,
        views: 0,
      };
      authorMap.set(article.authorId, {
        name: article.author.name,
        articles: existing.articles + 1,
        views: existing.views + views,
      });
    }

    const authorPerformance = Array.from(authorMap.entries())
      .map(([authorId, data]) => ({ authorId, ...data }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // 6. Top & Bottom articles ─────────────────────────────────
    let topArticles: Array<{
      id: string; title: string; slug: string; views: number;
      category: string; publishedAt: Date | null; author: { name: string };
    }> = [];
    let bottomArticles: typeof topArticles = [];
    let viewsPerArticle: Array<{
      id: string; name: string; fullTitle: string; views: number; category: string;
    }> = [];

    if (period === "all") {
      const [topRaw, bottomRaw, barRaw] = await Promise.all([
        prisma.article.findMany({
          where: { status: "publish" },
          orderBy: { views: "desc" },
          take: 5,
          select: {
            id: true, title: true, slug: true, views: true,
            category: true, publishedAt: true,
            author: { select: { name: true } },
          },
        }),
        prisma.article.findMany({
          where: { status: "publish" },
          orderBy: { views: "asc" },
          take: 5,
          select: {
            id: true, title: true, slug: true, views: true,
            category: true, publishedAt: true,
            author: { select: { name: true } },
          },
        }),
        prisma.article.findMany({
          where: { status: "publish" },
          orderBy: { views: "desc" },
          take: 10,
          select: { id: true, title: true, views: true, category: true },
        }),
      ]);
      topArticles    = topRaw;
      bottomArticles = bottomRaw;
      viewsPerArticle = barRaw.map((a) => ({
        id: a.id,
        name: a.title.length > 35 ? a.title.substring(0, 35) + "…" : a.title,
        fullTitle: a.title,
        views: a.views,
        category: a.category,
      }));
    } else {
      const topIds = topPageViewsData.map((d) => d.articleId);
      if (topIds.length > 0) {
        const articleDetails = await prisma.article.findMany({
          where: { id: { in: topIds }, status: "publish" },
          select: {
            id: true, title: true, slug: true, views: true,
            category: true, publishedAt: true,
            author: { select: { name: true } },
          },
        });
        const viewsMap = new Map(
          topPageViewsData.map((d) => [d.articleId, d._count.id])
        );
        const withPeriodViews = articleDetails
          .map((a) => ({ ...a, views: viewsMap.get(a.id) ?? 0 }))
          .sort((a, b) => b.views - a.views);
        topArticles    = withPeriodViews.slice(0, 5);
        viewsPerArticle = withPeriodViews.slice(0, 10).map((a) => ({
          id: a.id,
          name: a.title.length > 35 ? a.title.substring(0, 35) + "…" : a.title,
          fullTitle: a.title,
          views: a.views,
          category: a.category,
        }));
      }

      const allPublishedIds = await prisma.article.findMany({
        where: { status: "publish" },
        select: {
          id: true, title: true, slug: true, views: true,
          category: true, publishedAt: true,
          author: { select: { name: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 50,
      });
      const bottomViewsMap = new Map(
        topPageViewsData.map((d) => [d.articleId, d._count.id])
      );
      bottomArticles = allPublishedIds
        .map((a) => ({ ...a, views: bottomViewsMap.get(a.id) ?? 0 }))
        .sort((a, b) => a.views - b.views)
        .slice(0, 5);
    }

    // 7. Growth ───────────────────────────────────────────────
    const growth =
      lastWeekPublished > 0
        ? Math.round(
            ((thisWeekPublished - lastWeekPublished) / lastWeekPublished) * 100
          )
        : thisWeekPublished > 0
        ? 100
        : 0;

    // 8. Avg time read ─────────────────────────────────────────
    const avgTimeSpentSeconds = Math.round(avgTimeData._avg.timeSpent ?? 0);
    const avgMins = Math.floor(avgTimeSpentSeconds / 60);
    const avgSecs = avgTimeSpentSeconds % 60;
    const avgTimeRead =
      avgTimeSpentSeconds > 0 ? `${avgMins}m ${avgSecs}s` : "—";
    const prevAvgSeconds = Math.round(avgTimePrevData._avg.timeSpent ?? 0);

    // 9. Total views all-time ──────────────────────────────────
    const totalViewsAgg = await prisma.article.aggregate({
      _sum: { views: true },
    });
    const totalViewsAllTime = totalViewsAgg._sum.views ?? 0;

    // 10. Views hari ini ───────────────────────────────────────
    const todayStart = new Date(
      now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0
    );
    const viewsToday = await prisma.pageView.count({
      where: { createdAt: { gte: todayStart } },
    });

    // 11. Delta ABSOLUT ────────────────────────────────────────
    const uniqueCurrent = uniqueVisitorsData.length;
    const uniquePrev    = (uniqueVisitorsPrevData as typeof uniqueVisitorsData).length;

    const deltaViews        = calcDelta(viewsInPeriod, viewsInPrevPeriod);
    const deltaUnique       = calcDelta(uniqueCurrent, uniquePrev);
    const deltaPublished    = calcDelta(publishedInPeriod, publishedInPrevPeriod);
    const deltaAvgTime      = calcDelta(avgTimeSpentSeconds, prevAvgSeconds);

    const categoryData = articlesByCategory.map((item) => ({
      name: item.category,
      value: item._count.id,
    }));

    // 12. ── ENGAGEMENT METRICS ────────────────────────────────
    const bounceRate       = totalWithScrollData > 0
      ? Math.round((bounceCount / totalWithScrollData) * 100)
      : null;
    const avgScrollDepth   = Math.round(scrollDepthAgg._avg.scrollDepth ?? 0);
    const completionRate   = totalWithScrollData > 0
      ? Math.round((completedCount / totalWithScrollData) * 100)
      : null;

    const engagementMetrics = {
      bounceRate,       // % (null jika belum ada data)
      avgScrollDepth,   // 0–100
      completionRate,   // % (null jika belum ada data)
      totalTracked: totalWithScrollData, // total sesi yang sudah ada data scroll
    };

    // 13. ── CTR & HEADLINE PERFORMANCE ───────────────────────
    // Gabungkan impressions + clicks per artikel
    const impressionMap = new Map(
      (impressionsByArticle as Array<{ articleId: string; _count: { id: number } }>)
        .map((d) => [d.articleId, d._count.id])
    );
    const clicksMap = new Map(
      topPageViewsData.map((d) => [d.articleId, d._count.id])
    );

    // Kumpulkan semua unique articleIds dari kedua sumber
    const ctrCandidateIds = [
      ...new Set([
        ...impressionsByArticle.map((d) => d.articleId),
        ...topPageViewsData.map((d) => d.articleId),
      ]),
    ].slice(0, 20);

    let ctrData: Array<{
      id: string; title: string; category: string;
      impressions: number; clicks: number; ctr: number;
    }> = [];

    if (ctrCandidateIds.length > 0) {
      const ctrArticles = await prisma.article.findMany({
        where: { id: { in: ctrCandidateIds }, status: "publish" },
        select: { id: true, title: true, category: true },
      });

      ctrData = ctrArticles
        .map((a) => {
          const impressions = impressionMap.get(a.id) ?? 0;
          const clicks      = clicksMap.get(a.id) ?? 0;
          const ctr         =
            impressions > 0
              ? Math.round((clicks / impressions) * 1000) / 10 // 1 desimal
              : 0;
          return { id: a.id, title: a.title, category: a.category, impressions, clicks, ctr };
        })
        .filter((d) => d.impressions > 0 || d.clicks > 0)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 10);
    }

    // 14. Build response ──────────────────────────────────────
    const response = NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalArticles,
          publishedArticles: publishedCount,
          draftArticles: draftCount,
          totalViewsAllTime,
          viewsToday,
          viewsInPeriod,
          uniqueVisitors: uniqueCurrent,
          avgTimeRead,
          growth,
          thisWeekPublished,
          lastWeekPublished,
          publishedInPeriod,
          delta: {
            views:             deltaViews,
            uniqueVisitors:    deltaUnique,
            publishedArticles: deltaPublished,
            avgTimeRead:       deltaAvgTime,
          },
        },
        articlesByCategory: categoryData,
        topArticles,
        bottomArticles,
        viewsPerArticle,
        trendData,
        authorPerformance,
        engagementMetrics, // ← BARU
        ctrData,           // ← BARU
      },
    });

    if (auth.newAccessToken) {
      setNewTokenCookie(response, auth.newAccessToken);
    }

    return response;
  } catch (error) {
    console.error("Statistics GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data statistik" },
      { status: 500 }
    );
  }
}