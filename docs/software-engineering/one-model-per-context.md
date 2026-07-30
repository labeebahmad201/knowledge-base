# One Model Per Context

## The problem: one type to rule them all

A common mistake in monolithic applications is sharing a single model across multiple contexts. A `Vehicle` class with fields for every conceivable use case. A `Customer` object that serves checkout, marketing, support, and accounting. One type, everywhere.

```typescript
// The shared type -- tries to serve every context, serves none well
class Vehicle {
  id: string
  make: string
  model: string
  year: number
  color: string
  vin: string
  licensePlate: string
  mileage: number
  fuelType: 'gas' | 'diesel' | 'electric'
  status: 'available' | 'rented' | 'maintenance'
  rentalRate: number
  insurancePolicy: string
  lastServiceDate: Date
  gpsDeviceId: string
  // 20 more fields...
}
```

This type is used by the rental booking flow, the maintenance scheduler, the billing system, the customer portal, and the fleet tracking dashboard. Every consumer sees every field, even fields that are meaningless in their context. The billing system does not need `gpsDeviceId`. The fleet tracker does not need `rentalRate`.

The problems compound:

```mermaid
graph TD
    VEHICLE["Vehicle (shared type)"] --> BOOKING["Booking context"]
    VEHICLE --> MAINT["Maintenance context"]
    VEHICLE --> BILLING["Billing context"]
    VEHICLE --> FLEET["Fleet tracking"]
    VEHICLE --> PORTAL["Customer portal"]
    style VEHICLE fill:#f66,stroke:#333
```

Every context depends on the same type. Changing the type for one context risks breaking another. Adding a field required by maintenance means recompiling and redeploying the entire application, even for contexts that will never use that field.

This is the opposite of cohesion. Unrelated concerns are coupled through a shared data structure. The application looks like one system on the surface but is a collection of independent workflows forced to share a single vocabulary.

## Why shared types are wrong

When two contexts use the same type, one of two things happens:

1. **The type is a compromise.** Each context gets some of what it needs but not all. The Vehicle type has a `status` field, but the rental context needs `'available' | 'rented'` while the maintenance context needs `'in-service' | 'repair-scheduled' | 'totaled'`. The shared enum is the intersection of both sets, which fits neither perfectly.

2. **The type is everything.** Every field any context might ever need is added to the single type. The type becomes a dumping ground. It has no cohesion. It models nothing. It is just a bag of columns.

```typescript
// Compromise: neither context gets the right type
enum VehicleStatus {
  Available,    // rental uses this
  Rented,       // rental uses this
  InService,    // maintenance uses this
  Repairing,    // maintenance uses this
  Decommissioned  // both?
}
```

```mermaid
graph LR
    subgraph Rental["Rental context needs"]
        R1["available / rented"]
    end
    subgraph Maintenance["Maintenance context needs"]
        M1["in-service / repair-scheduled / totaled"]
    end
    subgraph Shared["Shared Vehicle.status enum"]
        S1["Available, Rented, InService, Repairing, Decommissioned"]
    end
    Rental -->|"fits poorly"| Shared
    Maintenance -->|"fits poorly"| Shared
    style Rental fill:#f66,stroke:#333
    style Maintenance fill:#f66,stroke:#333
    style Shared fill:#f96,stroke:#333
```

Eric Evans describes this problem in Domain-Driven Design (2003). Each bounded context has its own ubiquitous language, its own model. The same concept — a vehicle, a customer, a product — means different things in different contexts. In the rental context, a vehicle has a rate and an availability schedule. In the maintenance context, the same vehicle has a service history and a parts inventory. These are different models that happen to refer to the same real-world object.

Vaughn Vernon, in Implementing Domain-Driven Design (2013), emphasizes that bounded contexts are the primary pattern for managing domain model boundaries. Each context gets its own model, its own types, its own database schema — even if they overlap with other contexts. The overlap is resolved through translations, not shared types.

## The solution: one model per context

Each capability defines its own types. The rental context has a `RentalVehicle`. The maintenance context has a `MaintenanceVehicle`. They share no code, no types, no schema. They communicate through interfaces, not through shared data structures.

```typescript
// Rental context -- its own model
class RentalVehicle {
  id: string
  make: string
  model: string
  rentalRate: Money
  status: 'available' | 'rented'
}

// Maintenance context -- its own model, independent
class MaintenanceVehicle {
  id: string
  vin: string
  lastServiceDate: Date
  nextServiceDue: Date
  serviceStatus: 'in-service' | 'repair-scheduled' | 'totaled'
}
```

```mermaid
graph LR
    subgraph RentalContext["Rental context"]
        RV["RentalVehicle type<br/>make, model, rate, status"]
    end
    subgraph MaintenanceContext["Maintenance context"]
        MV["MaintenanceVehicle type<br/>vin, service dates, serviceStatus"]
    end
    RentalContext -->|"communicates via interface"| MaintenanceContext
    style RentalContext fill:#6f6,stroke:#333
    style MaintenanceContext fill:#6bf,stroke:#333
```

Each type is cohesive. Each type contains only the fields relevant to its context. Each type can change without affecting the other. The rental team can add fields, rename methods, or restructure the model without ever touching the maintenance team's code.

Martin Fowler describes this as "Bounded Context" in his 2014 article and in Patterns of Enterprise Application Architecture. The key insight: a model is not a universal truth. It is a simplification of reality for a specific purpose. Different purposes need different simplifications.

## How this connects to logical and physical separation

When every context has its own model, the application has achieved **logical separation**. The code files, the namespaces, and the dependency graphs are clean. The billing module does not import the fleet tracking module's types. Each module compiles independently.

But the application is still a single deployable unit. That is the modular monolith: logically separated, physically together.

```mermaid
graph TD
    subgraph Process["Single deployable artifact"]
        RENTAL["Rental module<br/>(own model, own tables)"]
        MAINT["Maintenance module<br/>(own model, own tables)"]
        BILLING["Billing module<br/>(own model, own tables)"]
    end
    Process -->|"deploy once"| PROD["Production"]
    style Process fill:#6bf,stroke:#333
```

Sam Newman, in Building Microservices (2015, 2021), argues that the hard part of microservices is not the deployment topology — it is the logical separation. Teams that cannot separate their models and data within a monolith will struggle to separate them across services. The reverse is also true: teams that achieve clean logical separation within a monolith can extract services later with far less friction.

This is the benefit the architect described. Build with capability-based modules, each with its own model and its own data. Deploy as one artifact today. Extract into separate services tomorrow. The extraction is a packaging change, not a code change.

```mermaid
graph LR
    subgraph Today["Today: modular monolith"]
        MOD1["Module A"] --- MOD2["Module B"]
        MOD1 -->|"interface"| MOD2
    end
    subgraph Tomorrow["Tomorrow: microservices"]
        SVC1["Service A"] -.->|"network call"| SVC2["Service B"]
    end
    Today -->|"extract without rewrite"| Tomorrow
    style Today fill:#6f6,stroke:#333
    style Tomorrow fill:#6bf,stroke:#333
```

## Deployment is a configuration choice

When modules are truly decoupled — own model, own data, communicate only through interfaces — the decision to deploy them together or separately becomes a deployment configuration, not an architecture decision.

The same codebase can be wired two ways:

```typescript
// Monolith wiring -- modules call each other in-process
const app = new App()
app.register(new RentalModule())
app.register(new MaintenanceModule())
app.register(new BillingModule())
app.start()

// Microservice wiring -- modules become separate processes
// Service A
const appA = new App()
appA.register(new RentalModule())
appA.registerHttpClient('maintenance', 'http://service-b:3001')
appA.registerHttpClient('billing', 'http://service-c:3002')
appA.start()

// Service B
const appB = new App()
appB.register(new MaintenanceModule())
appB.registerHttpClient('rental', 'http://service-a:3000')
appB.start()

// Service C
const appC = new App()
appC.register(new BillingModule())
appC.registerHttpClient('rental', 'http://service-a:3000')
appC.start()
```

The modules themselves do not change. Each module exposes the same interface regardless of how it is deployed. When everything runs in one process, the interface resolves to an in-memory call. When split into services, the same interface resolves to an HTTP, gRPC, or message queue call. The module does not know or care.

```mermaid
graph TD
    subgraph Monolith["Monolith deployment"]
        M_RENTAL["Rental<br/>Module"] -->|"in-memory"| M_MAINT["Maintenance<br/>Module"]
        M_RENTAL -->|"in-memory"| M_BILL["Billing<br/>Module"]
    end
    subgraph Services["Microservices deployment"]
        S_RENTAL["Rental<br/>Service"] -->|"HTTP/gRPC"| S_MAINT["Maintenance<br/>Service"]
        S_RENTAL -->|"HTTP/gRPC"| S_BILL["Billing<br/>Service"]
    end
    Monolith -->|"same modules<br/>different wiring"| Services
    style Monolith fill:#6f6,stroke:#333
    style Services fill:#6bf,stroke:#333
```

This is the promise of loose coupling. The module boundaries are drawn correctly, so the deployment topology is a runtime concern. Switch from monolith to microservices by changing a configuration file and restarting. No code changes, no rewrites, no months-long migration projects.

A common anti-pattern is building modules that "might become services someday" but are tightly coupled to shared types, shared tables, and in-process assumptions. When the time comes to split, the team discovers that the module cannot run independently because it depends on another module's database, or uses types that do not serialize over the wire, or makes synchronous calls that timeout under network latency. The separation becomes a rewrite, not a configuration change.

The goal of one-model-per-context is not to enable microservices. It is to build modules that are independently understandable and independently changeable. The deployment flexibility is a side effect — but it is a powerful one. It means you can start as a monolith (fast iteration, simple operations) and extract services when the scaling pressure or team structure demands it, without ever changing the module code.

## Data ownership makes this work

Logical separation means nothing without data ownership. If every module still reads and writes the same database tables, the models are paper-thin. The real coupling is in the schema.

True data ownership means:

1. Each module owns its tables
2. No module directly queries another module's tables
3. Cross-module data access happens through interfaces, not joins
4. Schema changes in one module never require migration in another

```typescript
// Wrong: direct data access across modules
const vehicles = await db.query('SELECT * FROM rental.vehicles WHERE status = $1', ['available'])

// Right: access through the owning module's interface
const vehicles = await rentalModule.getAvailableVehicles()
```

```mermaid
graph TD
    subgraph Wrong["Wrong: shared data"]
        R1["Rental code"] --> DB1["rental.vehicles table"]
        M1["Maintenance code"] --> DB1
        F1["Fleet code"] --> DB1
    end
    subgraph Right["Right: owned data"]
        R2["Rental code"] --> RDB["rental.vehicles"]
        M2["Maintenance code"] --> MDB["maintenance.vehicles"]
        F2["Fleet code"] --> FDB["fleet.vehicles"]
        M2 -->|"queries via interface"| R2
        F2 -->|"queries via interface"| R2
    end
    style Wrong fill:#f66,stroke:#333
    style Right fill:#6f6,stroke:#333
```

When data is owned, extraction is straightforward. The rental module already has its own tables, its own models, and its own public interface. Wrapping that behind a network boundary is mechanical. No model changes, no schema split, no data migration project.

This point is reinforced by the team at Pendoah AI (2025) in their analysis of modular monolith extraction patterns. They found that teams with clear data ownership within a monolith could extract individual modules into independent services in days rather than months. Teams without data ownership had to untangle shared schemas first, which took weeks per module.

The Flexera 2025 State of the Cloud Report similarly notes that organizations with well-defined domain boundaries in their monoliths report significantly lower migration costs when moving to distributed architectures compared to those with layered, schema-coupled monoliths.

## Summary

| Shared type across contexts | One model per context |
|---|---|
| Compromise type that fits neither | Purpose-built type for each use case |
| Changing one context risks breaking another | Each context changes independently |
| Schema couples unrelated modules | Data ownership enforces boundaries |
| Extraction requires untangling shared types | Extraction is a packaging change |

The rule is simple: if two parts of the system have different reasons to change, they should have different models. Even when deployed as one application, treat them as separate systems that happen to share a process. One capability, one model, one data owner. Always.

### References

- Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley. — Bounded Context, Ubiquitous Language
- Vernon, V. (2013). *Implementing Domain-Driven Design*. Addison-Wesley. — Bounded Context implementation patterns
- Fowler, M. (2014). *BoundedContext*. martinfowler.com. https://martinfowler.com/bliki/BoundedContext.html
- Newman, S. (2021). *Building Microservices: Designing Fine-Grained Systems*. 2nd ed. O'Reilly. — Logical separation before physical separation
- Pendoah AI (2025). *Modular Monolith Extraction Patterns*. Industry analysis on extraction timelines based on internal architecture quality
- Flexera (2025). *State of the Cloud Report*. Section on migration costs and architecture readiness
