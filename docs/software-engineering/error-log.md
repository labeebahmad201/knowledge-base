# Error Log & Recipes: Hand-Coding Sessions

Tracking errors, fixes, and common commands during daily hand-coding sessions.

---

## Recipes

### Commit workflow (by hand)

```bash
# 1. See what's changed
git status

# 2. Stage only the files you want
git add docs/software-engineering/error-log.md src/components/ArticleFilter.tsx

# 3. Check what you staged (before committing)
git diff --cached

# 4. Commit with a message
git commit -m "docs: add error log and link in filter"

# 5. Push (first time on a new branch)
git push --set-upstream origin <branch-name>

# 5. Push (after upstream is set)
git push
```

**Key commands:**
- `git status` — shows modified, staged, and untracked files
- `git add <file>` — stages a file (moves it to "ready to commit")
- `git diff --cached` — shows what's staged vs last commit (review before you commit)
- `git commit -m "message"` — commits staged files with a message
- `git push` — sends committed changes to the remote (GitHub)
- `git push --set-upstream origin <branch>` — first push on a new branch, sets the default destination
- `git remote -v` — shows the URLs of your remotes (which GitHub repo this local repo points to)

**What is `origin`?** Every git repository can have one or more "remotes" — named URLs pointing to other repos (usually on GitHub). The convention is to call the main remote `origin`. When you clone a repo, git automatically sets `origin` to the URL you cloned from. You can see it with `git remote -v`.

---

### EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@nestjs'

**Command:** `npm install -g @nestjs/cli`

**Full error:**
```
EACCES npm error syscall mkdir
npm error path /usr/local/lib/node_modules/@nestjs
npm error errno -13
npm error Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@nestjs'
```

**Cause:** `/usr/local/lib/` is owned by `root`. When you run `npm install -g`, npm tries to write to a root-owned directory. This happens if you previously ran `sudo npm install -g` or if Homebrew's node defaults to that location.

**Fix:**
```bash
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**Why `chown`:** `chown` changes the owner of a file or directory. Since `/usr/local/lib/` is owned by `root`, your regular user can't write to it. `chown -R $(whoami)` recursively changes ownership to your user, so you can install global npm packages without `sudo`. Done once, permanent.

**Prevention:** Run the `chown` fix above once — it's permanent.

---

### git push fails on a new branch

**Command:** `git push`

**Full error:**
```
fatal: The current branch feat/logs-page has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin feat/logs-page
```

**Cause:** You created a new branch locally and tried to push it, but git doesn't know which remote branch to push to. There's no "upstream" set — git can't guess where this branch should go on the remote.

**Fix:**
```bash
git push --set-upstream origin <branch-name>
```

**Why this happens:** When you `git checkout -b feat/logs-page`, the branch only exists locally. `git push` without arguments doesn't know which remote to target. `--set-upstream` (or `-u`) tells git: "push to `origin`, and remember that `origin/feat/logs-page` is the upstream for this branch." After the first push with `-u`, subsequent `git push` commands on that branch work without arguments.

**Shorthand:** After setting upstream once, just `git push` works.

---

### git diff vs git diff --cached

```bash
git diff          # shows changes NOT yet staged (modified but not git add-ed)
git diff --cached # shows changes that ARE staged (ready to commit)
```

Common mistake: `git diff --cache` (missing the `d`) — that's invalid. It must be `--cached` with a `d`.

**Workflow:** modify file → `git diff` (see what changed) → `git add` → `git diff --cached` (verify staged changes) → `git commit`.
