// src/components/GoogleAnalytics.tsx
//
// ── KOMPONEN TRACKING GA4 ──────────────────────────────────────
// 1. Inisialisasi gtag.js
// 2. Track custom events:
//    - scroll_depth_custom  → untuk Avg Scroll Depth
//    - article_completed    → untuk Completion Rate
//    - article_impression   → untuk CTR impressions
//
// Cara pakai di layout.tsx:
//   import GoogleAnalytics from "@/components/GoogleAnalytics";
//   <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!} />

"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface Props {
  measurementId: string;
}

// ── Deklarasi global gtag ─────────────────────────────────────
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config?: Record<string, any>
    ) => void;
    dataLayer: unknown[];
  }
}

// ── Helper: kirim event ke GA4 ────────────────────────────────
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params || {});
  }
}

// ── Hook: track scroll depth custom ──────────────────────────
// Gunakan di halaman artikel individu
// Contoh: useScrollDepthTracking() di dalam komponen artikel
export function useScrollDepthTracking() {
  useEffect(() => {
    const thresholds = [10, 25, 50, 75, 90, 100];
    const triggered = new Set<number>();

    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);

      for (const threshold of thresholds) {
        if (pct >= threshold && !triggered.has(threshold)) {
          triggered.add(threshold);
          trackEvent("scroll_depth_custom", {
            scroll_percentage: threshold,
          });

          // Jika scroll mencapai >= 90%, kirim juga article_completed
          if (threshold >= 90) {
            trackEvent("article_completed", {
              page_path: window.location.pathname,
            });
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}

// ── Hook: track article impression di feed/list ───────────────
// Gunakan di komponen ArticleCard dengan IntersectionObserver
// Contoh:
//   const ref = useArticleImpressionTracking(article.slug);
//   <div ref={ref}>...</div>
export function useArticleImpressionTracking(articlePath: string) {
  useEffect(() => {
    const element = document.querySelector(
      `[data-article-path="${articlePath}"]`
    );
    if (!element) return;

    let tracked = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !tracked) {
            tracked = true;
            trackEvent("article_impression", {
              article_path: articlePath,
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 } // minimal 50% artikel card terlihat
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [articlePath]);
}

// ── Komponen Utama ────────────────────────────────────────────
export default function GoogleAnalytics({ measurementId }: Props) {
  const pathname = usePathname();

  // Track pageview saat navigasi (SPA)
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", measurementId, {
        page_path: pathname,
      });
    }
  }, [pathname, measurementId]);

  if (!measurementId) return null;

  return (
    <>
      {/* Load gtag.js */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />

      {/* Inisialisasi dataLayer dan gtag */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: true,
              // Enhanced measurement untuk scroll otomatis (90%)
              // Kita pakai custom tracking yang lebih granular
            });
          `,
        }}
      />
    </>
  );
}