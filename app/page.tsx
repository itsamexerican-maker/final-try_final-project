"use client";
// app/page.tsx
// Public homepage — fetches all approved character cards from Supabase,
// displays them in a gallery with class filter buttons and a search bar.
// UX #1: Loading spinner while data loads
// UX #4: Toast on fetch error

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import CharacterCard from "@/components/CharacterCard";
import ClassFilter from "@/components/ClassFilter";
import SearchBar from "@/components/SearchBar";
import LoadingSpinner from "@/components/LoadingSpinner";

// ── Types ────────────────────────────────────────────────────────
export type Character = {
  id:         string;
  name:       string;
  race:       string;
  age:        number;
  bio:        string | null;
  image_url:  string | null;
  class_name: string;
  class_color: string;
};

export type ClassOption = {
  id:    number;
  name:  string;
  color: string;
};

// ── Page component ───────────────────────────────────────────────
export default function HomePage() {
  const supabase = createClient();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [classes,    setClasses]    = useState<ClassOption[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [activeClass, setActiveClass] = useState<string>("All");

  // ── Fetch data on mount ────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch approved cards via the convenience view
      const { data: cards, error: cardsError } = await supabase
        .from("cards_with_class")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (cardsError) {
        toast.error("Failed to load characters. Please try again.");
        setLoading(false);
        return;
      }

      // Fetch class list for filter buttons
      const { data: classData, error: classError } = await supabase
        .from("class")
        .select("id, name, color")
        .order("name");

      if (classError) {
        toast.error("Failed to load class filters.");
      }

      setCharacters(cards || []);
      setClasses(classData || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  // ── Client-side filtering (search + class) ─────────────────────
  // UX: instant filtering on already-loaded data — no extra requests
  const filtered = useMemo(() => {
    return characters.filter((c) => {
      const matchesClass =
        activeClass === "All" || c.class_name === activeClass;

      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.race.toLowerCase().includes(query) ||
        c.class_name.toLowerCase().includes(query);

      return matchesClass && matchesSearch;
    });
  }, [characters, activeClass, search]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ── Hero heading ────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <h1
          className="text-5xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          The Character Compendium
        </h1>
        <p
          className="text-lg max-w-xl mx-auto"
          style={{ fontFamily: "var(--font-body)", color: "var(--ink-faded)" }}
        >
          Browse adventurers, warriors, and wanderers crafted for your table.
          Filter by class, search by name, or{" "}
          <a href="/submit" style={{ color: "var(--gold-dark)" }}>
            submit your own
          </a>
          .
        </p>

        {/* Decorative divider */}
        <div className="divider mt-6">
          <span className="divider-symbol">⚔</span>
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────────── */}
      <SearchBar value={search} onChange={setSearch} />

      {/* ── Class filter buttons ─────────────────────────────────── */}
      <ClassFilter
        classes={classes}
        active={activeClass}
        onSelect={setActiveClass}
      />

      {/* ── Loading state (UX #1) ────────────────────────────────── */}
      {loading && <LoadingSpinner message="Summoning characters from the archives…" />}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-24">
          <p
            className="text-4xl mb-4"
            role="img" aria-label="Empty scroll"
          >
            📜
          </p>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            No Characters Found
          </h2>
          <p style={{ color: "var(--ink-faded)" }}>
            {search
              ? `No results for "${search}". Try a different name or class.`
              : "No characters have been approved yet. Be the first to submit one!"}
          </p>
          <a
            href="/submit"
            className="inline-block mt-6 px-6 py-3 rounded font-semibold transition-colors"
            style={{
              fontFamily:      "var(--font-display)",
              background:      "var(--gold-dark)",
              color:           "var(--parchment)",
              border:          "1px solid var(--gold)",
            }}
          >
            Submit a Character
          </a>
        </div>
      )}

      {/* ── Character card grid ──────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {filtered.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      )}

      {/* ── Result count ─────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <p
          className="text-center mt-10 text-sm"
          style={{ color: "var(--ink-faded)", fontFamily: "var(--font-body)" }}
        >
          Showing {filtered.length} of {characters.length} character
          {characters.length !== 1 ? "s" : ""}
        </p>
      )}

    </div>
  );
}
