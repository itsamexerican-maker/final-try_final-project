"use client";
// app/admin/page.tsx
// Admin panel — protected by middleware (admin emails only).
// Features:
// - Pending submissions queue (approve / reject)
// - Full approved cards list (edit name/race/class/age/bio/image + delete)
// - DeepSeek bio regeneration per card
// - Delete confirmation modal (UX #5)
// - Toast notifications (UX #4)

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import DeleteModal from "@/components/DeleteModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";

// ── Types ────────────────────────────────────────────────────────
type Card = {
  id:          string;
  name:        string;
  race:        string;
  age:         number;
  bio:         string | null;
  image_url:   string | null;
  approved:    boolean;
  class_name:  string;
  class_color: string;
  class_id?:   number;
};

type ClassOption = {
  id:    number;
  name:  string;
  color: string;
};

const RACES = [
  "Human","Elf","Dwarf","Goblin","Gnome",
  "Kobold","Orc","Ogre","Aasimar","Tiefling",
];

const MAX_FILE_SIZE  = 2 * 1024 * 1024;
const ALLOWED_TYPES  = ["image/jpeg","image/png","image/webp","image/gif"];

export default function AdminPage() {
  const supabase = createClient();

  const [pending,   setPending]   = useState<Card[]>([]);
  const [approved,  setApproved]  = useState<Card[]>([]);
  const [classes,   setClasses]   = useState<ClassOption[]>([]);
  const [loading,   setLoading]   = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm,  setEditForm]  = useState<Partial<Card & { classId: string }>>({});
  const [editImage, setEditImage] = useState<File | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [genBio,    setGenBio]    = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({
    open: false, id: "", name: "",
  });
  const [deleting, setDeleting] = useState(false);

  // ── Fetch all data ───────────────────────────────────────────
  async function fetchData() {
    setLoading(true);
    const [pendingRes, approvedRes, classRes] = await Promise.all([
      supabase.from("cards_with_class").select("*").eq("approved", false).order("created_at"),
      supabase.from("cards_with_class").select("*").eq("approved", true).order("created_at", { ascending: false }),
      supabase.from("class").select("id, name, color").order("name"),
    ]);
    setPending(pendingRes.data  || []);
    setApproved(approvedRes.data || []);
    setClasses(classRes.data   || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  // ── Approve a pending card ───────────────────────────────────
  async function handleApprove(id: string) {
    const res = await fetch("/api/admin/approve", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Character approved!");
      fetchData();
    } else {
      toast.error("Failed to approve.");
    }
  }

  // ── Reject a pending card ────────────────────────────────────
  async function handleReject(id: string) {
    const res = await fetch("/api/admin/reject", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Submission rejected and removed.");
      fetchData();
    } else {
      toast.error("Failed to reject.");
    }
  }

  // ── Open delete modal ────────────────────────────────────────
  function openDelete(id: string, name: string) {
    setDeleteModal({ open: true, id, name });
  }

  // ── Confirm delete ───────────────────────────────────────────
  async function handleDelete() {
    setDeleting(true);
    const res = await fetch("/api/admin/delete", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: deleteModal.id }),
    });
    setDeleting(false);
    setDeleteModal({ open: false, id: "", name: "" });
    if (res.ok) {
      toast.success("Character deleted.");
      fetchData();
    } else {
      toast.error("Failed to delete.");
    }
  }

  // ── Start editing a card ─────────────────────────────────────
  function startEdit(card: Card) {
    setEditingId(card.id);
    setEditForm({
      name:    card.name,
      race:    card.race,
      age:     card.age,
      bio:     card.bio ?? "",
      classId: String(card.class_id ?? ""),
    });
    setEditImage(null);
  }

  // ── Save edits ───────────────────────────────────────────────
  async function handleSave(cardId: string, currentImageUrl: string | null) {
    setSaving(true);
    try {
      let image_url = currentImageUrl;

      // Upload new image if provided
      if (editImage) {
        if (!ALLOWED_TYPES.includes(editImage.type)) {
          toast.error("Invalid image type."); setSaving(false); return;
        }
        if (editImage.size > MAX_FILE_SIZE) {
          toast.error("Image must be under 2MB."); setSaving(false); return;
        }
        const ext      = editImage.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data: up, error: upErr } = await supabase.storage
          .from("character-images")
          .upload(fileName, editImage, { upsert: false });
        if (upErr) throw new Error("Image upload failed.");
        const { data: urlData } = supabase.storage
          .from("character-images")
          .getPublicUrl(up.path);
        image_url = urlData.publicUrl;
      }

      const res = await fetch("/api/admin/approve", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          id:       cardId,
          update:   true,
          name:     editForm.name,
          race:     editForm.race,
          age:      Number(editForm.age),
          bio:      editForm.bio || null,
          class_id: Number(editForm.classId),
          image_url,
        }),
      });

      // Use supabase directly for update since approve route only patches approved flag
      const { error } = await supabase.from("cards").update({
        name:      editForm.name,
        race:      editForm.race,
        age:       Number(editForm.age),
        bio:       editForm.bio || null,
        class_id:  Number(editForm.classId),
        image_url,
      }).eq("id", cardId);

      if (error) throw error;

      toast.success("Character updated!");
      setEditingId(null);
      fetchData();
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  // ── DeepSeek: regenerate bio for a card being edited ────────
  async function handleRegenBio(cardId: string) {
    const className = classes.find((c) => String(c.id) === editForm.classId)?.name ?? "";
    setGenBio(true);
    try {
      const res = await fetch("/api/randomize", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          mode:      "bio",
          name:      editForm.name,
          race:      editForm.race,
          className,
          age:       editForm.age,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditForm((prev) => ({ ...prev, bio: data.bio }));
      toast.success("Bio regenerated!");
    } catch {
      toast.error("Failed to regenerate bio.");
    } finally {
      setGenBio(false);
    }
  }

  // ── Shared styles ────────────────────────────────────────────
  const inputClass = "w-full px-2 py-1 rounded border text-sm outline-none";
  const inputStyle = {
    fontFamily:  "var(--font-body)",
    background:  "var(--color-parchment)",
    color:       "var(--color-ink)",
    borderColor: "var(--color-parchment-deeper)",
  };

  if (loading) return <LoadingSpinner message="Loading the admin archives…" />;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <h1
        className="text-4xl font-bold text-center mb-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
      >
        Admin Panel
      </h1>
      <div className="divider mb-8">
        <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)" }}>⚔</span>
      </div>

      {/* ── Pending submissions ──────────────────────────────── */}
      <section className="mb-12">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          Pending Submissions ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <p style={{ color: "var(--color-ink-faded)" }}>
            No submissions awaiting approval. The realm is quiet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((card) => (
              <div
                key={card.id}
                className="flex items-start gap-4 p-4 rounded border"
                style={{
                  background:  "var(--color-parchment-dark)",
                  borderColor: "var(--color-parchment-deeper)",
                }}
              >
                {/* Avatar */}
                <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={card.image_url || `https://robohash.org/${card.id}?set=set2&size=80x80`}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {card.name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-ink-faded)" }}>
                    {card.race} · {card.class_name} · Age {card.age}
                  </p>
                  {card.bio && (
                    <p className="text-sm mt-1 italic" style={{ color: "var(--color-ink-light)" }}>
                      {card.bio}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(card.id)}
                    className="px-3 py-1 rounded text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-display)",
                      background: "#2d6a2d",
                      color:      "#f4e9d0",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(card.id)}
                    className="px-3 py-1 rounded text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-display)",
                      background: "#8b1a1a",
                      color:      "#f4e9d0",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Approved cards ───────────────────────────────────── */}
      <section>
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          Approved Characters ({approved.length})
        </h2>

        <div className="flex flex-col gap-4">
          {approved.map((card) => (
            <div
              key={card.id}
              className="p-4 rounded border"
              style={{
                background:  "var(--color-parchment-dark)",
                borderColor: "var(--color-parchment-deeper)",
              }}
            >
              {editingId === card.id ? (
                /* ── Edit form ─────────────────────────────── */
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold block mb-0.5"
                        style={{ fontFamily: "var(--font-display)" }}>Name</label>
                      <input
                        value={editForm.name ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-0.5"
                        style={{ fontFamily: "var(--font-display)" }}>Race</label>
                      <select
                        value={editForm.race ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, race: e.target.value }))}
                        className={inputClass} style={inputStyle}
                      >
                        {RACES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-0.5"
                        style={{ fontFamily: "var(--font-display)" }}>Class</label>
                      <select
                        value={editForm.classId ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, classId: e.target.value }))}
                        className={inputClass} style={inputStyle}
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={String(c.id)}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-0.5"
                        style={{ fontFamily: "var(--font-display)" }}>Age</label>
                      <input
                        type="number" min={1} max={9999}
                        value={editForm.age ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, age: Number(e.target.value) }))}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-xs font-semibold"
                        style={{ fontFamily: "var(--font-display)" }}>Bio</label>
                      <button
                        onClick={() => handleRegenBio(card.id)}
                        disabled={genBio}
                        className="text-xs px-2 py-0.5 rounded border"
                        style={{ borderColor: "var(--color-gold-dark)", color: "var(--color-gold-dark)" }}
                      >
                        {genBio ? "Writing…" : "✨ Regen Bio"}
                      </button>
                    </div>
                    <textarea
                      rows={3} maxLength={500}
                      value={editForm.bio ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                      className={`${inputClass} resize-none`} style={inputStyle}
                    />
                  </div>

                  {/* Image upload */}
                  <div>
                    <label className="text-xs font-semibold block mb-0.5"
                      style={{ fontFamily: "var(--font-display)" }}>
                      Replace Image (JPEG/PNG/WebP/GIF · max 2MB)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setEditImage(e.target.files?.[0] ?? null)}
                      className="text-xs w-full"
                    />
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleSave(card.id, card.image_url)}
                      disabled={saving}
                      className="px-4 py-1.5 rounded text-sm font-semibold disabled:opacity-60"
                      style={{ fontFamily: "var(--font-display)", background: "var(--color-ink)", color: "var(--color-parchment)" }}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 rounded text-sm font-semibold border"
                      style={{ fontFamily: "var(--font-display)", borderColor: "var(--color-parchment-deeper)", color: "var(--color-ink-faded)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Read view ─────────────────────────────── */
                <div className="flex items-start gap-4">
                  <div className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={card.image_url || `https://robohash.org/${card.id}?set=set2&size=80x80`}
                      alt={card.name} fill className="object-cover" sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>{card.name}</p>
                    <p className="text-sm" style={{ color: "var(--color-ink-faded)" }}>
                      {card.race} · {card.class_name} · Age {card.age}
                    </p>
                    {card.bio && (
                      <p className="text-sm mt-1 italic" style={{ color: "var(--color-ink-light)" }}>
                        {card.bio}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(card)}
                      className="px-3 py-1 rounded text-sm font-semibold border"
                      style={{
                        fontFamily:  "var(--font-display)",
                        borderColor: "var(--color-gold-dark)",
                        color:       "var(--color-gold-dark)",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDelete(card.id, card.name)}
                      className="px-3 py-1 rounded text-sm font-semibold"
                      style={{ fontFamily: "var(--font-display)", background: "#8b1a1a", color: "#f4e9d0" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Delete confirmation modal (UX #5) */}
      <DeleteModal
        isOpen={deleteModal.open}
        cardName={deleteModal.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: "", name: "" })}
        loading={deleting}
      />

    </div>
  );
}
