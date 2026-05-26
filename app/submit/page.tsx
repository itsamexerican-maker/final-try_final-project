"use client";
// app/submit/page.tsx
// Public character submission form.
// Features:
// - Manual form fields with inline validation (UX #6)
// - Image upload with file type and size validation
// - DeepSeek "Generate Bio" button (hits /api/randomize)
// - DeepSeek "Randomize Character" button (fills all fields)
// - Toast notifications on success/error (UX #4)
// - Submitted cards land as approved=false for admin review

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

// ── Types ────────────────────────────────────────────────────────
type FormData = {
  name:     string;
  race:     string;
  classId:  string;
  age:      string;
  bio:      string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type ClassOption = {
  id:    number;
  name:  string;
  color: string;
};

// ── Allowed races for the dropdown ───────────────────────────────
const RACES = [
  "Human", "Elf", "Dwarf", "Goblin", "Gnome",
  "Kobold", "Orc", "Ogre", "Aasimar", "Tiefling",
];

// ── File validation constants ─────────────────────────────────────
const MAX_FILE_SIZE    = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES    = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function SubmitPage() {
  const supabase   = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [classes,    setClasses]    = useState<ClassOption[]>([]);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [form,       setForm]       = useState<FormData>({
    name: "", race: "", classId: "", age: "", bio: "",
  });
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [randomizing, setRandomizing] = useState(false);

  // ── Load classes on first render ──────────────────────────────
  if (!classesLoaded) {
    setClassesLoaded(true);
    supabase
      .from("class")
      .select("id, name, color")
      .order("name")
      .then(({ data }) => setClasses(data || []));
  }

  // ── Field change handler ───────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  // ── Image file validation (UX #6) ─────────────────────────────
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, or GIF images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 2MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // ── Inline form validation on blur (UX #6) ────────────────────
  function validateField(name: keyof FormData, value: string) {
    let error = "";
    if (name === "name"    && !value.trim()) error = "Character name is required.";
    if (name === "race"    && !value)        error = "Please select a race.";
    if (name === "classId" && !value)        error = "Please select a class.";
    if (name === "age") {
      if (!value)                            error = "Age is required.";
      else if (isNaN(Number(value)) || Number(value) <= 0 || Number(value) > 9999)
                                             error = "Enter a valid age (1–9999).";
    }
    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
  }

  // ── Full form validation before submit ────────────────────────
  function validateAll(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim())  newErrors.name    = "Character name is required.";
    if (!form.race)         newErrors.race    = "Please select a race.";
    if (!form.classId)      newErrors.classId = "Please select a class.";
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) <= 0)
                            newErrors.age     = "Enter a valid age (1–9999).";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── DeepSeek: generate bio only ───────────────────────────────
  async function handleGenerateBio() {
    if (!form.name || !form.race || !form.classId) {
      toast.error("Fill in name, race, and class before generating a bio.");
      return;
    }
    const className = classes.find((c) => String(c.id) === form.classId)?.name ?? "";
    setGenerating(true);
    try {
      const res = await fetch("/api/randomize", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          mode:      "bio",
          name:      form.name,
          race:      form.race,
          className,
          age:       form.age,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((prev) => ({ ...prev, bio: data.bio }));
      toast.success("Bio generated!");
    } catch {
      toast.error("Failed to generate bio. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  // ── DeepSeek: randomize entire character ──────────────────────
  async function handleRandomize() {
    setRandomizing(true);
    try {
      const res = await fetch("/api/randomize", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ mode: "full" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Find matching class id from the returned class name
      const matchedClass = classes.find(
        (c) => c.name.toLowerCase() === data.className?.toLowerCase()
      );

      setForm({
        name:    data.name    ?? "",
        race:    data.race    ?? "",
        classId: matchedClass ? String(matchedClass.id) : "",
        age:     String(data.age ?? ""),
        bio:     data.bio     ?? "",
      });
      setErrors({});
      toast.success("Character randomized! Review and submit when ready.");
    } catch {
      toast.error("Failed to randomize character. Try again.");
    } finally {
      setRandomizing(false);
    }
  }

  // ── Submit handler ────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      let image_url: string | null = null;

      // Upload image to Supabase Storage if provided
      if (imageFile) {
        const ext      = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("character-images")
          .upload(fileName, imageFile, { cacheControl: "3600", upsert: false });

        if (uploadError) throw new Error("Image upload failed.");

        const { data: urlData } = supabase.storage
          .from("character-images")
          .getPublicUrl(uploadData.path);

        image_url = urlData.publicUrl;
      }

      // Insert card — approved defaults to false (awaits admin review)
      const { error: insertError } = await supabase.from("cards").insert({
        name:      form.name.trim(),
        race:      form.race,
        class_id:  Number(form.classId),
        age:       Number(form.age),
        bio:       form.bio.trim() || null,
        image_url,
        approved:  false,
      });

      if (insertError) throw new Error(insertError.message);

      // Notify admin via Resend
      await fetch("/api/notify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:      form.name,
          race:      form.race,
          className: classes.find((c) => String(c.id) === form.classId)?.name ?? "",
          age:       form.age,
          bio:       form.bio,
        }),
      });

      toast.success("Character submitted! It will appear after admin approval.");

      // Reset form
      setForm({ name: "", race: "", classId: "", age: "", bio: "" });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Shared input style ────────────────────────────────────────
  const inputClass =
    "w-full px-3 py-2 rounded border text-base outline-none transition-all";
  const inputStyle = {
    fontFamily:  "var(--font-body)",
    background:  "var(--color-parchment-dark)",
    color:       "var(--color-ink)",
    borderColor: "var(--color-parchment-deeper)",
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-12">

      {/* Heading */}
      <h1
        className="text-4xl font-bold text-center mb-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
      >
        Submit a Character
      </h1>
      <p
        className="text-center mb-2"
        style={{ fontFamily: "var(--font-body)", color: "var(--color-ink-faded)" }}
      >
        Fill in the details below, or let the dice decide with Randomize.
        All submissions are reviewed before appearing in the compendium.
      </p>

      <div className="divider mb-6">
        <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)" }}>⚔</span>
      </div>

      {/* Randomize entire character button */}
      <button
        type="button"
        onClick={handleRandomize}
        disabled={randomizing}
        className="w-full py-3 rounded font-bold text-base mb-8 transition-opacity disabled:opacity-60"
        style={{
          fontFamily: "var(--font-display)",
          background: "var(--color-gold-dark)",
          color:      "var(--color-parchment)",
          border:     "1px solid var(--color-gold)",
        }}
      >
        {randomizing ? "Rolling the dice…" : "🎲 Randomize Full Character"}
      </button>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* Name */}
        <div>
          <label
            className="block text-sm font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Character Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={(e) => validateField("name", e.target.value)}
            placeholder="e.g. Aldric Ironwall"
            className={inputClass}
            style={inputStyle}
            maxLength={80}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Race */}
        <div>
          <label
            className="block text-sm font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Race *
          </label>
          <select
            name="race"
            value={form.race}
            onChange={handleChange}
            onBlur={(e) => validateField("race", e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Select a race…</option>
            {RACES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.race && (
            <p className="text-red-600 text-xs mt-1">{errors.race}</p>
          )}
        </div>

        {/* Class */}
        <div>
          <label
            className="block text-sm font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Class *
          </label>
          <select
            name="classId"
            value={form.classId}
            onChange={handleChange}
            onBlur={(e) => validateField("classId", e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Select a class…</option>
            {classes.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-red-600 text-xs mt-1">{errors.classId}</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label
            className="block text-sm font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Age *
          </label>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            onBlur={(e) => validateField("age", e.target.value)}
            placeholder="e.g. 34"
            min={1}
            max={9999}
            className={inputClass}
            style={inputStyle}
          />
          {errors.age && (
            <p className="text-red-600 text-xs mt-1">{errors.age}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Bio <span style={{ color: "var(--color-ink-faded)" }}>(optional)</span>
            </label>
            {/* Generate bio button */}
            <button
              type="button"
              onClick={handleGenerateBio}
              disabled={generating}
              className="text-xs px-3 py-1 rounded border transition-colors disabled:opacity-50"
              style={{
                fontFamily:  "var(--font-display)",
                borderColor: "var(--color-gold-dark)",
                color:       "var(--color-gold-dark)",
              }}
            >
              {generating ? "Writing…" : "✨ Generate Bio"}
            </button>
          </div>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="A brief backstory or description of your character…"
            rows={4}
            maxLength={500}
            className={`${inputClass} resize-none`}
            style={inputStyle}
          />
          <p
            className="text-xs text-right mt-0.5"
            style={{ color: "var(--color-ink-faded)" }}
          >
            {form.bio.length}/500
          </p>
        </div>

        {/* Image upload */}
        <div>
          <label
            className="block text-sm font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Character Portrait{" "}
            <span style={{ color: "var(--color-ink-faded)" }}>
              (optional — JPEG, PNG, WebP, GIF · max 2MB)
            </span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="w-full text-sm"
            style={{ color: "var(--color-ink-faded)" }}
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded border"
                style={{ borderColor: "var(--color-parchment-deeper)" }}
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs"
                style={{ color: "var(--color-crimson)" }}
              >
                Remove image
              </button>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded font-bold text-base mt-2 transition-opacity disabled:opacity-60"
          style={{
            fontFamily: "var(--font-display)",
            background: "var(--color-ink)",
            color:      "var(--color-parchment)",
            border:     "1px solid var(--color-ink-light)",
          }}
        >
          {submitting ? "Submitting…" : "📜 Submit Character"}
        </button>

      </form>
    </div>
  );
}
