# System Design & Scalability

## Single Point of Failure (SPOF)

A component whose failure brings down the entire system — one machine, one database, one network link.

**Non-distributed**: everything on one server — simple to build, simple to debug, zero network latency, zero consistency problems; but one power outage or disk failure and you're down until someone fixes it; fine for internal tools, early-stage MVPs, or when downtime is acceptable.

**Distributed**: workload spread across multiple machines — if one dies, others take over; gives you high availability and horizontal scaling; but introduces network latency, partition tolerance (CAP), consistency headaches, and operational complexity — you pay for uptime with complexity.

**Rule of thumb**: start non-distributed; when a single machine can't handle the load OR you can't afford downtime, then distribute — and always ask "what's the SPOF?" in every architecture diagram.

## Requirements Gathering

Functional, non-functional, constraints.

## Capacity Estimation

Back-of-the-envelope calculations.

## Load Balancing

L4/L7, algorithms, health checks.

## Stateless vs Stateful

## Scaling

Horizontal vs vertical scaling.

## Multi-Region

Active-active vs active-passive.

## Rate Limiting

Throttling, bulkheads.

## File/Object Storage at Scale

## CDN & Edge

## Famous Designs to Study

URL shortener, feed, chat, payments, notifications.
