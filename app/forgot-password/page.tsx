"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Email wajib diisi");
    if (!validateEmail(email)) return setError("Format email tidak valid");

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal mengirim OTP");

      // Simpan email ke sessionStorage untuk dipakai di halaman berikutnya
      sessionStorage.setItem("resetEmail", email);
      router.push("/forgot-password/verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
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

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold text-zinc-900">Lupa Password?</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Masukkan email Anda, kami akan mengirimkan kode OTP
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoComplete="email"
                autoFocus
                className={`w-full px-3 py-2.5 text-sm border rounded-lg text-zinc-900
                  focus:outline-none focus:ring-2 focus:border-transparent transition-all
                  ${error ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-zinc-200 bg-white focus:ring-zinc-900"}`}
              />
            </div>

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
                  Mengirim OTP...
                </>
              ) : (
                "Kirim Kode OTP"
              )}
            </button>
          </form>

          {/* Back to login */}
          <p className="text-center text-sm text-zinc-400 mt-5">
            Ingat password?{" "}
            <Link href="/login" className="text-zinc-900 font-medium hover:underline">
              Kembali masuk
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