# /audit-components — React Architecture Audit

Scan all components against the principles in [.claude/reference/react-architecture.md](../reference/react-architecture.md), produce a structured report with pass/fail per check, and output a prioritized fix plan.

## Usage

```
/audit-components
```

**This command is read-only and never modifies files.**

## Scope

- All `.tsx` files under [src/app/](../../src/app/) and [src/components/](../../src/components/)
- Excludes [src/lib/](../../src/lib/), [src/hooks/](../../src/hooks/) (not components)

## Behavior

Run all checks below in order. Use Grep and Glob tools (not Bash) for all searches. Collect findings per check, then produce the final report.

---

### Check 1: Component Size (Principle 2 — Single Responsibility)

For every `.tsx` file in scope, count lines (excluding blank lines, import lines, and type/interface declaration blocks).

- **PASS**: under 150 lines
- **WARN**: 150–200 lines
- **FAIL**: over 200 lines

Record each WARN and FAIL file with its line count.

---

### Check 2: Duplicated Reveal / Animation Patterns (Principle 3 — DRY)

Search for inline reveal animations that should be consolidated:

- Grep pattern: `useInView` in `.tsx` files under [src/components/](../../src/components/)
- Cross-reference: the same file using a `motion.` element from Framer Motion
- If 2+ files match, flag as WARN — extract a shared `<ScrollReveal>` component

Other duplication patterns to check:

**Form submission state machine:**
- Grep pattern: `"idle" \| "loading" \| "success" \| "error"` (or similar union) in `.tsx` files
- If found in 2+ files, flag as WARN — extract a `useFormSubmission` hook

**Word-split headline animation:**
- Grep pattern: `\.split\(" "\)\.map` in `.tsx` files
- If found in 2+ files, flag as WARN — extract a shared headline component

---

### Check 3: Hardcoded Business Strings (Principle 7)

Search for hardcoded business values in component files:

- Grep pattern: `mailto:` followed by an email address — should be in `src/lib/constants.ts`
- Grep pattern: `https://cal\.com/` — booking URLs should be in constants
- Grep pattern: `https://[a-z]+\.opensession\.co` — domain links should be in constants
- Grep pattern: `\$[0-9,]+` in `.tsx` files (any pricing strings) — should live in a data file
- Grep pattern: hardcoded link arrays — components like [OurLinks.tsx](../../src/components/OurLinks.tsx), [FreeResources.tsx](../../src/components/FreeResources.tsx), [TechStack.tsx](../../src/components/TechStack.tsx), [RecentBlogs.tsx](../../src/components/RecentBlogs.tsx) should source their data from `src/data/` or `src/lib/`, not inline arrays

Each match is a WARN. If `src/lib/constants.ts` or `src/data/*.ts` exists and exports these values, downgrade matching files that import from them to PASS.

---

### Check 4: Props Typing (Props Typing Convention)

Search for anti-patterns:

**defaultProps usage:**
- Grep pattern: `\.defaultProps\s*=` in `.tsx` files
- Each match is a FAIL — React 19 deprecated

**Inline prop types (3+ properties):**
- Grep pattern: `function [A-Z]\w+\([^)]*:\s*\{` in `.tsx` files
- Exclude single-prop cases like `{ children }` — only flag complex inline types
- Each match is a WARN — should use a named `interface`

**`any` type usage:**
- Grep pattern: `: any` or `as any` in `.tsx` files under `src/`
- Each match is a FAIL

---

### Check 5: Prop Drilling (Principle 4)

This check is heuristic. For each component that accepts props:

- If a prop name appears in a parent component's props AND is passed through unchanged to a child, note it
- Only flag if the same prop passes through 3+ levels

Lighter approach:
- Grep for components that accept and pass the same prop name to a child: pattern `(\w+)=\{\1\}` (passing prop with same name)
- Cross-reference the parent to see if it also received that prop
- Flag chains of 3+ as WARN

If no clear violations are found, report as PASS with a note that this was a heuristic check.

---

### Check 6: Heavy Imports Without Lazy Loading (Principle 5)

Search for client-side heavy modules imported eagerly:

- Grep pattern: `import .* from 'ogl'` — WebGL library, must be `next/dynamic` with `ssr: false`
- Grep pattern: `import .* from 'gsap'` outside of an effect/handler — large bundle, prefer dynamic import
- Grep pattern: `'use client'` at the top of a file that imports OGL/GSAP without dynamic — WARN if the surrounding component is not itself dynamic-loaded

Cross-reference: if the import is wrapped via `next/dynamic` in a sibling file (e.g., [FaultyTerminalWrapper.tsx](../../src/components/FaultyTerminalWrapper.tsx)), the underlying file is fine — pass.

---

### Check 7: Shared Component Forking (Principle 6)

Heuristic — look for two or more components that re-implement the same visual primitive instead of sharing one:

- Grep pattern: card-shaped containers using identical class strings (`bg-[var(--bg-secondary)]/30 border border-[var(--border-secondary)]`) appearing in 3+ files
- If found, flag as WARN — extract a `<Card>` primitive

Until [src/components/shared/](../../src/components/) exists, the rule is "don't fork" — same pattern in 2 files is fine, 3+ is a signal to extract.

---

## Report Format

Output this structure:

```markdown
## React Architecture Audit Report

**Date:** {today}
**Files scanned:** {n}

### Summary

| Check | Status | Details |
|-------|--------|---------|
| Component Size | {PASS/WARN/FAIL} | {n} files over limit |
| Duplicated Reveal/Animation | {PASS/WARN/FAIL} | {n} duplications |
| Hardcoded Strings | {PASS/WARN/FAIL} | {n} hardcoded values |
| Props Typing | {PASS/WARN/FAIL} | {n} issues |
| Prop Drilling | {PASS/WARN/FAIL} | {n} chains found |
| Heavy Imports | {PASS/WARN/FAIL} | {n} eager imports |
| Shared Component Forking | {PASS/WARN/FAIL} | {n} forked patterns |

**Overall: {n}/7 checks passing**

### Findings

#### {Check name} — {PASS/WARN/FAIL}

{For each non-passing check, list every finding with:}
- File path
- What was found
- Severity (FAIL or WARN)
- Suggested fix (one line)

### Fix Plan

{Generate a prioritized list of fixes, ordered by:}
1. FAILs first (must fix)
2. WARNs second (should fix)
3. Group related fixes together (e.g., all reveal-animation extractions in one task)

Format each fix as:

#### Fix {n}: {short description}
**Priority:** {FAIL/WARN}
**Files:** {list of affected files}
**Action:** {what to do — be specific}
**Estimated scope:** {one-line, small/medium/large}
```

## Implementation Notes

- Use Grep (not Bash) for all searches. Prefer `files_with_matches` mode for existence checks and `content` mode when you need line-level detail.
- Use Glob to count files in scope.
- The report is a point-in-time snapshot. Re-run after fixes to verify.
- This command is purely diagnostic — do not modify any files.
- Cross-reference findings with [.claude/reference/react-architecture.md](../reference/react-architecture.md) for the authoritative rules.
- When the same file appears in multiple checks, consolidate in the fix plan so it only needs to be touched once.
