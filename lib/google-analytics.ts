// src/lib/google-analytics.ts
//
// ── GA4 DATA API CLIENT ──────────────────────────────────────
// Mengambil data dari Google Analytics 4 untuk digunakan di
// halaman statistik NarasiKota.
//
// Metrics yang diambil:
//   - Tren Views        → screenPageViews by date
//   - Engagement        → bounceRate, avgScrollDepth (custom event), completionRate
//   - CTR per artikel   → article_impression + article_click custom events
//   - Unique Visitors   → activeUsers / newUsers

import { BetaAnalyticsDataClient } from "@google-analytics/data";

// ── Inisialisasi Client ───────────────────────────────────────
function getGA4Client(): BetaAnalyticsDataClient {
  // Production: gunakan GOOGLE_APPLICATION_CREDENTIALS (path ke JSON file)
  // atau GOOGLE_SERVICE_ACCOUNT_JSON (JSON string dari env var)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new BetaAnalyticsDataClient();
  }

  // Local development: parse JSON dari environment variable
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON atau GOOGLE_APPLICATION_CREDENTIALS harus di-set"
    );
  }

  const credentials = JSON.parse(serviceAccountJson);
  return new BetaAnalyticsDataClient({ credentials });
}

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || "";

// ── Helper: konversi date ke format GA4 (YYYY-MM-DD) ─────────
function formatGA4Date(date: Date): string {
  return date.toISOString().split("T")[0];
}

// ── Helper: hitung startDate & endDate berdasarkan period ─────
export function getPeriodDateRange(
  period: "today" | "7d" | "30d" | "90d" | "12m" | "all"
): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = formatGA4Date(now);

  if (period === "today") {
    return { startDate: "today", endDate: "today" };
  }
  if (period === "7d") {
    return { startDate: "7daysAgo", endDate: "today" };
  }
  if (period === "30d") {
    return { startDate: "30daysAgo", endDate: "today" };
  }
  if (period === "90d") {
    return { startDate: "90daysAgo", endDate: "today" };
  }
  if (period === "12m") {
    const start = new Date(now);
    start.setFullYear(start.getFullYear() - 1);
    return { startDate: formatGA4Date(start), endDate };
  }
  // "all" → ambil 12 bulan terakhir (GA4 tidak menyimpan data tanpa batas)
  const start = new Date(now);
  start.setFullYear(start.getFullYear() - 1);
  return { startDate: formatGA4Date(start), endDate };
}

// ══════════════════════════════════════════════════════════════
// 1. TREN VIEWS ────────────────────────────────────────────────
// Mengambil jumlah pageviews per hari/minggu/bulan dari GA4
// ══════════════════════════════════════════════════════════════
export interface GA4TrendPoint {
  date: string;   // format: YYYYMMDD (dari GA4) atau YYYYMM untuk monthly
  views: number;
  label: string;  // label tampilan: "15 Mar", "Jan '25", dll
}

export async function getGA4TrendData(
  period: "today" | "7d" | "30d" | "90d" | "12m" | "all"
): Promise<GA4TrendPoint[]> {
  const client = getGA4Client();
  const { startDate, endDate } = getPeriodDateRange(period);

  // Pilih dimensi berdasarkan period
  const dateDimension =
    period === "today"
      ? "hour"
      : period === "12m" || period === "all"
      ? "yearMonth"
      : period === "90d"
      ? "isoWeek"
      : "date";

  const [response] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: dateDimension }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [
      { dimension: { dimensionName: dateDimension }, desc: false },
    ],
  });

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Ags", "Sep", "Okt", "Nov", "Des",
  ];

  const formatLabel = (raw: string): string => {
    if (period === "today") {
      return `${raw.padStart(2, "0")}:00`;
    }
    if (period === "12m" || period === "all") {
      // format: YYYYMM
      const year = raw.slice(0, 4);
      const month = parseInt(raw.slice(4, 6)) - 1;
      return `${monthNames[month]} '${year.slice(2)}`;
    }
    if (period === "90d") {
      // isoWeek: YYYYWNN
      return `W${raw.slice(-2)}`;
    }
    // format: YYYYMMDD
    const d = new Date(
      parseInt(raw.slice(0, 4)),
      parseInt(raw.slice(4, 6)) - 1,
      parseInt(raw.slice(6, 8))
    );
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (response.rows || []).map((row) => {
    const raw = row.dimensionValues?.[0]?.value || "";
    return {
      date: raw,
      views: parseInt(row.metricValues?.[0]?.value || "0"),
      label: formatLabel(raw),
    };
  });
}

// ══════════════════════════════════════════════════════════════
// 2. ENGAGEMENT METRICS ────────────────────────────────────────
// Bounce Rate, Avg Session Duration, Engaged Sessions
// Scroll Depth & Completion Rate → dari custom GA4 events
// ══════════════════════════════════════════════════════════════
export interface GA4EngagementMetrics {
  bounceRate: number | null;          // 0–100
  avgScrollDepth: number;             // 0–100 (dari custom event)
  completionRate: number | null;      // 0–100 (dari custom event)
  avgSessionDuration: number;         // detik
  totalSessions: number;
  totalTracked: number;
}

export async function getGA4EngagementMetrics(
  period: "today" | "7d" | "30d" | "90d" | "12m" | "all"
): Promise<GA4EngagementMetrics> {
  const client = getGA4Client();
  const { startDate, endDate } = getPeriodDateRange(period);

  // Query 1: metrics standar GA4
  const [standardResponse] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
      { name: "sessions" },
      { name: "engagedSessions" },
    ],
  });

  // Query 2: custom event "scroll_depth" — dikirim dari frontend
  // event param: scroll_percentage (0–100)
  const [scrollResponse] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "customEvent:scroll_percentage" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        stringFilter: { value: "scroll_depth_custom", matchType: "EXACT" },
      },
    },
  });

  // Query 3: custom event "article_completed" — dikirim dari frontend
  const [completionResponse] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        stringFilter: { value: "article_completed", matchType: "EXACT" },
      },
    },
  });

  const stdRow = standardResponse.rows?.[0];
  const rawBounceRate = parseFloat(stdRow?.metricValues?.[0]?.value || "0");
  const avgSessionDuration = parseFloat(
    stdRow?.metricValues?.[1]?.value || "0"
  );
  const totalSessions = parseInt(stdRow?.metricValues?.[2]?.value || "0");

  // Hitung avg scroll depth dari custom events
  let totalScrollWeight = 0;
  let totalScrollEvents = 0;
  for (const row of scrollResponse.rows || []) {
    const pct = parseInt(row.dimensionValues?.[0]?.value || "0");
    const count = parseInt(row.metricValues?.[0]?.value || "0");
    totalScrollWeight += pct * count;
    totalScrollEvents += count;
  }
  const avgScrollDepth =
    totalScrollEvents > 0
      ? Math.round(totalScrollWeight / totalScrollEvents)
      : 0;

  // Completion count dari custom event
  const completedCount = parseInt(
    completionResponse.rows?.[0]?.metricValues?.[0]?.value || "0"
  );

  const completionRate =
    totalSessions > 0
      ? Math.round((completedCount / totalSessions) * 100)
      : null;

  return {
    bounceRate:
      rawBounceRate > 0
        ? Math.round(rawBounceRate * 100)
        : null,
    avgScrollDepth,
    completionRate,
    avgSessionDuration,
    totalSessions,
    totalTracked: totalSessions,
  };
}

// ══════════════════════════════════════════════════════════════
// 3. CTR PER ARTIKEL ───────────────────────────────────────────
// Impressions = custom event "article_impression" (dikirim dari feed/list)
// Clicks      = screenPageViews per pagePath
// ══════════════════════════════════════════════════════════════
export interface GA4CTRItem {
  pagePath: string;
  pageTitle: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export async function getGA4CTRData(
  period: "today" | "7d" | "30d" | "90d" | "12m" | "all"
): Promise<GA4CTRItem[]> {
  const client = getGA4Client();
  const { startDate, endDate } = getPeriodDateRange(period);

  // Query 1: Klik (pageviews) per halaman artikel
  const [clicksResponse] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: "pagePath" },
      { name: "pageTitle" },
    ],
    metrics: [{ name: "screenPageViews" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: {
          // Filter hanya halaman artikel (sesuaikan pattern dengan URL kamu)
          value: "/artikel/",
          matchType: "CONTAINS",
        },
      },
    },
    orderBys: [
      { metric: { metricName: "screenPageViews" }, desc: true },
    ],
    limit: 20,
  });

  // Query 2: Impressions dari custom event "article_impression"
  // event param: article_path (slug/path artikel)
  const [impressionResponse] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "customEvent:article_path" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        stringFilter: { value: "article_impression", matchType: "EXACT" },
      },
    },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 20,
  });

  // Build maps
  const impressionMap = new Map<string, number>();
  for (const row of impressionResponse.rows || []) {
    const path = row.dimensionValues?.[0]?.value || "";
    const count = parseInt(row.metricValues?.[0]?.value || "0");
    impressionMap.set(path, count);
  }

  const clicksMap = new Map<string, { title: string; clicks: number }>();
  for (const row of clicksResponse.rows || []) {
    const path = row.dimensionValues?.[0]?.value || "";
    const title = row.dimensionValues?.[1]?.value || "";
    const views = parseInt(row.metricValues?.[0]?.value || "0");
    clicksMap.set(path, { title, clicks: views });
  }

  // Gabungkan: semua path yang punya impressions ATAU clicks
  const allPaths = new Set([
    ...impressionMap.keys(),
    ...clicksMap.keys(),
  ]);

  const result: GA4CTRItem[] = [];
  for (const path of allPaths) {
    const impressions = impressionMap.get(path) ?? 0;
    const clickData = clicksMap.get(path);
    const clicks = clickData?.clicks ?? 0;
    const title = clickData?.title || path;

    if (impressions === 0 && clicks === 0) continue;

    const ctr =
      impressions > 0
        ? Math.round((clicks / impressions) * 1000) / 10
        : 0;

    result.push({ pagePath: path, pageTitle: title, impressions, clicks, ctr });
  }

  return result
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);
}

// ══════════════════════════════════════════════════════════════
// 4. UNIQUE VISITORS & PAGE VIEWS SUMMARY ─────────────────────
// ══════════════════════════════════════════════════════════════
export interface GA4SummaryMetrics {
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number; // detik
}

export async function getGA4Summary(
  period: "today" | "7d" | "30d" | "90d" | "12m" | "all"
): Promise<GA4SummaryMetrics> {
  const client = getGA4Client();
  const { startDate, endDate } = getPeriodDateRange(period);

  const [response] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "screenPageViews" },
      { name: "activeUsers" },
      { name: "userEngagementDuration" },
      { name: "sessions" },
    ],
  });

  const row = response.rows?.[0];
  const totalViews = parseInt(row?.metricValues?.[0]?.value || "0");
  const uniqueVisitors = parseInt(row?.metricValues?.[1]?.value || "0");
  const totalEngagementDuration = parseFloat(
    row?.metricValues?.[2]?.value || "0"
  );
  const sessions = parseInt(row?.metricValues?.[3]?.value || "1");

  return {
    totalViews,
    uniqueVisitors,
    avgTimeOnPage: sessions > 0 ? Math.round(totalEngagementDuration / sessions) : 0,
  };
}