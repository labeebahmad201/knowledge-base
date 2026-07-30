# How Module Wiring Works: From In-Process to Network Calls

## The problem: how do you actually switch from monolith to microservices without rewriting?

The article **Deployment is a Configuration Choice (If You Have Boundaries)** makes the claim that the same module code can run as a monolith or as a microservice by changing the wiring. But what does that wiring actually look like? How does a module call another module in-process, and how does that same call become an HTTP request without the module knowing?

The answer is the **Ports and Adapters** pattern (also called Hexagonal Architecture), combined with **Dependency Injection** at the composition root.

## The pattern: ports and adapters

Each module defines its own **ports** — interfaces that describe what it needs from other modules. The module never calls another module directly. It calls an interface that it owns.

```typescript
// The rental module defines what it needs from inventory
// This is a PORT -- an interface owned by the rental module
interface InventoryPort {
  checkAvailability(sku: string, dateRange: DateRange): Promise<Availability>
  reserveVehicle(sku: string, reservationId: string): Promise<void>
}
```

The inventory module provides an **adapter** — a concrete implementation of that interface. In the monolith, the adapter calls the inventory module's internal logic directly.

```typescript
// This is an ADAPTER -- implements the port using in-process calls
class InProcessInventoryAdapter implements InventoryPort {
  constructor(private inventoryService: InventoryService) {}

  async checkAvailability(sku: string, dateRange: DateRange): Promise<Availability> {
    // Direct in-process call to the inventory module's internal service
    return this.inventoryService.checkAvailability(sku, dateRange)
  }

  async reserveVehicle(sku: string, reservationId: string): Promise<void> {
    return this.inventoryService.reserve(sku, reservationId)
  }
}
```

When extracted as a microservice, the same port gets a different adapter — one that makes HTTP calls instead of in-process calls. The rental module does not know which adapter it is using.

```typescript
// Same PORT, different ADAPTER -- now makes network calls
class HttpInventoryAdapter implements InventoryPort {
  constructor(private baseUrl: string) {}

  async checkAvailability(sku: string, dateRange: DateRange): Promise<Availability> {
    const response = await fetch(`${this.baseUrl}/inventory/check`, {
      method: 'POST',
      body: JSON.stringify({ sku, dateRange }),
    })
    return response.json()
  }

  async reserveVehicle(sku: string, reservationId: string): Promise<void> {
    await fetch(`${this.baseUrl}/inventory/reserve`, {
      method: 'POST',
      body: JSON.stringify({ sku, reservationId }),
    })
  }
}
```

```mermaid
graph LR
    subgraph RentalModule["Rental Module"]
        RENTAL_USE_CASE["Rental Use Case"] -->|"calls"| INVENTORY_PORT["InventoryPort (interface)"]
    end
    subgraph Monolith["Monolith wiring"]
        INVENTORY_PORT -->|"injected"| IN_PROC["InProcessInventoryAdapter"]
        IN_PROC -->|"direct call"| INV_SVC["InventoryService"]
    end
    subgraph Microservice["Microservice wiring"]
        INVENTORY_PORT -->|"injected"| HTTP["HttpInventoryAdapter"]
        HTTP -->|"HTTP request"| INV_SVC2["InventoryService (remote)"]
    end
    style RentalModule fill:#6f6,stroke:#333
    style Monolith fill:#6bf,stroke:#333
    style Microservice fill:#6f6,stroke:#333
```

The rental use case calls `this.inventoryPort.checkAvailability()`. It does not know whether that resolves to an in-process call or an HTTP call. It does not import anything from the inventory module. The only thing it knows is the interface.

## The composition root: where wiring happens

The wiring is done at the composition root — the place where the application starts up. This is the only place that knows about the deployment topology.

```typescript
// Monolith composition root
async function startMonolith() {
  const db = await createDatabaseConnection()

  // Create real module services
  const inventoryService = new InventoryService(db)
  const rentalService = new RentalService(
    new InProcessInventoryAdapter(inventoryService), // in-process adapter
    new InProcessBillingAdapter(billingService),
  )

  const app = new express()
  app.use('/api', rentalService.getRouter())
  app.listen(3000)
}
```

```typescript
// Microservice composition root (Rental Service)
async function startRentalService() {
  const db = await createDatabaseConnection()

  const rentalService = new RentalService(
    new HttpInventoryAdapter('http://inventory-service:3001'), // HTTP adapter
    new HttpBillingAdapter('http://billing-service:3002'),
  )

  const app = new express()
  app.use('/api', rentalService.getRouter())
  app.listen(3000)
}
```

```mermaid
graph TD
    subgraph CompRoot["Composition Root"]
        CR["Application startup"]
    end
    subgraph Modules["Module code (unchanged)"]
        RENTAL["Rental Use Case"]
        IPORT["InventoryPort"]
        BPORT["BillingPort"]
    end
    subgraph MonolithWiring["Monolith wiring"]
        I_ADAPTER["InProcessInventoryAdapter"]
        B_ADAPTER["InProcessBillingAdapter"]
    end
    subgraph ServiceWiring["Microservice wiring"]
        I_HTTP["HttpInventoryAdapter"]
        B_HTTP["HttpBillingAdapter"]
    end
    CR -->|"selects wiring"| MonolithWiring
    CR -->|"selects wiring"| ServiceWiring
    MonolithWiring -->|"implements"| IPORT
    ServiceWiring -->|"implements"| IPORT
    style CompRoot fill:#6bf,stroke:#333
    style Modules fill:#6f6,stroke:#333
```

The composition root is the only file that changes when switching deployment topologies. The module code — the rental use case, the inventory service, the billing service — never changes.

## What changes and what does not

| Aspect | Monolith | Microservice |
|---|---|---|
| Module code | Unchanged | Unchanged |
| Port interfaces | Unchanged | Unchanged |
| Adapter implementation | In-process call | HTTP/gRPC call |
| Composition root | Wires real services with in-process adapters | Wires HTTP adapters pointing at remote services |
| Deployment config | One Dockerfile, one process | Per-service Dockerfiles, multiple processes |

## The product module example

You mentioned a Product module that gets included in consumer modules. That is one valid approach, but it creates a coupling problem. If every module imports the Product module directly, then changing Product means changing every consumer.

The ports and adapters approach inverts this. Each consumer module defines its own product port with only the fields it needs.

```typescript
// Rental module's product port -- only what rental needs
interface ProductPortForRental {
  getVehicleDetails(sku: string): Promise<VehicleDetails>
}

// Billing module's product port -- different interface
interface ProductPortForBilling {
  getPricingInfo(sku: string): Promise<PricingInfo>
}

// The Product module provides adapters for both
class ProductAdapterForRental implements ProductPortForRental {
  constructor(private productService: ProductService) {}

  async getVehicleDetails(sku: string): Promise<VehicleDetails> {
    const product = await this.productService.findBySku(sku)
    return {
      make: product.make,
      model: product.model,
      year: product.year,
    }
  }
}

class ProductAdapterForBilling implements ProductPortForBilling {
  constructor(private productService: ProductService) {}

  async getPricingInfo(sku: string): Promise<PricingInfo> {
    const product = await this.productService.findBySku(sku)
    return {
      dailyRate: product.dailyRate,
      deposit: product.deposit,
      taxRate: product.taxRate,
    }
  }
}
```

```mermaid
graph TD
    subgraph Rental["Rental Module"]
        RENTAL_UC["Rental Use Case"] --> RENTAL_PORT["ProductPortForRental"]
    end
    subgraph Billing["Billing Module"]
        BILLING_UC["Billing Use Case"] --> BILLING_PORT["ProductPortForBilling"]
    end
    subgraph Product["Product Module"]
        RENTAL_ADAPTER["ProductAdapterForRental"]
        BILLING_ADAPTER["ProductAdapterForBilling"]
        PROD_SVC["ProductService"]
    end
    RENTAL_PORT -->|"injected"| RENTAL_ADAPTER --> PROD_SVC
    BILLING_PORT -->|"injected"| BILLING_ADAPTER --> PROD_SVC
    style Rental fill:#6f6,stroke:#333
    style Billing fill:#6bf,stroke:#333
    style Product fill:#f96,stroke:#333
```

If the Product module is extracted into a microservice, only the adapters change. The ports do not change. The use cases do not change.

## How this looks in practice

The bxcodec/golang-ddd-modular-monolith-with-hexagonal project (2025) demonstrates this exact pattern in Go. Each module is a bounded context with its own ports (interfaces). The payment module depends on the payment-settings module through a port:

```go
// payment module defines its port
type IPaymentSettingsPort interface {
    GetPaymentSetting(id string) (PaymentSetting, error)
}

// Module factory wires the dependencies
paymentModule := paymentfactory.NewModule(paymentfactory.ModuleConfig{
    DB:                  db,
    PaymentSettingsPort: paymentSettingsModule.Service,
})
```

The module factory receives the dependency as an interface. Whether `paymentSettingsModule.Service` is the real implementation running in-process or an HTTP client is invisible to the payment module. The factory does not care. It just calls the interface.

The Software Architecture Guild (2026) describes this as the recommended evolution path: "Start by reinforcing module seams. If evidence indicates a genuine hotspot, extract that module behind its existing contract. Treat extraction as an option unlocked by good modularity, not as the plan."

This is the core idea. The port is the contract. The adapter is the deployment decision. The module sees only the contract. Change the deployment by swapping the adapter at the composition root. No module code changes.

## What this means for your project

When building a modular monolith, follow these rules:

1. Each module defines its own ports for everything it needs from other modules
2. Ports are interfaces owned by the consuming module, not the providing module
3. Adapters are provided by the module that owns the implementation
4. Wiring happens in one place: the composition root
5. The composition root is the only file that knows about the deployment topology

If you follow these rules, you can start as a monolith today. When a module needs to become a service, you write one new adapter class (the HTTP client) and change one line in the composition root. The module code never changes.

### References

- Cockburn, A. (2005). *Hexagonal Architecture (Ports and Adapters)*. alistair.cockburn.us. https://alistair.cockburn.us/hexagonal-architecture/ — The original description of ports and adapters pattern
- Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall. — Dependency Inversion Principle, boundaries, and plugin architectures
- Tumorang, I. (2025). *Go DDD Modular Monolith with Hexagonal Architecture*. github.com/bxcodec. https://github.com/bxcodec/golang-ddd-modular-monolith-with-hexagonal — Working example combining modular monolith with ports and adapters in Go
- Jovanovic, M. (2026). *Modular Monolith Architecture*. milanjovanovic.tech. — Module communication patterns and extraction strategies
- Software Architecture Guild (2026). *Modular Monolith*. softwarearchitectureguild.com. — Evolution path from modular monolith to extracted services
- Nabrdalik, J. (2017). *Hexagonal Architecture in Practice*. Talk. — Practical implementation of ports and adapters with Spring framework
