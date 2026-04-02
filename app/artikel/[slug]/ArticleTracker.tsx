// src/app/artikel/[slug]/ArticleTracker.tsx
//
// ── SCROLL DEPTH TRACKING DI HALAMAN ARTIKEL ─────────────────
// Komponen client-side untuk track scroll depth di halaman artikel.
// Import dan gunakan di halaman artikel (server component).
//
// Contoh di src/app/artikel/[slug]/page.tsx:
//   import ArticleTracker from "./ArticleTracker";
//   ...
//   <ArticleTracker slug={params.slug} />

"use client";

import { useEffect } from "react";
import { trackEvent } from "@/components/GoogleAnalytics";

interface Props {
  slug: string;
  title?: string;
}

export default function ArticleTracker({ slug, title }: Props) {
  useEffect(() => {
    const thresholds = [10, 25, 50, 75, 90, 100];
    const triggered = new Set<number>();
    const startTime = Date.now();

    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);

      for (const threshold of thresholds) {
        if (pct >= threshold && !triggered.has(threshold)) {
          triggered.add(threshold);

          // Event: scroll_depth_custom → untuk Avg Scroll Depth di statistik
          trackEvent("scroll_depth_custom", {
            scroll_percentage: threshold,
            article_slug: slug,
            article_title: title || slug,
          });

          // Event: article_completed → untuk Completion Rate
          if (threshold >= 90) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            trackEvent("article_completed", {
              article_slug: slug,
              article_title: title || slug,
              time_spent_seconds: timeSpent,
            });
          }
        }
      }
    };

    // Kirim event saat user meninggalkan halaman (time spent)
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 3) {
        // Gunakan sendBeacon agar tidak terblokir saat close
        navigator.sendBeacon?.(
          `/api/tracking/time-spent`,
          JSON.stringify({ slug, timeSpent })
        );
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [slug, title]);

  return null; // Tidak ada UI, hanya tracking
}