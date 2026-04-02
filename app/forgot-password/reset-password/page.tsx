"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("resetToken");
    const savedEmail = sessionStorage.getItem("resetEmail");
    if (!token || !savedEmail) {
      router.push("/forgot-password");
      return;
    }
    setResetToken(token);
    setEmail(savedEmail);
  }, [router]);

  // Strength checker
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: "Sangat Lemah", color: "bg-red-500" };
    if (score === 2) return { level: 2, label: "Lemah", color: "bg-orange-400" };
    if (score === 3) return { level: 3, label: "Cukup", color: "bg-yellow-400" };
    if (score === 4) return { level: 4, label: "Kuat", color: "bg-blue-500" };
    return { level: 5, label: "Sangat Kuat", color: "bg-green-500" };
  };

  const strength = getPasswordStrength(formData.password);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) newErrors.password = "Password wajib diisi";
    else if (formData.password.length < 8) newErrors.password = "Password minimal 8 karakter";
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = "Harus ada minimal 1 huruf kapital";
    else if (!/[0-9]/.test(formData.password)) newErrors.password = "Harus ada minimal 1 angka";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Password tidak cocok";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError("");
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          resetToken,
          newPassword: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengubah password");

      // Bersihkan sessionStorage
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetToken");

      setIsSuccess(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Tampilan sukses ──────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center mb-8">
            <Link href="/">
              <Image src="/assets/NarasiKotaLogoBiru.webp" alt="NarasiKota"
                width={220} height={64} className="h-32 w-auto object-contain" priority />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-lg font-semibold text-zinc-900 mb-2">Password Berhasil Diubah!</h1>
            <p className="text-sm text-zinc-400 mb-6">
              Password Anda telah berhasil diperbarui. Silakan masuk dengan password baru.
            </p>
            <Link
              href="/login"
              className="block w-full bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-medium
                hover:bg-zinc-700 transition-colors text-center"
            >
              Masuk Sekarang
            </Link>
          </div>

          <p className="text-center text-xs text-zinc-300 mt-6">
            © 2026 CMS NarasiKota. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="shrink-0">
            <Image src="/assets/NarasiKotaLogoBiru.webp" alt="NarasiKota"
              width={220} height={64} className="h-32 w-auto object-contain" priority />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold text-zinc-900">Buat Password Baru</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Password baru harus berbeda dengan yang sebelumnya
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Password baru */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  autoFocus
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg text-zinc-900
                    focus:outline-none focus:ring-2 focus:border-transparent transition-all
                    ${errors.password
                      ? "border-red-400 bg-red-50 focus:ring-red-400"
                      : "border-zinc-200 bg-white focus:ring-zinc-900"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength.level ? strength.color : "bg-zinc-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    strength.level <= 2 ? "text-red-500" :
                    strength.level === 3 ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    Kekuatan: {strength.label}
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">⚠ {errors.password}</p>
              )}
            </div>

            {/* Konfirmasi password */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Ulangi password baru"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg text-zinc-900
                    focus:outline-none focus:ring-2 focus:border-transparent transition-all
                    ${errors.confirmPassword
                      ? "border-red-400 bg-red-50 focus:ring-red-400"
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? "border-green-400 bg-green-50 focus:ring-green-400"
                        : "border-zinc-200 bg-white focus:ring-zinc-900"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showConfirm ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Match indicator */}
              {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Password cocok
                </p>
              )}

              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">⚠ {errors.confirmPassword}</p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
              <p className="text-xs text-zinc-500 font-medium mb-1.5">Syarat password:</p>
              <ul className="space-y-1">
                {[
                  { check: formData.password.length >= 8, text: "Minimal 8 karakter" },
                  { check: /[A-Z]/.test(formData.password), text: "Minimal 1 huruf kapital" },
                  { check: /[0-9]/.test(formData.password), text: "Minimal 1 angka" },
                ].map(({ check, text }) => (
                  <li key={text} className={`text-xs flex items-center gap-1.5 ${check ? "text-green-600" : "text-zinc-400"}`}>
                    {check ? (
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth={2} />
                      </svg>
                    )}
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-800 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-300 mt-6">
          © 2026 CMS NarasiKota. All rights reserved.
        </p>
      </div>
    </div>
  );
}