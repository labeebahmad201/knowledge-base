# Request Coalescing: Turning a Stampede into a Single Call

## The problem: the cache expires and everyone hits the database

The code below looks harmless. Read a user from cache. If missing, read from the database and repopulate the cache.

```js
function getUser(userId) {
  const user = cache.get(userId);
  if (user == null) {
    const dbUser = db.findUser(userId);
    cache.set(userId, dbUser);
    return dbUser;
  }
  return user;
}
```

The failure is not in any single request. It is in what happens when the cache entry expires and 10,000 requests for the same user arrive at the same instant. Every one of them sees `null`, every one of them fires the identical database query. This is called a **cache stampede** (or thundering herd). The database was already hot, which is exactly why the cache was added. Now it absorbs a burst of duplicate work at the worst possible moment, and the surge can cascade into timeouts and an outage.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    A["Cache entry for userId expires"] --> B["10,000 requests arrive at once"]
    B --> C["Every request sees cache miss"]
    C --> D["Every request calls db.findUser(userId)"]
    D --> E["Database saturated with 10,000 identical queries"]
    E --> F["Timeouts and cascading failure"]
```

</div>

The query itself is cheap. The problem is its volume arriving in a single synchronized burst. Request coalescing removes that burst by guaranteeing that no matter how many requests race for the same data, only one of them ever reaches the source of truth.

## The solution: share one in-flight promise across all callers

Request coalescing (also known as singleflight, after the Go standard library package that popularized it) does one thing: when several identical operations are already in flight, a new caller does not start a second one. It attaches itself to the one already running and waits for its result.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    A["10,000 requests arrive at once"] --> B["Request 1: no in-flight call, start it"]
    B --> C["Requests 2-10,000: attach to in-flight call"]
    C --> D["One database query total"]
    D --> E["Result shared back to all 10,000 callers"]
```

</div>

The implementation keeps a map of keys to pending promises. When a key is not in the map, the caller starts the real work, stores its promise, and clears the entry when it settles. When a key is already present, the caller simply awaits the stored promise.

```ts
class RequestCoalescer {
  private inFlight = new Map<string, Promise<unknown>>();

  coalesce<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fn().finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, promise);
    return promise;
  }
}
```

The important detail is the `.finally()`: the entry must be removed whether the operation succeeds or fails. A leaked entry means future calls forever attach to a settled promise and never refetch. A key that errors should be cleaned up so the next caller retries instead of inheriting a cached failure forever.

```js
// With coalescing: one query for all 10,000 callers
const user = await coalescer.coalesce(`users:${userId}`, () => fetchUser(userId));
```

## Why it works: the map write is synchronous

The single-threaded event loop is what makes this pattern safe. Each HTTP request runs as its own callback, and the event loop executes each callback to completion before starting the next one. Inside that synchronous run, `coalesce()` does its map lookup and `set()` *before* the handler ever awaits anything. So by the time request 1's callback finishes, the entry is already parked in the map. Request 2's callback runs later, finds the key, and attaches.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    A["Request 1 callback starts"] --> B["coalesce(): no entry, start work"]
    B --> C["coalesce(): set() the promise in the map"]
    C --> D["Callback ends synchronously"]
    D --> E["Request 2 callback starts (later)"]
    E --> F["coalesce(): key already in map, attach"]
```

</div>

The crucial detail: `coalesce()` contains no `await` between the map lookup and the map write. If it did, a later request could run while the entry does not exist yet, and the stampede would slip through. The synchronous write is what guarantees that once any caller is mid-flight, every later caller sees it.

## Two levels of promise, not one

A common confusion is thinking coalescing creates one promise. It creates promises at two levels:

- **The caller promise** - one per request. Cheap: it just says "give me the result when it is ready."
- **The shared promise** - one per key. This is the actual database call, the one stored in the map.

Coalescing hands requests 2 through 10,000 the *same* shared promise. All 10,000 callers await one object, but only one database query fires. The count of promises is not what matters; the count of database queries is.

## The timing window: only overlapping requests merge

Coalescing merges requests that are in flight *at the same time*. A request that arrives after the shared promise has settled starts a new call. So the number of database calls is not always one. It is bounded by how the requests arrive in time:

- **A true stampede** - all requests land within the same latency window. Result: one database call.
- **Spread-out traffic** - requests keep arriving after each call settles. Result: roughly one call per latency window, not one call total.

Measured against a real server (NestJS, simulated 100 ms database query):

| Load pattern | Requests | Database calls |
|---|---|---|
| No coalescing | 10,000 | 10,000 |
| 10,000 spread over ~5.5 s (200 at a time) | 10,000 | ~63 |
| 400 fired in the same instant | 400 | 1 |
| 1,000 fired in the same instant | 1,000 | 1 |

The rule to internalize: coalescing replaces the request count with roughly the burst duration divided by the latency window. Under a genuine cache stampede, where everything arrives in the same instant, that collapses to one.

## Keying: the collision trap

Because the service holding the map is typically a singleton, every caller in the process shares the same `inFlight` map. Two different operations that use identical keys will silently share each other's work. That produces correct results only by accident, and stale or wrong results when the two operations are semantically different.

The fix is domain-specific keys. The key must uniquely describe the request, not just the raw ID.

```ts
// UserService
coalesce(`users:${userId}`, () => fetchUser(userId));

// OrderService
coalesce(`orders:${orderId}`, () => fetchOrder(orderId));
```

Using the bare `userId` in both places would collapse two unrelated operations into one. The `users:` and `orders:` prefixes make the key unique to its domain. If you prefer hard isolation, give each service its own coalescer instance instead of sharing one.

## Where coalescing fits next to the cache

Request coalescing and caching are complementary, not alternatives. The cache smooths out repeats over time. Coalescing smooths out the duplicates that arrive at the same moment, which is exactly the window the cache cannot cover, the instant after expiration.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
    A["Request arrives"] --> B{"Cache hit?"}
    B -- "yes" --> C["Return cached value"]
    B -- "no" --> D{"Another request in flight?"}
    D -- "yes" --> E["Attach to in-flight promise"]
    D -- "no" --> F["Query database once"]
    F --> G["Repopulate cache"]
    G --> H["Share result with all waiters"]
```

</div>

A layered read path checks the cache first, then coalesces the misses, so even under a stampede the database sees exactly one query per distinct key. The techniques reinforce each other: coalescing makes the cache's weakest moment safe, and the cache keeps coalescing from ever being needed on the happy path.

## The mental model

Request coalescing is not about making any single request faster. It is about making the worst case bounded: no matter how many requests collide, the work happens once and the result is broadcast. The three things to get right are sharing the promise, using keys that uniquely describe the operation, and cleaning up entries in both the success and failure paths.

The one nuance to keep straight: coalescing merges requests that overlap in time. A true stampede collapses to a single call; spread-out traffic gets one call per latency window. Either way the database load is bounded by time, not by request count, which is the entire point.

## Related

- [Caching, Messaging & Search](/docs/software-engineering/caching-messaging-search)
- [System Design & Scalability](/docs/software-engineering/system-design)
