// app/api/workflows/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";

const STATUS_LABEL: Record<string, string> = {
  IDE:          "Ide Berita",
  PENUGASAN:    "Penugasan",
  MENULIS:      "Sedang Ditulis",
  REVIEW:       "Review Editor",
  REVISI:       "Revisi",
  SIAP_PUBLISH: "Siap Publish",
  PUBLISHED:    "Published",
};

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

// ── PATCH /api/workflows/[id] ─────────────────────────────────────────────────
export async function PATCH(
  req: Request,
  // FIX: Next.js 15 — params harus di-await (bukan langsung destructure)
  context: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: await params terlebih dahulu sebelum menggunakan id
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    const body = await req.json();
    const {
      workflowStatus, reporterId, editorId,
      deadline, priority, judulBerita, kategori, subKategori,
    } = body;

    // Pastikan workflow ada
    const existing = await prisma.articleWorkflow.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Workflow tidak ditemukan" }, { status: 404 });
    }

    // Update
    const updated = await prisma.articleWorkflow.update({
      where: { id },
      data: {
        ...(workflowStatus              !== undefined && { workflowStatus }),
        ...(reporterId                  !== undefined && { reporterId:  reporterId  || null }),
        ...(editorId                    !== undefined && { editorId:    editorId    || null }),
        ...(deadline                    !== undefined && { deadline:    deadline ? new Date(deadline) : null }),
        ...(priority                    !== undefined && { priority }),
        ...(judulBerita                 !== undefined && { judulBerita }),
        ...(kategori                    !== undefined && { kategori }),
        ...(subKategori                 !== undefined && { subKategori: subKategori || null }),
      },
      include: {
        reporter:     { select: { id: true, name: true } },
        editor:       { select: { id: true, name: true } },
        activityLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    // Catat activity log jika status berubah
    if (workflowStatus && workflowStatus !== existing.workflowStatus) {
      const { actorId, actorName } = await getActorFromCookie();
      await prisma.activityLog.create({
        data: {
          workflowId: id,
          action:     `memindahkan ke ${STATUS_LABEL[workflowStatus] ?? workflowStatus}`,
          actorName,
          actorId,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/workflows/[id]]", error);
    return NextResponse.json({ error: "Gagal mengupdate workflow" }, { status: 500 });
  }
}

// ── DELETE /api/workflows/[id] ────────────────────────────────────────────────
export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    await prisma.articleWorkflow.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/workflows/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus workflow" }, { status: 500 });
  }
}