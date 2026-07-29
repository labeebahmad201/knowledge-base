# Git Squash and Merge

## The problem: a history of work-in-progress

When multiple developers work on a feature branch, the commit history often looks like this:

```
fix typo
wip
oops fix lint
pr feedback
more pr feedback
fix tests
merge main
actually fix tests this time
wip
```

Each commit represents a checkpoint, not a logical unit of work. When this branch is merged with a regular merge commit, the entire history of false starts, lint fixes, and merge commits gets preserved in the main branch forever.

```mermaid
graph LR
    subgraph FeatureBranch["Feature branch history"]
        C1["init"] --> C2["wip"]
        C2 --> C3["fix typo"]
        C3 --> C4["wip"]
        C4 --> C5["merge main"]
        C5 --> C6["fix tests"]
        C6 --> C7["pr feedback"]
    end
    subgraph MainAfterMerge["main after regular merge"]
        M1["..."] --> M2["merge commit"]
        M2 --> C1
        M2 --> C7
    end
    style FeatureBranch fill:#f66,stroke:#333
    style MainAfterMerge fill:#f66,stroke:#333
```

Every noise commit is now part of the permanent record. Anyone reading `git log` on main must wade through the noise to find meaningful changes. `git bisect` becomes painful. Reverting a feature requires untangling a web of partial commits.

## The solution: squash and merge

Squash and merge collapses an entire branch into a single commit before integrating it into main. All the work-in-progress commits are gone. One commit for one feature.

```mermaid
graph LR
    subgraph FeatureBranch2["Feature branch history"]
        S1["init"] --> S2["wip"]
        S2 --> S3["fix typo"]
        S3 --> S4["wip"]
        S4 --> S5["merge main"]
        S5 --> S6["fix tests"]
        S6 --> S7["pr feedback"]
    end
    subgraph MainAfterSquash["main after squash and merge"]
        M3["..."] --> M4["feat: add payment retry logic"]
    end
    M4 -.->|"squashed into"| FeatureBranch2
    style MainAfterSquash fill:#6f6,stroke:#333
```

The squash commit message should describe the feature as a whole, not the individual WIP steps. This is what the main branch should communicate: "this commit adds payment retry logic." Not: "fix typo."

```
feat: add payment retry logic

Retries failed payments up to 3 times with exponential backoff.
Stores retry state in the payment_attempts table.
Sends notification after final failure.

Closes #482
```

## How it works

Squash and merge takes all the commits on the feature branch, combines them into a single diff, and creates one new commit on main with that diff. The feature branch commits are not added to main — their content is, but their individual commit messages are discarded.

```mermaid
graph TD
    subgraph Before["Before squash"]
        A["Commit A (work in progress)"] --> B["Commit B (fix tests)"]
        B --> C["Commit C (PR feedback)"]
        C --> D["Commit D (merge main)"]
    end
    subgraph After["After squash and merge"]
        S["Single commit on main"] --> M["main"]
    end
    Before -->|"squash"| After
    style After fill:#6f6,stroke:#333
    style Before fill:#f66,stroke:#333
```

Platforms like GitHub, GitLab, and Bitbucket provide a "Squash and merge" button on pull requests. When you click it, you are prompted to write a single commit message for the squashed result.

## When to squash and merge

### Good candidates

- A branch with many small fixup commits, typo fixes, and "wip" checkpoints
- Any branch where the individual commits are meaningless outside the context of the PR
- Branches that include "merge main" commits to stay up to date

### Bad candidates

- Commits that represent independently meaningful units of work, especially if they might need to be reverted separately
- Example: a branch that adds a feature in commit A and then adds a database migration in commit B. If commit B has a bug, you want to revert just the migration without losing the feature.

```mermaid
graph LR
    subgraph GoodForSquash["Good for squash"]
        G1["fix typo"] --> G2["wip"]
        G2 --> G3["oops"]
        G3 --> G4["merge main"]
    end
    subgraph BadForSquash["Not good for squash"]
        B1["feat: add user API"] --> B2["feat: add database migration"]
        B2 --> B3["feat: add admin dashboard"]
    end
    style GoodForSquash fill:#6f6,stroke:#333
    style BadForSquash fill:#f66,stroke:#333
```

## Squash and merge vs rebase and merge

Both produce a clean history, but they differ in how.

Rebase and merge rewrites the feature branch commits onto the tip of main, preserving each commit individually. The history looks linear, and each commit is kept as a separate entry.

Squash and merge collapses everything into one commit. The individual commits are lost.

```mermaid
graph TD
    subgraph RebaseMerge["Rebase and merge"]
        RM1["commit A"] --> RM2["commit B"]
        RM2 --> RM3["commit C"]
    end
    subgraph SquashMerge["Squash and merge"]
        SM1["single commit (A+B+C)"]
    end
    style RebaseMerge fill:#6bf,stroke:#333
    style SquashMerge fill:#6f6,stroke:#333
```

Use rebase and merge when each commit on the feature branch is a coherent, independent change. Use squash and merge when the branch is a collection of work-in-progress that should be presented as one unit.

## What about the commit author?

When you squash and merge, the author of the squash commit is the person who performed the merge (typically the reviewer who clicked the button), not the original developer. The individual commits are still visible on the feature branch in the pull request, but in the main branch history, the feature is credited to the merger.

Some teams solve this by having the original developer squash their branch locally before pushing, then using a regular merge:

```bash
git rebase -i main
# mark all commits except the first as "squash"
git push --force-with-lease
```

This way the squash commit retains the original author, and the merge is a simple fast-forward or merge commit.

## Summary

| Merge strategy | History preserved | History is clean | Best for |
|---|---|---|---|
| Regular merge | Yes | No | Shared branches, preserving individual commits |
| Squash and merge | No (collapsed) | Yes | Feature branches with many WIP commits |
| Rebase and merge | Yes (rebased) | Yes | Feature branches with meaningful individual commits |

Squash and merge is the right default for most feature branches. It keeps main branch history readable, makes `git bisect` practical, and ensures that each commit on main represents a complete, coherent change.
