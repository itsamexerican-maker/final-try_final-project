// components/LoadingSpinner.tsx
// UX Polish #1 — Loading state
// Shown while data is being fetched from Supabase.
// Displays a spinning animation and a friendly message.

type Props = {
  message?: string;
};

export default function LoadingSpinner({ message = "Loading…" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      {/* Spinning ring */}
      <div
        className="w-12 h-12 rounded-full border-4 animate-spin"
        style={{
          borderColor:      "var(--color-parchment-deeper)",
          borderTopColor:   "var(--color-gold)",
        }}
      />
      {/* Friendly message */}
      <p
        className="text-lg"
        style={{
          fontFamily: "var(--font-display)",
          color:      "var(--color-ink-faded)",
        }}
      >
        {message}
      </p>
    </div>
  );
}
