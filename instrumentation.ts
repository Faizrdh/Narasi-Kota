export async function register() {
  // Hanya jalankan di server-side, bukan edge runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const { default: prisma } = await import("./lib/prisma");

    console.log("[CRON] Scheduler aktif — cek artikel terjadwal setiap menit");

    cron.schedule("* * * * *", async () => {
      try {
        const now = new Date();

        const articles = await prisma.article.findMany({
          where: {
            status: "scheduled",
            scheduledAt: { lte: now },
          },
          select: { id: true, title: true },
        });

        if (articles.length === 0) return;

        const ids = articles.map((a) => a.id);

        await prisma.article.updateMany({
          where: { id: { in: ids } },
          data: {
            status: "publish",
            publishedAt: now,
            scheduledAt: null,
          },
        });

        console.log(
          `[CRON] ✅ ${articles.length} artikel dipublish:`,
          articles.map((a) => a.title)
        );
      } catch (err) {
        console.error("[CRON] ❌ Error:", err);
      }
    });
  }
}