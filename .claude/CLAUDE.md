# our-links — Claude Development Guide

## Project Overview
Open Session's link portal — the company's curated link tree at `links.opensession.co`. A small static-ish Next.js 16 site that surfaces our links, free resources, tech stack, and recent blog posts. Built with React 19, TypeScript, Tailwind 4, Framer Motion, and GSAP. Deployed to GitHub Pages with `basePath`-aware asset loading.

This is a public-facing brand surface, not an application — no auth, no database, no API routes. Every change should preserve performance and brand fidelity above all else.

## Essential Commands
```bash
bun dev          # Start dev server (http://localhost:3003)
bun run build    # Production build
bun run lint     # ESLint
```

## Tech Stack
- **Framework**: Next.js 16 App Router (React 19)
- **Styling**: Tailwind CSS 4 with semantic CSS variables (`src/app/theme.css`, `src/lib/brand-styles/`)
- **Animation**: Framer Motion (gestures, component animations) + GSAP (timelines, scroll-triggered effects)
- **Graphics**: OGL (WebGL) for the FaultyTerminal effect — must be lazy-loaded via `next/dynamic`
- **Icons**: Lucide React (the `Sparkles` icon is permanently banned — see Icon Guidelines below)
- **Deploy**: GitHub Pages (static export). Asset paths flow through `src/lib/assetPath.ts` for `basePath` correctness.

## Key Directories
```
src/
├── app/                      # Next.js pages, layout, global styles
│   ├── layout.tsx, page.tsx
│   ├── globals.css           # imports theme + brand-styles + Tailwind
│   └── theme.css             # semantic CSS variables
├── components/               # CardNav, OurLinks, FreeResources,
│                             # SubscribeModal, TechStack, RecentBlogs,
│                             # FaultyTerminal{Wrapper}, Footer, ShuffleText
├── lib/
│   ├── assetPath.ts          # basePath-aware asset URL helper
│   └── brand-styles/         # brand.css, typography.css, tokens.json
└── hooks/                    # useMediaQuery, etc.
```

## Claude Configuration Structure

The `.claude/` directory is organized for Claude Code CLI compatibility:

```
.claude/
├── CLAUDE.md                    # This file (CLI required at root)
├── settings.json                # MCP permissions (CLI required at root)
├── settings.local.json          # Local dev permissions (gitignored)
│
├── agents/                      # Autonomous workflows (CLI required at root)
│   ├── README.md
│   └── feature-dev/
│
├── commands/                    # Slash commands (CLI required at root)
│   ├── README.md
│   ├── audit-components.md      # /audit-components — React architecture audit
│   ├── restart.md
│   └── test-mcp.md
│
├── plugins/                     # Full capability packages (CLI required at root)
│   ├── agent-sdk-dev/
│   ├── code-review/
│   ├── commit-commands/
│   ├── feature-dev/
│   ├── hookify/
│   ├── plugin-dev/
│   ├── pr-review-toolkit/
│   └── ralph-wiggum/
│
├── skills/                      # Auto-activating knowledge (CLI required at root)
│   ├── bos-code-quality/
│   ├── brand-guidelines/
│   ├── frontend-design/
│   └── ...
│
├── brand/                       # Brand content (for creatives)
│   ├── identity/                # Brand guidelines, PDFs
│   ├── writing/                 # Writing style guides
│   └── assets/                  # Future: logos, images
│
├── data/                        # Reference data
│   └── news-sources.md
│
├── reference/                   # Documentation
│   ├── design-system.md         # BOS design system reference
│   ├── mcp-setup.md             # MCP server configuration
│   └── react-architecture.md    # 7-principle React architecture rules
│
└── system/                      # Auto-generated (read-only)
    └── architecture.md          # Codebase architecture
```

### Categories by Audience

| Category | Folder | Audience | Contents |
|----------|--------|----------|----------|
| **CLI Tools** | `agents/`, `commands/`, `plugins/`, `skills/` | Engineers | CLI-required paths |
| **Brand** | `brand/` | Creatives | Identity docs, writing styles, assets |
| **Data** | `data/` | Both | Reference data (news sources, etc.) |
| **Reference** | `reference/` | Both | Design system, MCP setup docs |
| **System** | `system/` | Both | Auto-generated architecture |

### Agents vs Commands vs Skills

| Type | Trigger | Purpose | Location |
|------|---------|---------|----------|
| **Agents** | Auto-activates on context | Autonomous multi-step workflows | `agents/` or `plugins/*/agents/` |
| **Commands** | User types `/command` | Single operations, user-controlled | `commands/` or `plugins/*/commands/` |
| **Skills** | Auto-activates on keywords | Context-aware knowledge injection | `skills/` or `plugins/*/skills/` |
| **Plugins** | Contains all of the above | Full-featured packages | `plugins/` |

### Plugin-Embedded Agents

Some agents live inside plugins as subagents for larger workflows:

| Plugin | Embedded Agents |
|--------|-----------------|
| `feature-dev` | code-architect, code-explorer, code-reviewer |
| `pr-review-toolkit` | code-reviewer, silent-failure-hunter, code-simplifier, comment-analyzer, pr-test-analyzer, type-design-analyzer |
| `plugin-dev` | agent-creator, skill-reviewer, plugin-validator |
| `agent-sdk-dev` | agent-sdk-verifier-ts, agent-sdk-verifier-py |
| `hookify` | conversation-analyzer |

### Where to Look First

- **Building a feature?** → Check `plugins/feature-dev/`
- **Reviewing a PR?** → Check `plugins/pr-review-toolkit/`
- **Creating a plugin?** → Check `plugins/plugin-dev/`
- **Brand questions?** → Check `brand/identity/`
- **Writing content?** → Check `brand/writing/`
- **Design system?** → Check `reference/design-system.md`

---

## Code Conventions

### TypeScript
- Strict mode enabled
- Prefer `interface` for component props
- Use Zod for runtime validation where needed

### Components
- Use semantic HTML and native ARIA attributes for accessibility (no React Aria here — we keep the bundle small for a public-facing link portal)
- Co-locate component-specific types in the same file
- Prefer composition over prop drilling
- See [reference/react-architecture.md](./reference/react-architecture.md) for the 7 architecture principles, and run `/audit-components` for a compliance check

### Styling with CSS Variables
All colors use semantic CSS variables from `theme.css`:
```css
/* Backgrounds */
var(--bg-primary)      /* Main background */
var(--bg-secondary)    /* Elevated surfaces */
var(--bg-tertiary)     /* Hover states */

/* Foreground/Text */
var(--fg-primary)      /* Primary text */
var(--fg-secondary)    /* Secondary text */
var(--fg-tertiary)     /* Muted/disabled */

/* Brand */
var(--fg-brand-primary)   /* Brand text/icons */
var(--bg-brand-solid)     /* Brand buttons */

/* Borders */
var(--border-primary)     /* Default borders */
var(--border-secondary)   /* Subtle borders */
```

---

## Design System Guidelines

### Border Styling (IMPORTANT)
**Avoid harsh white or brand-colored outlines.** Borders should be soft, subtle, and supportive.

#### Container Borders (Cards, Panels, Sections)
Use `--border-secondary` for containers - it provides a soft gray that works in both light and dark modes:
```css
/* Container borders - soft and subtle */
border border-[var(--border-secondary)]

/* Dividers inside containers */
border-t border-[var(--border-secondary)]
/* Or with reduced opacity for very subtle dividers */
border-t border-[var(--border-secondary)]/50
```

#### Interactive Element Borders (Inputs, Buttons)
```css
/* Default - subtle */
border border-[var(--border-secondary)]

/* Hover - slightly more visible */
hover:border-[var(--fg-tertiary)]

/* Focus - clear but not harsh */
focus:border-[var(--border-primary)]
```

#### NEVER use these (harsh/distracting)
```css
border-[var(--border-brand-solid)]   /* Too bright */
border-white                          /* Too harsh */
border-[var(--border-primary)]/40     /* Can appear washed out */
border-2                              /* Too thick */
focus:ring-2 ring-[var(--bg-brand-solid)]  /* Too prominent */
```

#### ALWAYS prefer
```css
border border-[var(--border-secondary)]  /* Soft container borders */
hover:border-[var(--fg-tertiary)]        /* Subtle hover state */
focus:border-[var(--border-primary)]     /* Clear focus state */
```

### Card Pattern
```css
bg-[var(--bg-secondary)]/30
border border-[var(--border-secondary)]
hover:bg-[var(--bg-secondary)]/60
```

### Input Pattern
```css
bg-[var(--bg-secondary)]/30
border border-[var(--border-secondary)]
focus:border-[var(--border-primary)]
focus:bg-[var(--bg-secondary)]/50
```

### Brand Color Usage
Use `--fg-brand-primary` and `--bg-brand-solid` sparingly:
- Primary action buttons (Submit, Send)
- Type badges/labels (small elements)
- Accent highlights
- NOT for borders or outlines

### Forbidden Icons
**NEVER use the `Sparkles` icon from Lucide. EVER.** This is a hard rule with no exceptions. The 4-point star/sparkle icon is generic AI aesthetic that doesn't match the brand vision. Do not import it, do not use it, do not suggest it. For empty states or prompts, use text-only or more purposeful iconography.

### Interactive States
```css
/* Hover-revealed actions */
opacity-0 group-hover:opacity-100 transition-opacity duration-150

/* Toggle buttons - use background, not borders */
/* Inactive */ text-[var(--fg-tertiary)] hover:bg-[var(--bg-secondary)]/50
/* Active */   bg-[var(--bg-tertiary)] text-[var(--fg-primary)]
```

---

## Icon Guidelines

### Philosophy: Don't Overuse Icons
Icons should be **functional, not decorative**. They work best when they aid recognition or provide affordances for interaction. Overusing icons creates visual noise and dilutes their communicative power.

### Where Icons ARE Appropriate
- **Buttons** - Action buttons with icons (e.g., `<Plus /> Add Item`)
- **Icon buttons** - Standalone icon-only buttons with clear actions
- **Navigation items** - Sidebar/menu items where icons aid recognition
- **Cards** - In the icon area of selection cards (upper-left)
- **Tab navigation** - Tab buttons can have icons
- **Status indicators** - Success/error/warning states

### Where Icons are NOT Appropriate
- **Section headers** - `<h3>` titles should NOT have icons next to them
- **Modal headers** - Title + description only, no decorative icons
- **Form labels** - Text-only labels
- **Page headers** - Main `<h1>` titles should NOT have icons
- **Duplicated contexts** - If a card has an icon, don't repeat it in subtitles

### Banned Icons (ABSOLUTE BAN - NO EXCEPTIONS)
- **`Sparkles`** - The 4-point star/galaxy icon from Lucide Icons is corny and doesn't match the app's vibe or brand language. **NEVER use this icon anywhere in the codebase. This is a HARD BAN with zero exceptions. Do not import it, do not suggest it, do not use it under any circumstances.**

**Alternatives by context:**
- For release updates/announcements: Use `Bell` or `Megaphone`
- For creative/artistic contexts: Use `Wand2`, `Palette`, or `PenTool`
- For AI/automation features: Use `Wand2`, `Target`, `Lightbulb`, or `Zap`
- For empty states: Use text-only or more purposeful iconography

### Section Header Pattern (IMPORTANT)
**Do NOT place icons before section headers.** Headers should be text-only.

NEVER:
```tsx
<div className="flex items-center gap-3">
  <div className="p-2 bg-[var(--bg-tertiary)] rounded-lg">
    <SomeIcon className="w-5 h-5" />
  </div>
  <div>
    <h3>Section Title</h3>
    <p>Description text</p>
  </div>
</div>
```

INSTEAD:
```tsx
<div>
  <h3>Section Title</h3>
  <p>Description text</p>
</div>
```

### Modal Header Pattern
**Do NOT place icons in modal headers.** The header should contain only:
- Title (h2) - left-aligned
- Subtitle/description text (optional) - left-aligned
- Close button (X) - right-aligned

Icons belong in the modal body (e.g., selection cards), not duplicated in the header.

### Selection Card Icon Pattern
**Icons in selection cards should appear ONLY in the upper-left corner.** Do not repeat icons in subtitles, labels, or other areas of the card - this is redundant.

Card structure:
```tsx
<button className="card">
  {/* Icon - upper left only */}
  <div className="p-3 rounded-xl bg-[var(--bg-primary)] border">
    <Icon className="w-6 h-6" />
  </div>

  {/* Title */}
  <h3>Card Title</h3>

  {/* Description */}
  <p>Description text</p>

  {/* Subtitle - TEXT ONLY, no icon */}
  <div className="text-xs text-[var(--fg-quaternary)]">
    Subtitle text only
  </div>
</button>
```

NEVER put icons in card subtitles:
```tsx
<div className="flex items-center gap-2 text-xs">
  <SomeIcon className="w-3.5 h-3.5" />
  Subtitle text
</div>
```

---

## Brand Colors Reference
| Token | Hex | Usage |
|-------|-----|-------|
| Charcoal | `#191919` | Dark backgrounds |
| Vanilla | `#FFFAEE` | Light/cream accents |
| Aperol | `#FE5102` | Primary brand color |

---

## MCP Servers (Model Context Protocol)

This project uses MCP servers to extend Claude's capabilities with external tools and services.

| Server | Purpose |
|--------|---------|
| **GitHub** | Repository, issues, PRs, code search — primary tool given the GitHub Pages deploy |
| **Vercel** | Deployments, logs (if/when we move off GitHub Pages) |
| **Figma** | Design context, screenshots, code generation for new sections |
| **Firecrawl** | Web scraping, search, brand audits — see [skills/firecrawl-web-tools.md](./skills/firecrawl-web-tools.md) |
| **Notion** | Documentation, pages, databases (link source-of-truth, if curated there) |

**For setup instructions, see [reference/mcp-setup.md](./reference/mcp-setup.md)**

This is a public link portal — there is no Supabase, no auth, and no outbound MCP server exposed by this repo. Brand-knowledge MCP lives in the BOS 3.0 repo, not here.
