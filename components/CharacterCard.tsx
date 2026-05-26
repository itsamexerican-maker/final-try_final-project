// components/CharacterCard.tsx
// Reusable character card component.
// Shows avatar, name, race, class badge, age, and bio.
// Rises on hover via .card-rise class defined in globals.css
// Class badge color comes from the Tailwind string stored in Supabase.

import type { Character } from "@/app/page";
import Image from "next/image";

type Props = {
  character: Character;
};

export default function CharacterCard({ character }: Props) {
  return (
    <div className={`card-rise flex flex-col rounded-lg overflow-hidden border-2 ${character.class_color}`}
    >
      {/* ── Avatar image ─────────────────────────────────────── */}
      <div className="relative w-full aspect-square bg-parchment-deeper overflow-hidden">
        <Image
          src={character.image_url || `https://robohash.org/${character.id}?set=set2&size=200x200`}
          alt={`Portrait of ${character.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      {/* ── Card body ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        {/* Name */}
        <h3
          className="text-lg font-bold leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          {character.name}
        </h3>

        {/* Race + Age */}
        <p
          className="text-sm"
          style={{ color: "var(--color-ink-faded)", fontFamily: "var(--font-body)" }}
        >
          {character.race} &middot; Age {character.age}
        </p>

        {/* Class badge — uses Tailwind color string from Supabase */}
        <span
          className={`self-start px-3 py-0.5 rounded-full text-xs font-bold border-2 ${character.class_color}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {character.class_name}
        </span>

        {/* Bio text box */}
        {character.bio && (
          <div
            className="mt-2 text-sm leading-relaxed border-t pt-2 flex-1"
            style={{
              borderColor: "var(--color-parchment-deeper)",
              color:       "var(--color-ink-light)",
              fontFamily:  "var(--font-body)",
              fontStyle:   "italic",
            }}
          >
            {character.bio}
          </div>
        )}

      </div>
    </div>
  );
}
