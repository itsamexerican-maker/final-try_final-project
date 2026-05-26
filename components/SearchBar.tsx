"use client";
// components/SearchBar.tsx
// Search input that filters the character gallery instantly.
// Uses client-side filtering on already-loaded data — no extra
// Supabase requests. Parent page controls the state.

type Props = {
  value:    string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative max-w-md mx-auto mb-6">
      {/* Search icon */}
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
        style={{ color: "var(--color-ink-faded)" }}
      >
        🔍
      </span>

      <input
        type="text"
        placeholder="Search by name, race, or class…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded border text-base outline-none transition-all"
        style={{
          fontFamily:      "var(--font-body)",
          background:      "var(--color-parchment-dark)",
          color:           "var(--color-ink)",
          borderColor:     "var(--color-parchment-deeper)",
        }}
        // Focus ring matches gold theme
        onFocus={(e) => (e.target.style.borderColor = "var(--color-gold)")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--color-parchment-deeper)")}
      />

      {/* Clear button — only shows when there is a search query */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm hover:text-gold transition-colors"
          style={{ color: "var(--color-ink-faded)" }}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
