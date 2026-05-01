# Incremental Commit Workflow Examples

Real-world examples demonstrating correct vs incorrect commit patterns during multi-phase implementation.

---

## Example 1: Feature Implementation

**Task:** Implement user authentication logout flow

### ❌ WRONG: Bundled Commits

```
User: "Implement the logout feature"

[Creates LogoutButton component]
[Adds logout API endpoint]
[Updates auth context]
[Writes tests]
[Updates navigation]

"I've implemented the logout feature. Do you want me to commit all these changes?"

[Single commit: "feat: implement logout feature" with 8 files]
```

**Problems:**

- Can't revert just the API changes
- Can't bisect to find which part broke something
- History doesn't show the implementation journey

### ✅ CORRECT: Incremental Commits

```
User: "Implement the logout feature"

[TodoWrite: Create tasks for logout implementation]

--- Task 1: Create LogoutButton component ---
[Implement component]
[Run: bun test -- LogoutButton.test.tsx → PASS]
[git add components/LogoutButton.tsx components/LogoutButton.test.tsx]
[git commit -m "feat(auth): add LogoutButton component"]
[TodoWrite: mark Task 1 completed]

--- Task 2: Add logout API endpoint ---
[Implement endpoint]
[Run: bun test -- logout.test.ts → PASS]
[git add app/api/auth/logout/route.ts tests/api/logout.test.ts]
[git commit -m "feat(auth): add logout API endpoint"]
[TodoWrite: mark Task 2 completed]

--- Task 3: Update auth context ---
[Update context with logout method]
[Run: bun test → all pass]
[git add lib/auth/context.tsx]
[git commit -m "feat(auth): add logout method to auth context"]
[TodoWrite: mark Task 3 completed]

--- Task 4: Update navigation ---
[Add logout to nav menu]
[Run: bun run build → success]
[git add components/Navigation.tsx]
[git commit -m "feat(auth): add logout to navigation menu"]
[TodoWrite: mark Task 4 completed]

--- Session End ---

## Commits Made This Session

| Hash | Message | Files |
|------|---------|-------|
| `a1b2c3d` | feat(auth): add LogoutButton component | 2 |
| `e4f5g6h` | feat(auth): add logout API endpoint | 2 |
| `i7j8k9l` | feat(auth): add logout method to auth context | 1 |
| `m0n1o2p` | feat(auth): add logout to navigation menu | 1 |

Total: 4 commits, 6 files changed
```

---

## Example 2: Bug Fix with Refactor

**Task:** Fix user session expiry bug, then refactor session handling

### ❌ WRONG: Mixed Concerns

```
[Fix the session expiry bug]
[While fixing, refactor session handling to be cleaner]
[Commit everything: "fix: session expiry and refactor"]
```

**Problems:**

- Can't revert just the refactor if it causes issues
- Bug fix mixed with unrelated changes
- Code review harder

### ✅ CORRECT: Separate Concerns

```
--- Task 1: Fix session expiry bug ---
[Identify root cause]
[Implement minimal fix]
[Run: reproduce original bug → now works]
[Run: bun test → all pass]
[git add lib/session/expiry.ts]
[git commit -m "fix(session): correct expiry timestamp calculation"]
[TodoWrite: mark Task 1 completed]

--- Task 2: Refactor session handling ---
[Extract session logic into hook]
[Update consumers]
[Run: bun test → all pass]
[git add lib/session/useSession.ts lib/session/index.ts]
[git commit -m "refactor(session): extract session logic into useSession hook"]
[TodoWrite: mark Task 2 completed]

## Commits Made This Session

| Hash | Message | Files |
|------|---------|-------|
| `q3r4s5t` | fix(session): correct expiry timestamp calculation | 1 |
| `u6v7w8x` | refactor(session): extract session logic into useSession hook | 2 |

Total: 2 commits, 3 files changed
```

---

## Example 3: Multi-File Coordinated Changes

**Task:** Add new data model with API, types, and UI

### ❌ WRONG: All-or-nothing

```
[Create database schema]
[Create TypeScript types]
[Create API endpoints]
[Create React hooks]
[Create UI components]
[One massive commit: "feat: add new data model"]
```

### ✅ CORRECT: Logical Units

```
--- Phase 1: Data layer ---
[Create database schema migration]
[Create TypeScript types]
[Run: bun run typecheck → pass]
[git add migrations/001_add_model.sql types/model.ts]
[git commit -m "feat(data): add model schema and types"]

--- Phase 2: API layer ---
[Create API endpoints]
[Run: bun test -- api/model → pass]
[git add app/api/model/route.ts tests/api/model.test.ts]
[git commit -m "feat(api): add model CRUD endpoints"]

--- Phase 3: Client layer ---
[Create React hooks]
[Run: bun test -- hooks/useModel → pass]
[git add hooks/useModel.ts tests/hooks/useModel.test.ts]
[git commit -m "feat(hooks): add useModel data hook"]

--- Phase 4: UI layer ---
[Create UI components]
[Run: bun run build → success]
[git add components/Model/*.tsx]
[git commit -m "feat(ui): add Model components"]
```

---

## Example 4: Handling Verification Failures

What to do when verification fails mid-workflow:

```
--- Task 3: Update auth context ---
[Update context with logout method]
[Run: bun test]
→ FAIL: 2 tests failed in AuthContext.test.tsx

[DO NOT COMMIT YET]
[Fix failing tests]
[Run: bun test → all pass]
[NOW commit]
[git commit -m "feat(auth): add logout method to auth context"]
```

**Rule:** Never commit with failing tests. Fix first, then commit.

---

## Example 5: Context Switch Mid-Work

What to do when you need to switch tasks:

```
--- Working on Feature A ---
[Implement part of feature]
[Tests pass for implemented part]

User: "Actually, can you quickly fix this unrelated bug first?"

[COMMIT current work before switching]
[git commit -m "feat(featureA): add initial implementation (WIP)"]

--- Switch to Bug Fix ---
[Fix the bug]
[Verify fix]
[git commit -m "fix(unrelated): resolve issue X"]

--- Return to Feature A ---
[Continue implementation]
[git commit -m "feat(featureA): complete implementation"]
```

**Rule:** Commit before context switches. Don't leave work uncommitted.

---

## Session End Summary Format

At the end of every work session, output:

```markdown
## Commits Made This Session

| Hash      | Message                                  | Files |
| --------- | ---------------------------------------- | ----- |
| `abc1234` | feat(auth): add LogoutButton component   | 2     |
| `def5678` | feat(auth): add logout API endpoint      | 2     |
| `ghi9012` | fix(session): correct expiry calculation | 1     |

Total: 3 commits, 5 files changed

### Not Pushed

All commits are local. Run `git push` when ready.
```

---

## Key Takeaways

1. **One concern per commit** — Don't mix features, fixes, and refactors
2. **Verify before commit** — Tests pass, build succeeds
3. **Commit before switching** — Never leave work dangling
4. **Always summarize** — Show what was done at session end
5. **TodoWrite integration** — Commit completion aligns with task completion
