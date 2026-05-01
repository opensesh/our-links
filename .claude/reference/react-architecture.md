# React Architecture Reference

> Applies to all files under [src/components/](../../src/components/), [src/app/](../../src/app/), [src/hooks/](../../src/hooks/), [src/lib/](../../src/lib/).

This is a link portal (the company's link tree) — a small Next.js 16 / React 19 app. The principles below are intentionally lightweight: they prevent the codebase from growing into something hard to maintain as more cards, sections, and links are added.

---

## Principle 1: Separation of Concerns

**Rule:** Each component handles one UI job and operates independently.

**Threshold:** If a component does rendering + data fetching + complex state management, it needs to be split.

```tsx
// DO — page orchestrates, components render
// src/app/page.tsx
export default function Home() {
  return (
    <main>
      <CardNav />
      <OurLinks />
      <FreeResources />
    </main>
  );
}

// DON'T — one component fetches, validates, submits, and renders
export function SubscribeModal() {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  // ...validation logic, API call, form state, animation, render — all in one place
}
```

---

## Principle 2: Single Responsibility

**Rule:** One reason to change per file. Each module tackles one functionality.

**Thresholds:**
- **150 lines** — soft limit, review for extraction opportunities
- **200 lines** — hard limit, must decompose before merging

Line count excludes imports and type definitions.

```tsx
// DO — dedicated utility for a single task
// src/lib/assetPath.ts
export function assetPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return `${base}${path}`;
}
```

When a single component file pushes 200 lines, the usual culprits are: an inline animation hook, an inline state machine, or multiple unrelated subcomponents. Extract whichever is the cleanest seam.

---

## Principle 3: DRY / Pattern Consolidation

**Rule:** No pattern should be duplicated across 2+ files without extraction into a shared component or hook.

When you see the same logic in two places, extract it. Three similar lines is better than a premature abstraction — but two identical 15-line blocks is not.

**Patterns to watch for in this repo:**

| Pattern | When to extract |
|---------|-----------------|
| `useInView` + `motion.div` reveal animation | Once 2+ sections roll their own, extract a `<ScrollReveal>` |
| Form submission state machine (`idle/loading/success/error`) | Once 2+ forms share the shape, extract a `useFormSubmission` hook |
| Card-with-icon layout (used by `OurLinks`, `FreeResources`, etc.) | If 3+ surfaces share the structure, extract a `<LinkCard>` |
| Hardcoded URL list / link metadata | Move into `src/lib/links.ts` or `src/data/links.ts` |

---

## Principle 4: State Management

**Rule:** If a prop passes through 2+ intermediary components unchanged, it's prop drilling. Extract to Context, composition, or URL state.

**Threshold:** Max 2 levels of prop passing.

```tsx
// DO — composition avoids drilling
function HomePage() {
  const links = useLinks();
  return (
    <>
      <OurLinks links={links.featured} />
      <FreeResources resources={links.resources} />
    </>
  );
}

// DON'T — prop drills through intermediaries
<Page user={user}>
  <Header user={user}>
    <Avatar user={user} />     {/* 3 levels — use Context */}
  </Header>
</Page>
```

This is a small app today; the rule exists to prevent the situation as the link portal grows.

---

## Principle 5: Performance Optimization

**Rule:** Lazy load heavy components. Code-split where appropriate. Profile before optimizing.

```tsx
// DO — lazy load WebGL / heavy effects (already done correctly in this repo)
// src/components/FaultyTerminalWrapper.tsx
const FaultyTerminal = dynamic(() => import('./FaultyTerminal'), { ssr: false });

// DON'T — eagerly import a heavy component that's below the fold
import { HeavyChart } from '@/components/charts/heavy-chart';
```

**Rules of thumb:**
- Use `next/dynamic` with `ssr: false` for client-only heavy components (OGL/WebGL, GSAP scroll-triggered effects, large editors)
- Don't sprinkle `React.memo` or `useMemo` everywhere — profile first
- Refs over state for values read in animation loops (Framer Motion / GSAP timelines)

---

## Principle 6: Shared Component Usage

**Rule:** When a shared component or pattern exists, use it. Do not reimplement with raw markup or inline logic.

This repo doesn't have a dedicated `src/components/shared/` directory yet — extract one once 2+ surfaces share a pattern. When that happens, every consumer must use the shared component instead of re-inlining the markup.

Until a shared layer exists, the equivalent rule is: **don't fork a component**. If `OurLinks` and `FreeResources` both need a card layout, give them the same primitive instead of growing two divergent implementations.

---

## Principle 7: Constants Centralization

**Rule:** No hardcoded business strings (emails, URLs, link metadata, pricing) in component files. Import from a constants or data file.

```tsx
// DO
import { CONTACT_EMAIL, BOOKING_URL } from '@/lib/constants';

// DO — link list lives as data
import { LINKS } from '@/data/links';

// DON'T
<a href="mailto:hello@opensession.co">hello@opensession.co</a>
<a href="https://cal.com/opensession">Book a call</a>
```

For a link portal this is especially important: the entire reason the site exists is to surface a curated list of URLs. That list belongs in a data file, not interleaved with JSX.

---

## Props Typing Convention

**Rule:** Use `interface` for component props. Use `type` only for union/discriminated union patterns.

```tsx
// DO — interface for props
interface LinkCardProps {
  title: string;
  href: string;
  icon?: LucideIcon;
}

// DO — type for discriminated union (Button-style component)
type ButtonProps = ButtonAsButton | ButtonAsLink;

// DON'T — inline props (3+ properties)
function Card({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: LucideIcon }) {}

// DON'T — defaultProps (React 19 deprecated)
Card.defaultProps = { desc: 'Default' };

// DO — default values via destructuring
function Card({ title, desc = 'Default' }: LinkCardProps) {}
```

Avoid `: any` and `as any` in `.tsx` files — a missing type is almost always a sign that the data shape is unclear, not that types are getting in the way.
