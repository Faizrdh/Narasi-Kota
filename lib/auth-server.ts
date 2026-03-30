import { cookies } from "next/headers";

export interface JWTPayload {
  id: string;
  role: string;
  email: string;
  name: string;
}

/**
 * Middleware sudah memverifikasi token sebelum request masuk ke sini.
 * Cukup decode payload Base64 tanpa re-verifikasi ulang.
 */
function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Tambahkan padding jika kurang
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));

    return {
      id:    decoded.id    ?? decoded.sub ?? "",
      role:  decoded.role  ?? "",
      email: decoded.email ?? "",
      name:  decoded.name  ?? "",
    };
  } catch (err) {
    console.error("[auth-server] Failed to decode JWT:", err);
    return null;
  }
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) {
      console.warn("[auth-server] No accessToken cookie found");
      return null;
    }
    const payload = decodeJWTPayload(token);
    if (!payload) {
      console.warn("[auth-server] Failed to decode token payload");
      return null;
    }
    return payload;
  } catch (err) {
    console.error("[auth-server] getCurrentUser error:", err);
    return null;
  }
}