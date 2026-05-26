// app/api/randomize/route.ts
// Server-side API route for DeepSeek AI integration.
// IMPORTANT: The API key never leaves the server.
// Two modes:
//   "full"  — generates a complete random character (name, race, class, age, bio)
//   "bio"   — generates a bio for an existing character

import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// Valid races and classes for full randomization
const RACES   = ["Human","Elf","Dwarf","Goblin","Gnome","Kobold","Orc","Ogre","Aasimar","Tiefling"];
const CLASSES = ["Fighter","Ranger","Monk","Barbarian","Druid","Wizard","Sorcerer","Rogue","Bard","Cleric"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = body;

    if (!mode || (mode !== "full" && mode !== "bio")) {
      return NextResponse.json(
        { error: "mode must be 'full' or 'bio'" },
        { status: 400 }
      );
    }

    // ── Bio-only mode ──────────────────────────────────────────────
    if (mode === "bio") {
      const { name, race, className, age } = body;
      if (!name || !race || !className) {
        return NextResponse.json(
          { error: "name, race, and className are required for bio mode" },
          { status: 400 }
        );
      }

      const prompt = `You are a TTRPG character creator assistant with a medieval fantasy tone.
Write a short character bio (maximum 500 characters) for:
Name: ${name}
Race: ${race}
Class: ${className}
Age: ${age || "unknown"}

The bio should be written in third person, evocative, and feel like a tavern rumour or journal entry.
Return ONLY the bio text. No extra commentary, no quotation marks.`;

      const response = await fetch(DEEPSEEK_API_URL, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model:      "deepseek-chat",
          max_tokens: 200,
          messages:   [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      let bio = data.choices?.[0]?.message?.content?.trim() ?? "";

      // Enforce 500 character hard cap
      if (bio.length > 500) bio = bio.slice(0, 497) + "…";

      return NextResponse.json({ bio });
    }

    // ── Full randomize mode ────────────────────────────────────────
    const prompt = `You are a TTRPG character creator assistant with a medieval fantasy tone.
Generate a completely random TTRPG character.

You MUST choose:
- name: a fantasy name fitting the race
- race: pick ONE from this list only: ${RACES.join(", ")}
- className: pick ONE from this list only: ${CLASSES.join(", ")}
- age: a number appropriate for the race (elves/dwarves can be older)
- bio: a short backstory (maximum 500 characters), third person, evocative

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "name": "...",
  "race": "...",
  "className": "...",
  "age": 00,
  "bio": "..."
}`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model:      "deepseek-chat",
        max_tokens: 400,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const raw  = data.choices?.[0]?.message?.content?.trim() ?? "{}";

    // Strip markdown code fences if DeepSeek wraps the JSON
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed  = JSON.parse(cleaned);

    // Enforce 500 char bio cap
    if (parsed.bio && parsed.bio.length > 500) {
      parsed.bio = parsed.bio.slice(0, 497) + "…";
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Randomize API error:", error);
    return NextResponse.json(
      { error: "Failed to generate character. Please try again." },
      { status: 500 }
    );
  }
}
