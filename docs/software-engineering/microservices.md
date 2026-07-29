# Microservices

Microservices are an architectural style where an application is composed of small, independently deployable services, each with its own bounded context, data store, and API. They communicate via lightweight protocols (HTTP/REST, gRPC, message queues).

## Key tradeoffs

- **Independent scaling & deployment** vs. **operational complexity** (service discovery, distributed tracing, eventual consistency)
- Not a silver bullet — monoliths are often the right starting point

## When to go microservices

Start monolithic. Extract services only when you feel concrete pain that microservices would solve:

1. **Team scaling** — multiple teams step on each other's toes in one codebase
2. **Deployment coupling** — changing one feature requires rebuilding/deploying the whole app
3. **Scale divergence** — one part needs vastly different compute/memory/throughput than the rest
4. **Technology mismatch** — a subsystem genuinely benefits from a different stack

The rule of thumb: don't do it for technical purity, do it to solve a people or scaling problem. Premature microservices add complexity without payoff.
