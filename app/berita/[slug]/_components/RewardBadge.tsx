/* eslint-disable react-hooks/set-state-in-effect */
// app/berita/[slug]/_components/RewardBadge.tsx
"use client";

import { useState, useEffect } from "react";

const TIERS = [
  {
    id: "master",
    label: "Master Narasi",
    icon: "💎",
    minLikes: 500,
    badgeBg: "bg-gradient-to-r from-violet-600 to-purple-600",
    textColor: "text-violet-700",
    lightBg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    id: "bintang",
    label: "Jurnalis Bintang",
    icon: "🏆",
    minLikes: 200,
    badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-500",
    textColor: "text-amber-700",
    lightBg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    id: "pilihan",
    label: "Kontributor Pilihan",
    icon: "⭐",
    minLikes: 50,
    badgeBg: "bg-gradient-to-r from-sky-500 to-blue-600",
    textColor: "text-sky-700",
    lightBg: "bg-sky-50",
    border: "border-sky-200",
  },
  {
    id: "aktif",
    label: "Penulis Aktif",
    icon: "🔥",
    minLikes: 1,
    badgeBg: "bg-gradient-to-r from-orange-500 to-red-500",
    textColor: "text-orange-700",
    lightBg: "bg-orange-50",
    border: "border-orange-200",
  },
  {
    id: "baru",
    label: "Penulis Baru",
    icon: "🌱",
    minLikes: 0,
    badgeBg: "bg-gradient-to-r from-green-500 to-emerald-500",
    textColor: "text-green-700",
    lightBg: "bg-green-50",
    border: "border-green-200",
  },
] as const;

type Tier = (typeof TIERS)[number];

function getTier(totalLikes: number): Tier {
  return TIERS.find((t) => totalLikes >= t.minLikes) ?? TIERS[TIERS.length - 1];
}

interface RewardData {
  totalLikes: number;
  progress: number;
  nextTier: Tier | null;
}

// ── Default data ketika API belum selesai/gagal ──────────────
const DEFAULT_DATA: RewardData = { totalLikes: 0, progress: 0, nextTier: TIERS[TIERS.length - 2] };

interface RewardBadgeProps {
  authorId: string;
  authorName: string;
  variant?: "inline" | "card";
}

// ── Inline Badge ──────────────────────────────────────────────
function InlineBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
        ${tier.lightBg} ${tier.textColor} ${tier.border} border
      `}
      title={`${tier.label} · minimal ${tier.minLikes} dukungan`}
    >
      <span>{tier.icon}</span>
      {tier.label}
    </span>
  );
}

// ── Card Badge ────────────────────────────────────────────────
function CardBadge({ tier, data, authorName }: { tier: Tier; data: RewardData; authorName: string }) {
  const likesLeft = data.nextTier ? data.nextTier.minLikes - data.totalLikes : 0;

  return (
    <div className={`rounded-2xl border p-4 transition-shadow hover:shadow-lg ${tier.lightBg} ${tier.border}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl ${tier.badgeBg} flex items-center justify-center text-xl shadow-md`}>
          {tier.icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Reward Penulis</p>
          <p className={`text-sm font-bold ${tier.textColor}`}>{tier.label}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs text-gray-500">Total dukungan diterima</span>
        <span className={`text-sm font-black ${tier.textColor} tabular-nums`}>
          ▲ {data.totalLikes.toLocaleString("id-ID")}
        </span>
      </div>

      {data.nextTier && (
        <div className="space-y-1.5">
          <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${tier.badgeBg} transition-all duration-700`}
              style={{ width: `${Math.min(data.progress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {likesLeft.toLocaleString("id-ID")} lagi → {data.nextTier.icon} {data.nextTier.label}
            </span>
            <span className="text-[10px] font-semibold text-gray-500">{data.progress}%</span>
          </div>
        </div>
      )}

      {!data.nextTier && (
        <p className={`text-[10px] font-semibold ${tier.textColor} text-center mt-1`}>
          🎉 Tier tertinggi — luar biasa, {authorName.split(" ")[0]}!
        </p>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export default function RewardBadge({ authorId, authorName, variant = "inline" }: RewardBadgeProps) {
  // ✅ FIX: pakai DEFAULT_DATA supaya badge langsung tampil, bukan null
  const [data, setData]       = useState<RewardData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorId) {
      setLoading(false);
      return;
    }

    fetch(`/api/users/${authorId}/rewards`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setData({
          totalLikes: Number(json.totalLikes ?? 0),
          progress:   Number(json.progress   ?? 0),
          nextTier:   json.nextTier ?? null,
        });
      })
      .catch((err) => {
        // ✅ FIX: log error tapi tetap pakai DEFAULT_DATA (jangan return null)
        console.warn("[RewardBadge] gagal ambil data reward:", err);
      })
      .finally(() => setLoading(false));
  }, [authorId]);

  if (loading) {
    return variant === "inline"
      ? <span className="inline-block w-24 h-4 bg-gray-100 rounded-full animate-pulse" />
      : <div className="h-24 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />;
  }

  const tier = getTier(data.totalLikes);

  return variant === "inline"
    ? <InlineBadge tier={tier} />
    : <CardBadge tier={tier} data={data} authorName={authorName} />;
}

export { TIERS, getTier };