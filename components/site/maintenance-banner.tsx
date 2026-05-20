export function MaintenanceBanner() {
  const msg = process.env.MAINTENANCE_MESSAGE;
  if (!msg) return null;
  return (
    <div className="border-b border-[var(--color-warn)]/30 bg-[var(--color-warn-soft)] px-4 py-2.5 text-sm text-[var(--color-warn)]">
      <div className="container-page flex items-center gap-2">
        <span className="font-medium">⚠ Hinweis:</span>
        <span>{msg}</span>
      </div>
    </div>
  );
}
