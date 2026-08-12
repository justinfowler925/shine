// Token swatch — renders every semantic token as a labeled chip.
// Install into any @shine project to eyeball the active theme in situ.

const TOKENS = [
  "background",
  "foreground",
  "card",
  "popover",
  "primary",
  "secondary",
  "muted",
  "accent",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

export function Swatch() {
  return (
    <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4">
      {TOKENS.map((name) => (
        <div
          key={name}
          data-token={name}
          className="flex items-center gap-2 rounded-md border border-border bg-card p-2"
        >
          <span
            aria-hidden
            className="size-8 shrink-0 rounded-sm border border-border"
            style={{ background: `var(--${name})` }}
          />
          <code className="text-xs text-muted-foreground">{name}</code>
        </div>
      ))}
    </div>
  );
}
