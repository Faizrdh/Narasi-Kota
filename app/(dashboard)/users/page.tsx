"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type UserRole = "SUPER_ADMIN" | "REDAKSI" | "EDITOR" | "REPORTER" | "USER";

interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      UserRole;
  image?:    string | null;
  isActive:  boolean;
  createdAt: string;
}

const ROLE_CONFIG: Record<UserRole, { label: string; badge: string; dot: string; desc: string }> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    dot:   "bg-purple-500",
    desc:  "Akses penuh ke semua fitur dan pengaturan",
  },
  REDAKSI: {
    label: "Redaksi",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    dot:   "bg-blue-500",
    desc:  "Mengatur agenda dan penugasan reporter",
  },
  EDITOR: {
    label: "Editor",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot:   "bg-amber-500",
    desc:  "Penyunting tulisan dari reporter agar layak terbit",
  },
  REPORTER: {
    label: "Reporter",
    badge: "bg-green-100 text-green-700 border-green-200",
    dot:   "bg-green-500",
    desc:  "Menulis dan melaporkan berita",
  },
  USER: {
    label: "User",
    badge: "bg-zinc-100 text-zinc-500 border-zinc-200",
    dot:   "bg-zinc-400",
    desc:  "Pengguna biasa",
  },
};

const ALL_ROLES: UserRole[] = ["SUPER_ADMIN", "REDAKSI", "EDITOR", "REPORTER", "USER"];

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Eye Icon ──────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// ── Role Selector (shared between modals) ─────────────────────────────────────
function RoleSelector({ role, onChange }: { role: UserRole; onChange: (r: UserRole) => void }) {
  return (
    <div className="space-y-2">
      {ALL_ROLES.map(r => {
        const cfg = ROLE_CONFIG[r];
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
              ${role === r ? "border-zinc-900 bg-zinc-900/5" : "border-zinc-100 hover:border-zinc-200 bg-white"}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${role === r ? "text-zinc-900" : "text-zinc-700"}`}>
                {cfg.label}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">{cfg.desc}</p>
            </div>
            {role === r && (
              <svg className="w-4 h-4 text-zinc-900 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Status Toggle (shared between modals) ─────────────────────────────────────
function StatusToggle({
  isActive,
  onChange,
  labelOn = "Akun aktif dan bisa login",
  labelOff = "Akun dinonaktifkan, tidak bisa login",
}: {
  isActive: boolean;
  onChange: (v: boolean) => void;
  labelOn?:  string;
  labelOff?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
      <div>
        <p className="text-sm font-semibold text-zinc-900">Status Akun</p>
        <p className="text-xs text-zinc-400 mt-0.5">{isActive ? labelOn : labelOff}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!isActive)}
        className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? "bg-zinc-900" : "bg-zinc-200"}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

// ── Change Role Modal ─────────────────────────────────────────────────────────
function ChangeRoleModal({
  user,
  onClose,
  onSave,
}: {
  user:    User;
  onClose: () => void;
  onSave:  (id: string, role: UserRole, isActive: boolean) => Promise<void>;
}) {
  const [role, setRole]         = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(user.id, role, isActive);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-900">Edit Pengguna</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
              <p className="text-xs text-zinc-400">{user.email}</p>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 break-words">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2.5">Pilih Role</label>
            <RoleSelector role={role} onChange={setRole} />
          </div>

          <StatusToggle isActive={isActive} onChange={setIsActive} />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </span>
            ) : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create User Modal ─────────────────────────────────────────────────────────
interface CreateUserData {
  name:     string;
  email:    string;
  role:     UserRole;
  isActive: boolean;
  password: string;
}

interface CreateUserResult {
  tempPassword?: string;
}

function CreateUserModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave:  (data: CreateUserData) => Promise<CreateUserResult>;
}) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [role, setRole]         = useState<UserRole>("USER");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [created, setCreated]   = useState<{ name: string; email: string; tempPassword?: string } | null>(null);
  const [copied, setCopied]     = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Nama lengkap wajib diisi");
      return;
    }
    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format email tidak valid");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await onSave({ name: name.trim(), email: email.trim(), role, isActive, password });
      setCreated({ name: name.trim(), email: email.trim(), tempPassword: result.tempPassword });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal membuat pengguna");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (created?.tempPassword) {
      navigator.clipboard.writeText(created.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-8 flex flex-col items-center text-center">

            {/* Success icon */}
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-zinc-900 mb-1">Pengguna Berhasil Dibuat!</h2>
            <p className="text-sm text-zinc-400 mb-1">
              Akun untuk <span className="font-semibold text-zinc-700">{created.name}</span> telah dibuat.
            </p>
            <p className="text-xs text-zinc-400 mb-6">{created.email}</p>

            {/* Temp password box */}
            {created.tempPassword && (
              <div className="w-full p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs font-bold text-amber-700">Password Sementara — Simpan Sekarang!</p>
                </div>
                <p className="text-[11px] text-amber-600 mb-3">
                  Password ini tidak akan ditampilkan lagi setelah modal ini ditutup.
                </p>
                <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2.5">
                  <code className="flex-1 text-sm font-mono text-zinc-800 tracking-wide select-all">
                    {showPass ? created.tempPassword : "•".repeat(created.tempPassword.length)}
                  </code>
                  <button
                    onClick={() => setShowPass(v => !v)}
                    className="text-zinc-400 hover:text-zinc-600 shrink-0"
                    title={showPass ? "Sembunyikan" : "Tampilkan"}
                  >
                    <EyeIcon open={showPass} />
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 transition-colors ${copied ? "text-green-500" : "text-zinc-400 hover:text-zinc-600"}`}
                    title="Salin password"
                  >
                    {copied ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-[10px] text-green-600 mt-1.5 text-right">✓ Password disalin!</p>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Screen ───────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-zinc-900">Tambah Pengguna Baru</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {error && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start gap-2">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Nama */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Nama Lengkap <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Masukkan nama lengkap..."
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300
                focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300
                focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Password
              <span className="ml-1.5 text-[10px] font-normal text-zinc-400">
                (kosongkan untuk generate otomatis)
              </span>
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300
                  focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                tabIndex={-1}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
            {!password && (
              <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Password acak akan di-generate dan ditampilkan setelah pengguna dibuat
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2.5">
              Role <span className="text-red-400">*</span>
            </label>
            <RoleSelector role={role} onChange={setRole} />
          </div>

          {/* Status */}
          <StatusToggle
            isActive={isActive}
            onChange={setIsActive}
            labelOn="Akun langsung aktif setelah dibuat"
            labelOff="Akun nonaktif, tidak bisa login"
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 flex gap-2 border-t border-zinc-100 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !email.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Membuat...
              </span>
            ) : "Buat Pengguna"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "SEMUA">("SEMUA");
  const [editUser, setEditUser]     = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users?active=false", { credentials: "include" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // ── Handle Edit Role ──────────────────────────────────────────────────────
  const handleSaveUser = async (id: string, role: UserRole, isActive: boolean): Promise<void> => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role, isActive }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`);
    await fetchUsers();
    showSuccess("Role pengguna berhasil diperbarui!");
  };

  // ── Handle Create User ────────────────────────────────────────────────────
  const handleCreateUser = async (data: CreateUserData): Promise<CreateUserResult> => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`);
    await fetchUsers();
    showSuccess(`Pengguna "${data.name}" berhasil ditambahkan!`);
    return { tempPassword: body.tempPassword };
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const matchRole   = filterRole === "SEMUA" || u.role === filterRole;
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Manajemen Pengguna</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? "Memuat..." : `${users.length} pengguna terdaftar`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pengguna
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Toast Success ───────────────────────────────────────────────────── */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* ── Toast Error ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex justify-between items-center shrink-0">
          <span>⚠️ {error}</span>
          <button onClick={fetchUsers} className="underline font-medium ml-4 shrink-0">Coba lagi</button>
        </div>
      )}

      {/* ── Role Stats Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3 mb-6 shrink-0">
        {ALL_ROLES.map(r => {
          const cfg   = ROLE_CONFIG[r];
          const count = roleCounts[r] ?? 0;
          return (
            <button
              key={r}
              onClick={() => setFilterRole(filterRole === r ? "SEMUA" : r)}
              className={`p-3 rounded-xl border-2 text-left transition-all
                ${filterRole === r ? "border-zinc-900 bg-zinc-900/5" : "border-zinc-100 bg-white hover:border-zinc-200"}`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-[10px] font-medium text-zinc-400">{cfg.label}</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{count}</p>
            </button>
          );
        })}
      </div>

      {/* ── Search & Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="pl-9 pr-4 py-2 w-full rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300
              focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
          />
        </div>
        {filterRole !== "SEMUA" && (
          <button
            onClick={() => setFilterRole("SEMUA")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 text-xs font-medium text-white"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${ROLE_CONFIG[filterRole].dot}`} />
            {ROLE_CONFIG[filterRole].label}
            <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <p className="ml-auto text-xs text-zinc-400">{filtered.length} pengguna</p>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-zinc-100 bg-zinc-50/60">
          {["NAMA", "EMAIL", "ROLE", "STATUS", "AKSI"].map(h => (
            <p key={h} className="text-[10px] font-semibold text-zinc-400 tracking-wider">{h}</p>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="divide-y divide-zinc-50">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="grid grid-cols-[2fr_2fr_1fr_1fr_80px] gap-4 px-6 py-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 shrink-0" />
                  <div className="h-3 bg-zinc-100 rounded w-3/4" />
                </div>
                <div className="h-3 bg-zinc-100 rounded w-4/5 self-center" />
                <div className="h-5 bg-zinc-100 rounded-full w-16 self-center" />
                <div className="h-5 bg-zinc-100 rounded-full w-12 self-center" />
                <div className="h-7 bg-zinc-100 rounded-lg w-14 self-center" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-900">Tidak ada pengguna</p>
            <p className="text-xs text-zinc-400 mt-1">Coba ubah filter atau kata pencarian</p>
            {users.length === 0 && !loading && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Pengguna Pertama
              </button>
            )}
          </div>
        )}

        {/* Table rows */}
        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-zinc-50 overflow-y-auto max-h-[calc(100vh-420px)]">
            {filtered.map(user => {
              const cfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.USER;
              return (
                <div
                  key={user.id}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr_80px] gap-4 px-6 py-3.5 hover:bg-zinc-50/60 transition-colors items-center"
                >
                  {/* Nama */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        Bergabung{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit", month: "short", year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <p className="text-sm text-zinc-500 truncate">{user.email}</p>

                  {/* Role badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium
                      ${user.isActive
                        ? "bg-green-50 text-green-600 border border-green-100"
                        : "bg-red-50 text-red-500 border border-red-100"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-400" : "bg-red-400"}`} />
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  {/* Action */}
                  <div>
                    <button
                      onClick={() => setEditUser(user)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600
                        hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                    >
                      Edit Role
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Role Legend ─────────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-4 shrink-0 flex-wrap">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Keterangan Role:</p>
        {ALL_ROLES.map(r => (
          <div key={r} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${ROLE_CONFIG[r].dot}`} />
            <span className="text-[11px] text-zinc-500">
              <span className="font-medium">{ROLE_CONFIG[r].label}</span> — {ROLE_CONFIG[r].desc}
            </span>
          </div>
        ))}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {editUser && (
        <ChangeRoleModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreateUser}
        />
      )}
    </div>
  );
}