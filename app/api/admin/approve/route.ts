// app/api/admin/approve/route.ts
// Approves a character card submission.
// Uses the secret key (admin client) to bypass RLS.
// Called from the admin panel or directly from the Resend email link.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("cards")
      .update({ approved: true })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Failed to approve card" }, { status: 500 });
  }
}
