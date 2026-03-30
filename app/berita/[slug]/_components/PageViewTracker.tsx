/* eslint-disable react-hooks/purity */
// app/berita/[slug]/_components/PageViewTracker.tsx
"use client";

import { useEffect, useRef } from "react";

interface PageViewTrackerProps {
  articleId: string;
}

// Ambil atau buat visitorId unik per browser (disimpan di localStorage)
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
  const pageViewIdRef = useRef<string | null>(null);
  const startTimeRef  = useRef<number>(Date.now());

  useEffect(() => {
    if (!articleId) return;

    const visitorId = getOrCreateVisitorId();
    startTimeRef.current = Date.now();
    pageViewIdRef.current = null;

    // ── STEP 1: Catat kunjungan baru ─────────────────────────
    // Mengisi tabel page_views → viewsToday & uniqueVisitors bertambah
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

    // ── STEP 2: Kirim durasi baca saat halaman ditinggalkan ───
    // sendBeacon lebih reliable dari fetch saat tab ditutup
    const sendDuration = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const pvId = pageViewIdRef.current;

      // Abaikan jika < 5 detik (bukan pembaca sungguhan)
      if (!pvId || timeSpent < 5) return;

      const payload = JSON.stringify({ pageViewId: pvId, timeSpent });
      navigator.sendBeacon(
        "/api/statistics/pageview/patch",
        new Blob([payload], { type: "application/json" })
      );
    };

    // Saat tab/window ditutup
    window.addEventListener("beforeunload", sendDuration);
    // Saat user switch tab (penting untuk mobile)
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendDuration();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      sendDuration();
      window.removeEventListener("beforeunload", sendDuration);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [articleId]);

  // Komponen ini tidak merender apapun — hanya logic tracking
  return null;
}