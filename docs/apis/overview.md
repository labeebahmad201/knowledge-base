---
sidebar_position: 0
---

# APIs - Overview

How frontends talk to backends. REST, GraphQL, gRPC, and when to pick which.

*   [GraphQL vs REST](./graphql-vs-rest.md) - one endpoint vs resource endpoints, over-fetching, caching, and the decision framework.
*   More: gRPC, WebSockets, webhooks — coming next.

```mermaid
graph TD
  FE["Frontend"] --> API{"API style?"}
  API -->|"resources,<br/>cacheable"| REST["REST"]
  API -->|"flexible<br/>queries"| GQL["GraphQL"]
  API -->|"binary,<br/>streaming"| GRPC["gRPC"]
```
