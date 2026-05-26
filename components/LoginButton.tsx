"use client";
// components/LoginButton.tsx
// Shows a "Admin Login" button when logged out,
// and an "Admin Panel + Sign Out" pair when logged in as admin.
// Uses Supabase Google OAuth.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function LoginButton() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  // ── Get current session on mount ──────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Listen for auth state changes (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Sign in with Google ────────────────────────────────────────
  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  // ── Sign out ───────────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // ── Logged in — show admin panel link + sign out ───────────────
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/admin"
          className="text-sm px-3 py-1 rounded border transition-colors"
          style={{
            fontFamily:  "var(--font-display)",
            borderColor: "var(--color-gold-dark)",
            color:       "var(--color-gold-dark)",
          }}
        >
          Admin Panel
        </a>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1 rounded border transition-colors hover:bg-crimson hover:text-parchment"
          style={{
            fontFamily:  "var(--font-display)",
            borderColor: "var(--color-crimson)",
            color:       "var(--color-crimson)",
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // ── Logged out — show admin login button ───────────────────────
  return (
    <button
      onClick={handleLogin}
      className="text-sm px-3 py-1 rounded border transition-colors hover:bg-gold-dark hover:text-parchment"
      style={{
        fontFamily:  "var(--font-display)",
        borderColor: "var(--color-gold-dark)",
        color:       "var(--color-gold-dark)",
      }}
    >
      Admin Login
    </button>
  );
}
