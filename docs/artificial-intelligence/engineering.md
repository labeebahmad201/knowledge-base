# Prompt, Context & Harness Engineering

As LLMs move from research prototypes to production systems, a new engineering discipline has emerged. Three interconnected practices form its core: **prompt engineering**, **context engineering**, and **harness engineering**.

---

## Prompt Engineering

Prompt engineering is the practice of designing inputs to reliably elicit desired outputs from LLMs. It's the most accessible layer — anyone can do it with a chat interface — but depth comes from understanding how models process language.

### Core techniques

| Technique | Description |
|-----------|-------------|
| **Zero-shot** | Direct instruction with no examples. Works well for simple tasks. |
| **Few-shot** | Provide 2-5 examples inline. Helps the model infer the pattern. |
| **Chain-of-thought (CoT)** | Ask the model to reason step by step. Boosts accuracy on logic, math, and multi-step tasks. |
| **Self-consistency** | Run CoT multiple times and vote on the most common answer. Improves reliability. |
| **Tree-of-thought** | Explore multiple reasoning branches simultaneously. Useful for complex problem-solving. |
| **ReAct** | Interleave reasoning with tool calls (Retrieval + Acting). Powers agentic behavior. |

### Prompt structure

Every well-crafted prompt contains some combination of:

- **System message** — persona, constraints, rules (hidden from end users)
- **Instruction** — what to do (best placed *after* the input due to recency bias)
- **Context** — background information relevant to the task
- **Input data** — the content to process
- **Output format** — how the response should be structured (JSON, markdown, etc.)
- **Examples** — few-shot demonstrations

### Prompt as code

Treat prompts like software:
- **Version control** them alongside your codebase
- **Test** systematically — use eval suites, not vibes
- **Optimise iteratively** — small wording changes can have outsized effects
- **Monitor drift** — model updates can silently break prompts

### Limitations

Prompt engineering has a ceiling. You can only fit so much instruction in a context window, and the model's behaviour is never fully deterministic. When you hit these limits, you move to context engineering.

---

## Context Engineering

Context engineering is the practice of designing *what* goes into the context window and *how* it's structured. While prompt engineering focuses on instruction wording, context engineering focuses on information architecture.

### The context budget

Context windows are finite (4K–2M tokens depending on the model). Every token competes for limited attention. Context engineering is about allocating that budget effectively:

- **What to include** — relevance scoring, priority tiers
- **What to exclude** — noise, redundancy, low-signal content
- **Where to place it** — beginning (primacy) and end (recency) get the most attention
- **How to format it** — structured, delimited, hierarchical

### Retrieval-augmented generation (RAG)

RAG is the most common context engineering pattern: fetch relevant documents from a knowledge base and inject them into the prompt.

```
User Query → Retriever (vector search) → Top-K chunks → Prompt Builder → LLM → Response
```

Key design decisions:
- **Chunking strategy** — size, overlap, splitting boundaries (semantic vs. fixed-length)
- **Embedding model** — determines what "similar" means
- **Retrieval method** — dense (vector), sparse (BM25), hybrid
- **Context window strategy** — how many chunks, how to rank, how to format

### Dynamic context

Not all context is static. Advanced systems build context on the fly:

- **Conversation history** — sliding window, summarisation, or hybrid
- **Tool outputs** — results from function calls folded back in
- **User data** — personalisation, preferences, past behaviour
- **External state** — databases, APIs, real-time feeds

### System prompt as context engine

The system prompt is the most privileged context slot. Use it for:
- **Persona definition** — who the model is
- **Behavioural guardrails** — what it must/shouldn't do
- **Structural rules** — how to format responses
- **Tool definitions** — what tools are available and when to use them

### Context compression

When you have more relevant information than fits in the window:
- **Summarisation** — compress documents before injection
- **Ranking** — show only the top-N most relevant items
- **Structured pruning** — remove sections below a relevance threshold
- **Iterative refinement** — ask the model what it needs, then fetch it

---

## Harness Engineering

Harness engineering is the practice of building the *infrastructure* around LLMs — the systems that manage prompts, context, model calls, streaming, caching, observability, and safety. It's the engineering that makes AI reliable in production.

### The LLM harness

```
┌─────────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ Application │────▶│ Harness  │────▶│  Model  │────▶│ Response │
│ (UI/API)    │     │ Pipeline │     │  API    │     │  Handler │
└─────────────┘     └──────────┘     └─────────┘     └──────────┘
                         │                                │
                         ▼                                ▼
                   Context Builder                Output Validator
                   Prompt Manager                 Safety Filter
                   Tool Executor                  Format Parser
```

### Key harness components

#### 1. Prompt management
- **Templates** — parameterised prompts (e.g., `{{input}}`, `{{date}}`)
- **Versioning** — track prompt changes, roll back, A/B test
- **Registry** — central store of all prompts across environments
- **Localisation** — multi-language prompt variants

#### 2. Model routing
- **Gateway** — single entry point to multiple providers (OpenAI, Anthropic, open-source)
- **Fallback** — retry with different model on failure
- **Load balancing** — distribute requests across endpoints
- **Cost optimisation** — route simple queries to cheap models, complex ones to powerful models

#### 3. Caching
- **Exact match** — identical prompts return cached responses
- **Semantic caching** — similar prompts return cached responses (embedding-based)
- **TTL strategies** — how long to keep cached responses
- **Cache invalidation** — when to bust (model update, data change)

#### 4. Observability
- **Tracing** — end-to-end request lifecycle (prompt → context assembly → model call → response)
- **Logging** — full prompt/response pairs for debugging
- **Metrics** — latency, token usage, cost, error rates, quality scores
- **Evaluation** — automated eval suites (correctness, safety, style)

#### 5. Safety & guardrails
- **Input validation** — prompt injection detection, PII redaction
- **Output validation** — content filtering, format enforcement, factuality checks
- **Rate limiting** — per-user, per-API-key, per-model
- **Human-in-the-loop** — flag high-risk outputs for review

#### 6. Streaming
- **Chunked responses** — stream tokens as they're generated
- **Early stopping** — cut off generation based on trigger tokens
- **Progressive rendering** — show partial results to reduce perceived latency

### Frameworks

| Framework | Focus | Key features |
|-----------|-------|-------------|
| **LangChain** | Chain composition | Tools, agents, RAG, streaming |
| **LlamaIndex** | Data/rag-centric | Advanced indexing, query engines |
| **Vercel AI SDK** | Frontend-first | Streaming, tool calling, framework-agnostic |
| **DSPy** | Programmatic optimisation | Compiler for prompt pipelines |
| **Guardrails AI** | Safety | Structured output, validation |

### Cost management

LLM costs are dominated by token consumption. Harness engineering controls this via:
- **Caching** (avoid redundant calls)
- **Model selection** (cheaper model for simple tasks)
- **Context pruning** (keep only what matters)
- **Batching** (combine requests where possible)
- **Token budgeting** (max tokens per call, per session, per user)

---

## How they fit together

These three practices form a pipeline:

```
Prompt Engineering          Context Engineering          Harness Engineering
─────────────────          ──────────────────          ──────────────────
"What to say"              "What to give it"            "How to run it"

   Instruction  ────┐
   Format       ────┤
   Examples     ────┤──▶  Context window  ────▶   Prompt Manager    ────▶  LLM
                    │                          Caching
   Persona      ────┤                          Observability
   Facts        ────┘                          Safety
   Documents                                  Routing
   Tools                                       Streaming
```

- **Prompt engineering** gets you 80% of the way there for simple tasks
- **Context engineering** gets you the next 15% — handling complexity, knowledge, and personalisation
- **Harness engineering** makes the last 5% production-grade — reliable, observable, safe, and cost-effective

In a mature system, all three are developed and maintained together, owned by a single **AI engineering** team rather than split across specialities.
