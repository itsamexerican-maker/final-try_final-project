"use client";
// components/ClassFilter.tsx
// Row of class filter buttons on the homepage gallery.
// Each button uses the Tailwind class string stored in Supabase
// (e.g. "bg-red-600 text-red-100 border-red-800") as its color.
// An "All" button resets the filter.

import type { ClassOption } from "@/app/page";

type Props = {
  classes:  ClassOption[];
  active:   string;
  onSelect: (className: string) => void;
};

export default function ClassFilter({ classes, active, onSelect }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">

      {/* "All" button — always shown first */}
      <button
        onClick={() => onSelect("All")}
        className={`
          px-4 py-1.5 rounded-full border text-sm font-semibold transition-all
          ${active === "All"
            ? "bg-ink text-parchment border-ink scale-105"
            : "bg-parchment-dark text-ink-faded border-parchment-deeper hover:border-ink-faded"
          }
        `}
        style={{ fontFamily: "var(--font-display)" }}
      >
        All
      </button>

      {/* One button per class — color comes from Supabase */}
      {classes.map((cls) => {
        const isActive = active === cls.name;
        return (
          <button
            key={cls.id}
            onClick={() => onSelect(cls.name)}
            className={`
              px-4 py-1.5 rounded-full border-2 text-sm font-semibold
              transition-all duration-200
              ${cls.color}
              ${isActive ? "scale-110 shadow-md" : "opacity-70 hover:opacity-100 hover:scale-105"}
            `}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {cls.name}
          </button>
        );
      })}

    </div>
  );
}
