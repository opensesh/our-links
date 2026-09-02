/**
 * Design Philosophy bin — content TBD.
 *
 * TODO(karim): this is the section we're shaping together. Drop the
 * inspiration components here; the Bin wrapper already handles the
 * expand/collapse, so this component only needs to render the body.
 */
export function DesignPhilosophyPanel() {
  return (
    <div className="bin-panel-inner flex flex-col gap-2">
      <span className="font-accent text-[10px] uppercase tracking-[0.08em] text-[var(--color-aperol)]">
        Coming soon
      </span>
      <p className="text-sm text-[var(--fg-secondary)] max-w-[52ch]">
        How we think about brand, code, and creative work — and why
        human-centered design still wins in the AI era. We&rsquo;re building
        this one out next.
      </p>
    </div>
  );
}
