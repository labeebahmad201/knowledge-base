# Prompts

A **prompt** is the input you give to a language model to produce a desired output. It's the primary interface for directing an AI's behavior — the quality of the output is directly tied to the quality of the prompt.

## Why prompts matter

LLMs are few-shot learners. They don't have innate intent — they respond statistically based on the context you provide. A well-structured prompt is the difference between a vague answer and a precise, actionable one.

## Components of a prompt

| Component | Purpose | Example |
|-----------|---------|---------|
| **Instruction** | What you want the model to do | "Translate this to French" |
| **Context** | Background information | "This is a legal document" |
| **Input data** | The actual content to process | "The quick brown fox..." |
| **Output format** | How the response should be structured | "Return JSON with fields: translated_text, confidence" |
| **Examples** | Few-shot demonstrations | "Input: hello → Output: bonjour" |

## Types of prompting

### Zero-shot
Ask directly without examples.

> *"Classify this email as spam or not spam: [email]"*

### Few-shot
Provide 2-5 examples before the actual task.

> *"Positive: I love this! → Sentiment: positive
> Negative: This is terrible → Sentiment: negative
> Neutral: It's okay → Sentiment: neutral
>
> Text: The product arrived late → Sentiment:"*

### Chain-of-thought (CoT)
Ask the model to reason step by step before answering. Improves accuracy on math, logic, and multi-step tasks.

> *"A store has 12 apples. It sells 4 and then gets 6 more. How many apples now? Let's think step by step."*

### System vs User prompts

Most chat models distinguish between two roles:

- **System prompt:** Sets the model's persona, constraints, and behavior rules (hidden from the user in most UIs)
- **User prompt:** The actual request within that context

```
System: You are a senior Python reviewer. Be concise. Point out bugs and security issues.
User: Review this code: [code block]
```

## Best practices

- **Be specific:** "Explain this" → "Explain this to a junior developer in 3 bullet points with code examples"
- **Set constraints:** word limits, format requirements, tone instructions
- **Put instructions last** (recency bias — models pay most attention to the end of the prompt)
- **Use delimiters** to separate input from instructions: `###`, `"""`, `---`
- **Ask for structured output** (JSON, markdown, bullet points) when you need to parse the response
- **Iterate:** treat prompts as code — test, refine, version them

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| Vague instructions | Be explicit about format, length, and tone |
| Overloading the prompt | One task per prompt, or use structured sections |
| No output format | Specify JSON, CSV, bullet points, etc. |
| Forgetting context | Tell the model who it is and who the audience is |
| Not handling edge cases | Include instructions for what to do if unsure |

## Prompts in opencode

opcode uses prompts extensively — every skill file is essentially a prompt wrapped in metadata. The `description` field determines *when* it activates, and the body is the *instruction* the AI follows. See [opencode Skills](./opencode-skills) for more.
