// middleware.ts
// Runs on every request. Protects the /admin route so only
// logged-in users whose email is in ADMIN_EMAILS can access it.
// Everyone else is redirected to the homepage.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // ── Build a Supabase client that can read/write cookies ────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── Refresh session (keeps auth alive) ─────────────────────────
  const { data: { user } } = await supabase.auth.getUser();

  // ── Protect /admin route ───────────────────────────────────────
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Not logged in at all → redirect to home
    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Logged in but not an approved admin email → redirect to home
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

// ── Only run middleware on these paths ─────────────────────────────
export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
