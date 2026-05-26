// app/layout.tsx
// Root layout — loads medieval fonts via next/font/google,
// wraps every page with NavBar, footer, and Sonner toaster (UX #4)

import type { Metadata } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { Toaster } from "sonner";

// ── Font definitions (next/font handles optimized loading) ───────
const cinzel = Cinzel({
  subsets:  ["latin"],
  weight:   ["400", "600", "700", "900"],
  variable: "--font-cinzel",   // referenced in globals.css @theme
});

const crimsonText = Crimson_Text({
  subsets:  ["latin"],
  weight:   ["400", "600"],
  style:    ["normal", "italic"],
  variable: "--font-crimson",  // referenced in globals.css @theme
});

// ── Page metadata ────────────────────────────────────────────────
export const metadata: Metadata = {
  title:       "Starter Character Creator",
  description: "A TTRPG character creator for D&D, Pathfinder, and beyond. Browse, submit, and randomize characters for your next adventure.",
};

// ── Root layout ──────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${crimsonText.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-parchment">

        {/* Site-wide navigation bar */}
        <NavBar />

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-parchment-deeper py-6 text-center">
          <p
            className="text-sm text-ink-faded"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ⚔️ Starter Character Creator &mdash; A TTRPG Aid &mdash;{" "}
            <a href="/privacy" className="underline hover:text-gold">
              Privacy Policy
            </a>
          </p>
        </footer>

        {/* Sonner toast notifications (UX #4)
            Styled to match parchment theme */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily:   "var(--font-body)",
              background:   "var(--color-parchment-dark)",
              color:        "var(--color-ink)",
              border:       "1px solid var(--color-gold-dark)",
              borderRadius: "6px",
            },
          }}
        />

      </body>
    </html>
  );
}
