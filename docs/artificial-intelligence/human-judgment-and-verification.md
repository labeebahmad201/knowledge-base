# Human Judgment & Verification

Every task has two parts: **thinking** (judgment, reasoning, decision-making, design) and **grunt work** (implementation, transcription, formatting, boilerplate, search). AI excels at the second part — but it cannot fully replace the first.

## The division

| | Human | AI |
|--|-------|-----|
| **Strengths** | Judgment, taste, context, values, intent | Speed, scale, recall, pattern matching, generation |
| **Role** | Decide *what* to do and *whether* it's right | Execute the mechanics |
| **Limitations** | Slow, inconsistent, forgetful | Non-deterministic, hallucinates, no true understanding |

The most productive workflow is: **human decides the direction, AI handles the execution, human verifies the result.**

## AI automates grunt work

The implementation layer of most tasks is pattern-matching and syntax — exactly what LLMs are good at. Writing boilerplate, formatting a document, searching documentation, fixing typos, generating tests, structuring data. This is work that takes human time but rarely requires human judgment.

AI can do this work **instantly** and **tirelessly**. The leverage is enormous: one human with good judgment plus an AI can output what a team of people used to.

But there's a catch — you still need to verify.

## Non-determinism is fundamental

LLMs are stochastic by nature. The same prompt can produce different outputs on successive calls (temperature > 0). Even at temperature 0, floating-point determinism across model versions, APIs, and hardware is not guaranteed.

This is not a bug that will be fixed. It is a consequence of how these models work:

- **Sampling-based generation** — tokens are drawn from a probability distribution
- **No built-in factuality** — the model predicts plausible text, not true text
- **No persistent memory** — each generation is independent
- **Sensitivity to phrasing** — small prompt changes can produce large output changes

LLMs will always be capable of producing wrong, misleading, or nonsensical output. They are **generators**, not **verifiers**.

## Why verification is always needed

Because AI output is non-deterministic, you cannot trust it without checking. This applies at every level:

| Level | What to verify |
|-------|----------------|
| **Factual** | Did it get the details right? |
| **Logical** | Does the reasoning hold up? |
| **Stylistic** | Does the tone match expectations? |
| **Structural** | Is the format correct and consistent? |
| **Safety** | Does it violate any guardrails? |
| **Intent** | Does this actually solve the original problem? |

The most dangerous failure mode is **plausible wrongness** — output that looks correct but isn't. This is what makes AI-generated code, writing, and analysis so insidious: it *seems* right, so verification is skipped.

## The human role in the loop

```
Human: Define intent, set direction, choose approach
         │
         ▼
   AI: Generate, draft, implement, search
         │
         ▼
Human: Verify, correct, refine, approve
         │
         ▼
       [Loop or ship]
```

The human's job is not to do the grunt work — it's to:

1. **Know what good looks like** — you can't verify output you can't evaluate
2. **Set the direction** — choose the approach, define constraints, supply context
3. **Verify the output** — check facts, logic, style, and alignment with intent
4. **Iterate** — feed corrections back to the AI for the next pass

This is a **supervisory** role, not a *doer* role. The human becomes an editor, reviewer, and decision-maker rather than a producer.

## Implications for how we work

- **Verify everything** — especially when it looks right (that's when it's most dangerous)
- **Use AI for drafts, not finals** — the first pass is AI, the final pass is human
- **Know your domain** — you cannot supervise AI work in areas you don't understand
- **Treat AI output like a junior's work** — it's fast and helpful, but needs review
- **Build verification into workflows** — don't make it an optional step

## The future

AI will get more capable, more reliable, and more autonomous. But the need for human verification will not disappear — it will shift upward in the stack. Instead of checking individual lines of code, humans will verify architectural decisions. Instead of fact-checking every sentence, humans will verify the reasoning and sources.

The core insight remains: **AI automates execution; humans own judgment and verification.** The most effective teams are the ones that embrace this division rather than fighting it.
