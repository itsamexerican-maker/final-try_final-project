// app/auth/callback/route.ts
// Handles the redirect from Google OAuth after login.
// Supabase sends the user back here with a code in the URL.
// This route exchanges the code for a session and redirects
// the admin to the /admin page.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/admin";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Exchange the OAuth code for a Supabase session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful login — send admin to the admin panel
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to home with an error flag
  return NextResponse.redirect(`${origin}/?error=auth`);
}
