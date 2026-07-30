# From Event Storming to Bounded Contexts: The Amazon Book Example

## The problem: same noun, different meaning

Two teams at Amazon talk about "book." But they mean different things.

The catalog team describes a book by its title, author, cover, description, and reviews. The warehouse team describes a book by its weight, dimensions, and fragility. The shipping team describes a book by its delivery speed and handling instructions.

Same noun. Three different models. If you force them into a single `Book` class, it becomes a 50-field god object that satisfies nobody and breaks every time one team changes a field.

Event Storming alone cannot catch this. The sticky notes say "Book" in both places, but they do not show what attributes each context needs. You need a second step: write the Read Models and event payloads for each cluster and compare them.

## The setup

We model three teams at Amazon for the journey of a book from listing to delivery. We follow the correct Event Storming color coding throughout:

| Color | Represents |
|---|---|
| Salmon / Orange | Domain event (past tense) |
| Blue | Command (present tense) |
| Yellow (small) | Actor |
| Yellow (large) | Event cluster / aggregate |
| Lilac / Purple | Policy / automated rule |
| Green | Read model / what the actor needs to see |
| Pink | External system |
| Red | Hot spot / question |

A **policy** (lilac sticky) represents an automated business rule — a decision that the system makes without a human. Everywhere you have a human actor deciding when to act, a policy is the automated equivalent.

### Purpose: why policies exist

During a Process Modeling workshop, you identify every command and ask "who or what triggers this?" For most commands the answer is a person (yellow actor). But some commands happen automatically — no one sits there clicking a button. Those get a policy instead of an actor.

Examples of policies:
- "When stock drops below 10 units, automatically reorder"
- "When payment is received, automatically mark order as confirmed"
- "When a package has not moved in 2 days, automatically alert support"

Without policies, your event timeline has gaps. Events happen but you do not know why — was a human involved or was it automatic? The policy fills that gap.

### How to use a policy in the workshop

During Level 2 (Process Modeling), for each command in your table:

| If the trigger is… | Use… |
|---|---|
| A human making a decision | Yellow actor sticky |
| An automated rule or system logic | Lilac policy sticky |
| An event from another system | Lilac policy + pink external system |

Place the policy between the triggering event and the command:

```
[Trigger Event] → [Policy (lilac)] → [Command (blue)] → [Result Event]
```

The policy does three things:
1. **Listens** for a specific event
2. **Evaluates** a condition or rule
3. **Executes** a command if the rule matches

### How policies affect boundary decisions

Policies are either *internal* or *cross-context*:

- **Internal policy**: both the trigger event and the command live inside the same bounded context. Example: a policy in Fulfillment that says "when Shipment Created, send tracking email" — everything stays inside Fulfillment.
- **Cross-context policy**: the trigger event comes from another context. Example: Inventory's Auto-Reserve policy listens to `Book Purchased` from Catalog. This is the normal way contexts communicate — via event subscriptions.

The boundary rule: **a policy must only consume events, never query aggregates.** If your policy needs to read another context's database table or call its API to fetch current state before deciding, that is a boundary violation. The policy should get everything it needs from the event payload.

We work through three levels: Big Picture for events, Process Modeling for commands and actors, Software Design for aggregates and boundaries.

## Level 1: Big Picture — events only

Walk through the whole process of a book from listing to delivery. Write every event on orange stickies and place them on a timeline.

```
[Book Listed] → [Book Details Updated] → [Book Purchased] → [Stock Reserved]
→ [Shipment Created] → [Package Picked Up] → [Package In Transit]
→ [Package Delivered] → [Return Requested] → [Refund Issued]
```

```mermaid
graph LR
    subgraph Timeline["Timeline (left to right)"]
        A["[Book Listed]"] --> B["[Book Purchased]"]
        B --> C["[Stock Reserved]"]
        C --> D["[Shipment Created]"]
        D --> E["[Package Delivered]"]
        E --> F["[Return Requested]"]
    end
    style Timeline fill:#f5f5f5,stroke:#999
    style A fill:#ffa07a,stroke:#333
    style B fill:#ffa07a,stroke:#333
    style C fill:#ffa07a,stroke:#333
    style D fill:#ffa07a,stroke:#333
    style E fill:#ffa07a,stroke:#333
    style F fill:#ffa07a,stroke:#333
```

At this level we only have events. No commands, no actors. The goal is to see the full lifecycle.

## Level 2: Process Modeling — add commands and actors

Go event by event. Add blue commands (what triggered it) and small yellow actors (who triggered it).

### Catalog process

| Orange event | Blue command | Yellow actor |
|---|---|---|
| Book Listed | List Book | Content Manager |
| Book Details Updated | Update Book Details | Content Manager |
| Book Purchased | Purchase Book | Customer |

The catalog events cluster around "Book" as a saleable item.

```mermaid
graph LR
    ACTOR1["Content Manager<br/>(actor)"] --> CMD1["List Book<br/>(command)"]
    CMD1 --> EVT1["Book Listed<br/>(event)"]
    ACTOR2["Customer<br/>(actor)"] --> CMD2["Purchase Book<br/>(command)"]
    CMD2 --> EVT2["Book Purchased<br/>(event)"]
    style ACTOR1 fill:#ffe680,stroke:#333
    style ACTOR2 fill:#ffe680,stroke:#333
    style CMD1 fill:#80b3ff,stroke:#333
    style CMD2 fill:#80b3ff,stroke:#333
    style EVT1 fill:#ffa07a,stroke:#333
    style EVT2 fill:#ffa07a,stroke:#333
```

### Inventory process

The inventory cluster has no humans. Policies trigger everything automatically.

| Orange event | Blue command | Lilac policy | Triggered by |
|---|---|---|---|
| Stock Reserved | Reserve Stock | Auto-Reserve Policy | Book Purchased event from Catalog |
| Stock Depleted | (no command — automatic side effect) | Auto-Deplete Policy | Shipment Created event from Fulfillment |

The policy sits between the incoming event and the local command:

```mermaid
graph LR
    IN_EVT["Book Purchased (event)<br/>from Catalog context"] --> POL1["Auto-Reserve Policy"]
    POL1 --> CMD["Reserve Stock (command)"]
    CMD --> EVT1["Stock Reserved (event)"]
    style IN_EVT fill:#ffa07a,stroke:#333
    style POL1 fill:#c9b,stroke:#333
    style CMD fill:#80b3ff,stroke:#333
    style EVT1 fill:#ffa07a,stroke:#333
```

The Auto-Reserve Policy reads the `Book Purchased` event, determines which stock to reserve, and issues `Reserve Stock`. No human writes a picking list or clicks a button.

**How policies affect boundaries:** If a policy is triggered by an event from another context (like this one), that is normal — it is the event contract between contexts. But if a policy needs read access to another context's aggregates (not just events), that is a boundary violation. The policy should only consume events, not query another context's database.

### Warehouse / Fulfillment process

| Orange event | Blue command | Yellow actor |
|---|---|---|
| Shipment Created | Create Shipment | Warehouse Staff |
| Package Picked Up | Pick Up Package | Carrier (External) |
| Package In Transit | (automated tracking) | System |
| Package Delivered | Confirm Delivery | Customer |

```mermaid
graph LR
    ACTOR3["Warehouse Staff<br/>(actor)"] --> CMD3["Create Shipment<br/>(command)"]
    CMD3 --> EVT3["Shipment Created<br/>(event)"]
    ACTOR4["Customer<br/>(actor)"] --> CMD4["Confirm Delivery<br/>(command)"]
    CMD4 --> EVT4["Package Delivered<br/>(event)"]
    style ACTOR3 fill:#ffe680,stroke:#333
    style ACTOR4 fill:#ffe680,stroke:#333
    style CMD3 fill:#80b3ff,stroke:#333
    style CMD4 fill:#80b3ff,stroke:#333
    style EVT3 fill:#ffa07a,stroke:#333
    style EVT4 fill:#ffa07a,stroke:#333
```

## Level 3: Add Read Models

The full flow is **Read Model → Command (with payload) → Event (with payload)**. The actor first sees information, then decides what to send, then the system records what happened.

```
[Read Model] → Actor looks → [Command + Payload] → System → [Event + Payload]
```

Every command requires a Read Model — the information the actor needs to *see* before they can act. The Read Model comes *before* the command, not after.

One subtlety: the Read Model does not have to mirror a single aggregate. A Customer's Book Listing read model might pull `averageRating` from the Review aggregate even though `Purchase Book` only touches the Book aggregate's price and availability. Read Models are denormalized views built for the actor's convenience. They span aggregates — only the command targets a specific one.

| Green Read Model | Blue command | Actor sees |
|---|---|---|
| Book Details Form | List Book | Author, title, description, categories, pricing |
| Book Listing | Purchase Book | Cover, price, availability, reviews, ratings |
| Shipment Picking List | Create Shipment | Weight, dimensions, fragility, warehouse location |
| Delivery Confirmation | Confirm Delivery | Order ID, delivery photo, signature |

### Catalog context Read Models

```
Book Details Form (what Content Manager sees before listing a book):
  { title, author, description, isbn, coverImage,
    category, tags, price, reviews, ratings,
    publicationDate, pageCount, publisher }
```

```
Book Listing (what Customer sees before purchasing):
  { title, author, coverImage, price, averageRating,
    availabilityStatus, deliveryEstimate }
```

### Warehouse context Read Models

```
Shipment Picking List (what Warehouse Staff sees before creating shipment):
  { sku, title (short), weight, dimensions,
    fragility, warehouseLocation, quantity }
```

### Shipping context Read Models

```
Delivery Confirmation (what Customer sees before confirming delivery):
  { orderId, trackingNumber, deliveryPhoto,
    signature, deliveredAt, recipientName }
```

## Level 3a: Add Command Payloads

The Command Payload is what the actor *sends*. It is not the same as the Read Model. The actor sees many fields but only sends the ones relevant to their intent.

### Catalog context command payloads

```
List Book (command) → payload:
  { title, author, description, isbn, coverImage,
    category, price, pageCount, publisher }
  → Book Listed (event):
  { isbn, title, listedAt, listedBy }
```

```
Update Book Details (command) → payload:
  { isbn, price?, description?, tags?, coverImage? }
  (only fields that changed)
  → Book Details Updated (event):
  { isbn, changedFields[], updatedAt }
```

```
Purchase Book (command) → payload:
  { isbn, quantity, customerId, shippingAddress }
  → Book Purchased (event):
  { orderId, isbn, quantity, totalPrice, purchasedAt }
```

### Warehouse context command payloads

```
Create Shipment (command) → payload:
  { orderId, sku, quantity, warehouseLocation, carrier }
  → Shipment Created (event):
  { shipmentId, sku, quantity, carrier, trackingNumber, createdAt }
```

### What command payloads reveal

Compare the `Purchase Book` command payload (Catalog) with `Create Shipment` command payload (Fulfillment). They share no fields beyond identifiers:

| Command | Context | Payload fields |
|---|---|---|
| Purchase Book | Catalog | isbn, quantity, customerId, shippingAddress |
| Create Shipment | Fulfillment | orderId, sku, quantity, warehouseLocation, carrier |

Same `quantity` field, but `Purchase Book` sends a customer address while `Create Shipment` sends a warehouse location and carrier. The Catalog context does not know about warehouse locations. The Fulfillment context does not know about customer addresses (it receives a pre-packed order).

**Different payloads = different context.** If two commands had the same payload structure, they would be candidates for merging.

## Step 4: Group events into clusters

Now cluster events by their shared noun.

| Cluster | Events | Actors |
|---|---|---|
| **Catalog** | Book Listed, Book Details Updated, Book Purchased | Content Manager, Customer |
| **Inventory** | Stock Reserved, Stock Depleted | System |
| **Fulfillment** | Shipment Created, Package Picked Up, Package In Transit | Warehouse Staff, Carrier |
| **Delivery** | Package Delivered, Return Requested, Refund Issued | Customer, Customer Support |

```mermaid
graph TD
    subgraph Catalog["Catalog Cluster"]
        C1["Book Listed"]
        C2["Book Details Updated"]
        C3["Book Purchased"]
    end
    subgraph Inventory["Inventory Cluster"]
        I1["Stock Reserved"]
        I2["Stock Depleted"]
    end
    subgraph Fulfillment["Fulfillment Cluster"]
        F1["Shipment Created"]
        F2["Package Picked Up"]
        F3["Package In Transit"]
    end
    subgraph Delivery["Delivery Cluster"]
        D1["Package Delivered"]
        D2["Return Requested"]
        D3["Refund Issued"]
    end
    style Catalog fill:#e8e8e8,stroke:#999
    style Inventory fill:#e8e8e8,stroke:#999
    style Fulfillment fill:#e8e8e8,stroke:#999
    style Delivery fill:#e8e8e8,stroke:#999
    style C1 fill:#ffa07a,stroke:#333
    style C2 fill:#ffa07a,stroke:#333
    style C3 fill:#ffa07a,stroke:#333
    style I1 fill:#ffa07a,stroke:#333
    style I2 fill:#ffa07a,stroke:#333
    style F1 fill:#ffa07a,stroke:#333
    style F2 fill:#ffa07a,stroke:#333
    style F3 fill:#ffa07a,stroke:#333
    style D1 fill:#ffa07a,stroke:#333
    style D2 fill:#ffa07a,stroke:#333
    style D3 fill:#ffa07a,stroke:#333
```

## Step 5: Compare Read Models to validate boundaries

Now compare the "Book" noun across clusters. Does it have the same attributes? If yes, merge. If no, keep separate.

| Attribute | Catalog | Inventory | Fulfillment | Shipping |
|---|---|---|---|---|
| title | Yes | Yes (short) | No | No |
| author | Yes | No | No | No |
| description | Yes | No | No | No |
| coverImage | Yes | No | No | No |
| price | Yes | No | No | No |
| isbn | Yes | Yes | No | No |
| weight | No | Yes | Yes | No |
| dimensions | No | Yes | Yes | No |
| fragility | No | Yes | Yes | No |
| warehouseLocation | No | No | Yes | No |
| trackingNumber | No | No | No | Yes |
| deliveryPhoto | No | No | No | Yes |
| signature | No | No | No | Yes |

The attribute sets barely overlap. Each cluster cares about a fundamentally different view of "book." This confirms they are separate bounded contexts.

This is one of three signals you triangulate. The others are:

- **Invariants**: "price cannot be negative" (Catalog) vs "weight cannot exceed 30kg" (Fulfillment) — different rules means different context, even if the noun is the same.
- **Actors**: different people touch different clusters — see the next section.

Attributes alone are usually enough to spot the split, but invariants and actors catch the edge cases where attribute sets happen to overlap.

## How different actors affect the boundary

Look at the actors column from the event cluster table:

| Cluster | Actors |
|---|---|
| Catalog | Content Manager, Customer |
| Inventory | System (no human) |
| Fulfillment | Warehouse Staff, Carrier |
| Delivery | Customer, Customer Support |

**Different actors = different language = different context.** The Content Manager talks about "book" as a product listing. The Warehouse Staff talks about "book" as a physical object with weight and location. The Customer talks about "book" as a purchase to be delivered.

If two clusters share the same actor, they are candidates for merging. If they have different actors, they are candidates for separation. The actor check is the fastest way to validate a boundary.

## Step 6: Define the aggregates

Within each bounded context, define the aggregates — the entities that enforce business rules.

### Catalog context

```mermaid
graph TD
    subgraph CatalogContext["Catalog Bounded Context<br/><br/>Language: book = product listing"]
        BOOK_AGG["Book Aggregate<br/>{ title, author, description, price,<br/>coverImage, isbn, reviews, ratings }"]
        CMD_LIST["List Book (command)"] --> BOOK_AGG
        CMD_UPDATE["Update Details (command)"] --> BOOK_AGG
        BOOK_AGG --> EVT_LIST["Book Listed (event)"]
        BOOK_AGG --> EVT_UPDATE["Book Details Updated (event)"]
    end
    style CatalogContext fill:#e8e8e8,stroke:#999,stroke-width:2
    style BOOK_AGG fill:#ffe680,stroke:#333
    style CMD_LIST fill:#80b3ff,stroke:#333
    style CMD_UPDATE fill:#80b3ff,stroke:#333
    style EVT_LIST fill:#ffa07a,stroke:#333
    style EVT_UPDATE fill:#ffa07a,stroke:#333
```

### Fulfillment context

```mermaid
graph TD
    subgraph FulfillmentContext["Fulfillment Bounded Context<br/><br/>Language: book = pickable item"]
        SHIP_AGG["Shipment Aggregate<br/>{ sku, weight, dimensions, fragility,<br/>warehouseLocation, quantity,<br/>trackingNumber }"]
        CMD_SHIP["Create Shipment (command)"] --> SHIP_AGG
        SHIP_AGG --> EVT_SHIP["Shipment Created (event)"]
    end
    style FulfillmentContext fill:#e8e8e8,stroke:#999,stroke-width:2
    style SHIP_AGG fill:#ffe680,stroke:#333
    style CMD_SHIP fill:#80b3ff,stroke:#333
    style EVT_SHIP fill:#ffa07a,stroke:#333
```

The Book aggregate in Catalog has a `price` field and enforces "price cannot be negative." The Shipment aggregate in Fulfillment has a `weight` field and enforces "weight cannot exceed 30kg." Different rules because different contexts.

### How they connect

The Catalog publishes `Book Purchased`. The Fulfillment context subscribes to it and reads only the fields it needs: `{ isbn, quantity, shippingAddress }`. It does not import the full `Book` aggregate.

```mermaid
graph LR
    CAT["Catalog Context"] -->|"Book Purchased event"| FUL["Fulfillment Context"]
    CAT -->|"Book Purchased event"| BILL["Billing Context"]
    style CAT fill:#e8e8e8,stroke:#999
    style FUL fill:#e8e8e8,stroke:#999
    style BILL fill:#e8e8e8,stroke:#999
```

## From Workshop Output to Documented Boundaries

### Where Event Storming ends

Event Storming the workshop stops at candidate clusters. The output is:

- Orange events grouped by shared noun into clusters
- Blue commands and yellow actors per cluster
- Green Read Models and lilac policies discovered along the way

It does **not** give you validated boundaries, aggregate definitions, or formal documentation. The workshop produces *candidates*. Validation happens in a follow-up session where you compare attributes, payloads, and actors across clusters — steps 5 and 5a in this article.

### Step 7: Name each bounded context

The context name becomes the module name, the team boundary, and the namespace in the code. Naming rules:

| Do | Don't |
|---|---|
| Name after the business capability: **Catalog**, **Fulfillment**, **Billing** | Name after an entity: **Book Context**, **Order Context** |
| Use domain language: **Inventory Management** | Use technical terms: **DB Context**, **API Context** |
| Use nouns: **Shipping**, **Payments** | Use verbs: **Shipping Books**, **Handling Returns** |

Why not "Book Context"? Because a context contains multiple aggregates. Catalog has Book, Review, and Category. If you name it "Book", where does Review go? The capability name covers everything in that context.

For the Amazon example:

| Candidate cluster | Bounded context name | Why |
|---|---|---|
| Catalog events | **Catalog** | Manages product listings, search, discovery |
| Inventory events | **Inventory** | Manages stock levels, reordering |
| Fulfillment events | **Fulfillment** | Manages picking, packing, shipping |
| Delivery events | **Shipping** | Manages carrier handoff, tracking, confirmation |
| (inferred) billing | **Billing** | Manages payments, invoices, refunds |

### Step 8: Map aggregates to bounded contexts

Each bounded context contains one or more aggregates. The rule: aggregates that share the same invariants and the same actors live in the same context.

In Catalog, multiple aggregates sit under one capability:

```
Catalog (bounded context)
├── Book aggregate     { title, author, price, coverImage, isbn, ... }
├── Review aggregate   { rating, text, customerId, bookId, ... }
├── Category aggregate { name, slug, parentId, ... }
└── Author aggregate   { name, bio, photo, bookIds[], ... }
```

Book and Review share the same actor (Content Manager manages both) and participate in the same workflow (a book page displays reviews). They belong in the same context even though they are different entity types.

Compare with Fulfillment:

```
Fulfillment (bounded context)
├── Shipment aggregate     { sku, weight, warehouseLocation, carrier, ... }
└── PickingList aggregate  { orderId, items[], status, assignedTo, ... }
```

Shipment and PickingList share the same actor (Warehouse Staff). They belong together. But neither belongs in Catalog — different actors, different attributes, different language.

### Step 9: Document each bounded context

Each bounded context gets a structured documentation block. This is the standard artifact format — it captures the context boundary, its language, its aggregates, and its event contracts:

```yaml
---
context: Catalog
purpose: Manage product listings for customer browsing and purchase
language:
  book: A product listing with title, description, price, and metadata
  review: Customer feedback on a book with rating and text
  category: Grouping of books by genre or topic
aggregates:
  Book:
    attributes: [title, author, description, isbn, price, coverImage, reviews]
    invariants:
      - price must be non-negative
      - isbn must be unique
    commands:
      List Book: { title, author, description, isbn, price }
      Update Book Details: { isbn, price?, description?, tags? }
    events:
      Book Listed: { isbn, title, listedAt, listedBy }
      Book Details Updated: { isbn, changedFields[], updatedAt }
  Review:
    attributes: [bookId, customerId, rating, text, createdAt]
    invariants:
      - rating must be between 1 and 5
      - one review per customer per book
    events:
      Review Submitted: { reviewId, isbn, rating, createdAt }
published_events:
  Book Purchased: { orderId, isbn, quantity, totalPrice, purchasedAt }
  -> consumed by: Billing, Fulfillment
---
```

For Inventory — note it has no commands initiated by humans, only policies:

```yaml
---
context: Inventory
purpose: Track stock levels and trigger replenishment
language:
  stock: Physical units of a book available in the warehouse
  stock-reservation: Held units for an active order, not available for other orders
aggregates:
  Stock:
    attributes: [sku, quantityAvailable, quantityReserved, reorderThreshold]
    invariants:
      - quantityAvailable must never be negative
      - quantityReserved must never exceed quantityAvailable
      - when quantityAvailable falls below reorderThreshold, emit Stock Low
    events:
      Stock Reserved: { sku, quantity, orderId }
      Stock Depleted: { sku, orderId }
      Stock Low: { sku, currentLevel, reorderThreshold }
policies:
  Auto-Reserve:
    triggers_on: Book Purchased (event from Catalog)
    action: Reserve Stock command
    rule: Reserve quantity === event.quantity for orderId orderId
  Auto-Deplete:
    triggers_on: Shipment Created (event from Fulfillment)
    action: Decrement quantityAvailable
    rule: Reduce stock by shipment quantity at shipment confirmation
consumed_events:
  Book Purchased: { orderId, isbn, quantity }
  -> source: Catalog
  Shipment Created: { shipmentId, sku, quantity }
  -> source: Fulfillment
---
```

For Fulfillment:

```yaml
---
context: Fulfillment
purpose: Pick, pack, and ship customer orders
language:
  shipment: A physical package with weight, dimensions, and tracking
  picking-list: A work order for warehouse staff to collect items
aggregates:
  Shipment:
    attributes: [sku, weight, dimensions, fragility, warehouseLocation, carrier, trackingNumber]
    invariants:
      - weight must not exceed carrier maximum
    commands:
      Create Shipment: { orderId, sku, quantity, warehouseLocation, carrier }
    events:
      Shipment Created: { shipmentId, sku, quantity, carrier, trackingNumber, createdAt }
consumed_events:
  Book Purchased: { orderId, isbn, quantity, shippingAddress }
  -> source: Catalog
---
```

### Step 10: Draw the context map

The context map shows relationships between bounded contexts. Arrows point from event publisher to event subscriber:

```mermaid
graph LR
    CAT["Catalog"] -->|"Book Purchased"| FUL["Fulfillment"]
    CAT -->|"Book Purchased"| BILL["Billing"]
    FUL -->|"Shipment Created"| SHIP["Shipping"]
    BILL -->|"Refund Issued"| CAT
    style CAT fill:#e8e8e8,stroke:#999
    style FUL fill:#e8e8e8,stroke:#999
    style BILL fill:#e8e8e8,stroke:#999
    style SHIP fill:#e8e8e8,stroke:#999
```

Each context is a module, a team boundary, and a deployment unit. The arrows are the event contracts — the only thing that crosses the boundary.

Each arrow implies a **policy** in the consuming context. When Fulfillment subscribes to `Book Purchased`, it has a policy somewhere that says "when this event arrives, create a shipment." Policies are the automated glue that turns an incoming event into a local command. If you draw a context map, you should be able to point at each arrow and say "this is the policy in the consumer that reacts to this event."

### Summary of artifacts

| Artifact | Content | Produced when |
|---|---|---|
| Event Storming photos | Orange events, blue commands, lilac policies, yellow actors on a wall | During workshop |
| Cluster table | Events grouped by shared noun, with actors, policies marked | End of workshop |
| Attribute comparison matrix | Read Model attributes per cluster (same noun, different fields) | Follow-up |
| Payload comparison | Command and event payload fields per cluster | Follow-up |
| Bounded context spec | Name, purpose, language, aggregates, invariants, commands, events, policies | Follow-up |
| Context map | Graph of contexts and their event contracts; each arrow implies a policy in the consumer | Follow-up |

## The method summarized (full sequence)

**During the Event Storming workshop:**

1. Write events (orange) on a timeline
2. Add commands (blue) and actors (small yellow)
3. Where commands are triggered automatically (no human), replace the actor with a policy (lilac) — write the policy, its trigger event, and the command it executes
4. Add Read Models (green) — what the actor sees *before* issuing the command
5. Group events into clusters by shared noun (large yellow)

**After the workshop, in a follow-up session:**

6. Write Read Model attributes for each cluster — if the same noun has different attributes across clusters, they are separate contexts
7. Write Command Payloads for each command — if the same-sounding command has different payloads across clusters, they are separate contexts
8. Write Event Payloads for each event — the event is the contract between contexts
9. Check invariants — if the same noun enforces different business rules in different clusters, they are separate contexts
10. Check policies — if a policy reaches into another context's aggregates (beyond consuming events), that is a boundary violation. Policies should only consume events across contexts
11. If actors differ across clusters → separate contexts
12. Name each context after its business capability (not after an entity)
13. Map aggregates to contexts — aggregates sharing actors and invariants go together
14. Document each context with its language, aggregates, commands, events, policies, and invariants
15. Draw the context map showing event flows between contexts

Event Storming gives you the clusters. The payloads and actors validate the boundaries. The documentation artifacts make them permanent.

## References

- Brandolini, A. (2017). *Introducing Event Storming*. Leanpub. https://leanpub.com/introducing_eventstorming — The full workshop format including Read Models and Software Design level.
- Jovanovic, M. (2026). *Bounded Context in DDD: How to Define Boundaries*. milanjovanovic.tech. https://milanjovanovic.tech/blog/bounded-context-ddd-explained — Shows the same Product entity with different attributes in Sales vs Fulfillment contexts.
- Fowler, M. (2014). *BoundedContext*. martinfowler.com. https://martinfowler.com/bliki/BoundedContext.html — "Different contexts may have completely different models of common concepts."
- Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley. Chapter 14 — Bounded contexts and context mapping.
- Vernon, V. (2013). *Implementing Domain-Driven Design*. Addison-Wesley. Chapter 2 — Bounded context definition and Chapter 3 — Context mapping.
