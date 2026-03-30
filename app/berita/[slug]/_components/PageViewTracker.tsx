/* eslint-disable react-hooks/purity */
// app/berita/[slug]/_components/PageViewTracker.tsx
"use client";

import { useEffect, useRef } from "react";

interface PageViewTrackerProps {
  articleId: string;
}

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

export default function PageViewTracker({ articleId }: PageViewTrackerProps) {
  const pageViewIdRef  = useRef<string | null>(null);
  const startTimeRef   = useRef<number>(Date.now());
  const maxScrollRef   = useRef<number>(0);   // ← NEW: 0–100
  const completedRef   = useRef<boolean>(false); // ← NEW

  useEffect(() => {
    if (!articleId) return;

    const visitorId = getOrCreateVisitorId();
    startTimeRef.current  = Date.now();
    pageViewIdRef.current = null;
    maxScrollRef.current  = 0;
    completedRef.current  = false;

    // ── STEP 1: Catat kunjungan baru ─────────────────────────
    fetch("/api/statistics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, visitorId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.id) {
          pageViewIdRef.current = d.data.id;
        }
      })
      .catch((err) => console.warn("[PageViewTracker] POST gagal:", err));

    // ── STEP 2: Track scroll depth ────────────────────────────
    const handleScroll = () => {
      const scrollTop  = window.scrollY || document.documentElement.scrollTop;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      if (pct > maxScrollRef.current) {
        maxScrollRef.current = pct;
        // Tandai sebagai "completed" jika sudah scroll ≥ 90%
        if (pct >= 90) completedRef.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // ── STEP 3: Kirim data saat halaman ditinggalkan ──────────
    const sendSessionData = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const pvId      = pageViewIdRef.current;

      // Abaikan sesi < 3 detik (bot / tidak sengaja)
      if (!pvId || timeSpent < 3) return;

      const payload = JSON.stringify({
        pageViewId:  pvId,
        timeSpent,
        scrollDepth: maxScrollRef.current,  // ← NEW
        completed:   completedRef.current,  // ← NEW
      });

      navigator.sendBeacon(
        "/api/statistics/pageview/patch",
        new Blob([payload], { type: "application/json" })
      );
    };

    window.addEventListener("beforeunload", sendSessionData);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendSessionData();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      sendSessionData();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", sendSessionData);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [articleId]);

  return null;
}