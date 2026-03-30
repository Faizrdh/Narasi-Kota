// hooks/useCurrentUser.ts
"use client";

import { useState, useEffect } from "react";

export type UserRole =
  | "SUPER_ADMIN"
  | "REDAKSI"
  | "EDITOR"
  | "REPORTER"
  | "USER";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
}

const EDITOR_ROLES: UserRole[] = ["EDITOR", "REDAKSI", "SUPER_ADMIN"];

export function useCurrentUser() {
  const [user, setUser]       = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setUser(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isEditor   = EDITOR_ROLES.includes(user?.role as UserRole);
  const isReporter = user?.role === "REPORTER";

  return { user, loading, isEditor, isReporter };
}