# SQL Introduction - From Data to Answers with Supabase

## The problem: data without a way to ask

An application stores data in tables: users, orders, products. The data exists, but without a language to ask questions, it is just rows. You need to ask: who bought what, what is the total per user, which products never sold. Copying data into code and filtering with loops is slow, error-prone, and never scales to big data.

```js
// Without SQL: manual loops in code
const top = orders.filter(o => o.status === 'paid').reduce(...)
```

This does not use an index, does not run on the database, and moves all data to the app.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  APP["App code<br/>loops over rows"] --> COPY["Copy all data<br/>to memory"]
  COPY --> FILTER["Filter in JS<br/>no index"]
  FILTER --> SLOW["Slow, moves big data<br/>to the client"]
```

</div>

## The solution: SQL, a language that runs on the data

SQL lets you **describe the answer**, not the steps. You write *what* you want, the database decides *how* to get it using indexes, joins, and aggregates.

```sql
SELECT user_id, SUM(amount) AS total
FROM orders
WHERE status = 'paid'
GROUP BY user_id
ORDER BY total DESC
LIMIT 3;
```

The query runs on the data, returns only the answer, and the engine optimizes it.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  Q["SQL: describe the answer"] --> ENGINE["Postgres engine<br/>uses index, join, aggregate"]
  ENGINE --> ANSWER["Only the answer<br/>comes back"]
  style ANSWER fill:#e8f5e9,stroke:#333
```

</div>

This article uses **Supabase**, which is Postgres in the cloud, so every example is real Postgres that also runs the knowledge-base itself.

## Setup: Supabase in 5 minutes

Supabase is the fastest way to get a real Postgres you can share across all runnable examples. The runnable playground in later articles runs against the same Postgres, so the big dataset is loaded once.

**Steps:**

1.  Create a project at `supabase.com` -> New project -> set DB password -> wait 2 minutes for provisioning.
2.  Get the connection string: Dashboard -> Project Settings -> Database -> Connection string -> `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`
3.  Create the demo tables: SQL Editor -> New query -> paste the seed below -> Run.

```sql
-- Seed for all examples in this series
create table users (
  id serial primary key,
  name text not null,
  country text
);
create table orders (
  id serial primary key,
  user_id int references users(id),
  amount numeric not null,
  status text not null, -- paid, pending, cancelled
  created_at timestamp default now()
);

insert into users (name, country) values
  ('Alice','USA'), ('Bob','USA'), ('Sai','India');

insert into orders (user_id, amount, status) values
  (1, 100, 'paid'), (1, 50, 'paid'), (1, 20, 'pending'),
  (2, 200, 'paid'), (2, 30, 'cancelled'),
  (3, 300, 'paid'), (3, 10, 'paid');
```

4.  Test a query: `select * from orders;` should return 7 rows.
5.  For the playground: keep the same project for all articles. The big dataset for later WASM vs real comparisons can live in `orders_big` in the same DB.

For local isolation, each playground session in later articles runs its writes in a transaction that is rolled back, so your seed data stays clean.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  SUPA["Supabase project<br/>real Postgres"] --> SEED["Seed: users + orders<br/>run once"]
  SEED --> PLAY["Playground<br/>shared across docs"]
  PLAY --> ROLLBACK["Writes auto-rolled back<br/>seed stays clean"]
```

</div>

## The core building blocks

Every SQL statement is built from the same six clauses. Think of them as a pipeline, not the order you write them:

```
FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
```

### 1. SELECT and WHERE - filter rows

The problem: you need only some rows, with only some columns.

```sql
-- All paid orders, only the columns you need
SELECT id, user_id, amount
FROM orders
WHERE status = 'paid';
-- Result: 5 rows (Alice 2, Bob 1, Sai 2)
```

`WHERE` runs before `SELECT`. Indexes on `status` make this fast on big data.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
flowchart TD
  FROM["FROM orders<br/>7 rows"] --> WHERE["WHERE status='paid'<br/>5 rows remain"]
  WHERE --> SELECT["SELECT id, user_id, amount<br/>project columns"]
```

</div>

### 2. JOIN - combine tables

The problem: `orders` has `user_id`, but you want the name.

```sql
SELECT u.name, o.amount
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.status = 'paid';
```

This is an `INNER JOIN`: only rows with a match in both tables. A `LEFT JOIN` would keep all users even if they have no orders.

```sql
-- Left join: includes Bob even if he had no paid orders
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid';
```

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  USERS["users<br/>3 rows"] --> JOIN{"JOIN ON<br/>users.id = orders.user_id"}
  ORDERS["orders<br/>7 rows"] --> JOIN
  JOIN --> INNER["INNER: only matches<br/>5 rows"]
  JOIN --> LEFT["LEFT: all users<br/>3 users + matches"]
```

</div>

### 3. GROUP BY and HAVING - aggregate

The problem: you need totals per user, not per row.

```sql
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total
FROM orders
WHERE status = 'paid'
GROUP BY user_id
HAVING SUM(amount) > 100
ORDER BY total DESC;
-- Result: Bob 200 (1), Sai 310 (2) - Alice 150 is filtered by HAVING
```

`WHERE` filters rows before grouping, `HAVING` filters groups after.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
flowchart TD
  ROWS["Rows after WHERE<br/>5 paid rows"] --> GROUP["GROUP BY user_id<br/>3 groups"]
  GROUP --> HAVING["HAVING SUM>100<br/>2 groups remain"]
  HAVING --> SELECT2["SELECT totals"]
  SELECT2 --> ORDER["ORDER BY total DESC"]
```

</div>

### 4. ORDER BY and LIMIT - rank and sample

```sql
-- Top 2 spenders
SELECT user_id, SUM(amount) AS total
FROM orders
WHERE status = 'paid'
GROUP BY user_id
ORDER BY total DESC
LIMIT 2;
```

`ORDER BY` without `LIMIT` on big data sorts everything. With `LIMIT`, Postgres can use a top-N sort.

### 5. Subquery and CTE - name an intermediate result

When a query gets nested, name it with a CTE (`WITH`) instead of nesting.

```sql
-- CTE: readable name for an intermediate result
WITH paid AS (
  SELECT * FROM orders WHERE status = 'paid'
)
SELECT user_id, AVG(amount) AS avg_paid
FROM paid
GROUP BY user_id;
```

The same as a subquery: `SELECT ... FROM (SELECT ... ) AS paid`.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  RAW["orders"] --> CTE["WITH paid AS<br/>filtered CTE"]
  CTE --> FINAL["Final SELECT<br/>reads from CTE"]
```

</div>

### 6. Window functions - compute without collapsing rows

The problem: you want each order plus the user's total, but `GROUP BY` would collapse rows. A window keeps rows and adds a computed column.

```sql
SELECT
  id, user_id, amount,
  SUM(amount) OVER (PARTITION BY user_id) AS user_total,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rank_in_user
FROM orders
WHERE status = 'paid';
```

`PARTITION BY` is the window's `GROUP BY`, but rows stay.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  ROWS2["5 paid rows"] --> WINDOW["WINDOW PARTITION BY user_id<br/>compute per user, keep rows"]
  WINDOW --> ADD["Add user_total + rank<br/>as new columns"]
```

</div>

## DDL vs DML - structure vs data

The same distinction as in `ddl-vs-dml.md`, but from a setup view:

*   **DDL** (`CREATE`, `ALTER`, `DROP`) changes the *shape* of the database. You run it once in Supabase SQL Editor when seeding.
*   **DML** (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) changes or reads the *data*. This is what the playground runs and auto-rolls back.

```sql
-- DDL: run once
CREATE TABLE orders (...);

-- DML: run many times, reverted per playground session
INSERT INTO orders (user_id, amount, status) VALUES (1, 99, 'paid');
```

## Supabase in practice for the playground

The later runnable examples share one pattern to keep the big dataset isolated per user:

```sql
BEGIN;
-- user's DML from the playground
INSERT INTO orders VALUES (999, 10, 'paid');
SELECT * FROM orders WHERE id = 999; -- show result
ROLLBACK; -- revert, no one else sees it
```

For read-only snippets, no transaction wrapper is needed. For `locks` and `mvcc` demos that need two concurrent transactions, the playground opens two connections to the same Supabase project and shows blocking.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  SNIPPET["Snippet from article"] --> WRAP{"Is it DML?"}
  WRAP -->|"no (SELECT)"| RUN["Run directly"]
  WRAP -->|"yes"| TX["BEGIN; run; ROLLBACK"]
  TX --> CLEAN["Shared dataset untouched"]
  RUN --> CLEAN
```

</div>

## The decision in one line

Use Supabase as the single Postgres for every example: seed `users`/`orders` once, run all snippets against it, and let the playground rollback writes. Master `FROM`/`WHERE`/`JOIN`/`GROUP BY`/`HAVING`/`SELECT`/`WINDOW` in this order, and every later topic - from `ddl-vs-dml` to `postgresql-locks` - is a variation on the same pipeline.

## References

- PostgreSQL Documentation. *Queries - SELECT*. https://www.postgresql.org/docs/current/sql-select.html. The pipeline and clause order.
- PostgreSQL Documentation. *Window Functions*. https://www.postgresql.org/docs/current/tutorial-window.html. `OVER (PARTITION BY)` semantics.
- Supabase Documentation. *Project Setup*. https://supabase.com/docs/guides/database. Creating a project and connection string.
- Supabase Documentation. *SQL Editor*. https://supabase.com/docs/guides/database/overview. Running the seed.
- Knowledge base. *PostgreSQL MVCC Deep Dive* ./postgresql-mvcc.md and *PostgreSQL Locks* ./postgresql-locks.md. How the same Postgres runs transactions and isolation.

