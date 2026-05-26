// lib/supabase/client.ts
// Browser-side Supabase client — uses the publishable key.
// Safe to use in Client Components ("use client" files).
// Respects RLS policies configured in Supabase.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
