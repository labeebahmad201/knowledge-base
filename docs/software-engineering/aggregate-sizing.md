# Aggregate Sizing: How Big Should an Aggregate Be?

## The problem: the aggregate is either too big or too small

Every team using Domain-Driven Design hits the same question: how many entities should go inside one aggregate? The two failure modes:

**Too big:** you bundle everything together. One aggregate contains Order, LineItem, Payment, Shipment. Now changing the shipment status locks the order, and every concurrent operation serializes on the same lock. Performance degrades. The team blames DDD.

**Too small:** you split everything apart. Order and LineItem are separate aggregates. Now the user adds an item to the order, and the system needs to keep the order total and the line items consistent. But they are in different transactions. You need eventual consistency between things that must be consistent right now.

Both failure modes come from the same mistake: treating the aggregate as a structural grouping (things that are "related") instead of a behavioral boundary (things that must be consistent together).

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    TOO_BIG["Too big\nEverything in one aggregate\nLocking, contention, slow"]
    TOO_SMALL["Too small\nEverything separate\nConsistency gaps, policies everywhere"]
    JUST_RIGHT["Just right\nSmallest unit that keeps\ninvariants in one transaction"]
    TOO_BIG --> JUST_RIGHT
    TOO_SMALL --> JUST_RIGHT
    style TOO_BIG fill:#f96,stroke:#333
    style TOO_SMALL fill:#f96,stroke:#333
    style JUST_RIGHT fill:#6bf,stroke:#333,stroke-width:3px
```

</div>

## The rule: aggregate boundary = consistency boundary = transaction boundary

An aggregate is not a folder for related entities. It is a **consistency boundary**. After a transaction commits, every invariant inside the aggregate must hold. The aggregate root (the entity you load and save through) enforces all invariants.

The sizing question is simple: **do these entities need to be in the same transaction to stay consistent?**

- **Yes:** same aggregate. Transaction keeps them consistent.
- **No:** separate aggregates. Consistency between them is eventual.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    Q{"Do they need to be\nin the same transaction\nto stay consistent?"}
    Q -->|"Yes"| SAME["Same aggregate\nTransaction keeps them consistent"]
    Q -->|"No"| DIFF["Separate aggregates\nConsistency is eventual"]
    style Q fill:#ff9,stroke:#333,stroke-width:3px
    style SAME fill:#6bf,stroke:#333
    style DIFF fill:#f96,stroke:#333
```

</div>

Three sub-questions help answer the main one:

**Do they change in the same transaction?** If you update a LineItem, do you need to recalculate the Order total in the same transaction? If yes, they belong together.

**Do they share invariants?** Is there a rule that says "Order total must equal sum of LineItem prices"? If yes, they must be in the same aggregate. If the invariant spans two aggregates, you need eventual consistency to enforce it, which is harder and slower.

**Do they have independent lifecycles?** Can a LineItem exist without an Order? Can an Order exist without a Payment? If they can live independently, they are separate aggregates.

## What the aggregate root actually does

The aggregate root is the entry point. All operations go through it. It loads the entities it needs, enforces invariants, and saves everything in one transaction.

Entities inside the aggregate are data. They do not enforce invariants on their own. The root does.

Events are the output of the aggregate, not part of it. A command triggers behavior; the aggregate enforces invariants; events are the result.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph LR
    CMD["Command\n(e.g. AddItem)"] --> ROOT["Aggregate Root\n(Order)"]
    ROOT -->|"loads"| ENTITIES["Entities inside\n(LineItem)"]
    ROOT -->|"enforces"| INVARIANTS["Invariants\n(total = sum of items)"]
    ROOT -->|"produces"| EVT["Event\n(ItemAdded)"]
    style CMD fill:#6bf,stroke:#333
    style ROOT fill:#ff9,stroke:#333,stroke-width:3px
    style ENTITIES fill:#eee,stroke:#333
    style INVARIANTS fill:#f96,stroke:#333
    style EVT fill:#6bf,stroke:#333
```

</div>

## Practical example: e-commerce order

### Too big (the everything-bagel aggregate)

```typescript
class Order {
  id: string;
  customer: Customer;
  lineItems: LineItem[];
  payment: Payment;
  shipment: Shipment;
  status: OrderStatus;

  addItem(item: LineItem) {
    this.lineItems.push(item);
    this.recalculateTotal(); // touches line items
    this.validatePayment(); // touches payment
  }
}
```

Everything is in one aggregate. Changing an item locks the entire order. Payment and shipment serialize on the same lock. If two users modify different line items at the same time, they block each other. If the payment service is slow, the order modification is slow too.

### Too small (everything is separate)

```typescript
class Order {
  id: string;
  total: number;
}

class LineItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}
```

Order and LineItem are separate aggregates. But the invariant "Order total must equal sum of LineItem prices" must hold. Since they are in different transactions, you need eventual consistency. You need a policy that updates the order total when a line item changes. This is over-engineered for something that must be immediately consistent.

### Just right (the consistency boundary)

```typescript
class Order {
  id: string;
  private lineItems: LineItem[] = [];
  private total: number = 0;

  addItem(productId: string, price: number, quantity: number) {
    const item = new LineItem(productId, price, quantity);
    this.lineItems.push(item);
    this.recalculateTotal(); // same transaction, same aggregate
  }

  removeItem(lineItemId: string) {
    this.lineItems = this.lineItems.filter(i => i.id !== lineItemId);
    this.recalculateTotal(); // invariant enforced immediately
  }

  private recalculateTotal() {
    this.total = this.lineItems.reduce(
      (sum, i) => sum + i.price * i.quantity, 0
    );
  }
}
```

LineItem is inside Order because the invariant "total = sum of line items" must hold in the same transaction. Payment is separate because payment can succeed or fail independently of the order being created. Shipment is separate because shipping happens later, after payment.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    subgraph ORDER["Order Aggregate"]
        O["Order\n{id, total}"]
        L1["LineItem 1\n{product, qty, price}"]
        L2["LineItem 2\n{product, qty, price}"]
    end
    subgraph PAYMENT["Payment Aggregate"]
        P["Payment\n{id, status, amount}"]
    end
    subgraph SHIPMENT["Shipment Aggregate"]
        S["Shipment\n{id, status, address}"]
    end
    O --> L1
    O --> L2
    ORDER -->|"OrderPlaced"| PAYMENT
    PAYMENT -->|"PaymentProcessed"| SHIPMENT
    style ORDER fill:#6bf,stroke:#333,stroke-width:3px
    style PAYMENT fill:#f96,stroke:#333
    style SHIPMENT fill:#f96,stroke:#333
```

</div>

## How people actually mess this up

The theory is simple. The practice is where it falls apart. Here are real patterns that show up in production codebases.

### Mistake 1: modifying two aggregates in one transaction

This is the most common violation. A service loads two aggregates, modifies both, and saves them in one transaction. It looks clean. It breaks the rule.

```typescript
// From Dandoescode.com: "Bad: Trying to modify multiple aggregates
// in one transaction"
class OrderService {
  processOrder(orderId: OrderId, customerId: CustomerId) {
    const transaction = this.context.beginTransaction();
    const order = this.orderRepository.getById(orderId);
    const customer = this.customerRepository.getById(customerId);

    // This violates the one-transaction-per-aggregate rule
    order.markAsProcessed();
    customer.updateLastOrderDate(new Date());

    this.orderRepository.save(order);
    this.customerRepository.save(customer);
    transaction.commit();
  }
}
```

The problem: Order and Customer are separate aggregates. They have independent lifecycles. Locking both in one transaction means a slow customer update blocks the order operation, and vice versa. If the customer table is hot (many concurrent updates), every order operation waits.

The fix: use domain events. Order publishes `OrderProcessed`. A separate handler updates the customer. No shared transaction.

```typescript
// Correct: cross-aggregate coordination via events
class Order {
  markAsProcessed() {
    this.status = OrderStatus.Processed;
    this.processedAt = new Date();
    this.domainEvents.push(new OrderProcessed(this.id, this.customerId));
  }
}

class OrderProcessedHandler {
  handle(event: OrderProcessed) {
    const customer = this.customerRepository.getById(event.customerId);
    customer.updateLastOrderDate(new Date());
    this.customerRepository.save(customer);
  }
}
```

### Mistake 2: the large aggregate that locks everything

An e-commerce order aggregate that includes Order, all LineItems, Payment, Shipment, Invoice, and Customerpreferences. Every operation on any of these locks the entire aggregate.

```typescript
class Order {
  id: string;
  lineItems: LineItem[];
  payment: Payment;
  shipment: Shipment;
  invoice: Invoice;
  customerPrefs: CustomerPreferences;

  updateShipmentAddress(address: Address) {
    this.shipment.address = address;
    // This locks: order, all line items, payment, invoice, customer prefs
    // Every concurrent operation on ANY of these now waits
  }

  applyDiscount(code: string) {
    this.invoice.discount = this.calculateDiscount(code);
    this.recalculateTotal();
    // Same lock. If payment is processing, it waits for this.
    // If another user is adding a line item, it waits for this.
  }
}
```

The real-world symptom: you see database row locks piling up in monitoring. Transaction times spike during peak hours. Two users modifying different parts of the same order (one updates shipping, one applies a coupon) serialize on the same lock. The payment service calls time out because the order aggregate is locked by a slow invoice calculation.

The fix: split into focused aggregates.

```typescript
class Order {
  id: string;
  private lineItems: LineItem[] = [];

  addItem(productId: string, price: number, quantity: number) {
    this.lineItems.push(new LineItem(productId, price, quantity));
  }
}

class OrderFulfillment {
  id: string;
  orderId: string;
  address: Address;
  status: FulfillmentStatus;

  updateAddress(address: Address) {
    this.address = address;
    // Only locks this row. Order is not affected.
  }
}

class Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;

  applyDiscount(code: string) {
    this.discount = this.calculateDiscount(code);
    // Only locks payment. Order and fulfillment are not affected.
  }
}
```

Now updating the shipment address does not block applying a discount. Different aggregates, different locks, parallel operations.

### Mistake 3: loading everything to enforce one rule

The chat group example from CodeOpinion. A group chat has a rule: "cannot have more than 100,000 members." The naive implementation loads all members into memory to count them.

```typescript
// From CodeOpinion: "Model Rules, Not Relationships"
class GroupChat {
  id: string;
  members: User[]; // could be millions

  addMember(user: User) {
    if (this.members.length >= 100000) {
      throw new Error("Group chat is full");
    }
    this.members.push(user);
  }
}
```

The problem: loading the GroupChat aggregate loads every User entity into memory. Each User has a username, email, relationships, preferences. The aggregate is enormous. The database query is slow. The JVM heap fills up. Garbage collection pauses. All to enforce one simple count.

The fix: model the rule, not the relationship. Store only the count.

```typescript
class GroupChat {
  id: string;
  memberCount: number = 0;

  addMember() {
    if (this.memberCount >= 100000) {
      throw new Error("Group chat is full");
    }
    this.memberCount++;
  }
}
```

The invariant is enforced. The aggregate is tiny. Members are a separate aggregate (or even just a database table) that does not need to be loaded into the domain model.

### Mistake 4: the anemic domain model

The entity is a data holder. All logic lives in a service class. The service loads the entity, reads its fields, makes decisions, and writes them back. The entity does nothing.

```typescript
// From AbstractAlgorithms: "The Anemic Domain Model (Anti-Pattern)"
class AnemicOrder {
  id: number;
  status: string;
  totalAmount: number;
  items: AnemicOrderItem[];

  // Getters and setters only, no behavior
  getId() { return this.id; }
  getStatus() { return this.status; }
  getTotalAmount() { return this.totalAmount; }
}

class OrderService {
  addItem(order: AnemicOrder, item: AnemicOrderItem) {
    // Business logic in the service, not the entity
    order.items.push(item);
    order.totalAmount = order.items.reduce(
      (sum, i) => sum + i.price * i.quantity, 0
    );
    if (order.totalAmount > 10000) {
      order.status = "NEEDS_APPROVAL";
    }
    this.orderRepository.save(order);
  }
}
```

The problem: the invariant "totalAmount must match sum of items" is enforced in the service, not the entity. Any code that modifies `order.items` directly (another service, a script, a test) bypasses the invariant. The entity is a bag of fields with no guarantees.

The fix: move the behavior into the entity. The entity enforces its own invariants.

```typescript
class Order {
  private items: OrderLine[] = [];
  private totalAmount: number = 0;

  addItem(productId: string, price: number, quantity: number) {
    const item = new OrderLine(productId, price, quantity);
    this.items.push(item);
    this.recalculateTotal(); // invariant enforced here
    if (this.totalAmount > 10000) {
      this.status = "NEEDS_APPROVAL";
    }
  }

  private recalculateTotal() {
    this.totalAmount = this.items.reduce(
      (sum, i) => sum + i.total, 0
    );
  }
}
```

The invariant is now enforced inside the entity. No external code can bypass it. The aggregate root is the gatekeeper.

### Mistake 5: over-modeling (everything is an aggregate root)

Every entity gets its own repository, its own lifecycle, its own transaction. LineItem, OrderNote, ShippingAddress are all separate aggregates. Now adding a line item to an order requires three repositories and three transactions.

```typescript
// From Dandoescode.com: "Over-modeling"
class Order { }
class OrderLine { } // should be inside Order
class OrderLineItem { } // should be inside Order
class OrderNote { } // should be inside Order
```

The problem: the invariant "Order total must equal sum of line items" now spans two aggregates. You need a policy to keep them consistent. The system is more complex, slower, and harder to debug.

The fix: keep things that share invariants in the same aggregate. LineItem is inside Order. OrderNote can be inside Order too (it does not have its own lifecycle). ShippingAddress is a value object inside Order.

## The cost of getting it wrong

### Too big: contention

When the aggregate is large, every operation that touches any entity inside it locks the entire aggregate. Two users modifying different line items on the same order serialize on the same lock. The bigger the aggregate, the worse the contention. In a high-throughput system, this kills performance.

You will see it in database row locks, long transactions, and timeout errors. The fix is always the same: make the aggregate smaller.

### Too small: consistency gaps

When the aggregate is too small, you need policies to keep things consistent that should have been consistent by default. The system becomes more complex, harder to reason about, and harder to debug. Every policy is a potential failure point. You end up with event handlers doing work that a single transaction would do.

### The sweet spot

The right aggregate is the smallest unit that keeps all invariants consistent in a single transaction. Everything outside that boundary is a separate aggregate with eventual consistency.

## When to split: signals that your aggregate is too big

- Concurrent operations on different entities serialize on the same lock.
- The aggregate has entities with independent lifecycles (e.g., Payment can exist without Order).
- The aggregate has entities that are modified by different commands at different times.
- The aggregate is loaded but most of its data is never read.

## When to merge: signals that your aggregate is too small

- Two entities share an invariant that must hold in the same transaction.
- You need a policy to keep them consistent, but the consistency is immediate (not eventual).
- The "separate" aggregate is always loaded together with the other one.

## The relationship to bounded contexts

Aggregate sizing is a tactical decision within a bounded context. The bounded context tells you where language changes. The aggregate tells you what must be consistent together. You can have multiple aggregates in one bounded context, each with its own consistency boundary.

The bounded context is the strategic boundary. The aggregate is the tactical boundary. Both matter, but they solve different problems.

## Summary

- Aggregate = consistency boundary, not a folder for related entities.
- Same transaction = same aggregate. Different transactions = separate aggregates.
- The aggregate root enforces invariants. Entities inside are data. Events are output.
- Too big = contention. Too small = consistency gaps.
- The right size is the smallest unit that keeps all invariants consistent in a single transaction.

## See also

- [How Two Updates in Transactions Block Each Other](/docs/software-engineering/transaction-locking) explains the locking mechanics behind aggregate contention: how row locks work, what happens when they are held too long, and how deadlock occurs.
