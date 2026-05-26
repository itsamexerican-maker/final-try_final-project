// app/api/admin/delete/route.ts
// Permanently deletes an approved card and its storage image.
// Uses the secret key admin client to bypass RLS.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get image URL first for storage cleanup
    const { data: card } = await supabase
      .from("cards")
      .select("image_url")
      .eq("id", id)
      .single();

    // Delete from storage if it's a Supabase-hosted image
    if (card?.image_url && card.image_url.includes("character-images")) {
      const path = card.image_url.split("/character-images/")[1];
      if (path) {
        await supabase.storage.from("character-images").remove([path]);
      }
    }

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
  }
}
