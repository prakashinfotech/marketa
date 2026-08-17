# Git Workflow & Best Practices — Marketa

This document defines the git workflow, branching model, commit conventions, and review practices for the Marketa project. Follow it for every change, no matter how small.

---

## 1. Branching Model

We use a lightweight **trunk-based** flow with short-lived feature branches.

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| `main` | Always deployable. Protected. | Permanent |
| `feat/<scope>-<short-desc>` | New feature work | < 1 week |
| `fix/<scope>-<short-desc>` | Bug fix | < 2 days |
| `chore/<scope>-<short-desc>` | Tooling, deps, config | < 2 days |
| `refactor/<scope>-<short-desc>` | Refactor without behavior change | < 1 week |
| `docs/<short-desc>` | Documentation only | < 1 day |
| `hotfix/<short-desc>` | Urgent production fix off `main` | hours |

**Examples:**
- `feat/ads-image-upload`
- `fix/auth-jwt-refresh-loop`
- `chore/frontend-bump-vite`
- `refactor/profile-extract-avatar-picker`

### Rules
- Branch off the **latest `main`**. Pull before branching.
- One branch = one logical change. Don't bundle unrelated work.
- Delete the branch after merging.
- Never commit directly to `main`. All changes go through a PR.

---

## 2. Commit Message Convention

We follow **Conventional Commits**: `<type>(<scope>): <subject>`.

### Format
```
<type>(<scope>): <subject>

<body — optional, wrap at 72 chars>

<footer — optional, e.g. BREAKING CHANGE, Closes #123>
```

### Allowed types
| Type | Use for |
|------|---------|
| `feat` | New user-visible feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `docs` | Documentation only |
| `style` | Formatting, whitespace, missing semicolons |
| `test` | Adding/updating tests |
| `chore` | Tooling, dependencies, build config |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverting a prior commit |

### Subject rules
- Imperative mood: "add" not "added" / "adds".
- No trailing period.
- ≤ 72 characters.
- Lowercase after the colon.

### Examples
```
feat(ads): add multi-image upload with preview
fix(auth): prevent infinite refresh loop on expired token
refactor(profile): extract avatar picker into reusable component
docs(readme): document seed script usage
chore(deps): bump react to 19.2.5
perf(search): add index on ads(category_id, created_at)
```

### Body
Explain **why**, not **what** — the diff already shows the what. Mention trade-offs, alternatives considered, or constraints.

### Footers
- `Closes #42` / `Fixes #42` — auto-closes a GitHub issue
- `Refs #42` — references without closing
- `BREAKING CHANGE: <description>` — for incompatible API changes

---

## 3. Pull Requests

### Before opening
- [ ] Rebase on latest `main` (no merge commits from `main` into your branch).
- [ ] Run `npm run lint` (frontend) and ensure backend tests / type checks pass.
- [ ] Self-review the diff. Remove debug logs, commented code, and TODOs without an owner.
- [ ] Update docs and `CLAUDE.md` if behavior or conventions changed.

### PR title
Same convention as commits: `feat(ads): add multi-image upload`.

### PR description template
```markdown
## Summary
<1–3 bullet points on what changed and why>

## Screenshots / Demo
<for UI changes — before/after images or short clip>

## Test plan
- [ ] Manual: <steps>
- [ ] Automated: <tests added/updated>

## Risk & rollback
<what can break, how to roll back>

## Linked issues
Closes #<id>
```

### Size guidance
- Aim for **< 400 lines** of diff. Split larger work into stacked PRs.
- A PR a reviewer can read in 15 minutes gets faster, better reviews.

### Review etiquette
- At least **one approval** before merge.
- Address every comment with either a change or a reasoned reply.
- Use "Suggest changes" for one-line fixes — saves reviewer round-trips.
- Reviewers: be specific, kind, and prioritize correctness > style.

### Merge strategy
- **Squash and merge** is the default — keeps `main` history linear and readable.
- The squash commit message must follow the Conventional Commit format.
- Only use "Rebase and merge" for cleanly atomic commit series; never use "Create a merge commit".

---

## 4. Working With Your Branch

### Keep your branch fresh
```bash
git fetch origin
git rebase origin/main
# Resolve conflicts, then:
git push --force-with-lease
```
> Always `--force-with-lease`, never `--force`. It refuses to overwrite remote work you haven't seen.

### Amending vs. new commit
- **Before push** → `git commit --amend` is fine.
- **After push** → create a new commit. Only amend if you're the sole branch owner and use `--force-with-lease`.

### Stashing
```bash
git stash push -m "wip: search filters"
git stash list
git stash pop
```

### Undoing
| Goal | Command |
|------|---------|
| Unstage a file | `git restore --staged <file>` |
| Discard local changes to a file | `git restore <file>` |
| Undo last commit, keep changes staged | `git reset --soft HEAD~1` |
| Undo last commit, keep changes unstaged | `git reset HEAD~1` |
| Revert a pushed commit | `git revert <sha>` |

> Never `git reset --hard` or `git push --force` without confirming nobody else is on the branch.

---

## 5. Files & Secrets

### Never commit
- `.env` files, API keys, JWT secrets, SMTP credentials, database URLs
- `node_modules/`, `.venv/`, `__pycache__/`, build artifacts
- Personal IDE config (`.vscode/settings.json` unless project-wide)
- Large binaries; use a CDN or Git LFS

### If a secret leaks
1. Rotate the secret immediately at the source (provider dashboard).
2. Purge it from history: `git filter-repo` (preferred) or BFG Repo-Cleaner.
3. Force-push the cleaned history and notify the team to re-clone.
4. Audit logs for any usage of the leaked value.

### `.gitignore` discipline
Keep it tidy and grouped by concern (Python, Node, IDE, OS). Don't add `.gitignore` entries for files you've already committed — remove them with `git rm --cached <file>` first.

---

## 6. Tags & Releases

- Tag releases on `main` using semantic versioning: `v<MAJOR>.<MINOR>.<PATCH>`.
- Annotated tags only: `git tag -a v1.2.0 -m "v1.2.0"`.
- Generate release notes from squash-merge commit subjects since the previous tag.

| Bump | When |
|------|------|
| MAJOR | Breaking API or schema change |
| MINOR | New backwards-compatible feature |
| PATCH | Bug fix or internal refactor |

---

## 7. Hotfix Procedure

1. Branch from `main`: `git checkout -b hotfix/<desc> main`.
2. Make the minimal fix. Add a regression test.
3. Open a PR, get expedited review.
4. Squash-merge to `main`, tag a PATCH release.
5. Verify in production.

---

## 8. Quick Reference

```bash
# Start new work
git checkout main && git pull
git checkout -b feat/ads-bulk-delete

# Commit
git add <files>
git commit -m "feat(ads): allow bulk delete from my-ads page"

# Push & open PR
git push -u origin feat/ads-bulk-delete
gh pr create --fill

# Sync with main during long-lived branch
git fetch origin && git rebase origin/main
git push --force-with-lease

# After merge — cleanup
git checkout main && git pull
git branch -d feat/ads-bulk-delete
git push origin --delete feat/ads-bulk-delete
```

---

## 9. Anti-patterns to Avoid

- ❌ Commits named `wip`, `update`, `fix stuff`, `asdf` reaching `main`.
- ❌ Mega-PRs touching 30+ files across unrelated concerns.
- ❌ Merge commits from `main` cluttering your feature branch (rebase instead).
- ❌ Force-pushing to `main` or shared branches.
- ❌ Skipping hooks with `--no-verify` to "just get it in".
- ❌ Committing `.env`, credentials, or generated build artifacts.
- ❌ Mixing formatting changes with logic changes in the same commit — review nightmare.

---

> **Rule of thumb:** Write the commit and PR for the next engineer who has to debug a production incident at 2 AM. Clarity beats cleverness.
