---
name: pr-guidelines
description: Use when the user says "commit", "pr", "commit changes", "push", "create a commit", "open a PR", or anything related to making commits or pull requests. Use ONLY for commits/PRs in the knowledge-base repo.
---

# PR & Commit Guidelines

## Commit message format

Use **conventional commits**:

```
<type>: <short description>

<optional body>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `ci`, `revert`.

- Keep the subject under 72 chars, lowercase after the colon, no period.
- Body wraps at 72 chars, explains *what* and *why* (not *how*).

Examples from this repo:
- `feat: add leetcode search bar on index page`
- `chore: remove product section, collapse categories by default, fix search plugin`

## Before committing

1. `git status` — only intended files should be staged
2. `git diff` + `git diff --cached` — review for secrets, debug code, TODOs
3. Never commit secrets, API keys, `.env` files, or `node_modules`

## Pull requests

- Title follows conventional commit format
- Description includes:
  - **What** this PR does
  - **Why** (motivation / context)
  - **How** (brief technical approach if non-trivial)
- Link related issues if any
- Keep PRs focused — one logical change per PR

## When the user says "commit changes"

Stage only the relevant files (not unrelated changes), write a conventional commit message, and commit. Do not push unless asked.
