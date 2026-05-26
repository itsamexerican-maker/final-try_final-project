// app/api/admin/reject/route.ts
// Rejects (deletes) a pending character card submission.
// Uses the secret key (admin client) to bypass RLS.
// Rejection permanently removes the card from the database.

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
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Reject error:", error);
    return NextResponse.json({ error: "Failed to reject card" }, { status: 500 });
  }
}
