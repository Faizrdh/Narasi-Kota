"use client";

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Application {
  id: string;
  namaLengkap: string;
  nomorHP: string;
  email: string;
  tanggalLahir: string;
  jenisKelamin: string | null;
  role: string;
  pengalaman: string;
  spesialisasi: string;
  motivasi: string;
  portofolioLink: string | null;
  cvFileUrl: string | null;
  status: "pending" | "diterima" | "ditolak";
  catatanAdmin: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  diterima: number;
  ditolak: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    applications: Application[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
    stats: Stats;
  };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const roleLabel: Record<string, string> = {
  redaksi: "Redaksi / Redaktur",
  jurnalis: "Jurnalis / Reporter",
  editor: "Editor",
};

const roleBadge: Record<string, string> = {
  redaksi:  "bg-blue-50 text-blue-700",
  jurnalis: "bg-purple-50 text-purple-700",
  editor:   "bg-orange-50 text-orange-700",
};

const statusBadge: Record<string, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border border-amber-200" },
  diterima: { label: "Diterima", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  ditolak:  { label: "Ditolak",  className: "bg-red-50 text-red-600 border border-red-200" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL
// ─────────────────────────────────────────────────────────────
function DetailModal({
  app,
  onClose,
  onUpdateStatus,
}: {
  app: Application;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, catatan?: string) => Promise<void>;
}) {
  const [catatan, setCatatan]       = useState(app.catatanAdmin ?? "");
  const [loading, setLoading]       = useState(false);
  const [confirm, setConfirm]       = useState<"diterima" | "ditolak" | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAction = async (status: "diterima" | "ditolak") => {
    setLoading(true);
    await onUpdateStatus(app.id, status, catatan);
    setLoading(false);
    setConfirm(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[app.role] ?? "bg-zinc-100 text-zinc-600"}`}>
                {roleLabel[app.role] ?? app.role}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[app.status]?.className}`}>
                {statusBadge[app.status]?.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{app.namaLengkap}</h2>
            <p className="text-sm text-zinc-400">{app.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Nomor HP / WA",   value: app.nomorHP },
              { label: "Jenis Kelamin",   value: app.jenisKelamin ?? "—" },
              { label: "Tanggal Lahir",   value: formatDate(app.tanggalLahir) },
              { label: "Tanggal Daftar",  value: formatDate(app.createdAt) },
              { label: "Pengalaman",      value: app.pengalaman },
              { label: "Spesialisasi",    value: app.spesialisasi },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-50 rounded-xl p-3">
                <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-zinc-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Motivasi */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Motivasi Bergabung</p>
            <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 rounded-xl p-4">{app.motivasi}</p>
          </div>

          {/* Portofolio */}
          {app.portofolioLink && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Link Portofolio</p>
              <a
                href={app.portofolioLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {app.portofolioLink}
              </a>
            </div>
          )}

          {/* CV */}
          {app.cvFileUrl && (
            <div className="flex items-center gap-2 bg-zinc-50 rounded-xl p-3">
              <span className="text-lg">📎</span>
              <span className="text-sm text-zinc-600">{app.cvFileUrl}</span>
            </div>
          )}

          {/* Catatan Admin */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Catatan Admin (opsional)
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan untuk pelamar ini..."
              rows={3}
              className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-700 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition"
            />
          </div>
        </div>

        {/* Footer Actions */}
        {app.status === "pending" && (
          <div className="px-6 pb-6 flex gap-3">
            {!confirm ? (
              <>
                <button
                  onClick={() => setConfirm("ditolak")}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Tolak Lamaran
                </button>
                <button
                  onClick={() => setConfirm("diterima")}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  Terima Lamaran
                </button>
              </>
            ) : (
              <div className="flex-1 bg-zinc-50 rounded-xl p-4 flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-700">
                  Konfirmasi <strong>{confirm === "diterima" ? "terima" : "tolak"}</strong> lamaran ini?
                </p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setConfirm(null)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleAction(confirm)}
                    disabled={loading}
                    className={`px-3 py-1.5 text-xs rounded-lg text-white font-semibold transition-colors disabled:opacity-50 ${
                      confirm === "diterima" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {loading ? "Memproses..." : "Ya, Konfirmasi"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status sudah diproses */}
        {app.status !== "pending" && (
          <div className={`mx-6 mb-6 p-3 rounded-xl text-sm font-medium text-center ${
            app.status === "diterima"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}>
            Lamaran ini sudah {app.status === "diterima" ? "diterima ✓" : "ditolak ✗"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function PelamarPage() {
  const [data, setData]           = useState<Application[]>([]);
  const [stats, setStats]         = useState<Stats>({ total: 0, pending: 0, diterima: 0, ditolak: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [selected, setSelected]   = useState<Application | null>(null);

  // ── Filter state ────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRole,   setFilterRole]   = useState("");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterRole)   params.set("role",   filterRole);
      if (search)       params.set("search", search);
      params.set("page", String(page));

      const res = await fetch(`/api/contributor/applications?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat data");

      const json: ApiResponse = await res.json();
      if (json.success) {
        setData(json.data.applications);
        setStats(json.data.stats);
        setTotalPages(json.data.pagination.totalPages);
      } else {
        throw new Error("Gagal memuat data pelamar");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterRole, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page ketika filter berubah
  useEffect(() => { setPage(1); }, [filterStatus, filterRole, search]);

  const handleUpdateStatus = async (id: string, status: string, catatan?: string) => {
    const res = await fetch(`/api/contributor/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, catatanAdmin: catatan }),
    });
    if (res.ok) {
      await fetchData();
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Pelamar Kontributor</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Kelola lamaran dari calon kontributor NarasiKota
        </p>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Lamaran", value: stats.total,    color: "text-zinc-900",    bg: "bg-white" },
          { label: "Menunggu",      value: stats.pending,  color: "text-amber-700",   bg: "bg-amber-50" },
          { label: "Diterima",      value: stats.diterima, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Ditolak",       value: stats.ditolak,  color: "text-red-600",     bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-zinc-200 p-5`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter & Search Bar ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition"
            />
          </div>

          {/* Filter Role */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition bg-white"
          >
            <option value="">Semua Role</option>
            <option value="redaksi">Redaksi / Redaktur</option>
            <option value="jurnalis">Jurnalis / Reporter</option>
            <option value="editor">Editor</option>
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition bg-white"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="diterima">Diterima</option>
            <option value="ditolak">Ditolak</option>
          </select>

          {/* Reset */}
          {(filterRole || filterStatus || search) && (
            <button
              onClick={() => { setFilterRole(""); setFilterStatus(""); setSearch(""); }}
              className="text-xs text-zinc-400 hover:text-zinc-700 underline transition-colors"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-sm text-red-500">
            {error} —{" "}
            <button onClick={fetchData} className="underline hover:no-underline">
              Coba lagi
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  {["NAMA", "ROLE", "EMAIL", "PENGALAMAN", "TGL DAFTAR", "STATUS", "AKSI"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-zinc-400 px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 bg-zinc-100 rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-zinc-400">
                      Tidak ada data pelamar
                    </td>
                  </tr>
                ) : (
                  data.map((app) => {
                    const st = statusBadge[app.status];
                    return (
                      <tr key={app.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-zinc-900">{app.namaLengkap}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[app.role] ?? "bg-zinc-100 text-zinc-600"}`}>
                            {roleLabel[app.role] ?? app.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-zinc-500">{app.email}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-zinc-500">{app.pengalaman}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-zinc-400">{formatDate(app.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st?.className}`}>
                            {st?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelected(app)}
                            className="text-xs text-zinc-900 font-medium hover:underline"
                          >
                            Detail →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────── */}
      {selected && (
        <DetailModal
          app={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}