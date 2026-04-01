"use client";

// app/berita/[slug]/_components/LikeButton.tsx

import { useState, useEffect, useCallback } from "react";

function getOrCreateVisitorId(): string {
  const key = "nk_visitor_id";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

// ── Inject CSS animasi sekali saja via useEffect ──────────────
function useInjectLikeStyles() {
  useEffect(() => {
    const id = "nk-like-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes nkLikeParticle {
        0%   { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-32px) scale(0); opacity: 0; }
      }
      .nk-like-particle {
        animation: nkLikeParticle 0.7s ease-out forwards;
      }
      @keyframes nkLikePulse {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.18); }
      }
      .nk-like-pulse {
        animation: nkLikePulse 0.3s ease-in-out;
      }
      @keyframes nkToastIn {
        from { opacity: 0; transform: translateY(6px) scale(0.9); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes nkToastOut {
        from { opacity: 1; }
        to   { opacity: 0; transform: translateY(-4px); }
      }
      .nk-toast-enter { animation: nkToastIn 0.2s ease-out forwards; }
      .nk-toast-exit  { animation: nkToastOut 0.3s ease-in 1.8s forwards; }
    `;
    document.head.appendChild(style);
  }, []);
}

// ── Partikel konfeti ──────────────────────────────────────────
function LikeParticles() {
  const particles = [
    { color: "#ef4444", x: -24, delay: 0 },
    { color: "#f59e0b", x: -12, delay: 40 },
    { color: "#10b981", x: 0,   delay: 80 },
    { color: "#6366f1", x: 12,  delay: 40 },
    { color: "#ec4899", x: 24,  delay: 0 },
    { color: "#f97316", x: -6,  delay: 120 },
    { color: "#06b6d4", x: 6,   delay: 120 },
  ];
  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none z-20">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full nk-like-particle"
          style={{
            backgroundColor: p.color,
            left: `${p.x}px`,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

interface LikeButtonProps {
  articleId: string;
  compact?: boolean;
}

export default function LikeButton({ articleId, compact = false }: LikeButtonProps) {
  useInjectLikeStyles();

  const [liked,         setLiked]         = useState(false);
  const [likeCount,     setLikeCount]     = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [initialized,   setInitialized]   = useState(false);
  const [showToast,     setShowToast]     = useState(false);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    fetch(`/api/articles/${articleId}/like?visitorId=${encodeURIComponent(visitorId)}`)
      .then((r) => r.json())
      .then((data) => {
        setLiked(data.hasLiked ?? false);
        setLikeCount(data.likeCount ?? 0);
        setInitialized(true);
      })
      .catch(() => setInitialized(true));
  }, [articleId]);

  const handleLike = useCallback(async () => {
    if (loading || !initialized) return;
    setLoading(true);

    const prevLiked = liked;
    const prevCount = likeCount;
    const newLiked  = !prevLiked;

    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));

    if (newLiked) {
      setShowParticles(true);
      setShowToast(true);
      setTimeout(() => setShowParticles(false), 900);
      setTimeout(() => setShowToast(false), 2200);
    }

    try {
      const visitorId = getOrCreateVisitorId();
      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked ?? newLiked);
        setLikeCount(data.likeCount ?? (newLiked ? prevCount + 1 : prevCount));
      } else {
        setLiked(prevLiked);
        setLikeCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLoading(false);
    }
  }, [articleId, liked, likeCount, loading, initialized]);

  // ── Compact (homepage) ────────────────────────────────────
  if (compact) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(); }}
        disabled={loading || !initialized}
        aria-label={liked ? "Batalkan dukungan" : "Dukung artikel ini"}
        className={`flex items-center gap-1 text-xs font-semibold transition-all duration-200 disabled:opacity-50
          ${liked ? "text-red-600" : "text-gray-400 hover:text-red-500"}`}
      >
        <svg
          className={`w-3.5 h-3.5 transition-all duration-150 ${liked ? "scale-110" : ""}`}
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
        <span className="tabular-nums">
          {initialized ? likeCount.toLocaleString("id-ID") : "—"}
        </span>
      </button>
    );
  }

  // ── Full (halaman detail) ─────────────────────────────────
  return (
    <div className="relative flex flex-col items-center gap-1.5">

      {showParticles && <LikeParticles />}

      {showToast && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
          bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg
          pointer-events-none z-30 nk-toast-enter nk-toast-exit">
          ▲ Terima kasih atas dukunganmu!
        </div>
      )}

      <button
        onClick={handleLike}
        disabled={loading || !initialized}
        aria-label={liked ? "Batalkan dukungan" : "Dukung artikel ini"}
        className={`
          group relative flex items-center gap-2.5 px-6 py-3 rounded-2xl
          font-bold text-sm select-none transition-all duration-200
          active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${liked
            ? "bg-red-600 text-white shadow-xl shadow-red-200 focus:ring-red-400 hover:bg-red-700"
            : "bg-white border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 hover:shadow-md focus:ring-red-300"
          }
        `}
      >
        <svg
          className={`w-5 h-5 transition-all duration-200
            ${liked ? "nk-like-pulse" : "group-hover:scale-110 group-hover:-translate-y-0.5"}`}
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={liked ? 0 : 2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>

        <span className="tracking-wide">Dukung Naik</span>

        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tabular-nums transition-all
          ${liked
            ? "bg-white/25 text-white"
            : "bg-gray-100 text-gray-700 group-hover:bg-red-50 group-hover:text-red-600"
          }`}>
          {initialized ? likeCount.toLocaleString("id-ID") : "·"}
        </span>
      </button>

      <p className={`text-[10px] font-medium transition-colors
        ${liked ? "text-red-500" : "text-gray-400"}`}>
        {liked ? "✓ Kamu sudah mendukung artikel ini" : "Bantu artikel ini menjangkau lebih banyak orang"}
      </p>
    </div>
  );
}