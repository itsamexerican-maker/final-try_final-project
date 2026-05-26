// lib/supabase/server.ts
// Server-side Supabase clients for use in API routes and Server Components.

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ── Standard server client (respects RLS) ────────────────────────
// Use this in Server Components to fetch data with RLS enforced.
export async function createServerSupabaseClient() {
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
            // Safe to ignore in Server Components
          }
        },
      },
    }
  );
}

// ── Admin client (bypasses RLS entirely) ─────────────────────────
// Uses the secret key directly via the base supabase-js client.
// No cookies needed — this is purely server-to-server.
// Use ONLY in admin API routes (approve, reject, delete, edit).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
