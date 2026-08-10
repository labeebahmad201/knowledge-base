# When Events Are Events and When They Are Not

Not every event from event storming becomes an event in code. An orange sticky means "something happened in the business." A code event means "something else needs to react." If no other context needs to know, it is a method call, not an event. And when you do emit an event to another context, that tells you something about the relationship: those two contexts are coupled through that moment.

Here is an event storming wall for an online bookstore:

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    E1["OrderCreated"] --> E2["InventoryReserved"]
    E2 --> E3["PaymentAuthorized"]
    E3 --> E4["ShipmentPrepared"]
    E4 --> E5["ConfirmationEmailSent"]
    E4 --> E6["ReceiptGenerated"]
    E4 --> E7["LoyaltyPointsAwarded"]
    style E1 fill:#ffe680,stroke:#333
    style E2 fill:#ffe680,stroke:#333
    style E3 fill:#ffe680,stroke:#333
    style E4 fill:#ffe680,stroke:#333
    style E5 fill:#ffe680,stroke:#333
    style E6 fill:#ffe680,stroke:#333
    style E7 fill:#ffe680,stroke:#333
```

</div>

Seven orange stickies. The natural impulse is to emit all seven as domain events in code. That is a mistake.

## The filter

A domain event in code exists to tell something else to react. If nothing else reacts, the state change is a method call. The workshop produces discovery. The developer decides what becomes a communication mechanism.

Brandolini: "It's the developer understanding, not the expert knowledge, that becomes working code."

Microsoft's .NET docs: "Use domain events to explicitly implement side effects across multiple aggregates." The key word is *across*. Within a single aggregate, you just change state.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    START["State change"] --> Q1{"Another aggregate<br/>needs to react?"}
    Q1 -->|"Yes"| DE["Domain event"]
    Q1 -->|"No"| Q2{"Another context<br/>needs to know?"}
    Q2 -->|"Yes"| IE["Integration event"]
    Q2 -->|"No"| MC["Method call"]
    style START fill:#6bf,stroke:#333
    style DE fill:#ffe680,stroke:#333
    style IE fill:#6bf,stroke:#333
    style MC fill:#e8e8e8,stroke:#999
```

</div>

## Applying the filter to the bookstore

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    subgraph Wall["Event storming wall"]
        W1["OrderCreated"]
        W2["InventoryReserved"]
        W3["PaymentAuthorized"]
        W4["ShipmentPrepared"]
        W5["ConfirmationEmailSent"]
        W6["ReceiptGenerated"]
        W7["LoyaltyPointsAwarded"]
    end
    subgraph Code["In code"]
        C1["placeOrder() method call"]
        C2["reserveStock() method call"]
        C3["Domain event"]
        C4["Domain event"]
        C5["Integration event"]
        C6["Integration event"]
        C7["Integration event"]
    end
    W1 --> C1
    W2 --> C2
    W3 --> C3
    W4 --> C4
    W5 --> C5
    W6 --> C6
    W7 --> C7
    style Wall fill:#ffe680,stroke:#333
    style C1 fill:#e8e8e8,stroke:#999
    style C2 fill:#e8e8e8,stroke:#999
    style C3 fill:#ffe680,stroke:#333
    style C4 fill:#ffe680,stroke:#333
    style C5 fill:#6bf,stroke:#333
    style C6 fill:#6bf,stroke:#333
    style C7 fill:#6bf,stroke:#333
```

</div>

| Sticky | Code | Why |
|---|---|---|
| OrderCreated | `placeOrder()` | Changes state. Nothing else reacts yet. |
| InventoryReserved | `reserveStock()` | Same transaction as OrderCreated. Internal. |
| PaymentAuthorized | Domain event | Payment aggregate needs to react. |
| ShipmentPrepared | Domain event | Shipment aggregate needs to react. |
| ConfirmationEmailSent | Integration event | Notification system is outside the domain. |
| ReceiptGenerated | Integration event | Same. |
| LoyaltyPointsAwarded | Integration event | Same. |

Seven stickies. Two method calls, two domain events, three integration events.

## Before and after

Every sticky as an event:

```python
class OrderService:
    def place_order(self, order):
        order.status = "created"
        self.event_store.append(OrderCreated(order))
        self.event_store.append(InventoryReserved(order))
        self.event_store.append(PaymentRequested(order))
        self.event_store.append(ShipmentRequested(order))
        self.event_store.append(ConfirmationEmailRequested(order))
        self.event_store.append(ReceiptRequested(order))
        self.event_store.append(LoyaltyPointsRequested(order))
```

Only cross-boundary communication as events:

```python
class OrderService:
    def place_order(self, order):
        order.reserve_stock()
        order.status = "created"
        self.event_store.append(OrderCreated(order))
```

The second version tells you what matters: `OrderCreated` is the moment other aggregates need to react. Everything else is internal.

## Why event storming still works

The workshop is not wrong for producing more events than the code needs. Every orange sticky is a business concept worth understanding. The filter happens between the wall and the keyboard.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    W["Event storming wall"] --> F{"Who needs to react?"}
    F -->|"Nobody"| MC["Method call"]
    F -->|"Another aggregate"| DE["Domain event"]
    F -->|"Another context"| IE["Integration event"]
    style W fill:#ffe680,stroke:#333
    style F fill:#6bf,stroke:#333
    style MC fill:#e8e8e8,stroke:#999
    style DE fill:#ffe680,stroke:#333
    style IE fill:#6bf,stroke:#333
```

</div>

## Related

- [DDD: The Complete Process Step by Step](ddd-process.md) - the full process from discovery to implementation
- [Transactions Outside the Aggregate](transactions-outside-aggregate.md) - how to handle communication across aggregate boundaries
- [Strong vs Eventual Consistency](strong-vs-eventual-consistency.md) - the consistency decision for cross-aggregate events
