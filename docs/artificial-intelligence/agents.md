# Agents

An **AI agent** is a system that can autonomously perform multi-step tasks by reasoning, using tools, and adapting to feedback — as opposed to a chatbot that answers a single question in one turn.

## How agents work

Most agents follow an **observe-think-act** loop:

1. Receive a request and context
2. Reason about what needs to be done
3. Take an action (edit a file, run a command, search the web)
4. See the result and decide what to do next
5. Repeat until the goal is complete

For example, you ask an agent to "add a dark mode toggle." It reads your code, writes the CSS, builds the project, sees a compilation error, fixes it, rebuilds, and says "done." All without you intervening between steps. The loop ends only when the result satisfies the original request.

## Agents vs chatbots

| | Chatbot | Agent |
|--|---------|-------|
| Interaction | Single Q&A | Multi-step task |
| Tools | None | Read, write, execute code, browse |
| Feedback loop | User re-prompts | Self-corrects based on results |

## Key traits

- **Tool use** — calls external functions (file system, shell, APIs)
- **Planning** — breaks complex requests into sub-steps
- **Self-correction** — changes approach on errors
- **Autonomy** — works without step-by-step guidance

## Risks

- **Cost** — agent loops consume many more tokens than single-turn calls
- **Runaway loops** — can get stuck repeating a failed action
- **Over-autonomy** — may make changes the user didn't intend (mitigated by permission gates)

## Examples

Tools like opencode, Claude Code, and ChatGPT Tasks are all agentic systems — an LLM with tools and a permission model that lets you delegate complex workflows while staying in control.
