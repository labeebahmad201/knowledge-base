# Software 3.0: Vibe Coding, Verification & Understanding

Notes from Andrej Karpathy's talks on where software development is headed — and what stays the same.

---

## Vibe Coding and the quality question

Karpathy coined **"vibe coding"** to describe the new reality: AI has lowered the bar so much that anyone can build software by describing what they want. You don't need to know syntax, frameworks, or architecture — you just need to know *what you want*.

But quality does drop. Vibe coding trades depth for speed. The output is broader but shallower. This means there is still — perhaps more than ever — a demand for **fundamentals-oriented engineers** who understand what's happening under the hood. They are the ones who catch the edge cases, fix the subtle bugs, and keep the system from collapsing under its own generated complexity.

> Lowering the barrier to entry does not eliminate the need for expertise. It shifts the expert's role from *doing* to *directing and verifying*.

---

## Software 1.0 → 3.0

Karpathy's framing of software evolution:

| Era | Paradigm | Core idea | Data |
|-----|----------|-----------|------|
| **Software 1.0** | Hand-written code | You write every line. You specify every behaviour. | **Structured** — schemas, types, parsers. You model the data shape in code before you can process it. |
| **Software 2.0** | Neural networks | You train a model on data instead of writing rules. But the training pipeline is still hand-coded. | **Curated** — labelled datasets, hand-collected or generated. The training pipeline is still Software 1.0. |
| **Software 3.0** | AI-native development | You describe intent, and the model generates the implementation. | **Any natural data** — text, images, audio, logs, code. The model handles structure implicitly. |

This "Data" dimension captures a subtle but important shift. Software 1.0 could process unstructured data — it just needed you to write parsers, schema validators, and type coercions first. The *burden of structuring* was on the programmer. LLMs collapse that step: you dump in raw text, images, or logs and the model extracts the structure internally. This is why LLMs feel so much more flexible — not because Software 1.0 *couldn't* handle messy data, but because it made *you* do the messy work upfront.

The key shift in Software 3.0:

> **Software 1.0:** You can automate what you can *specify*.
> **Software 3.0:** You can automate what you can *verify*.

This is profound. In the old world, if you couldn't write precise specifications, you couldn't automate. Now, if you can *recognise* a correct output — even if you can't precisely specify it — you can use AI to generate it. But the trade-off is that you must become a verifier, not just a producer.

---

## The neural computer

Karpathy describes neural networks as a new kind of computer — a **neural computer** that takes input, processes it through learned weights, and produces output. Unlike traditional computers, it is:
- **Non-deterministic** — same input, different output
- **Learned, not programmed** — behaviour comes from data, not rules
- **Continuous, not discrete** — small input changes produce smooth output changes

This framing is useful because it reminds us that LLMs are not magical. They are a different *kind* of computer, with different strengths and weaknesses. And like any computer, they need to be programmed — except the programming is done through prompts, context, and data rather than through code.

---

## Thinking vs Implementation

Every task has two parts:

1. **Thinking / Planning** — What needs to be done? What approach should we take? What are the trade-offs?
2. **Implementation / Doing** — Write the code, format the document, execute the plan.

AI automates the second part. This reduces **cognitive exhaustion** — you no longer have to expend mental energy on the mechanics of implementation. You can stay at the strategic level.

But here's the catch: implementing something yourself is how you build **understanding**. If you always offload the doing, you never develop the deep familiarity that comes from hands-on work. And if you don't have that understanding, you cannot effectively **verify**.

> You don't get good at verifying things unless you have done them by hand.

This is the fundamental tension. AI reduces the *need* to do grunt work, but grunt work is how skill develops. A generation that never writes code by hand — that always "one-shots" it through AI — may never develop the depth of understanding needed to know when the AI is wrong.

---

## Jagged intelligence

LLMs are not uniformly intelligent. Karpathy calls this **jagged intelligence** — they excel at some tasks and fail embarrassingly at others.

| Excels at | Struggles with |
|-----------|----------------|
| Refactoring 100K lines of code | "How many Rs are in strawberry?" |
| Generating boilerplate | Multi-step logical reasoning without CoT |
| Pattern matching across large contexts | Precise factual recall |
| Translation and summarisation | Novel problem-solving |

Why? Because training data is not uniform. Coding tasks had high ROI during training — there's lots of high-quality code data, and coding is a well-defined domain with clear right/wrong answers. So models were trained in a way that made them disproportionately good at coding.

The lesson: **know your tool**. A model that works brilliantly for code generation may be unreliable for legal analysis, medical advice, or creative writing. The characteristics of the model are shaped by its training, and you need to understand those characteristics to use it effectively.

---

## Thinking vs Understanding

> You can outsource your thinking, but you cannot outsource your understanding.

This is the most important line in Karpathy's talk. LLMs can *think* — in the sense of generating plausible sequences of reasoning — but they do not *understand*. And when you use an LLM to think on your behalf, you risk mistaking its plausible output for genuine insight.

To direct the LLM effectively, you need understanding. You need to know:
- What is the right question to ask?
- What context is relevant?
- What output looks correct?
- When is the model off-track?

These require **deep thinking about the problem**, not just prompting. If you skip this step, you're not using AI as a tool — you're outsourcing your judgment to something that has none.

---

## Agentic engineering preserves quality

**Agentic engineering** is the practice of building AI systems that *preserve the quality* of the software development process. It doesn't throw away code reviews, testing, architecture design, or verification — it integrates AI into them.

This is what many software developers miss. They see AI generating code and think their role is disappearing. But the real shift is:

> **Before:** Human produces, human verifies.
> **After:** AI produces, human directs and verifies.

The human is still in the loop. The skills change — less typing, more judgment — but the demand for expertise does not disappear. The hopelessness comes from conflating "the way I work is changing" with "my skills are obsolete."

---

## The review problem

Karpathy recognises that code generated by AI needs review — it's often bloated, suboptimal, or subtly wrong. The human-in-the-loop is not optional.

But there is a more extreme view gaining traction. The CEO of a prominent startup (and Y Combinator) recently advocated for **not reviewing AI-generated code at all** — just let AI review its own code and merge it.

This is dangerous for two reasons:

1. **AI cannot catch its own blind spots.** If the model missed something in the first pass, why would it catch it in the second? The same limitations apply.

2. **Review is how you build understanding.** You don't write the code — you lose one opportunity to understand. But if you don't even *review* it, you lose the second opportunity too. You end up with a system you don't understand, managed by people who don't understand it.

> Skipping review is not efficiency. It is surrendering understanding.

---

## Implications

| Principle | What it means |
|-----------|---------------|
| **Expertise still matters** | Vibe coding doesn't replace fundamentals — it makes them more valuable |
| **You must verify** | Non-deterministic output requires human oversight |
| **Understanding comes from doing** | You don't get good at verification without hands-on experience |
| **Know your model** | Jagged intelligence means you need to understand where the model works and where it doesn't |
| **Direct, don't outsource** | You can use AI to execute, but you cannot outsource judgment |
| **Review is non-negotiable** | Skipping review is not a shortcut — it's a risk |
| **The role shifts, not disappears** | Engineer → Editor. Producer → Verifier. Doer → Director. |
