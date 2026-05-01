# Incremental Commits

> This skill activates during plan execution, multi-phase work, or TodoWrite usage. Triggers on phrases like "plan", "phase", "task", "implement", "execute", "execute the plan", "work through", "complete the tasks".

---

## The Iron Law

**COMMIT AFTER EACH LOGICAL UNIT OF WORK — SUMMARIZE AT END**

Never bundle. Never ask at the end. Commit as you go. Bundling all changes into one commit destroys traceability and makes git history useless for debugging, reverting, or understanding why changes were made.

---

## Commit Triggers

Execute a commit when ANY of these occur:

| Trigger                           | Action                          |
| --------------------------------- | ------------------------------- |
| TodoWrite task marked `completed` | Commit that task's changes      |
| Plan phase complete               | Commit phase changes            |
| Bug fix verified                  | Commit the fix                  |
| Refactor complete                 | Commit separately from features |
| Before context switch             | Commit current work first       |

---

## The Commit Sequence

Before marking a TodoWrite task as `completed`:

```
1. VERIFY  → Tests pass, build succeeds (via verification-before-completion)
2. STAGE   → Stage files related to this task only
3. COMMIT  → Use conventional commit format
4. MARK    → Update TodoWrite status to completed
5. NEXT    → Move to next task
```

**Skipping steps = poor git history = future pain**

---

## Integration Points

### With TodoWrite

When marking a task `completed`, commit FIRST:

```
❌ WRONG:
[mark TodoWrite task completed]
[continue to next task]
...later...
"Should I commit all these changes?"

✅ CORRECT:
[complete task work]
[verify it works]
[git add relevant files]
[git commit -m "feat(feature): add component skeleton"]
[mark TodoWrite task completed]
[move to next task]
```

### With verification-before-completion

Always verify BEFORE committing:

```
[implement feature]
   ↓
[run tests - they pass]
   ↓
[run build - it succeeds]
   ↓
[commit with confidence]
```

### With writing-plans

Plans should anticipate commits:

```markdown
## Task 1: Create component skeleton

Expected commit: `feat(feature): add component skeleton`

## Task 2: Add API integration

Expected commit: `feat(feature): add API integration`

## Task 3: Write tests

Expected commit: `test(feature): add unit tests`
```

---

## Session Tracking

Track all commits made during a work session. At session end, output a summary:

```markdown
## Commits Made This Session

| Hash      | Message                                 | Files |
| --------- | --------------------------------------- | ----- |
| `abc1234` | feat(auth): add logout button component | 2     |
| `def5678` | feat(auth): implement logout API call   | 3     |
| `ghi9012` | test(auth): add logout flow tests       | 1     |

Total: 3 commits, 6 files changed
```

---

## Anti-Patterns

**STOP IMMEDIATELY if you catch yourself:**

- ❌ "I'll commit everything at the end"
- ❌ "Do you want me to commit all this?"
- ❌ "Let me bundle these changes together"
- ❌ Making one commit with unrelated changes
- ❌ Waiting until user explicitly asks to commit
- ❌ Forgetting to show commit summary at session end

---

## Correct Workflow Pattern

```
Plan Execution Start
   │
   ├─── Phase 1: Component skeleton
   │    ├── [implement]
   │    ├── [verify: tests pass]
   │    ├── [commit: feat(feature): add skeleton]
   │    └── [TodoWrite: mark completed]
   │
   ├─── Phase 2: API integration
   │    ├── [implement]
   │    ├── [verify: tests pass, build succeeds]
   │    ├── [commit: feat(feature): add API integration]
   │    └── [TodoWrite: mark completed]
   │
   ├─── Phase 3: Tests
   │    ├── [implement]
   │    ├── [verify: tests pass]
   │    ├── [commit: test(feature): add unit tests]
   │    └── [TodoWrite: mark completed]
   │
   └─── Session End
        └── [output commit summary]
```

---

## Benefits of Incremental Commits

Following this pattern provides:

1. **Easy reverting** — Cherry-pick or revert specific changes
2. **Simplified merging** — Smaller commits = fewer conflicts
3. **Better debugging** — Use `git bisect` effectively
4. **Clear history** — Understand _why_ changes were made
5. **AI-friendly** — Clean history helps AI tools understand context

---

## Commit Message Guidelines

Use Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** feat, fix, refactor, style, docs, test, chore, perf

**Rules:**

- Imperative mood: "add feature" not "added feature"
- First line under 72 characters
- Always include Co-Authored-By footer

---

## Supporting Files

### Examples

- **[commit-workflow.md](examples/commit-workflow.md)** — Real-world examples showing correct incremental commit patterns during multi-phase implementation

---

_Adapted from atomic commit best practices (2025) — AFTER Framework: Atomic, Frequent, Test before push, Enforce standards, Refactoring separate_
