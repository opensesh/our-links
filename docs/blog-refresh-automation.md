# Blog Refresh Automation — Options & Recommendation

## Today's workflow (manual)

Blog data lives in [`public/data/blogs.json`](../public/data/blogs.json), generated at build time by [`scripts/fetch-rss.ts`](../scripts/fetch-rss.ts).

The script:
1. Fetches Substack's RSS feed for the post list.
2. For each post, fetches the live post page's HTML and reads `og:image` + `og:description` (fresher than the RSS feed's cached `<description>`).
3. Writes the result to `public/data/blogs.json`.

The site (static export → GitHub Pages) only reflects what was last committed to that file. So today, every new post or edit requires:

```bash
bun run scripts/fetch-rss.ts
git add public/data/blogs.json
git commit -m "chore(blogs): refresh feed"
git push
```

…and then a GitHub Pages re-deploy.

## Three ways to automate this

### Option 1 — Pre-build hook

Add the fetch to the build pipeline so every deploy auto-pulls the latest:

```jsonc
// package.json
"scripts": {
  "prebuild": "bun run scripts/fetch-rss.ts",
  "build": "next build"
}
```

**Pros:** zero net-new infra. Every deploy is up to date by definition.
**Cons:** still requires a manual deploy trigger. If we don't push, the site doesn't update — even if there's a new post on Substack.

### Option 2 — Scheduled GitHub Action ⭐ **Recommended**

A workflow that runs on a cron, runs the script, commits `blogs.json` if it changed, and triggers a re-deploy. Fully hands-off.

```yaml
# .github/workflows/refresh-blogs.yml
name: Refresh blogs
on:
  schedule:
    # Every Monday + Tuesday at 14:00 UTC (~10am ET) — tune to publish cadence
    - cron: "0 14 * * 1,2"
  workflow_dispatch: # also allow manual runs

jobs:
  refresh:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run scripts/fetch-rss.ts
      - name: Commit if changed
        run: |
          if ! git diff --quiet public/data/blogs.json; then
            git config user.name  "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            git add public/data/blogs.json
            git commit -m "chore(blogs): scheduled refresh"
            git push
          fi
```

**Pros:**
- True hands-off. Post on Substack, walk away — site updates within the cron window.
- Schedule maps to actual publishing cadence. If posts go up Monday/Tuesday, the cron runs Monday/Tuesday.
- `workflow_dispatch` gives a manual "refresh now" button in the GitHub Actions UI for one-offs (typo fix, late edit) without needing the CLI.
- The commit retriggers the existing GitHub Pages deploy automatically.

**Cons:**
- Substack's edge cache can lag a real edit by a few minutes (see "Cache caveat" below). Pick the cron time so it runs *after* you typically publish, not at the same moment.

**Tuning the schedule for a Mon/Tue cadence:**
- If publishing in the morning ET, run the cron in the early afternoon ET so Substack's CDN has had time to propagate.
- Cron is in UTC. `0 14 * * 1,2` = 14:00 UTC = 10am ET (DST) / 9am ET (standard).
- If we want belt-and-suspenders, run twice on publish days: `0 14,18 * * 1,2`.

### Option 3 — Client-side fetch

Skip the build step entirely; hit Substack's RSS from the browser at runtime.

**Don't do this.** This was the original approach and was rejected:
- Substack blocks anonymous browser requests (bot detection).
- CORS doesn't allow direct cross-origin RSS fetches.
- Required a third-party CORS proxy, which adds a network hop, a dependency we don't control, and a failure mode where the entire blog section is empty.

Pre-fetching at build time eliminates all three issues, which is why `scripts/fetch-rss.ts` exists.

## Recommendation

**Go with Option 2 once a posting cadence is established.** The fact that posts are planned for Monday/Tuesday makes a scheduled workflow the obvious fit — the cron's frequency stays low (no wasted runs), and the schedule mirrors the editorial calendar. Add `workflow_dispatch` so any off-cadence edit can be picked up manually with one click in the Actions UI.

Until then, Option 1 (`prebuild` hook) is a one-line improvement that makes every deploy self-correcting, with zero new infra.

## Cache caveat (applies to all options)

Substack's edge CDN holds the rendered post page for several minutes after an edit. Both `og:description` and the RSS `<description>` field can lag the actual published content. The script already prefers `og:description` (fresher than RSS), but if a refresh runs *immediately* after an edit, it can still pull the previous string. For the cron schedule, this is solved by waiting a beat after publish; for manual runs, just re-trigger after a few minutes if the copy didn't update.
