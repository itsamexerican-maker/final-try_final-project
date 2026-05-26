"use client";
// components/NavBar.tsx
// Site-wide navigation bar.
// Shows the site title, nav links, and the admin login button.
// Login is only needed by the admin — public users browse freely.

import Link from "next/link";
import LoginButton from "./LoginButton";

export default function NavBar() {
  return (
    <nav
      className="w-full border-b border-parchment-deeper px-6 py-4 flex items-center justify-between"
      style={{ background: "var(--color-parchment-dark)" }}
    >
      {/* ── Site title / home link ─────────────────────────────── */}
      <Link
        href="/"
        className="text-xl font-bold tracking-wide hover:text-gold transition-colors"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
      >
        ⚔️ Character Compendium
      </Link>

      {/* ── Nav links + login ──────────────────────────────────── */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-sm hover:text-gold transition-colors"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink-faded)" }}
        >
          Gallery
        </Link>
        <Link
          href="/submit"
          className="text-sm hover:text-gold transition-colors"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink-faded)" }}
        >
          Submit
        </Link>
        <Link
          href="/privacy"
          className="text-sm hover:text-gold transition-colors"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink-faded)" }}
        >
          Privacy
        </Link>

        {/* Admin login — only admin needs this */}
        <LoginButton />
      </div>
    </nav>
  );
}
