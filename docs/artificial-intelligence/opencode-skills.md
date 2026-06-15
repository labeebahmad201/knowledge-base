# opencode Skills

opencode is an AI coding assistant used throughout this project. **Skills** are reusable instruction modules that tell the AI *when* and *how* to handle specific tasks.

## What skills are

A skill is a markdown file with frontmatter:

```markdown
---
name: pr-guidelines
description: Use when the user says "commit", "pr", "commit changes", or anything related to commits/pull requests.
---

# PR & Commit Guidelines

Detailed instructions for the AI to follow...
```

The `description` is the key piece — the AI reads it to decide whether this skill applies to the current request.

## How they work

1. You say something in chat (e.g., "commit changes")
2. opencode scans all available skills and matches your request against their `description` fields
3. If a match is found, the skill body is injected as context for the AI
4. The AI follows the skill's instructions automatically

No manual activation needed. It's all automatic.

## Where they live

```
.opencode/skills/<skill-name>/SKILL.md
```

For project-specific skills, create them in `.opencode/skills/` at the project root.

## Our skills

### `pr-guidelines`
- **Path:** `.opencode/skills/pr-guidelines/SKILL.md`
- **Triggers on:** "commit", "pr", "push", "commit changes"
- **What it does:** Enforces conventional commits (`feat:`, `fix:`, `chore:`, etc.), pre-commit checks, and PR description format

## Creating a new skill

```bash
mkdir -p .opencode/skills/my-skill
```

Then create `.opencode/skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: Use when the user asks about X. Front-load the keywords the user would naturally say.
---

# My Skill

Instructions, conventions, examples, and references.
```

## Best practices

- **Front-load keywords** in the description — the AI matches against it, so lead with the most likely trigger words
- **Be specific with "Use ONLY when..."** if the skill should stay quiet on adjacent topics
- **Keep skills focused** — one task per skill
- **Restart opencode** after adding or editing a skill for changes to take effect
