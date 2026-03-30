// app/api/workflows/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";

const VALID_STATUSES = [
  "IDE", "PENUGASAN", "MENULIS", "REVIEW",
  "REVISI", "SIAP_PUBLISH", "PUBLISHED",
] as const;

type ValidStatus = (typeof VALID_STATUSES)[number];

async function getActorFromCookie() {
  let actorId: string | null = null;
  let actorName = "Admin";
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload?.userId) {
        actorId = payload.userId;
        const user = await prisma.user.findUnique({
          where: { id: actorId },
          select: { name: true },
        });
        actorName = user?.name ?? "Admin";
      }
    }
  } catch { /* pakai default */ }
  return { actorId, actorName };
}

// ── GET /api/workflows ────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kategori = searchParams.get("kategori");

    const workflows = await prisma.articleWorkflow.findMany({
      where: kategori ? { kategori } : undefined,
      include: {
        reporter: { select: { id: true, name: true } },
        editor:   { select: { id: true, name: true } },
        activityLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error("[GET /api/workflows]", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// ── POST /api/workflows ───────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { judulBerita, kategori, subKategori, reporterId, editorId, deadline, priority, workflowStatus } = body;

    if (!judulBerita || !kategori) {
      return NextResponse.json(
        { error: "judulBerita dan kategori wajib diisi" },
        { status: 400 }
      );
    }

    const resolvedStatus: ValidStatus =
      VALID_STATUSES.includes(workflowStatus) ? workflowStatus : "IDE";

    const { actorId, actorName } = await getActorFromCookie();

    const workflow = await prisma.articleWorkflow.create({
      data: {
        judulBerita,
        kategori,
        subKategori:    subKategori || null,
        reporterId:     reporterId  || null,
        editorId:       editorId    || null,
        deadline:       deadline    ? new Date(deadline) : null,
        priority:       priority    || "SEDANG",
        workflowStatus: resolvedStatus,
      },
      include: {
        reporter:     { select: { id: true, name: true } },
        editor:       { select: { id: true, name: true } },
        activityLogs: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workflowId: workflow.id,
        action:     `membuat artikel baru dengan status "${resolvedStatus}"`,
        actorName,
        actorId,
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error("[POST /api/workflows]", error);
    return NextResponse.json({ error: "Gagal membuat artikel" }, { status: 500 });
  }
}