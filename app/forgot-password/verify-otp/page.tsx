"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [countdown, setCountdown] = useState(120); // 2 menit
  const [email, setEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    if (!savedEmail) {
      router.push("/forgot-password");
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const maskEmail = (e: string) => {
    const [user, domain] = e.split("@");
    if (!user || !domain) return e;
    const masked = user.slice(0, 2) + "****" + user.slice(-1);
    return `${masked}@${domain}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // hanya angka
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // ambil karakter terakhir saja
    setOtp(newOtp);
    setError("");

    // Auto-focus ke input berikutnya
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length < 6) return setError("Masukkan 6 digit kode OTP");

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kode OTP tidak valid");

      // Simpan reset token untuk halaman selanjutnya
      sessionStorage.setItem("resetToken", data.resetToken);
      router.push("/forgot-password/reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verifikasi gagal, coba lagi");
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    setResendSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim ulang OTP");

      setCountdown(120);
      setOtp(Array(6).fill(""));
      setResendSuccess("Kode OTP baru telah dikirim ke email Anda");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim ulang OTP");
    } finally {
      setIsResending(false);
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
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold text-zinc-900">Verifikasi OTP</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Kode OTP telah dikirim ke
            </p>
            <p className="text-sm font-medium text-zinc-700 mt-0.5">
              {maskEmail(email)}
            </p>
          </div>

          {/* Success resend */}
          {resendSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-600">{resendSuccess}</p>
            </div>
          )}

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

          {/* Form OTP */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* 6-Digit OTP Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-3 text-center">
                Masukkan 6 digit kode OTP
              </label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    autoFocus={index === 0}
                    className={`w-11 h-12 text-center text-lg font-semibold border rounded-xl text-zinc-900
                      focus:outline-none focus:ring-2 focus:border-transparent transition-all
                      ${error
                        ? "border-red-400 bg-red-50 focus:ring-red-400"
                        : digit
                          ? "border-zinc-900 bg-zinc-50 focus:ring-zinc-900"
                          : "border-zinc-200 bg-white focus:ring-zinc-900"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Countdown */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-zinc-400">
                  Kode kedaluwarsa dalam{" "}
                  <span className={`font-mono font-semibold ${countdown <= 30 ? "text-red-500" : "text-zinc-700"}`}>
                    {formatTime(countdown)}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-red-500 font-medium">
                  Kode OTP telah kedaluwarsa
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || otp.join("").length < 6}
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
                  Memverifikasi...
                </>
              ) : (
                "Verifikasi OTP"
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center mt-4">
            <p className="text-sm text-zinc-400">
              Tidak menerima kode?{" "}
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className={`font-medium transition-colors ${
                  countdown > 0 || isResending
                    ? "text-zinc-300 cursor-not-allowed"
                    : "text-zinc-900 hover:underline cursor-pointer"
                }`}
              >
                {isResending ? "Mengirim..." : "Kirim ulang"}
              </button>
            </p>
          </div>

          {/* Back */}
          <p className="text-center text-sm text-zinc-400 mt-4">
            <Link href="/forgot-password" className="text-zinc-500 hover:text-zinc-900 transition-colors flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
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