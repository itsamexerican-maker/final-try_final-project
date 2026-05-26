"use client";
// components/DeleteModal.tsx
// UX Polish #5 — Confirmation modal for delete actions.
// Shown before permanently deleting a character card.
// Has a Cancel button and a red Delete button.

type Props = {
  isOpen:    boolean;
  cardName:  string;
  onConfirm: () => void;
  onCancel:  () => void;
  loading?:  boolean;
};

export default function DeleteModal({
  isOpen,
  cardName,
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    // ── Backdrop ──────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(44, 24, 16, 0.6)" }}
      onClick={onCancel}
    >
      {/* ── Modal box ─────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-sm rounded-lg border-2 p-6 shadow-xl"
        style={{
          background:   "var(--color-parchment)",
          borderColor:  "var(--color-gold-dark)",
        }}
        // Prevent backdrop click from closing when clicking inside
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="text-4xl text-center mb-3">⚠️</div>

        {/* Title */}
        <h2
          className="text-xl font-bold text-center mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          Delete Character?
        </h2>

        {/* Message */}
        <p
          className="text-center text-sm mb-6"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-ink-faded)" }}
        >
          Are you sure you want to permanently delete{" "}
          <strong style={{ color: "var(--color-ink)" }}>{cardName}</strong>?
          This cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded border font-semibold text-sm transition-colors hover:bg-parchment-dark disabled:opacity-50"
            style={{
              fontFamily:  "var(--font-display)",
              borderColor: "var(--color-parchment-deeper)",
              color:       "var(--color-ink-faded)",
            }}
          >
            Cancel
          </button>

          {/* Delete — red to signal danger */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded font-semibold text-sm transition-colors disabled:opacity-50"
            style={{
              fontFamily: "var(--font-display)",
              background: "#8b1a1a",
              color:      "#f4e9d0",
            }}
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
