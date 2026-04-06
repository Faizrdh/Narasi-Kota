"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <h1>Profile</h1>
    </div>
  );
}