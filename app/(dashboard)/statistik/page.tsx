"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area,
} from "recharts";

// ── Tipe Periode ─────────────────────────────────────────────
type Period = "today" | "7d" | "30d" | "90d" | "12m" | "all";

const PERIOD_OPTIONS: { value: Period; label: string; short: string }[] = [
  { value: "today", label: "Hari Ini", short: "Hari Ini" },
  { value: "7d",    label: "7 Hari",   short: "7H" },
  { value: "30d",   label: "30 Hari",  short: "30H" },
  { value: "90d",   label: "3 Bulan",  short: "3B" },
  { value: "12m",   label: "12 Bulan", short: "12B" }, // ← BARU
  { value: "all",   label: "Semua",    short: "All" },
];

const PERIOD_LABELS: Record<Period, string> = {
  today: "hari ini",
  "7d":  "7 hari terakhir",
  "30d": "30 hari terakhir",
  "90d": "3 bulan terakhir",
  "12m": "12 bulan terakhir", // ← BARU
  all:   "semua waktu",
};

// ── Types ────────────────────────────────────────────────────
interface ArticleSummary {
  id: string; title: string; slug: string; views: number;
  category: string; publishedAt: string | null; author: { name: string };
}
interface ViewsPerArticle {
  id: string; name: string; fullTitle: string; views: number; category: string;
}
interface CategoryData { name: string; value: number; }
interface DeltaData {
  views: number | null; uniqueVisitors: number | null;
  publishedArticles: number | null; avgTimeRead: number | null;
}
interface StatsSummary {
  totalArticles: number; publishedArticles: number; draftArticles: number;
  totalViewsAllTime: number; viewsToday: number; viewsInPeriod: number;
  uniqueVisitors: number; avgTimeRead: string; growth: number;
  thisWeekPublished: number; lastWeekPublished: number; publishedInPeriod: number;
  delta: DeltaData;
}
interface TrendPoint { date: string; views: number; label: string; }
interface AuthorStat { authorId: string; name: string; articles: number; views: number; }

// ── BARU: CTR & Engagement ────────────────────────────────────
interface CTRItem {
  id: string; title: string; category: string;
  impressions: number; clicks: number; ctr: number;
}
interface EngagementMetrics {
  bounceRate: number | null;
  avgScrollDepth: number;
  completionRate: number | null;
  totalTracked: number;
}

interface StatisticsData {
  period: Period;
  summary: StatsSummary;
  articlesByCategory: CategoryData[];
  topArticles: ArticleSummary[];
  bottomArticles: ArticleSummary[];
  viewsPerArticle: ViewsPerArticle[];
  trendData: TrendPoint[];
  authorPerformance: AuthorStat[];
  ctrData: CTRItem[];             // ← BARU
  engagementMetrics: EngagementMetrics; // ← BARU
}

// ── Warna ────────────────────────────────────────────────────
const PIE_COLORS = [
  "#6366f1", "#22d3ee", "#f59e0b", "#10b981",
  "#f43f5e", "#a78bfa", "#fb923c", "#34d399",
];
const CARD_THEMES = [
  { bg: "from-indigo-500 to-indigo-600",   light: "bg-indigo-50",  text: "text-indigo-600",  icon: "bg-indigo-100" },
  { bg: "from-cyan-500 to-teal-500",        light: "bg-cyan-50",    text: "text-cyan-600",    icon: "bg-cyan-100" },
  { bg: "from-amber-400 to-orange-500",     light: "bg-amber-50",   text: "text-amber-600",   icon: "bg-amber-100" },
  { bg: "from-rose-500 to-pink-500",        light: "bg-rose-50",    text: "text-rose-600",    icon: "bg-rose-100" },
  { bg: "from-violet-500 to-purple-600",    light: "bg-violet-50",  text: "text-violet-600",  icon: "bg-violet-100" },
  { bg: "from-emerald-500 to-green-500",    light: "bg-emerald-50", text: "text-emerald-600", icon: "bg-emerald-100" },
  { bg: "from-sky-500 to-blue-500",         light: "bg-sky-50",     text: "text-sky-600",     icon: "bg-sky-100" },
  { bg: "from-fuchsia-500 to-pink-600",     light: "bg-fuchsia-50", text: "text-fuchsia-600", icon: "bg-fuchsia-100" },
];
const CATEGORY_BADGE_COLORS = [
  "bg-indigo-100 text-indigo-600", "bg-cyan-100 text-cyan-600",
  "bg-amber-100 text-amber-600",   "bg-emerald-100 text-emerald-600",
  "bg-rose-100 text-rose-600",     "bg-violet-100 text-violet-600",
  "bg-orange-100 text-orange-600",
];
const RANK_COLORS = [
  "bg-rose-100 text-rose-500", "bg-rose-50 text-rose-400",
  "bg-rose-50 text-rose-400",  "bg-rose-50 text-rose-300",
  "bg-rose-50 text-rose-300",
];
const AUTHOR_RANK_COLORS = [
  { badge: "bg-amber-400 text-white",       bar: "#f59e0b" },
  { badge: "bg-zinc-400 text-white",        bar: "#a1a1aa" },
  { badge: "bg-orange-400 text-white",      bar: "#fb923c" },
  { badge: "bg-indigo-100 text-indigo-600", bar: "#6366f1" },
  { badge: "bg-indigo-100 text-indigo-600", bar: "#6366f1" },
];

// ── Format delta absolut ──────────────────────────────────────
function formatDelta(delta: number | null, unit = ""): string | null {
  if (delta === null) return null;
  if (delta === 0) return "±0" + unit;
  return `${delta > 0 ? "+" : ""}${delta}${unit}`;
}
void formatDelta; // suppress unused warning

// ── Delta Badge ───────────────────────────────────────────────
function DeltaBadge({
  delta, unit = "", inverted = false, white = false,
}: {
  delta: number | null; unit?: string; inverted?: boolean; white?: boolean;
}) {
  if (delta === null) return null;
  const isNeutral  = delta === 0;
  const isPositive = inverted ? delta < 0 : delta > 0;

  if (isNeutral) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
        white ? "bg-white/20 text-white/70" : "bg-zinc-100 text-zinc-400"
      }`}>±0{unit}</span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
      white
        ? isPositive ? "bg-white/20 text-white" : "bg-black/10 text-white/70"
        : isPositive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"
    }`}>
      {isPositive ? "↑" : "↓"} {delta > 0 ? "+" : ""}{delta}{unit}
    </span>
  );
}

// ── Custom Tooltips ──────────────────────────────────────────
const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/95 backdrop-blur border border-zinc-100 rounded-xl px-4 py-2.5 shadow-xl text-sm">
        <p className="font-semibold text-zinc-800 capitalize mb-0.5">{payload[0].name}</p>
        <p className="text-indigo-500 font-bold">{payload[0].value} artikel</p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/95 backdrop-blur border border-zinc-100 rounded-xl px-4 py-2.5 shadow-xl text-sm max-w-[220px]">
        <p className="font-medium text-zinc-600 leading-tight mb-1 text-xs">{label}</p>
        <p className="text-indigo-600 font-bold">{payload[0].value.toLocaleString("id-ID")} <span className="text-zinc-400 font-normal">views</span></p>
      </div>
    );
  }
  return null;
};

const CustomTrendTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: TrendPoint }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/98 backdrop-blur border border-indigo-100 rounded-xl px-4 py-3 shadow-xl text-sm">
        <p className="font-medium text-zinc-500 text-xs mb-1">{payload[0].payload.label || label}</p>
        <p className="text-indigo-600 font-bold text-base">
          {payload[0].value.toLocaleString("id-ID")}
          <span className="text-zinc-400 font-normal text-xs ml-1">views</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomYAxisTick = (props: { x?: number; y?: number; payload?: { value: string } }) => {
  const { x = 0, y = 0, payload } = props;
  const label   = payload?.value ?? "";
  const maxChars = 22;
  const display  = label.length > maxChars ? label.slice(0, maxChars) + "…" : label;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#71717a" fontSize={10} fontFamily="inherit">{display}</text>
    </g>
  );
};

// ── Loading Skeleton ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-zinc-100 animate-pulse shadow-sm">
      <div className="h-2.5 w-20 bg-zinc-100 rounded-full mb-4" />
      <div className="h-8 w-14 bg-zinc-200 rounded-lg mb-3" />
      <div className="h-2 w-24 bg-zinc-100 rounded-full" />
    </div>
  );
}
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-36 bg-zinc-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: React.ReactNode; gradient?: string; flat?: boolean;
  flatTheme?: { light: string; text: string; icon: string };
  delta?: number | null; deltaUnit?: string; deltaInverted?: boolean;
}
function StatCard({ icon, label, value, sub, gradient, flat, flatTheme, delta, deltaUnit = "", deltaInverted }: StatCardProps) {
  if (flat && flatTheme) {
    return (
      <div className="group rounded-2xl p-5 border border-zinc-100 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default">
        <div className="flex items-start justify-between mb-3">
          <span className={`w-9 h-9 rounded-xl ${flatTheme.icon} flex items-center justify-center ${flatTheme.text}`}>{icon}</span>
          {delta !== undefined && delta !== null && (
            <DeltaBadge delta={delta} unit={deltaUnit} inverted={deltaInverted} />
          )}
        </div>
        <p className="text-2xl font-bold text-zinc-900 mb-1 tabular-nums">
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
        {sub && <div className="text-xs text-zinc-400">{sub}</div>}
      </div>
    );
  }
  return (
    <div className={`group rounded-2xl p-5 bg-gradient-to-br ${gradient} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default relative overflow-hidden`}>
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute -bottom-6 -left-2 w-16 h-16 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">{icon}</span>
          {delta !== undefined && delta !== null && (
            <DeltaBadge delta={delta} unit={deltaUnit} inverted={deltaInverted} white />
          )}
        </div>
        <p className="text-3xl font-bold text-white mb-1 tabular-nums">
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
        <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">{label}</p>
        {sub && <div className="text-xs text-white/60">{sub}</div>}
      </div>
    </div>
  );
}

// ── Article Row ──────────────────────────────────────────────
function ArticleRow({ rank, article, colorDot }: { rank: number; article: ArticleSummary; variant: "top" | "bottom"; colorDot: string }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  return (
    <div className="group flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-zinc-50 transition-all duration-200 cursor-default">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${RANK_COLORS[rank - 1] ?? RANK_COLORS[4]}`}>{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800 truncate leading-tight group-hover:text-zinc-900 transition-colors">{article.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorDot} capitalize`}>{article.category}</span>
          <span className="text-[10px] text-zinc-400">{date}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-zinc-900 tabular-nums">{article.views.toLocaleString("id-ID")}</p>
        <p className="text-[10px] text-zinc-400">views</p>
      </div>
    </div>
  );
}

// ── Pie Legend ───────────────────────────────────────────────
function PieLegend({ data, total }: { data: CategoryData[]; total: number }) {
  return (
    <div className="space-y-2 mt-1">
      {data.map((item, i) => (
        <div key={item.name} className="group flex items-center gap-2.5 hover:bg-zinc-50 rounded-lg px-2 py-1 -mx-2 transition-colors cursor-default">
          <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
          <span className="text-xs text-zinc-600 capitalize flex-1 truncate group-hover:text-zinc-900 transition-colors font-medium">{item.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-zinc-800">{item.value}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${CATEGORY_BADGE_COLORS[i % CATEGORY_BADGE_COLORS.length]}`}>
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Custom Gradient Bar ───────────────────────────────────────
const GradientBar = (props: { x?: number; y?: number; width?: number; height?: number; index?: number }) => {
  const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
  const colors = ["#6366f1","#22d3ee","#f59e0b","#10b981","#f43f5e","#a78bfa","#fb923c","#34d399","#6366f1","#22d3ee"];
  const color  = colors[index % colors.length];
  return (
    <g>
      <defs>
        <linearGradient id={`bar-grad-${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={1} />
        </linearGradient>
      </defs>
      <rect x={x} y={y + height * 0.1} width={width} height={height * 0.8} fill={`url(#bar-grad-${index})`} rx={5} />
    </g>
  );
};

// ── Period Selector ───────────────────────────────────────────
function PeriodSelector({ value, onChange, loading }: { value: Period; onChange: (p: Period) => void; loading: boolean }) {
  return (
    <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          disabled={loading}
          className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 ${
            value === opt.value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <span className="hidden sm:inline">{opt.label}</span>
          <span className="sm:hidden">{opt.short}</span>
        </button>
      ))}
    </div>
  );
}

// ── Trend Pill ────────────────────────────────────────────────
function TrendPill({ delta, label, unit = "" }: { delta: number | null; label: string; unit?: string }) {
  if (delta === null) return null;
  return (
    <div className="flex items-center gap-1.5">
      <DeltaBadge delta={delta} unit={unit} />
      <span className="text-[10px] text-zinc-400">vs {label}</span>
    </div>
  );
}

// ── Author Row ────────────────────────────────────────────────
function AuthorRow({ rank, author, maxViews }: { rank: number; author: AuthorStat; maxViews: number }) {
  const pct       = maxViews > 0 ? Math.round((author.views / maxViews) * 100) : 0;
  const rankTheme = AUTHOR_RANK_COLORS[rank - 1] ?? AUTHOR_RANK_COLORS[4];
  const initials  = author.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="group flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-zinc-50 transition-all duration-200 cursor-default">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${RANK_COLORS[rank - 1] ?? "bg-zinc-100 text-zinc-400"}`}>{rank}</span>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: rankTheme.bar }}>{initials}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 truncate leading-tight">{author.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 bg-zinc-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: rankTheme.bar, opacity: 0.8 }} />
          </div>
          <span className="text-[10px] text-zinc-400 shrink-0">{pct}%</span>
        </div>
      </div>
      <div className="text-right shrink-0 space-y-0.5">
        <p className="text-sm font-bold text-zinc-900 tabular-nums">{author.views.toLocaleString("id-ID")}</p>
        <p className="text-[10px] text-zinc-400">{author.articles} artikel</p>
      </div>
    </div>
  );
}

// ── ── ── ── ── BARU: CTR Row ── ── ── ── ── ── ── ── ── ── ──
function CTRRow({ rank, item }: { rank: number; item: CTRItem }) {
  // Kategorisasi CTR
  const ctrColor =
    item.ctr >= 10 ? "text-emerald-600 bg-emerald-50" :
    item.ctr >= 5  ? "text-sky-600 bg-sky-50" :
    item.ctr >= 2  ? "text-amber-600 bg-amber-50" :
    "text-rose-500 bg-rose-50";

  const ctrLabel =
    item.ctr >= 10 ? "Luar biasa" :
    item.ctr >= 5  ? "Bagus" :
    item.ctr >= 2  ? "Cukup" :
    "Perlu dioptimasi";

  const catColor = CATEGORY_BADGE_COLORS[rank % CATEGORY_BADGE_COLORS.length];

  return (
    <div className="group flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-zinc-50 transition-all duration-200 cursor-default">
      {/* Rank */}
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${RANK_COLORS[rank - 1] ?? "bg-zinc-100 text-zinc-400"}`}>
        {rank}
      </span>

      {/* Title & category */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-800 truncate leading-tight group-hover:text-zinc-900">{item.title}</p>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${catColor} capitalize mt-1 inline-block`}>{item.category}</span>
      </div>

      {/* Impressions */}
      <div className="text-center shrink-0 w-16">
        <p className="text-xs font-bold text-zinc-700 tabular-nums">{item.impressions.toLocaleString("id-ID")}</p>
        <p className="text-[9px] text-zinc-400">impresi</p>
      </div>

      {/* Clicks */}
      <div className="text-center shrink-0 w-14">
        <p className="text-xs font-bold text-indigo-600 tabular-nums">{item.clicks.toLocaleString("id-ID")}</p>
        <p className="text-[9px] text-zinc-400">klik</p>
      </div>

      {/* CTR */}
      <div className="shrink-0 w-20 text-right">
        <span className={`inline-flex flex-col items-end`}>
          <span className={`text-sm font-bold tabular-nums ${item.ctr >= 5 ? "text-emerald-600" : item.ctr >= 2 ? "text-amber-600" : "text-rose-500"}`}>
            {item.ctr.toFixed(1)}%
          </span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${ctrColor}`}>
            {ctrLabel}
          </span>
        </span>
      </div>
    </div>
  );
}

// ── ── ── BARU: Engagement Metric Card ── ── ── ── ── ── ── ── ──
function EngagementCard({
  label, value, subtitle, color, icon, helpText,
}: {
  label: string; value: string; subtitle: string;
  color: string; icon: React.ReactNode; helpText?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-zinc-900 tabular-nums mb-0.5">{value}</p>
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
      <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
      {helpText && (
        <p className="text-[10px] text-zinc-400 mt-2 border-t border-zinc-50 pt-2">{helpText}</p>
      )}
    </div>
  );
}

// ── CTR Progress Bar untuk artikel tertentu ───────────────────
function CTRMiniBar({ ctr, max }: { ctr: number; max: number }) {
  const pct   = max > 0 ? (ctr / max) * 100 : 0;
  const color =
    ctr >= 10 ? "#10b981" :
    ctr >= 5  ? "#0ea5e9" :
    ctr >= 2  ? "#f59e0b" :
    "#f43f5e";
  return (
    <div className="w-full bg-zinc-100 rounded-full h-1 mt-1">
      <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}
void CTRMiniBar; // suppress unused

// ── Main Page ────────────────────────────────────────────────
export default function StatistikPage() {
  const [data, setData]         = useState<StatisticsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [period, setPeriod]             = useState<Period>("all");
  const [periodChanging, setPeriodChanging] = useState(false);

  const fetchStats = useCallback(
    async (opts: { isRefresh?: boolean; newPeriod?: Period } = {}) => {
      const { isRefresh = false, newPeriod } = opts;
      const activePeriod = newPeriod ?? period;

      if (isRefresh) setRefreshing(true);
      else if (newPeriod) setPeriodChanging(true);

      try {
        const res = await fetch(`/api/statistics?period=${activePeriod}`, { credentials: "include" });
        if (!res.ok) throw new Error("Gagal mengambil data statistik");
        const json = await res.json();
        if (json.success) { setData(json.data); setError(null); }
        else setError(json.message || "Terjadi kesalahan");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setPeriodChanging(false);
      }
    },
    [period]
  );

  useEffect(() => { fetchStats(); }, []); // eslint-disable-line

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    fetchStats({ newPeriod });
  };

  const isTransitioning = periodChanging || refreshing;

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-sm text-zinc-500">{error}</p>
        <button onClick={() => fetchStats()} className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">Coba lagi →</button>
      </div>
    );
  }
  if (!data) return null;

  const {
    summary, articlesByCategory = [], topArticles = [], bottomArticles = [],
    viewsPerArticle = [], trendData = [], authorPerformance = [],
    ctrData = [], engagementMetrics,
  } = data;

  const growthPositive = summary.growth >= 0;
  const isAllTime      = period === "all";

  const prevLabel: Record<Period, string> = {
    today: "kemarin",
    "7d":  "7h sebelumnya",
    "30d": "30h sebelumnya",
    "90d": "3bln sebelumnya",
    "12m": "12bln sebelumnya",
    all:   "",
  };

  const maxTrendViews = Math.max(...trendData.map((d) => d.views), 1);
  const avgTrendViews = Math.round(trendData.reduce((s, d) => s + d.views, 0) / (trendData.length || 1));

  const trendXInterval = period === "today" ? 3 : period === "7d" ? 1 : period === "30d" ? 4 : period === "90d" ? 2 : 2;

  const trendSubtitle =
    isAllTime         ? "12 bulan terakhir · per bulan" :
    period === "today" ? "Hari ini · per jam" :
    period === "90d"   ? "3 bulan terakhir · per minggu" :
    period === "12m"   ? "12 bulan terakhir · per bulan" : // ← BARU
    `${PERIOD_LABELS[period]} · per hari`;

  // ── Row 1: Gradient Cards ─────────────────────────────────
  const row1Cards = [
    {
      label: "Total Artikel", value: summary.totalArticles, gradient: CARD_THEMES[0].bg,
      sub: `${summary.publishedArticles} publish · ${summary.draftArticles} draft`,
      delta: null, deltaUnit: "",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      label: isAllTime ? "Artikel Publish" : "Publish di Periode",
      value: isAllTime ? summary.publishedArticles : summary.publishedInPeriod,
      gradient: CARD_THEMES[1].bg,
      sub: isAllTime ? `${articlesByCategory.length} kategori aktif` : `dari ${summary.publishedArticles} total artikel`,
      delta: isAllTime ? null : summary.delta.publishedArticles, deltaUnit: " artikel",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Artikel Draft", value: summary.draftArticles, gradient: CARD_THEMES[2].bg,
      sub: "Menunggu publish", delta: null, deltaUnit: "",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
    {
      label: "Growth Minggu Ini", value: `${growthPositive ? "+" : ""}${summary.growth}%`,
      gradient: growthPositive ? CARD_THEMES[3].bg : "from-zinc-500 to-zinc-700",
      sub: `${summary.thisWeekPublished} artikel vs ${summary.lastWeekPublished} minggu lalu`,
      delta: null, deltaUnit: "",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
  ];

  // ── Row 2: Flat Cards ─────────────────────────────────────
  const row2Cards = [
    {
      label: isAllTime ? "Total Views" : "Views di Periode",
      value: isAllTime ? summary.totalViewsAllTime : summary.viewsInPeriod,
      sub: isAllTime ? "All time" : PERIOD_LABELS[period],
      theme: CARD_THEMES[4], delta: isAllTime ? null : summary.delta.views, deltaUnit: " views",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    },
    {
      label: "Views Hari Ini", value: summary.viewsToday, sub: "Sejak 00:00 hari ini",
      theme: CARD_THEMES[5], delta: null, deltaUnit: "",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      label: isAllTime ? "Unique Visitors" : "Visitor Unik",
      value: summary.uniqueVisitors, sub: PERIOD_LABELS[period],
      theme: CARD_THEMES[6], delta: isAllTime ? null : summary.delta.uniqueVisitors, deltaUnit: " visitor",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      label: "Avg. Waktu Baca", value: summary.avgTimeRead, sub: PERIOD_LABELS[period],
      theme: CARD_THEMES[7], delta: isAllTime ? null : summary.delta.avgTimeRead, deltaUnit: "s",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ];

  const pieTotal = isAllTime ? summary.publishedArticles : summary.publishedInPeriod;
  const hasEngagementData = (engagementMetrics?.totalTracked ?? 0) > 0;
  const maxCTR = ctrData.length > 0 ? Math.max(...ctrData.map((d) => d.ctr)) : 1;
  void maxCTR;

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isTransitioning ? "opacity-60" : "opacity-100"}`}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Statistik</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Ringkasan performa portal berita NarasiKota
            {!isAllTime && <span className="ml-1 text-indigo-500 font-medium">· {PERIOD_LABELS[period]}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodSelector value={period} onChange={handlePeriodChange} loading={isTransitioning} />
          <button
            onClick={() => fetchStats({ isRefresh: true })}
            disabled={isTransitioning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── Delta info bar ──────────────────────────────────── */}
      {!isAllTime && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
          <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-indigo-600 font-medium">
            Data untuk <span className="font-bold">{PERIOD_LABELS[period]}</span>
            {" · "}Badge = <span className="font-bold">perubahan absolut</span> vs periode sebelumnya
          </p>
        </div>
      )}

      {/* ── Row 1: Gradient Cards ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {row1Cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} gradient={card.gradient}
            sub={card.sub} icon={card.icon} delta={card.delta} deltaUnit={card.deltaUnit} />
        ))}
      </div>

      {/* ── Row 2: Flat Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {row2Cards.map((card) => (
          <StatCard
            key={card.label} label={card.label} value={card.value} flat flatTheme={card.theme}
            sub={
              !isAllTime && card.delta !== null && card.delta !== undefined
                ? <TrendPill delta={card.delta} label={prevLabel[period]} unit={card.deltaUnit} />
                : card.sub
            }
            icon={card.icon} delta={card.delta} deltaUnit={card.deltaUnit}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          ── D. ENGAGEMENT METRICS ─────────────────────────────
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">📊 Engagement Metrics</h2>
            <p className="text-xs text-zinc-700 mt-0.5">
              Seberapa dalam pembaca berinteraksi dengan artikel
              {!isAllTime && <span className="text-indigo-500 font-medium"> · {PERIOD_LABELS[period]}</span>}
            </p>
          </div>
          {hasEngagementData && (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg">
              {engagementMetrics.totalTracked.toLocaleString("id-ID")} sesi
            </span>
          )}
        </div>

        {!hasEngagementData ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-zinc-700">Data belum tersedia</p>
              <p className="text-[10px] text-zinc-700 mt-1">
                Engagement tracking aktif setelah pengunjung membaca artikel. Data akan muncul setelah sesi pertama selesai.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bounce Rate */}
            <EngagementCard
              label="Bounce Rate"
              value={engagementMetrics.bounceRate !== null ? `${engagementMetrics.bounceRate}%` : "—"}
              subtitle={
                engagementMetrics.bounceRate !== null
                  ? engagementMetrics.bounceRate < 30
                    ? "👍 Sangat baik — pembaca engage"
                    : engagementMetrics.bounceRate < 50
                    ? "📌 Normal untuk portal berita"
                    : "⚠️ Tinggi — cek kualitas konten"
                  : "Belum ada data"
              }
              color="bg-rose-50 text-rose-500"
              helpText="% pembaca yang keluar < 15 detik tanpa interaksi"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              }
            />

            {/* Avg Scroll Depth */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-bold text-zinc-900 tabular-nums mb-0.5">
                {engagementMetrics.avgScrollDepth}%
              </p>
              {/* Progress bar scroll depth */}
              <div className="w-full bg-zinc-100 rounded-full h-2 my-2">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${engagementMetrics.avgScrollDepth}%`,
                    background: engagementMetrics.avgScrollDepth >= 70
                      ? "linear-gradient(to right, #10b981, #34d399)"
                      : engagementMetrics.avgScrollDepth >= 40
                      ? "linear-gradient(to right, #0ea5e9, #38bdf8)"
                      : "linear-gradient(to right, #f59e0b, #fcd34d)",
                  }}
                />
              </div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Avg. Scroll Depth</p>
              <p className="text-xs text-zinc-700 mt-1">
                {engagementMetrics.avgScrollDepth >= 70
                  ? "🔥 Artikel dibaca hampir tuntas"
                  : engagementMetrics.avgScrollDepth >= 40
                  ? "📖 Pembaca membaca separuh artikel"
                  : "📌 Pembaca hanya membaca bagian atas"}
              </p>
              <p className="text-[10px] text-zinc-400 mt-2 border-t border-zinc-50 pt-2">Rata-rata persentase halaman yang di-scroll</p>
            </div>

            {/* Completion Rate */}
            <EngagementCard
              label="Completion Rate"
              value={engagementMetrics.completionRate !== null ? `${engagementMetrics.completionRate}%` : "—"}
              subtitle={
                engagementMetrics.completionRate !== null
                  ? engagementMetrics.completionRate >= 30
                    ? "🏆 Konten sangat engaging!"
                    : engagementMetrics.completionRate >= 15
                    ? "✅ Di atas rata-rata industri"
                    : "📝 Pertimbangkan pemendekan artikel"
                  : "Belum ada data"
              }
              color="bg-emerald-50 text-emerald-600"
              helpText="% pembaca yang scroll hingga ≥ 90% artikel"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Engagement footer note */}
        {hasEngagementData && (
          <div className="mt-4 pt-4 border-t border-zinc-50 flex items-start gap-2">
            <svg className="w-3 h-3 text-zinc-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[10px] text-zinc-700">
              Engagement dihitung dari sesi pembaca yang sudah selesai (minimal 3 detik). Bounce Rate &lt;40% dan Completion Rate &gt;15% adalah target umum untuk portal berita.
            </p>
          </div>
        )}
      </div>

      {/* ── TREND LINE CHART ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">📈 Tren Views</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{trendSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-50 rounded-xl">
              <div className="text-center">
                <p className="text-[10px] text-zinc-400 font-medium">Puncak</p>
                <p className="text-xs font-bold text-indigo-600">{maxTrendViews.toLocaleString("id-ID")}</p>
              </div>
              <div className="w-px h-6 bg-zinc-200" />
              <div className="text-center">
                <p className="text-[10px] text-zinc-400 font-medium">Rata-rata</p>
                <p className="text-xs font-bold text-zinc-700">{avgTrendViews.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg">{trendData.length} titik</span>
          </div>
        </div>

        {trendData.every((d) => d.views === 0) ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-300 gap-2">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
            <p className="text-xs text-zinc-400">{isAllTime ? "Belum ada data views" : `Tidak ada views di ${PERIOD_LABELS[period]}`}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} interval={trendXInterval} />
              <YAxis tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} allowDecimals={false} />
              {avgTrendViews > 0 && (
                <ReferenceLine y={avgTrendViews} stroke="#a1a1aa" strokeDasharray="4 4" strokeWidth={1}
                  label={{ value: `avg: ${avgTrendViews}`, position: "insideTopRight", fontSize: 9, fill: "#a1a1aa" }}
                />
              )}
              <Tooltip content={<CustomTrendTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} fill="url(#trend-gradient)" dot={false}
                activeDot={{ r: 5, fill: "#6366f1", stroke: "white", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          ── C. CTR & HEADLINE PERFORMANCE ────────────────────
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">🎯 CTR & Headline Performance</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Seberapa efektif judul artikel menarik klik dari feed
              {!isAllTime && <span className="text-indigo-500 font-medium"> · {PERIOD_LABELS[period]}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-zinc-500 font-medium">CTR ≥10% luar biasa</span>
            </div>
            <span className="px-2.5 py-1 bg-violet-50 text-violet-600 text-xs font-semibold rounded-lg">
              {ctrData.length} artikel
            </span>
          </div>
        </div>

        {ctrData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-zinc-500">Belum ada data CTR</p>
              <p className="text-[10px] text-zinc-400 mt-1">
                Data CTR muncul setelah artikel-artikel tampil di feed pembaca (impression tracking aktif).
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Legend header */}
            <div className="flex items-center gap-3 pb-2 border-b border-zinc-50 mb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              <div className="w-6 shrink-0" />
              <div className="flex-1">Artikel</div>
              <div className="w-16 text-center shrink-0">Impresi</div>
              <div className="w-14 text-center shrink-0">Klik</div>
              <div className="w-20 text-right shrink-0">CTR</div>
            </div>

            {ctrData.map((item, i) => (
              <CTRRow key={item.id} rank={i + 1} item={item} />
            ))}

            {/* CTR scale legend */}
            <div className="mt-5 pt-4 border-t border-zinc-50 flex flex-wrap items-center gap-3">
              <span className="text-[10px] text-zinc-400 font-medium">Skala CTR:</span>
              {[
                { color: "bg-rose-400",   label: "< 2% — Rendah" },
                { color: "bg-amber-400",  label: "2–5% — Cukup" },
                { color: "bg-sky-400",    label: "5–10% — Bagus" },
                { color: "bg-emerald-400", label: "≥ 10% — Luar biasa" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-[10px] text-zinc-500">{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTR explanation */}
            <div className="mt-3 flex items-start gap-2">
              <svg className="w-3 h-3 text-zinc-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[10px] text-zinc-400">
                <strong>CTR = Klik ÷ Impresi × 100%.</strong> Artikel dengan impresi tinggi tapi CTR rendah = judul kurang menarik. Impresi kecil tapi CTR tinggi = judul bagus, perlu lebih banyak exposure.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Artikel per Kategori</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{pieTotal} artikel {isAllTime ? "publish" : `di ${PERIOD_LABELS[period]}`}</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg">{articlesByCategory.length} kategori</span>
          </div>
          {articlesByCategory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-300 gap-2">
              <p className="text-xs text-zinc-400">{isAllTime ? "Belum ada data kategori" : `Tidak ada artikel di ${PERIOD_LABELS[period]}`}</p>
            </div>
          ) : (
            <div className="flex gap-6 items-center">
              <div className="shrink-0">
                <PieChart width={160} height={160}>
                  <Pie data={articlesByCategory} cx={75} cy={75} innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {articlesByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </div>
              <div className="flex-1 min-w-0">
                <PieLegend data={articlesByCategory} total={pieTotal} />
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Views per Artikel</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Top 10 · {isAllTime ? "all time" : PERIOD_LABELS[period]}</p>
            </div>
            <span className="px-2.5 py-1 bg-cyan-50 text-cyan-600 text-xs font-semibold rounded-lg">Top 10</span>
          </div>
          {viewsPerArticle.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-300 gap-2">
              <p className="text-xs text-zinc-400">{isAllTime ? "Belum ada data views" : `Tidak ada views di ${PERIOD_LABELS[period]}`}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={viewsPerArticle} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={<CustomYAxisTick />} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f8f8ff", radius: 8 }} />
                <Bar dataKey="views" shape={<GradientBar />} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Article Tables ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">🔥 Top Artikel</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Paling banyak dibaca {isAllTime ? "" : `· ${PERIOD_LABELS[period]}`}</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-lg">Top 5</span>
          </div>
          {topArticles.length === 0 ? (
            <p className="text-xs text-zinc-400 py-8 text-center">{isAllTime ? "Belum ada artikel" : `Tidak ada views di ${PERIOD_LABELS[period]}`}</p>
          ) : (
            topArticles.map((article, i) => (
              <ArticleRow key={article.id} rank={i + 1} article={article} variant="top" colorDot={CATEGORY_BADGE_COLORS[i % CATEGORY_BADGE_COLORS.length]} />
            ))
          )}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">📉 Performa Terendah</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Perlu perhatian lebih {isAllTime ? "" : `· ${PERIOD_LABELS[period]}`}</p>
            </div>
            <span className="px-2.5 py-1 bg-rose-50 text-rose-500 text-xs font-semibold rounded-lg">Low Views</span>
          </div>
          {bottomArticles.length === 0 ? (
            <p className="text-xs text-zinc-400 py-8 text-center">{isAllTime ? "Belum ada artikel" : `Tidak ada data di ${PERIOD_LABELS[period]}`}</p>
          ) : (
            bottomArticles.map((article, i) => (
              <ArticleRow key={article.id} rank={i + 1} article={article} variant="bottom" colorDot={CATEGORY_BADGE_COLORS[i % CATEGORY_BADGE_COLORS.length]} />
            ))
          )}
        </div>
      </div>

      {/* ── AUTHOR PERFORMANCE ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">✍️ Performa Penulis</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ranking jurnalis & kontributor berdasarkan views
              {!isAllTime && <span className="text-indigo-500 font-medium"> · {PERIOD_LABELS[period]}</span>}
            </p>
          </div>
          <span className="px-2.5 py-1 bg-violet-50 text-violet-600 text-xs font-semibold rounded-lg">{authorPerformance.length} penulis</span>
        </div>

        {authorPerformance.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-zinc-300 gap-2">
            <p className="text-xs text-zinc-400">Belum ada data penulis</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <div>
              {authorPerformance.slice(0, Math.ceil(authorPerformance.length / 2)).map((author, i) => (
                <AuthorRow key={author.authorId} rank={i + 1} author={author} maxViews={authorPerformance[0]?.views || 1} />
              ))}
            </div>
            {authorPerformance.length > 1 && (
              <div>
                {authorPerformance.slice(Math.ceil(authorPerformance.length / 2)).map((author, i) => (
                  <AuthorRow key={author.authorId} rank={Math.ceil(authorPerformance.length / 2) + i + 1} author={author} maxViews={authorPerformance[0]?.views || 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {authorPerformance.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center gap-2">
            <svg className="w-3 h-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[10px] text-zinc-400">
              Progress bar menunjukkan proporsi views relatif terhadap penulis teratas{!isAllTime && ` · data ${PERIOD_LABELS[period]}`}
            </p>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-[11px] text-zinc-400">
          Data diperbarui secara real-time · Engagement & CTR aktif setelah PageView + Impression tracking terpasang
        </p>
      </div>
    </div>
  );
}