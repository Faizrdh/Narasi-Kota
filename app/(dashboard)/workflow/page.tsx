/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Status =
  | "IDE" | "PENUGASAN" | "MENULIS" | "REVIEW"
  | "REVISI" | "SIAP_PUBLISH" | "PUBLISHED";

type Priority = "TINGGI" | "SEDANG" | "RENDAH";

type UserRole = "SUPER_ADMIN" | "REDAKSI" | "EDITOR" | "REPORTER" | "USER";

interface UserOption {
  id:    string;
  name:  string;
  email: string;
  role:  UserRole;
}

interface WorkflowArticle {
  id: string;
  judulBerita: string;
  kategori: string;
  subKategori?: string | null;
  workflowStatus: Status;
  priority: Priority;
  deadline?: string | null;
  createdAt: string;
  reporter?: { id: string; name: string } | null;
  editor?:   { id: string; name: string } | null;
  activityLogs: ActivityLog[];
}

interface ActivityLog {
  id: string;
  action: string;
  actorName: string;
  createdAt: string;
  workflowId: string;
}

// ── Column Config ─────────────────────────────────────────────────────────────
const COLUMNS: { id: Status; label: string; color: string; dot: string; bg: string; ring: string }[] = [
  { id: "IDE",          label: "Ide Berita",    color: "text-slate-500",   dot: "bg-slate-400",   bg: "bg-slate-50",   ring: "ring-slate-300"   },
  { id: "PENUGASAN",    label: "Penugasan",     color: "text-blue-600",    dot: "bg-blue-500",    bg: "bg-blue-50",    ring: "ring-blue-300"    },
  { id: "MENULIS",      label: "Sedang Ditulis",color: "text-violet-600",  dot: "bg-violet-500",  bg: "bg-violet-50",  ring: "ring-violet-300"  },
  { id: "REVIEW",       label: "Review Editor", color: "text-amber-600",   dot: "bg-amber-500",   bg: "bg-amber-50",   ring: "ring-amber-300"   },
  { id: "REVISI",       label: "Revisi",        color: "text-red-600",     dot: "bg-red-500",     bg: "bg-red-50",     ring: "ring-red-300"     },
  { id: "SIAP_PUBLISH", label: "Siap Publish",  color: "text-emerald-600", dot: "bg-emerald-500", bg: "bg-emerald-50", ring: "ring-emerald-300" },
  { id: "PUBLISHED",    label: "Published",     color: "text-zinc-900",    dot: "bg-zinc-900",    bg: "bg-zinc-100",   ring: "ring-zinc-400"    },
];

const ROLE_BADGE: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  REDAKSI:     "bg-blue-100 text-blue-700",
  EDITOR:      "bg-amber-100 text-amber-700",
  REPORTER:    "bg-green-100 text-green-700",
  USER:        "bg-zinc-100 text-zinc-500",
};

const KATEGORI_COLORS: Record<string, string> = {
  Politik:   "bg-orange-100 text-orange-700",
  Ekonomi:   "bg-blue-100 text-blue-700",
  Hukum:     "bg-red-100 text-red-700",
  Olahraga:  "bg-green-100 text-green-700",
  Teknologi: "bg-violet-100 text-violet-700",
  Hiburan:   "bg-pink-100 text-pink-700",
  Sosial:    "bg-amber-100 text-amber-700",
};

const PRIORITY_CONFIG: Record<Priority, { label: string; cls: string }> = {
  TINGGI: { label: "Tinggi", cls: "bg-red-100 text-red-600" },
  SEDANG: { label: "Sedang", cls: "bg-amber-100 text-amber-600" },
  RENDAH: { label: "Rendah", cls: "bg-green-100 text-green-600" },
};

const INPUT_CLS =
  "w-full px-3 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 " +
  "placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white";

const SELECT_CLS =
  "w-full px-3 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDeadline(d?: string | null) {
  if (!d) return null;
  const deadline = new Date(d);
  const now  = new Date();
  const diff = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
  const label = deadline.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  if (diff < 0)   return { text: `${Math.abs(diff)}h terlambat`, cls: "text-red-500" };
  if (diff === 0) return { text: "Hari ini",                      cls: "text-amber-500 font-semibold" };
  if (diff <= 2)  return { text: `${diff}h lagi`,                 cls: "text-amber-500" };
  return { text: label, cls: "text-zinc-400" };
}

// ── Custom hook ───────────────────────────────────────────────────────────────
function useUsers(role: string) {
  const [users, setUsers]     = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users?role=${role}&active=true`, { credentials: "include" })
      .then(r => r.json())
      .then((data: UserOption[] | { users: UserOption[] }) => {
        setUsers(Array.isArray(data) ? data : (data.users ?? []));
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [role]);

  return { users, loading };
}

// ── Role Select ───────────────────────────────────────────────────────────────
function RoleSelect({ label, value, onChange, users, loading, placeholder, roleBadge }: {
  label: string; value: string; onChange: (id: string) => void;
  users: UserOption[]; loading: boolean; placeholder: string; roleBadge: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-xs font-medium text-zinc-500">{label}</label>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleBadge}`}>{label}</span>
      </div>
      <select value={value} onChange={e => onChange(e.target.value)} className={SELECT_CLS} disabled={loading}>
        <option value="">
          {loading ? "Memuat daftar..." : users.length === 0 ? "— Belum ada —" : placeholder}
        </option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      {!loading && users.length === 0 && (
        <p className="text-[10px] text-red-400 mt-1">⚠️ Belum ada user dengan role {label}.</p>
      )}
    </div>
  );
}

// ── Add Modal ─────────────────────────────────────────────────────────────────
function AddModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd:   (data: unknown) => Promise<void>;
}) {
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { users: reporters, loading: loadingReporters } = useUsers("REPORTER");
  const { users: editors,   loading: loadingEditors   } = useUsers("EDITOR,REDAKSI");

  const [form, setForm] = useState({
    judulBerita: "", kategori: "Politik", subKategori: "",
    reporterId: "", editorId: "", deadline: "",
    priority: "SEDANG" as Priority,
    workflowStatus: "IDE" as Status,
  });

  const handleSubmit = async () => {
    if (!form.judulBerita.trim()) { setSubmitError("Judul berita wajib diisi."); return; }
    setSubmitting(true); setSubmitError(null);
    try {
      await onAdd({
        judulBerita:    form.judulBerita.trim(),
        kategori:       form.kategori,
        subKategori:    form.subKategori.trim() || null,
        reporterId:     form.reporterId || null,
        editorId:       form.editorId   || null,
        deadline:       form.deadline   || null,
        priority:       form.priority,
        workflowStatus: form.workflowStatus,
      });
      onClose();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Gagal menyimpan artikel.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-900">Tambah Artikel Baru</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {submitError && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              ⚠️ {submitError}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Judul Berita *</label>
            <input value={form.judulBerita}
              onChange={e => setForm(f => ({ ...f, judulBerita: e.target.value }))}
              placeholder="Masukkan judul berita..." className={INPUT_CLS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Kategori *</label>
              <select value={form.kategori}
                onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} className={SELECT_CLS}>
                {Object.keys(KATEGORI_COLORS).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Sub Kategori</label>
              <input value={form.subKategori}
                onChange={e => setForm(f => ({ ...f, subKategori: e.target.value }))}
                placeholder="Opsional..." className={INPUT_CLS} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RoleSelect label="Reporter" value={form.reporterId}
              onChange={id => setForm(f => ({ ...f, reporterId: id }))}
              users={reporters} loading={loadingReporters}
              placeholder="— Pilih reporter —" roleBadge={ROLE_BADGE.REPORTER} />
            <RoleSelect label="Editor" value={form.editorId}
              onChange={id => setForm(f => ({ ...f, editorId: id }))}
              users={editors} loading={loadingEditors}
              placeholder="— Pilih editor —" roleBadge={ROLE_BADGE.EDITOR} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Prioritas</label>
              <select value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} className={SELECT_CLS}>
                <option value="TINGGI">Tinggi</option>
                <option value="SEDANG">Sedang</option>
                <option value="RENDAH">Rendah</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Status Awal</label>
            <div className="flex flex-wrap gap-1.5">
              {COLUMNS.map(col => (
                <button key={col.id} type="button"
                  onClick={() => setForm(f => ({ ...f, workflowStatus: col.id }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all
                    ${form.workflowStatus === col.id
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50"}`}>
                  {col.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button type="button" onClick={onClose} disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={handleSubmit}
            disabled={submitting || !form.judulBerita.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Menyimpan...
              </span>
            ) : "Tambah Artikel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ article, onClose, onStatusChange }: {
  article: WorkflowArticle;
  onClose: () => void;
  onStatusChange: (id: string, status: Status) => Promise<void>;
}) {
  const col = COLUMNS.find(c => c.id === article.workflowStatus)!;
  const [moving, setMoving] = useState<Status | null>(null);

  const handleMove = async (s: Status) => {
    setMoving(s);
    await onStatusChange(article.id, s);
    setMoving(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between p-6 border-b border-zinc-100">
          <div className="flex-1 pr-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${col.bg} ${col.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
              {col.label}
            </span>
            <h2 className="text-sm font-semibold text-zinc-900 leading-snug">{article.judulBerita}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-2 gap-4 border-b border-zinc-50">
            {[
              { label: "Kategori",  value: article.kategori },
              ...(article.subKategori ? [{ label: "Sub Kategori", value: article.subKategori }] : []),
              { label: "Reporter",  value: article.reporter?.name ?? "—" },
              { label: "Editor",    value: article.editor?.name   ?? "—" },
              { label: "Deadline",  value: article.deadline
                  ? new Date(article.deadline).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" })
                  : "—" },
              { label: "Prioritas", value: PRIORITY_CONFIG[article.priority]?.label ?? "—" },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                <p className="text-xs font-medium text-zinc-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="p-6 border-b border-zinc-50">
            <p className="text-xs font-medium text-zinc-500 mb-3">Pindahkan ke Status</p>
            <div className="flex flex-wrap gap-1.5">
              {COLUMNS.map(c => (
                <button key={c.id}
                  disabled={c.id === article.workflowStatus || moving !== null}
                  onClick={() => handleMove(c.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${c.id === article.workflowStatus
                      ? `${c.bg} ${c.color} opacity-50 cursor-default`
                      : moving === c.id ? "bg-zinc-900 text-white border border-zinc-900"
                      : "border border-zinc-200 text-zinc-500 hover:border-zinc-400"}`}>
                  {moving === c.id ? "..." : c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            <p className="text-xs font-medium text-zinc-500 mb-3">Activity Log</p>
            {article.activityLogs.length === 0
              ? <p className="text-xs text-zinc-300 italic">Belum ada aktivitas.</p>
              : (
                <div className="space-y-3">
                  {article.activityLogs.map(log => (
                    <div key={log.id} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-zinc-500">{getInitials(log.actorName)}</span>
                      </div>
                      <div>
                        <p className="text-xs">
                          <span className="font-medium text-zinc-900">{log.actorName}</span>{" "}
                          <span className="text-zinc-500">{log.action}</span>
                        </p>
                        <p className="text-[10px] text-zinc-300 mt-0.5">
                          {new Date(log.createdAt).toLocaleString("id-ID", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Kanban Card ───────────────────────────────────────────────────────────────
function KanbanCard({ article, isDragging, onDragStart, onDragEnd, onClick }: {
  article:     WorkflowArticle;
  isDragging:  boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd:   () => void;
  onClick:     (a: WorkflowArticle) => void;
}) {
  const dl     = formatDeadline(article.deadline);
  const katCls = KATEGORI_COLORS[article.kategori] || "bg-zinc-100 text-zinc-600";
  const priCfg = PRIORITY_CONFIG[article.priority];

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, article.id)}
      onDragEnd={onDragEnd}
      onClick={() => !isDragging && onClick(article)}
      className={`bg-white rounded-xl border p-3.5 cursor-grab active:cursor-grabbing
        hover:border-zinc-300 hover:shadow-sm transition-all duration-150 group select-none
        ${isDragging ? "opacity-30 border-zinc-300 shadow-inner" : "border-zinc-100"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${katCls}`}>
          {article.kategori}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${priCfg.cls}`}>
          {priCfg.label}
        </span>
      </div>
      <p className="text-xs font-semibold text-zinc-900 leading-snug mb-3 line-clamp-2 group-hover:text-zinc-700">
        {article.judulBerita}
      </p>
      {article.subKategori && (
        <p className="text-[10px] text-zinc-400 mb-2">#{article.subKategori}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
            ${article.reporter ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400 border border-dashed border-zinc-300"}`}>
            {getInitials(article.reporter?.name)}
          </div>
          <span className="text-[10px] text-zinc-400 truncate max-w-[80px]">
            {article.reporter?.name ?? "Belum ditugaskan"}
          </span>
        </div>
        {dl && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`text-[10px] ${dl.cls}`}>{dl.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WorkflowPage() {
  const [articles, setArticles]         = useState<WorkflowArticle[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [dragId, setDragId]             = useState<string | null>(null);
  const [dragOverCol, setDragOverCol]   = useState<Status | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected]         = useState<WorkflowArticle | null>(null);
  const [filterKategori, setFilterKat]  = useState("Semua");
  const [search, setSearch]             = useState("");
  const [showLog, setShowLog]           = useState(false);
  const [allLogs, setAllLogs]           = useState<ActivityLog[]>([]);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const dragIdRef    = useRef<string | null>(null);
  const dragCounters = useRef<Partial<Record<Status, number>>>({});

  // FIX 1 — articlesRef: selalu simpan nilai articles terbaru agar handleDrop
  // tidak membaca stale closure (nilai lama saat fungsi pertama kali dibuat).
  const articlesRef = useRef<WorkflowArticle[]>([]);
  useEffect(() => { articlesRef.current = articles; }, [articles]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchWorkflows = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/workflows", { credentials: "include" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: WorkflowArticle[] = await res.json();
      setArticles(data);
      setAllLogs(data.flatMap(a => a.activityLogs).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  const handleAdd = async (formData: unknown) => {
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Error ${res.status}`);
    }
    await fetchWorkflows();
  };

  const handleStatusChange = useCallback(async (id: string, newStatus: Status) => {
    // Optimistic update — UI langsung berubah sebelum API selesai
    setArticles(prev => prev.map(a => a.id === id ? { ...a, workflowStatus: newStatus } : a));

    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ workflowStatus: newStatus }),
      });
      if (!res.ok) {
        console.error("PATCH gagal:", res.status, await res.text());
      }
    } catch (err) {
      console.error("PATCH error:", err);
    }

    // Refresh dari server agar data sinkron
    await fetchWorkflows();
  }, [fetchWorkflows]);

  // ── Drag & Drop handlers ──────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragIdRef.current = id;
    setDragId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    dragIdRef.current = null;
    setDragId(null);
    setDragOverCol(null);
    dragCounters.current = {};
  };

  const handleDragEnter = (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    dragCounters.current[colId] = (dragCounters.current[colId] ?? 0) + 1;
    setDragOverCol(colId);
  };

  const handleDragLeave = (_e: React.DragEvent, colId: Status) => {
    dragCounters.current[colId] = Math.max(0, (dragCounters.current[colId] ?? 1) - 1);
    if (dragCounters.current[colId] === 0) {
      setDragOverCol(prev => prev === colId ? null : prev);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = useCallback(async (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    e.stopPropagation();

    // FIX 2 — Baca id dari ref, bukan dari state (state bisa stale)
    const id = dragIdRef.current ?? e.dataTransfer.getData("text/plain");

    dragIdRef.current = null;
    dragCounters.current = {};
    setDragId(null);
    setDragOverCol(null);

    if (!id) {
      console.warn("handleDrop: id kosong, drop diabaikan");
      return;
    }

    // FIX 3 — Baca articles dari ref, bukan dari closure state
    const current = articlesRef.current;
    const article  = current.find(a => a.id === id);

    if (!article) {
      console.warn("handleDrop: artikel tidak ditemukan di state, id =", id);
      // Tetap panggil API karena artikel mungkin ada di DB
      await handleStatusChange(id, colId);
      return;
    }

    if (article.workflowStatus === colId) {
      // Sudah di kolom yang sama, tidak perlu update
      return;
    }

    await handleStatusChange(id, colId);
  }, [handleStatusChange]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = articles.filter(a => {
    const matchKat    = filterKategori === "Semua" || a.kategori === filterKategori;
    const matchSearch = !search
      || a.judulBerita.toLowerCase().includes(search.toLowerCase())
      || (a.reporter?.name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchKat && matchSearch;
  });

  const kategoriList = ["Semua", ...Array.from(new Set(articles.map(a => a.kategori)))];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Workflow Artikel</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? "Memuat..." : `${articles.length} artikel · ${COLUMNS.length} tahap editorial`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchWorkflows} disabled={loading}
            className="p-2 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40">
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button onClick={() => setShowLog(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
              ${showLog ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Activity Log
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Artikel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 shrink-0 flex justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchWorkflows} className="underline font-medium">Coba lagi</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 shrink-0 flex-wrap">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul atau reporter..."
            className="pl-9 pr-4 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 w-56" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {kategoriList.map(k => (
            <button key={k} onClick={() => setFilterKat(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${filterKategori === k ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}>
              {k}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-zinc-400">{filtered.length} artikel</div>
      </div>

      {/* Board */}
      <div className="flex-1 min-h-0 flex">
        <div className="flex gap-3 overflow-x-auto pb-4 flex-1">

          {/* Loading skeleton */}
          {loading && COLUMNS.map(col => (
            <div key={col.id} className="flex flex-col shrink-0 w-60 bg-zinc-50/60 rounded-xl">
              <div className="flex items-center gap-2 px-3 py-3">
                <span className={`w-2 h-2 rounded-full ${col.dot} opacity-30`} />
                <span className={`text-xs font-semibold ${col.color} opacity-30`}>{col.label}</span>
              </div>
              <div className="px-2 pb-2 space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-zinc-100 p-3.5 animate-pulse">
                    <div className="h-3 bg-zinc-100 rounded w-1/2 mb-3" />
                    <div className="h-3 bg-zinc-100 rounded w-full mb-1.5" />
                    <div className="h-3 bg-zinc-100 rounded w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Kanban columns */}
          {!loading && COLUMNS.map(col => {
            const colArticles = filtered.filter(a => a.workflowStatus === col.id);
            const isOver      = dragOverCol === col.id && dragId !== null;

            return (
              <div
                key={col.id}
                onDragEnter={e => handleDragEnter(e, col.id)}
                onDragLeave={e => handleDragLeave(e, col.id)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, col.id)}
                className={`flex flex-col shrink-0 w-60 rounded-xl transition-all duration-150
                  ${isOver ? `ring-2 ${col.ring} ${col.bg}` : "bg-zinc-50/60"}`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                  </div>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${isOver ? `${col.bg} ${col.color} border ${col.ring}` : "bg-white border border-zinc-200 text-zinc-500"}`}>
                    {colArticles.length}
                  </span>
                </div>

                {/* Cards area */}
                <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto min-h-[200px]">
                  {colArticles.length === 0 && (
                    <div className={`min-h-[100px] rounded-xl border-2 border-dashed flex items-center justify-center transition-all
                      ${isOver ? `border-current ${col.color} ${col.bg}` : "border-zinc-200"}`}>
                      <span className={`text-xs ${isOver ? `font-medium ${col.color}` : "text-zinc-300"}`}>
                        {isOver ? "Lepaskan di sini" : "Seret artikel ke sini"}
                      </span>
                    </div>
                  )}
                  {colArticles.map(article => (
                    <KanbanCard
                      key={article.id}
                      article={article}
                      isDragging={dragId === article.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={setSelected}
                    />
                  ))}
                  {colArticles.length > 0 && isOver && (
                    <div className={`min-h-[60px] rounded-xl border-2 border-dashed flex items-center justify-center
                      border-current ${col.color} ${col.bg}`}>
                      <span className={`text-xs font-medium ${col.color}`}>Lepaskan di sini</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Log Panel */}
        {showLog && (
          <div className="w-72 shrink-0 ml-3 bg-white rounded-xl border border-zinc-100 flex flex-col overflow-hidden" style={{ maxHeight: "calc(100vh - 12rem)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <h3 className="text-xs font-semibold text-zinc-900">Activity Log</h3>
              <button onClick={() => setShowLog(false)} className="text-zinc-300 hover:text-zinc-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {allLogs.length === 0 && (
                <p className="text-xs text-zinc-300 italic text-center mt-4">Belum ada aktivitas.</p>
              )}
              {allLogs.slice(0, 50).map(log => {
                const art = articles.find(a => a.id === log.workflowId);
                return (
                  <div key={log.id} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-zinc-500">{getInitials(log.actorName)}</span>
                    </div>
                    <div>
                      <p className="text-[11px] leading-snug">
                        <span className="font-semibold text-zinc-900">{log.actorName}</span>{" "}
                        <span className="text-zinc-500">{log.action}</span>
                        {art && (
                          <span className="text-zinc-400 block mt-0.5 truncate max-w-[170px]">
                            &quot;{art.judulBerita.slice(0, 40)}{art.judulBerita.length > 40 ? "…" : ""}&quot;
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-zinc-300 mt-0.5">
                        {new Date(log.createdAt).toLocaleString("id-ID", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
      {selected    && <DetailModal article={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />}
    </div>
  );
}