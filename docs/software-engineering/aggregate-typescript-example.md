# Where Does the Code Go? A TypeScript Example

## The folder structure

```
src/
  orders/
    domain/
      Order.ts          # aggregate
      OrderItem.ts      # entity inside the aggregate
      OrderRepository.ts # interface (port)
    application/
      PlaceOrder.ts     # command handler (write)
      AddOrderItem.ts   # command handler (write)
      GetOrder.ts       # query handler (read)
      ListOrders.ts     # query handler (read)
    infrastructure/
      PostgresOrderRepository.ts  # repository implementation
```

## The domain layer: aggregates and entities

```typescript
// src/orders/domain/OrderItem.ts
export class OrderItem {
  constructor(
    public readonly productId: string,
    public quantity: number,
    public price: number,
  ) {}
}

// src/orders/domain/Order.ts
import { OrderItem } from './OrderItem';

export class Order {
  private items: OrderItem[] = [];
  private status: 'draft' | 'confirmed' = 'draft';

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
  ) {}

  addItem(productId: string, quantity: number, price: number): void {
    if (this.status !== 'draft') {
      throw new Error('cannot modify a confirmed order');
    }
    if (this.items.length >= 10) {
      throw new Error('order cannot have more than 10 items');
    }
    this.items.push(new OrderItem(productId, quantity, price));
  }

  removeItem(productId: string): void {
    if (this.status !== 'draft') {
      throw new Error('cannot modify a confirmed order');
    }
    this.items = this.items.filter(i => i.productId !== productId);
  }

  confirm(): void {
    if (this.items.length === 0) {
      throw new Error('cannot confirm an empty order');
    }
    this.status = 'confirmed';
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  }

  get itemCount(): number {
    return this.items.length;
  }
}
```

## The repository interface

```typescript
// src/orders/domain/OrderRepository.ts
import { Order } from './Order';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}
```

## The application layer: write side

```typescript
// src/orders/application/PlaceOrder.ts
import { Order } from '../domain/Order';
import { OrderRepository } from '../domain/OrderRepository';

export class PlaceOrder {
  constructor(private orderRepo: OrderRepository) {}

  async execute(command: {
    orderId: string;
    customerId: string;
    items: { productId: string; quantity: number; price: number }[];
  }): Promise<void> {
    const order = new Order(command.orderId, command.customerId);

    for (const item of command.items) {
      order.addItem(item.productId, item.quantity, item.price);
    }

    order.confirm();
    await this.orderRepo.save(order);
  }
}
```

```typescript
// src/orders/application/AddOrderItem.ts
import { OrderRepository } from '../domain/OrderRepository';

export class AddOrderItem {
  constructor(private orderRepo: OrderRepository) {}

  async execute(command: {
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
  }): Promise<void> {
    const order = await this.orderRepo.findById(command.orderId);
    if (!order) throw new Error('order not found');

    order.addItem(command.productId, command.quantity, command.price);
    await this.orderRepo.save(order);
  }
}
```

## The application layer: read side

```typescript
// src/orders/application/GetOrder.ts
import { db } from '../../infrastructure/database';

export class GetOrder {
  async execute(orderId: string): Promise<{
    orderId: string;
    customerId: string;
    total: number;
    itemCount: number;
    status: string;
  } | null> {
    return db.queryOne(
      'SELECT order_id, customer_id, total, item_count, status FROM orders WHERE id = ?',
      [orderId],
    );
  }
}
```

```typescript
// src/orders/application/ListOrders.ts
import { db } from '../../infrastructure/database';

export class ListOrders {
  async execute(customerId: string): Promise<
    { orderId: string; total: number; status: string }[]
  > {
    return db.query(
      'SELECT order_id, total, status FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId],
    );
  }
}
```

## How they connect: the controller

```typescript
// src/orders/interfaces/OrderController.ts
import { PlaceOrder } from '../application/PlaceOrder';
import { AddOrderItem } from '../application/AddOrderItem';
import { GetOrder } from '../application/GetOrder';
import { ListOrders } from '../application/ListOrders';

export class OrderController {
  constructor(
    private placeOrder: PlaceOrder,
    private addOrderItem: AddOrderItem,
    private getOrder: GetOrder,
    private listOrders: ListOrders,
  ) {}

  // POST /orders
  async createOrder(req, res) {
    await this.placeOrder.execute({
      orderId: req.body.orderId,
      customerId: req.body.customerId,
      items: req.body.items,
    });
    res.status(201).send();
  }

  // POST /orders/:id/items
  async addItem(req, res) {
    await this.addOrderItem.execute({
      orderId: req.params.id,
      productId: req.body.productId,
      quantity: req.body.quantity,
      price: req.body.price,
    });
    res.status(200).send();
  }

  // GET /orders/:id
  async getOrder(req, res) {
    const order = await this.getOrder.execute(req.params.id);
    if (!order) return res.status(404).send();
    res.json(order);
  }

  // GET /customers/:id/orders
  async listOrders(req, res) {
    const orders = await this.listOrders.execute(req.params.id);
    res.json(orders);
  }
}
```

## The key point

The read side (`GetOrder`, `ListOrders`) does not use the aggregate. It queries the database directly. The write side (`PlaceOrder`, `AddOrderItem`) uses the aggregate to enforce rules.

Same database. Different access patterns. The aggregate lives in the domain layer. The read queries live in the application layer. They are in the same project, the same folder, just different files.

## Related

- [Aggregates, Behavior, and Querying](aggregates-behavior-and-querying.md) - the conceptual separation
- [DDD: The Complete Process Step by Step](ddd-process.md) - the full process
- [Transactions Live Outside the Aggregate](transactions-outside-aggregate.md) - how writes cross boundaries
