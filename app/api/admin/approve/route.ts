// app/api/admin/approve/route.ts
// Approves or updates a character card.
// Uses the secret key admin client to bypass RLS.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, update, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    // No await needed — createAdminClient is now synchronous
    const supabase = createAdminClient();

    if (update) {
      const { error } = await supabase
        .from("cards")
        .update({
          name:      fields.name,
          race:      fields.race,
          age:       fields.age,
          bio:       fields.bio,
          class_id:  fields.class_id,
          image_url: fields.image_url,
        })
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("cards")
        .update({ approved: true })
        .eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Failed to approve card" }, { status: 500 });
  }
}
