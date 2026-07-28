# Testing a Modular Monolith

Modular monoliths are the sweet spot for testing. The module boundaries give you clean isolation for fast, focused tests. The single-process deployment gives you simple smoke tests that do not require orchestrating multiple services.

This is not a compromise. A modular monolith avoids the two worst testing regimes: the layered monolith where everything is coupled so tests are slow and brittle, and microservices where every test requires network orchestration and deals with distributed flakiness.

## The layered monolith problem: no seams

In a layered monolith, there are no module boundaries. Every test sets up the entire system because there is no way to isolate a piece of it.

```
// Layered monolith -- every test needs everything
test("checkout flow") {
  seedDatabase(ALL_TABLES)       // need data for every module
  startFullApplication()         // controllers, services, repos all wired
  hitEndpoint("/checkout")
  assertDatabase(CHECKOUT_TABLES, PAYMENT_TABLES, INVENTORY_TABLES)
  cleanupEverything()
}
```

The result is a test suite that is slow, fragile, and hard to maintain. Tests become integration tests by default because there is no way to make them unit tests.

```mermaid
graph TD
    subgraph Layered["Layered monolith test"]
        Test["Checkout test"] -->|"needs"| Setup["Seed entire database<br/>Start all controllers<br/>Wire all services"]
        Setup --> Run["Run the test"]
        Run --> Verify["Assert across all tables"]
        Verify --> Cleanup["Cleanup everything"]
    end
    subgraph Modular["Modular monolith test"]
        Test2["Checkout test"] -->|"needs"| Setup2["Stub IPaymentService<br/>Seed checkout tables only"]
        Setup2 --> Run2["Run the test"]
    end
    style Layered fill:#f66,stroke:#333
    style Modular fill:#6f6,stroke:#333
```

A 30-minute test suite in a layered monolith is common. The same system as a modular monolith tests in under 5 minutes because the boundaries allow parallel, isolated test runs.

## The microservices problem: orchestration hell

Microservices replace the layered monolith's coupling problem with an orchestration problem.

```
// Microservices -- every test needs network
test("checkout flow") {
  startCheckoutService()         // wait for container
  startPaymentService()          // wait for container
  startNotificationService()     // wait for container
  seedDatabase(CHECKOUT_DB)      // service-specific DB
  seedDatabase(PAYMENT_DB)       // another DB
  waitForHealthChecks()          // everything ready?
  hitEndpoint("/checkout")
  assertResponse()
  tearDownContainers()
}
```

Every test requires starting dependent services. Tests are flaky because network calls timeout. The developer workflow is: write code, run tests, wait for containers, debug a flaky network issue, fix the test, rerun.

```mermaid
graph LR
    subgraph Microservices["Microservices test"]
        A["Start 3 containers"] --> B["Wait for health checks"]
        B --> C["Seed 2 databases"]
        C --> D["Run test"]
        D --> E["Tear down containers"]
    end
    subgraph Modular["Modular monolith test"]
        F["Start 1 process"] --> G["Seed module tables"]
        G --> H["Run test"]
    end
    style Microservices fill:#f96,stroke:#333
    style Modular fill:#6f6,stroke:#333
```

The modular monolith removes the network layer from tests without removing the module boundaries. You test the same module structure that will eventually become services, without paying the distributed systems tax during development.

## Test levels in a modular monolith

### 1. Module tests (fastest)

A module test tests one module in isolation. Every dependency on other modules is replaced by a test double through the interface.

```mermaid
graph TD
    subgraph ModuleTest["Module test"]
        MM["Checkout Module"] -->|"calls"| IF["IPaymentService"]
        IF -->|"stubbed"| DBL["Dummy implementation<br/>returns success"]
        MM -..->|"owns"| DB[("Checkout tables")]
    end
    style ModuleTest fill:#6bf,stroke:#333
    style DBL fill:#6f6,stroke:#333
```

```
// Module test -- only checkout, stub payment
test("checkout submits order successfully") {
  paymentService = DummyPaymentService()  // always succeeds
  checkout = CheckoutModule(paymentService)

  checkout.submitOrder(customerId, items)

  assert(checkout.orderRepository.count() === 1)
  assert(checkout.orderRepository.lastOrder().status === "confirmed")
}
```

This test:
- Does not start a server or hit a network
- Seeds only checkout tables
- Runs in milliseconds
- Can run in parallel with every other module test

### 2. Integration tests (medium)

An integration test wires multiple real modules together. External dependencies (third-party APIs, databases, message brokers) are still stubbed or use test containers.

```mermaid
graph TD
    subgraph IntegrationTest["Integration test"]
        CO["Checkout Module"] -->|"real"| PS["Payment Module"]
        PS -->|"stubbed"| SA["Stripe Adapter<br/>returns success"]
        CO -..->|"owns"| CDB[("Checkout tables")]
        PS -..->|"owns"| PDB[("Payment tables")]
    end
    style IntegrationTest fill:#6bf,stroke:#333
    style SA fill:#6f6,stroke:#333
```

```
// Integration test -- real checkout + real payment, stub Stripe
test("checkout creates payment transaction") {
  stripe = DummyStripeAdapter()            // never hits Stripe's API
  payment = PaymentModule(stripe)
  checkout = CheckoutModule(payment)

  checkout.submitOrder(customerId, items)

  assert(payment.transactionRepository.count() === 1)
  assert(payment.transactionRepository.last().amount === expected)
}
```

This test exercises the real interface between two modules. It catches contract issues that module tests miss. It still does not require network calls because both modules run in the same process.

### 3. Deployment smoke tests (slowest but simplest)

A smoke test starts the full application as a single process and hits its endpoints. It confirms that the wiring works, the database migrations applied, and the basic flows succeed.

```mermaid
graph LR
    App["Start 1 process"] --> DB["Run migrations"]
    DB --> Ready["Ready"]
    Ready --> T1["GET /health -> 200"]
    Ready --> T2["POST /checkout -> 201"]
    Ready --> T3["GET /orders -> 200"]
    style App fill:#6f6,stroke:#333
    style Ready fill:#6f6,stroke:#333
```

```
// Smoke test -- start the monolith, hit endpoints
test("deployment smoke test") {
  app = startModularMonolith()     // one command

  health = GET("/health")
  assert(health.status === 200)

  order = POST("/checkout", { items: [...] })
  assert(order.status === 201)

  orders = GET("/orders")
  assert(orders.body.length > 0)

  app.stop()
}
```

No containers. No service orchestration. No network dependencies. The application starts, serves requests, and stops. This test takes seconds, not minutes.

## How the test suite scales

As the system grows, these three levels give a clear distribution of tests:

```mermaid
graph TD
    subgraph Pyramid["Test pyramid"]
        SMOKE["Smoke tests<br/>1-2 per module<br/>start the app, hit endpoints"]
        INTEGRATION["Integration tests<br/>A few per module pair<br/>verify real interfaces"]
        MODULE["Module tests<br/>Many per module<br/>fast, isolated, parallel"]
    end
    style SMOKE fill:#f96,stroke:#333
    style INTEGRATION fill:#6bf,stroke:#333
    style MODULE fill:#6f6,stroke:#333
```

| Test level | Count | Speed | Runs on every commit |
|---|---|---|---|
| Module tests | Hundreds | Milliseconds each, parallel | Yes |
| Integration tests | Dozens | Seconds each | Yes |
| Smoke tests | A handful | Seconds total | Yes (or nightly) |

A modular monolith can run all tests in under 5 minutes. A microservice system with the same functionality typically takes 15-30 minutes because of container startup, network calls, and distributed test coordination.

## What makes it possible: interfaces and data ownership

Two properties of the modular monolith make this testing structure work.

### Interfaces make stubbing natural

Because modules already communicate through interfaces (not by importing each other's internals), providing a test double is not a workaround. It is the same mechanism used in production.

```
// Production wiring
payment = PaymentModule(StripeAdapter())
checkout = CheckoutModule(payment)

// Test wiring
payment = PaymentModule(DummyStripeAdapter())
checkout = CheckoutModule(payment)
```

No reflection. No monkey patching. No special test configuration. The interface exists for architectural reasons and testing benefits for free.

### Data ownership makes test data predictable

Because each module owns its tables, a module test only seeds the tables for that module. There is no risk of a shared test fixture leaking across test boundaries.

```
// Checkout module test -- seeds only checkout tables
checkout.orderRepository.insert(testOrder())
checkout.orderRepository.insert(testOrder())

// Payment module test -- seeds only payment tables
payment.transactionRepository.insert(testTransaction())

// Never collide, never need global fixtures
```

Contrast this with a layered monolith where a single test database contains every table. Tests must carefully clean up after themselves, and test order can affect results. In a modular monolith, each module's test data is scoped to its tables.

## Migration: adding tests when refactoring toward modular

If you are moving from a layered monolith to a modular monolith, the testing structure follows the module structure. You do not need to rewrite all tests at once.

```
// Step 1: Add interfaces between modules
Old: checkout.service.ts  ->  imports payment.repository.ts directly
New: checkout.service.ts  ->  calls IPaymentService interface

// Step 2: Write module tests for the new boundaries
test("checkout with stubbed payment") { ... }

// Step 3: Keep existing integration tests until they break naturally
// They still pass because the behavior is the same
```

```mermaid
graph LR
    subgraph Before["Layered monolith tests"]
        ALL["All tests are integration tests<br/>Slow, coupled, no isolation"]
    end
    subgraph After["Modular monolith tests"]
        MT["Module tests<br/>Fast, isolated, parallel"]
        IT["Integration tests<br/>Fewer, focused on boundaries"]
        ST["Smoke tests<br/>Simple, single process"]
    end
    Before -->|"Refactor boundaries"| After
    style Before fill:#f66,stroke:#333
    style After fill:#6f6,stroke:#333
```

You do not need to convert every test overnight. As modules emerge, write new module tests for new code. Convert slow integration tests to module tests when you touch those files.

## Anti-patterns: what most teams get wrong

The boundaries that make testing easy also create new ways to write bad tests. Here are the common anti-patterns teams fall into when testing a modular monolith.

### Mocking at the class level instead of stubbing at the module boundary

The most common mistake. Teams bring their microservice or DDD testing habits and mock every class individually instead of providing a module-level test double through the interface.

```
// Bad: mock every class
paymentService = mock(PaymentService)
when(paymentService.processPayment(any())).thenReturn(success)
checkout = CheckoutModule(paymentService)

// Good: module-level stub through the interface
paymentService = DummyPaymentService()  // implements IPaymentService
checkout = CheckoutModule(paymentService)
```

Class-level mocking couples the test to the internal structure of the module. Rename a method? Update 20 tests. Change the interface? Update 2 tests (the stub and the integration test).

```mermaid
graph TD
    subgraph Bad["Anti-pattern: class-level mocks"]
        T1["Test mocks PaymentService.processPayment"]
        T2["Test mocks PaymentValidator.validate"]
        T3["Test mocks FraudDetector.check"]
        T4["Test mocks InvoiceService.generate"]
    end
    subgraph Good["Module-level stub"]
        S1["DummyPaymentService implements IPaymentService"]
        S1 -->|"one change point"| T["All checkout tests"]
    end
    style Bad fill:#f66,stroke:#333
    style Good fill:#6f6,stroke:#333
```

The module boundary is the right level of abstraction for test doubles. Below that, you are testing implementation details.

### Bypassing module boundaries in tests

A test for the checkout module directly queries the payment module's tables to verify behavior. This breaks data encapsulation and creates invisible coupling.

```
// Bad: bypass the boundary
checkout.submitOrder(customerId, items)
paymentRows = db.query("SELECT * FROM payment_transactions")  // direct table access
assert(paymentRows.length === 1)

// Good: verify through the module's public interface
checkout.submitOrder(customerId, items)
assert(checkout.lastOrder().status === "confirmed")
```

If the payment module renames its tables, the checkout test breaks. The checkout test should not know that payment tables exist.

```mermaid
graph TD
    subgraph Bad["Anti-pattern: reaching into other modules"]
        CT["Checkout Test"] -->|"direct SQL"| PT[("Payment Tables")]
    end
    subgraph Good["Test the owning module"]
        PT2[("Payment Tables")] -..->|"owned by"| PM["Payment Module"]
        CT2["Checkout Test"] -->|"calls interface"| PM
    end
    style Bad fill:#f66,stroke:#333
    style Good fill:#6f6,stroke:#333
```

### Shared global test fixtures

A single setup file that seeds data for every module. This is the layered monolith pattern brought into a modular monolith.

```
// Bad: global fixture seeds everything
beforeAll() {
  seedAllTables()  // checkout, payment, notification, search tables
}

test("checkout") { ... }   // works but slow
test("payment") { ... }    // works but fragile -- data may conflict
```

Each module test should seed only its own tables. If a test needs data from another module, it should go through that module's interface to create it.

```mermaid
graph LR
    subgraph Bad["Shared fixture"]
        GF["Global fixture"] -->|"seeds"| ALL[("All tables")]
        ALL --> T1["Checkout test"]
        ALL --> T2["Payment test"]
        ALL --> T3["Notification test"]
    end
    subgraph Good["Module-specific setup"]
        C[("Checkout tables")] -..->|"seeded by"| CSetup["Checkout test setup"]
        P[("Payment tables")] -..->|"seeded by"| PSetup["Payment test setup"]
    end
    style Bad fill:#f66,stroke:#333
    style Good fill:#6f6,stroke:#333
```

### Testing through HTTP when in-process works

Starting the full HTTP server for every test because that is how you would test a microservice. A modular monolith lets you call module methods directly.

```
// Bad: HTTP for every test
test("checkout") {
  startServer()
  response = http.post("http://localhost:3000/checkout", body)
  assert(response.status === 201)
  stopServer()
}

// Good: in-process call
test("checkout") {
  checkout = CheckoutModule(dummyPayment)
  result = checkout.submitOrder(customerId, items)
  assert(result.status === "confirmed")
}
```

The HTTP test takes 10x longer and tests nothing the in-process version does not. Reserve HTTP tests for the smoke test layer.

### Over-specifying test doubles

Using strict mocks that verify exact call counts, argument patterns, and call order. This makes tests brittle -- every refactoring breaks the mocks even when the behavior is correct.

```
// Bad: over-specified mock
verify(paymentService).processPayment(exactMatch(orderId), eq(amount))
verify(paymentService, times(1)).processPayment(any(), any())
verifyNoMoreInteractions(paymentService)

// Good: verify behavior, not calls
checkout.submitOrder(customerId, items)
assert(checkout.lastOrder().status === "confirmed")
assert(dummyPayment.lastCharged === expected)
```

A dummy or fake implementation naturally records what happened. You assert on the result, not on the interaction. The test is resilient to refactoring.

```mermaid
graph TD
    subgraph Bad["Over-specified"]
        T1["Test verifies exact call count"]
        T2["Test verifies argument order"]
        T3["Test asserts no extra calls"]
        T1 -->|"refactor breaks"| FAIL["Test fails<br/>even when behavior is correct"]
    end
    subgraph Good["Behavior-based"]
        T4["Test asserts on outputs"]
        T5["Test checks observable state"]
        T4 -->|"refactor passes"| PASS["Test passes<br/>when behavior is correct"]
    end
    style Bad fill:#f66,stroke:#333
    style Good fill:#f96,stroke:#333
    style PASS fill:#6f6,stroke:#333
    style FAIL fill:#f66,stroke:#333
```

### Circular module dependencies in tests

If module A tests wire module B, and module B tests wire module A, the test setup becomes circular. This is a symptom of a missing interface.

```
// Bad: circular wiring
test("checkout") {
  payment = PaymentModule(checkout)  // payment needs checkout?
  checkout = CheckoutModule(payment)
}

// Good: clear dependency direction
test("checkout") {
  payment = DummyPaymentService()    // stub, not real
  checkout = CheckoutModule(payment)
}
```

Circular dependencies in tests always reflect circular dependencies in the architecture. Fix the architecture first.

### Treating the modular monolith like microservices

Starting Docker containers, TestContainers, or service orchestration for tests that should run in-process. This is the most expensive anti-pattern because it adds minutes to every test run without benefit.

```
// Bad: treating it like microservices
test("checkout flow") {
  startContainer("postgres")
  startContainer("redis")
  startContainer("kafka")
  runMigrations()
  // ... test
  stopContainers()
}

// Good: in-process test with real database (or in-memory)
test("checkout flow") {
  db = inMemoryDatabase()           // or real postgres in test mode
  checkout = CheckoutModule(dummyPayment, db)
  checkout.submitOrder(customerId, items)
  assert(checkout.lastOrder().status === "confirmed")
}
```

Reserve containers for the smoke test layer or for testing third-party integrations. Do not use them for module or integration tests.

```mermaid
graph TD
    subgraph Bad["Container for every test"]
        A["Start Postgres container"] --> B["Start Redis container"]
        B --> C["Start Kafka container"]
        C --> D["Run one test"]
        D --> E["Tear down containers"]
    end
    subgraph Good["In-process test"]
        F["Start in-memory DB"] --> G["Wire modules"]
        G --> H["Run one test"]
        H --> I["Clean up memory"]
    end
    style Bad fill:#f66,stroke:#333
    style Good fill:#6f6,stroke:#333
```

## Summary

| | Layered monolith | Modular monolith | Microservices |
|---|---|---|---|
| **Test isolation** | None -- everything coupled | Module-level via interfaces | Service-level via network |
| **Test speed** | Slow (30 min+) | Fast (under 5 min) | Medium (depends on orchestration) |
| **Test flakiness** | Low (no network) | Low (no network) | High (network, containers) |
| **Test setup** | Seed shared database | Seed module-specific tables | Start containers, seed per-service DB |
| **Smoke test** | Start one process | Start one process | Start N containers |
| **Refactoring confidence** | Low -- tests are brittle | High -- boundaries are tested | High but slow feedback |

A modular monolith gives you the best of both testing worlds: the isolation and speed of module tests with the simplicity of single-process smoke tests. The same interfaces that make the architecture clean make the testing fast.
