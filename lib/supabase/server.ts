// lib/supabase/server.ts
// Server-side Supabase client — uses cookies for auth session.
// Use this in Server Components, API routes, and middleware.
// Uses the secret key for admin routes that need to bypass RLS.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ── Standard server client (respects RLS) ────────────────────────
// Use this in Server Components to fetch data with RLS enforced.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}

// ── Admin server client (bypasses RLS) ───────────────────────────
// Use this ONLY in API routes that require admin access
// (approve, reject, delete, edit cards).
// Never import this in client-side or public-facing code.
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
