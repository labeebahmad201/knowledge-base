---
sidebar_position: 1
---

# Node.js

Node.js is a cross-platform JavaScript runtime built on the V8 engine and libuv. It runs JavaScript outside the browser and uses an event loop to handle non-blocking I/O, which is why it scales well for I/O-heavy servers without a thread per connection. This page is the hub for the Node.js article series; each topic below is its own short page.

## Runtime and architecture

- [Why your Node.js app can't monitor itself](./monitoring-paradox) - the monitoring paradox: the single event loop that serves requests also answers health checks and metrics scrapes, so under load it cannot observe itself, and the thread-per-application architecture that separates the control plane from the application to fix it.
