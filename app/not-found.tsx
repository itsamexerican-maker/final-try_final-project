// app/not-found.tsx
// UX Polish #9 — Custom 404 page.
// Shown when a user lands on a route that doesn't exist.
// Medieval fantasy themed with a friendly message and link home.

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">

      {/* Icon */}
      <div className="text-7xl mb-6" role="img" aria-label="Lost scroll">
        🗺️
      </div>

      {/* Title */}
      <h1
        className="text-5xl font-bold mb-4"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
      >
        404
      </h1>

      {/* Decorative divider */}
      <div className="divider w-48 mb-4">
        <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)" }}>
          ⚔
        </span>
      </div>

      {/* Message */}
      <h2
        className="text-2xl font-semibold mb-3"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
      >
        You Have Wandered Off the Map
      </h2>
      <p
        className="max-w-md text-lg mb-8"
        style={{ fontFamily: "var(--font-body)", color: "var(--color-ink-faded)" }}
      >
        The page you seek does not exist in this realm. Perhaps it was lost to
        the ages, or perhaps you took a wrong turn at the last dungeon.
      </p>

      {/* Back home button */}
      <Link
        href="/"
        className="px-8 py-3 rounded font-semibold text-base transition-colors hover:opacity-90"
        style={{
          fontFamily: "var(--font-display)",
          background: "var(--color-gold-dark)",
          color:      "var(--color-parchment)",
          border:     "1px solid var(--color-gold)",
        }}
      >
        ← Return to the Compendium
      </Link>

    </div>
  );
}
