"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) newErrors.email = "Email wajib diisi";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Format email tidak valid";

    if (!formData.password) newErrors.password = "Password wajib diisi";
    else if (formData.password.length < 8) newErrors.password = "Password minimal 8 karakter";

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email atau password salah");
      }

      if (data.accessToken) {
        // 1. Simpan ke localStorage (untuk keperluan client-side)
        localStorage.setItem("accessToken", data.accessToken);

        // 2. ✅ KUNCI: Simpan ke cookie agar middleware Next.js bisa baca
        // Middleware berjalan di server, tidak bisa baca localStorage!
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 86400; // 30 hari atau 1 hari
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Strict`;
      }

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // ✅ Redirect ke dashboard
      router.push("/dashboard");

    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Gagal login, coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

       {/* Logo */}
<div className="flex items-center justify-center mb-8">
  <Link href="/" className="shrink-0">
    <Image
      src="/assets/NarasiKotaLogoBiru.webp"
      alt="NarasiKota"
      width={220}
      height={64}
      className="h-32 w-auto object-contain"
      priority
    />
  </Link>
</div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-zinc-900">Masuk ke akun Anda</h1>
            <p className="text-sm text-zinc-400 mt-1">Kelola konten berita dengan mudah</p>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                placeholder="contoh@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg
                  focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.email
                    ? "border-red-400 bg-red-50 focus:ring-red-400"
                    : "border-zinc-200 bg-white text-zinc-900 focus:ring-zinc-900"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">⚠ {errors.email}</p>
              )}
            </div>

           {/* Password */}
<div>
  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder="Masukkan password"
      value={formData.password}
      onChange={handleChange}
      autoComplete="current-password"
      className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg text-zinc-900
        focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
        errors.password
          ? "border-red-400 bg-red-50 focus:ring-red-400"
          : "border-zinc-200 bg-white focus:ring-zinc-900"
      }`}
    />
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
      tabIndex={-1}
    >
      {showPassword ? (
        // Icon mata tertutup (hide)
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        // Icon mata terbuka (show)
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  </div>
  {errors.password && (
    <p className="mt-1.5 text-xs text-red-500">⚠ {errors.password}</p>
  )}
</div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-sm text-zinc-500">Ingat saya</span>
              </label>
              <Link href="/forgot-password"
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                Lupa password?
              </Link>
            </div>

            {/* Submit Button */}
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
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-zinc-400">atau</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-zinc-400 mt-5">
            Belum punya akun?{" "}
            <Link href="/register" className="text-zinc-900 font-medium hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-zinc-300 mt-6">
          © 2026 CMS NarasiKota. All rights reserved.
        </p>
      </div>
    </div>
  );
}