"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-[var(--color-ink)] px-4 py-1.5 text-sm text-white hover:opacity-90"
    >
      Drucken / PDF
    </button>
  );
}
