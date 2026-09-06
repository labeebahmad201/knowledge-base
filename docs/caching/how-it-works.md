---
title: "Caching: How It Works, the 5 Layers, and the Strategies"
---

# Caching: How It Works, the 5 Layers, and the Strategies

> A cache is a faster copy placed closer to the reader. The moment you add one, you accept that the copy can differ from the source of truth. All of caching is choosing where the copy sits and how you keep it good enough.

This is the fundamentals article for roadmap section 5 (Caching & Storage). It covers how caching works, the 5 layers, and the write and invalidation strategies. For what happens when your cache misses all at once, see [Cache Stampede](./cache-stampede.md).

## 1. Why a cache: the database read is not free

Caching exists because the alternative, hitting the database on every read, stops working before you get popular. So the question "why a cache" is really "why not just query the database every time". The answer has four parts, and none of them is about the query being slow in isolation:

*   **One read is cheap, a million reads are not.** A single indexed DB read is ~10ms, an API call 50-500ms. The cost that breaks systems is the multiplier: 10ms times millions of requests is 10 thousand seconds of DB work per hour. Stand up a reader, then multiply it by traffic and by the same query arriving from every replica, and the same work is computed over and over. Amazon describes the moment they reach for a cache in exactly these terms: *"the database is expensive to scale out as call volume increases... many requests are using the same downstream resource or the same query results"* ([AWS Builders' Library, Caching challenges and strategies](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/)).
*   **The database is a shared, contended resource.** Every replica and service is a single read away from the same tables. A hot query is not one user's problem; it is every query competing for the same connection pool, same buffer pool, same disk and CPU. When the DB is the bottleneck, no horizontal scaling of stateless app servers helps, because they all run into the same wall. AWS puts it bluntly: disk retrieval "plus the added query processing times generally will put your query response times in double-digit millisecond speeds, at best" ([AWS Database Caching](https://aws.amazon.com/caching/database-caching/)).
*   **Latency is easier to take out than to add.** A "tens of milliseconds" fetch is fine for one user, but it sits on the critical path of every response. The gap the cache removes is real: a memory read is roughly 10,000x faster than disk and 100x faster than a network round trip ([Jeff Dean and Peter Norvig, Latency Numbers Every Programmer Should Know](http://norvig.com/21-days.html)). And AWS notes a request to a remote in-memory cache is "sub-millisecond... orders of magnitude faster than a disk-based database" ([AWS Database Caching](https://aws.amazon.com/caching/database-caching/)).
*   **The database has a job better than serving identical copies.** Indexes, transactions, constraints, durability - that work is wasted when the answer is the same as the last thousand answers you served. Caching does not remove the source of truth; it removes the repeated *compute* of the same answer, so the DB only does real work on real changes. The AWS Well-Architected framework states the net effect directly: caching "can improve read latency, read throughput, user experience, and overall efficiency, as well as reduce costs" ([AWS Well-Architected, PERF03-BP05](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/perf_data_access_patterns_caching.html)).

So the shortest reason to cache: the hottest data is read vastly more often than it changes. A popular product price is read thousands of times a second and changes a few times a day. Instead of recomputing the answer on every request, compute it once, keep the result where it is cheap to read, and serve that copy on the hot path.

The read path becomes two paths. The fast path is a memory lookup: microseconds, no query, no DB load. The slow path is the source of truth plus refilling the cache. You win when the fast path serves most requests.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  A["GET product price"] --> B{"Cache hit?"}
  B -->|"yes"| H["Serve copy: microseconds<br/>no query"]
  B -->|"no"| M["Query database: 10ms+<br/>QPS load"]
  M --> W["Fill cache, TTL 60s"]
  H --> R[Response]
  W --> R
  style H fill:#e8f5e9
  style M fill:#ffebee
```

</div>

This is why the cache is often described with the 95/5 rule. If 95% of reads hit the cache, the database only sees 5% of the traffic. The miss rate is the real quality metric, not the cache size.

## 2. How a cache works: key, value, TTL, and fill path

A cache is a key-value store. It holds values under keys, and when you ask for a key it returns the matching value, or nothing on a miss. "Store" just means where data lives: the cache store holds the fast copies, and the database is the source-of-truth store. Same key-value shape, opposite roles.

A cache has three parts you control and one you do not:

*   **A bounded store.** Memory is limited, so the cache must evict entries when full (LRU is the usual policy).
*   **A key and a value.** The key is what the reader asks for. The value is the freshly computed or fetched result.
*   **A lifetime.** TTL, time to live, says how long the copy is trusted. After TTL the entry is a candidate for staleness or removal.
*   **A fill path.** The code that computes or fetches the value on a miss and puts it in the store.

Every read hits one of three states:

*   **Hit.** Key present and within TTL. Served from memory, no further work.
*   **Miss.** Key absent or expired. Fetch from the source of truth, fill the cache, answer.
*   **Stale.** Key present but past TTL. The copy still exists, so you can choose to serve it (bounded staleness) or rebuild. This third state is what the stampede and staleness articles build on.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  R["Read key"] --> Q{"Key present?"}
  Q -->|"no"| F["Fetch from source of truth"]
  F --> S["Fill cache with TTL"]
  Q -->|"yes, within TTL"| H["Serve fast copy"]
  Q -->|"yes, past TTL"| ST{"Policy"}
  ST -->|"serve stale"| S1["Serve copy + rebuild in background"]
  ST -->|"rebuild"| F
  style H fill:#e8f5e9
  style S1 fill:#fff3e0
```

</div>

The trade begins here: a cache is a second copy of data, so it can disagree with the source of truth. TTL bounds how long the disagreement may last. Everything else in this article is about shrinking that window without losing the speed benefit.

## 3. The numbers: how much slower is the database, really

Design interviews keep coming back to one table: latency numbers. What matters is the ratio, not the exact value:

| Operation | Typical time |
|---|---|
| L1/L2 CPU cache | ~1-10 ns |
| Main memory (RAM) | ~100 ns |
| Redis GET/SET | ~0.1-1 ms |
| Same-datacenter network round trip | ~0.2-0.5 ms |
| SSD random read | ~100 µs |
| Simple database query | ~1-10 ms |
| HDD seek | ~10 ms |

The numbers to quote in an interview: a Redis GET is about 0.1-1 ms and a simple database read about 1-10 ms. A cache hit at ~100 µs against a ~5 ms database read is the 50x improvement people use as the reference figure. That ratio is why the 95/5 rule from section 1 is so powerful: cutting 95% of reads off the database removes almost all of the expensive path.

And here is the point that answers "how can Redis be that much faster if both hit a network." Both paths pay the network. A Redis and a Postgres in the same datacenter share the same round trip, ~0.2-0.5 ms. The gap is what each server does after the packet lands. Postgres parses SQL, builds a plan, walks indexes, touches disk or its buffer pool, and marshals rows. Redis hashes a key in memory. The database does orders of magnitude more work per request for the same network cost, so the difference is memory vs disk plus query work, not network. Say that explicitly and you sound like you have operated the stack, not memorized it.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  R[Redis: in-memory hash lookup] --> RTT[Same network RTT paid by both]
  D[Database: parse, plan, index<br/>walk, disk, marshal rows] --> RTT
  RTT --> GAP[~0.1-1 ms vs ~1-10 ms<br/>gap is memory vs disk, not network]
  style R fill:#e8f5e9
  style D fill:#ffebee
```

</div>

## 4. The 5 layers of caching

Between the user and the database there are five places a copy can sit. Each layer is cheaper to hit than the one behind it, and each layer has a smaller audience than the one in front of it. A request walks the layers from top to bottom and stops at the first hit.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  U["Request"] --> L1["1 - Browser cache<br/>one user, headers"]
  L1 --> L2["2 - CDN<br/>region, HTTP cacheable"]
  L2 --> L3["3 - Reverse proxy<br/>responses by URL"]
  L3 --> L4["4 - In-process cache<br/>per instance, zero RTT"]
  L4 --> L5["5 - Distributed cache<br/>Redis / Memcached, shared"]
  L5 --> DB["Source of truth"]
  style L5 fill:#fff3e0
  style DB fill:#ffebee
```

</div>

### Layer 1: Browser cache

<<<<<<< HEAD:docs/caching/how-it-works.md
`Cache-Control` and `ETag` headers tell the browser to serve assets and GET responses from its local copy. The audience is one user, and the cost of staying in sync is HTTP headers. This is the layer people most often misunderstand, so the key question is: how much of the caching work is the browser's, and how much is yours as the backend?

**`max-age` is the only part the browser does alone.** Within the `max-age` window the browser serves from its local copy and sends **zero** requests to your server. That is the entire browser-only interval.

**Every revalidation requires your backend.** Once `max-age` expires, the browser can no longer decide on its own. It must ask the server. And that request always requires the server to participate, no matter which mechanism you use:

- `If-None-Match` / `ETag` revalidation
- `If-Modified-Since` / `Last-Modified` revalidation
- the background refresh of `stale-while-revalidate`

There is no browser-only fast path once freshness expires. The only question is how expensive the server's side of the handshake is.

**`ETag` revalidation optimizes bandwidth, not server CPU.** On a request that carries `If-None-Match`, your server must **recompute the current payload**, compute the ETag from it, and compare it to the browser's tag. Only the comparison result decides the response:

- **Match** → `304 Not Modified`, empty body. The browser keeps its copy. **But you already did the full work** of recomputing the payload; you only saved sending the bytes over the wire.
- **No match** → `200` with the fresh body and a new `ETag`.

So if the expensive part is `getProductsFromDb()`, ETag saves you nothing there. It only saves bandwidth, which matters when the payload is large.

The good news: Express (and most frameworks) already do the compute-and-compare for you. You do **not** hand-roll `etag()`. `res.send()` / `res.json()` computes the ETag automatically, and `req.fresh` tells you whether the browser's `If-None-Match` matched. Your only job is to return the response; the framework decides between `304` and `200`.

```ts
// Express: browser cache for 60s, then revalidate via ETag.
// Within max-age the browser sends nothing. After it, Express:
//   1. recomputes the product list,  2. computes its ETag,
//   3. compares to If-None-Match,    4. returns 304 or 200.
app.get('/api/products', async (req, res) => {
  const products = await getProductsFromDb();     // (1) recompute the payload
  res.set('Cache-Control', 'public, max-age=60');

  if (req.fresh) {                                // (3) browser's tag matched
    res.status(304).end();                        // (4) empty body, bytes saved
    return;
  }
  res.json(products);                             // (2)+(4) auto-ETag, 200 + body
});
```

```ts
// stall-while-revalidate: same backend work, just deferred
app.get('/api/products', async (req, res) => {
  const products = await getProductsFromDb();           // recomputed here
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  if (req.fresh) { res.status(304).end(); return; }
  res.json(products);
});
```

<<<<<<< HEAD:docs/caching/how-it-works.md
Within the `max-age` window the browser serves locally and sends nothing. After that, `stale-while-revalidate` lets it keep serving the stale copy while the background refresh hits this same handler. The server recomputes the payload and answers `304` or `200` exactly as above, just in the background instead of on the user's critical path.

The `300` in `stale-while-revalidate=300` is a **time in seconds (5 minutes)**: how long the browser may keep serving the stale copy instead of forcing the user to wait for fresh data. The mechanic is described in the HTTP spec: a cache may serve a stale response while it asynchronously checks in with the origin in the background ([RFC 9111, stale-while-revalidate](https://www.rfc-editor.org/rfc/rfc9111#name-stale-while-revalidate)). Concretely, three visitors on `max-age=60, stale-while-revalidate=300`:

- **At 55s** (inside `max-age`): browser shows its copy, sends **no request**, no backend work at all.
- **At 80s** (past `max-age`, inside SWR): browser shows the **stale copy instantly**, and revalidates in the background against your handler. The user never waits; the server still recomputes the payload and answers `304` or `200`.
- **At 400s** (past both windows): the browser **must block** and wait on the server before showing anything.

So the trade-off is one dial: a short value like `30` keeps data fresher but makes users wait more often; a long value like `600` keeps the user on stale data longer but never shows a loading spinner. You pick it from how tolerant your readers are of staleness. RFC 9111 also warns the delta-seconds value must not be too large, or a client may stay stuck on stale content for a very long time ([MDN, stale-while-revalidate](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-while-revalidate)).
 
### Layer 2: CDN

A CDN puts copies at edge nodes near the user and serves the same cacheable responses across a region. It does not need special integration: it obeys the same HTTP cache headers, but the shared-cache directive is `s-maxage`, which browsers ignore. Versioned static assets get `max-age=31536000, immutable` so the edge and browser cache them forever, and when you need to evict before expiry, the CDN exposes a purge API (by URL, tag, or hostname).

```ts
// s-maxage targets shared caches (CDN + proxy), max-age targets the browser
app.get('/api/feed', async (_req, res) => {
  const feed = await getFeed();
  res.set('Cache-Control', 'public, s-maxage=60, max-age=30, stale-while-revalidate=300');
  res.json(feed);
});

// Hashed asset: content never changes for a given name, cache it forever
app.get('/static/app.3f2a1c.js', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile('app.3f2a1c.js');
});
```

### Layer 3: Reverse proxy

Nginx, Varnish, or HAProxy sits one hop in front of the app and caches full responses by a key it computes from the request. This is where "which URL should be cacheable" becomes a config decision, and `X-Cache-Status: HIT/MISS` is the debugging header that shows you which layer answered.

```nginx
http {
  # on-disk cache area: 10MB index, 1GB total, drop entries idle 60m
  proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

  server {
    location /api/ {
      proxy_pass http://app_server;

      proxy_cache api_cache;
      proxy_cache_key "$scheme$request_method$host$request_uri";
      proxy_cache_valid 200 60s;

      add_header X-Cache-Status $upstream_cache_status; # HIT | MISS | EXPIRED
    }
  }
}
```

Note the default safety: nginx will not cache responses with a `Set-Cookie` header or without an explicit validity, so authenticated or personal data does not leak into the shared cache unless you opt in.

### Layer 4: Application in-process cache

A map or memoization table inside the app instance. Zero network round trip, but per instance: each replica has its own copy, so writes must invalidate everywhere or accept divergence. It suits per-request configuration, reference data, and anything so hot that even a Redis round trip is too much.

```ts
class TtlMap<T> {
  private store = new Map<string, { value: T; expiresAt: number }>();

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key); // expired, lazy cleanup
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

// two replicas => two separate copies; no network, but divergent state
const configCache = new TtlMap<AppConfig>();
configCache.set('checkout', await loadConfig('checkout'), 60_000);
```

### Layer 5: Distributed cache

Redis or Memcached, a shared store every instance reads. It survives instance restarts and is where "cache" usually means Redis. Bonus on the same level: the database's own buffer pool and query cache sitting under everything.

```ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

async function getProduct(id: string): Promise<Product | null> {
  const key = `product:${id}`;

  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as Product;

  const product = await db.queryOne(
    'SELECT * FROM products WHERE id = $1', [id],
  );
  if (!product) return null;

  await redis.set(key, JSON.stringify(product), 'EX', 60);
  return product;
}
```

That read path is cache-aside, the pattern from section 6. The moment you run several instances, add single-flight here so concurrent misses do not each hit the database; the mechanism is in [request-coalescing](../software-engineering/request-coalescing.md).

The practical design rule: put the copy as close to the reader as the freshness requirements allow. Cache static assets in the browser, images at the CDN, aggregated list responses at the proxy, per-request configuration in process, and cross-service hot feeds in Redis.

## 5. Eviction: what leaves when the cache is full

A bounded cache has to drop entries, and it uses two different controls that interviews test separately. Expiration removes an entry because it is too old (TTL). Eviction removes an entry because the cache is out of capacity. A fresh entry can be evicted to make room, and a stale entry can sit in memory until someone reads it. Age and capacity are different decisions.

**LRU, least recently used,** evicts the entry not touched for the longest. It is the default, because recent access predicts near-future reuse, and it is implementable in O(1) with a hash map plus a doubly linked list. That exact "implement an LRU cache" is one of the most asked coding questions, and its LFU variant is the common hard follow up.

**LFU, least frequently used,** evicts the entry with the fewest accesses. It keeps perpetually hot items that LRU would drop as soon as they go quiet for a few seconds. It needs frequency counts and can keep yesterday's favorites forever, so production LFU adds decay, like Redis aging its 24-bit counter over time.

Both share a known failure: a one-time scan touches every key once, fills the cache, and evicts the hot working set. That is the scan resistance problem, fixed with a segmented cache or an admission policy that filters one-time reads. The related failure is thrashing, the cache smaller than the working set, so entries are evicted almost as fast as they load and the hit rate collapses.

FIFO and random exist for simplicity and uniform access patterns. TTL belongs to expiration, LRU and LFU to capacity.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  E["Expiration: entry too old<br/>TTL"] --> D{Separate controls}
  V["Eviction: cache full<br/>LRU / LFU / FIFO"] --> D
  D --> H1["LRU: recent predicts reuse<br/>O(1) hash map + doubly linked list"]
  D --> H2["LFU: frequency keeps hot items<br/>needs counter decay"]
  D --> H3["TTL + LRU combined<br/>age then capacity"]
  D --> H4["Hazard: scans and thrash<br/>kill the hit rate"]
  style H1 fill:#e8f5e9
  style H4 fill:#ffebee
```

</div>

## 6. The strategies: who fills the cache and who invalidates it

The strategies differ in who moves data between the cache and the source of truth. They are easiest to remember by the read path and the write path they imply.

**Cache-aside (lazy load).** The application reads the cache first, and on a miss fetches from the source, fills the cache, and carries on. Writes go to the source, and the application invalidates or updates the cache key. This is the default for most services because it is easy and it fills the cache only with data actually asked for.

**Read-through.** The cache itself fetches from the source when it does not have the value. The application talks only to the cache. This is cache-aside with the fetch logic moved inside the cache layer.

**Write-through.** The write updates the source of truth and the cache in the same operation. The cache never goes stale from a write, but every write now costs two writes.

**Write-behind (write-back).** The write lands in the cache first and is flushed to the source asynchronously. Fastest writes and the cache always has the newest value, but a crash before flush loses data. Use only when losing a few writes is acceptable or the flush is idempotent and retried.

**Refresh ahead.** Background refresh before expiry replaces the miss with a scheduled rebuild. This is the family the stampede article calls early recomputation.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  C1["cache-aside<br/>read: fill on miss<br/>write: DB + invalidate"] --> P[Pick strategy]
  C2["read-through<br/>cache fetches on miss"] --> P
  C3["write-through<br/>write DB and cache together"] --> P
  C4["write-behind<br/>write cache, flush later"] --> P
  C5["refresh ahead<br/>rebuild before expiry"] --> P
  P --> R[Payoff: query the fast copy, not the slow source]
```

</div>

Rule of thumb: start with cache-aside. It pairs naturally with the invalidation in the next section, and you can evolve to read-through or write-behind only when a specific hot path proves it needs it.

The four write strategies differ in what a write costs and what you accept in exchange:

| Strategy | Write path | Read path | Accepts | Best for |
|---|---|---|---|---|
| Cache-aside | DB only, invalidate key | fill on miss | stale window | most services, the default |
| Read-through | DB only | cache fills itself | stale window | read-heavy, cleaner app code |
| Write-through | DB + cache together | always fresh | slower writes | read-your-writes, sessions |
| Write-behind | cache only, flush async | always fresh | data loss on crash | write-heavy, counters, analytics |

## 7. Invalidation: the hard part

TTL is the simplest invalidation: accept staleness up to a bound, let expiry take care of the rest. It works, but it gives up precision. When a price changes at 14:00 and the TTL says 60s, you knowingly serve the old price for up to a minute.

Where correctness matters, you invalidate explicitly:

*   **Delete on write.** The write path removes the cache key so the next read repopulates from the new source value. This is the natural pair for cache-aside.
*   **Versioned keys.** Put a version in the key name. A new version means a new key, old readers keep the old copy until they move, and nothing is ever modified in place.
*   **Generation bump.** One global counter or version number is part of every key. Bumping it invalidates everything at once. Expensive, but useful when a bulk change touches a large fraction of the cache, and it beats deleting thousands of keys one by one.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  TTL["TTL<br/>accept staleness to a bound"] --> C{How fresh must reads be?}
  E["Delete on write<br/>remove key when source changes"] --> C
  V["Versioned keys<br/>new value, new key"] --> C
  G["Generation bump<br/>invalidate everything"] --> C
  C -->|"freshness required"| W["Weak consistency<br/>bounded staleness tools"]
  C -->|"staleness fine"| S["Serve copy, keep moving"]
```

</div>

The invalidation rule that prevents most surprises: never invalidate on a read, only on the write that changes the data. And never pretend the cache is consistent when it is not. The bounded-inconsistency view of all this lives in [Stale is Eventual](./stale-is-eventual.md) and [Strong vs Eventual Cache](./strong-vs-eventual-cache.md).

## 8. Redis vs Memcached

Both are in-memory key-value stores, and for a plain session or lookup-table cache they behave the same. The differences decide the choice:

**Redis.** Persists data (RDB snapshots, AOF append log), so a restart does not lose everything. Has rich data types: lists, sets, sorted sets, hashes, streams, which let you build queues, leaderboards, and counters inside the cache. Supports replication and clustering, so it can hold much more memory than one server. Ops run on a single thread per instance, which gives simple semantics and atomic Lua scripts. Redis is the default for almost anything beyond pure caching, and many systems use it as a general fast data store.

**Memcached.** Keeps values in memory only, no persistence, no data types beyond bytes and strings. Uses multiple threads and an efficient memory allocator, so on one large box it can serve more concurrent throughput than a single-threaded Redis instance. Because there is no persistence and no replication to coordinate, it is simple and rock solid for transient caches where losing a copy on restart is fine.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  Q{"Need persistence, rich<br/>data types, or replication?"} -->|"yes"| R["Redis<br/>general fast data store"]
  Q -->|"no, plain transient bytes<br/>max cores on one box"| M["Memcached<br/>simple, fast, volatile"]
  style R fill:#e8f5e9
```

</div>

The practical rule: start with Redis. It covers sessions, rate limits, pub/sub, and its data types replace a lot of application code. Reach for Memcached when you have a huge single-node cache, mostly large blobs, and the simplicity and threading model of Memcached beat what Redis gives you.

## 9. Failure modes: hot keys, penetration, and the stampede

Three problems show up under load, and interviews ask you to name the failure and its fix for each starts with the demand on the cache.

**Cache penetration.** Reads for keys that never exist fall through the cache every time and hammer the source, because there is nothing to cache. The fix is negative caching: cache the absence with a short, separate TTL so repeated misses stop reaching the database.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  P1["GET missing id"] --> P2{"Negative cache?"}
  P2 -->|"no"| P3["First miss hits the database"]
  P3 --> P4["Cache 'absent' for 30s"]
  P2 -->|"yes"| P5["Return miss fast, DB untouched"]
  style P5 fill:#e8f5e9
  style P3 fill:#ffebee
```

</div>

**Hot keys and hot partitions.**

A cache is only as safe as its load distribution. With many keys the load spreads evenly, but traffic is rarely even. A single hot key, one event, one celebrity product, one feed, can absorb 90% of the operations.

Sharding does not save you here. Consistent hashing spreads keys across nodes, so the hot key lands on exactly one shard, and that shard melts while the others idle. The symptom to watch is one shard at 100% CPU or memory while its siblings are quiet.

The fixes are the same family as the stampede fixes and usually combine them:

*   **Read replicas** of the hot key or of the cache itself, so one copy does not serve everyone.
*   **Local in-process cache** in front of the shared one, so most reads never reach the hot shard.
*   **Shard by a key component.** Instead of one key `feed:jobs`, use `feed:jobs:0` to `feed:jobs:9` and read all ten, spreading the traffic across shards.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  H["Hot key: 90% of ops<br/>shard 0 flooded"] --> P["Shard 0 saturated<br/>others idle"]
  P --> F1["Read replicas"]
  P --> F2["Local cache in front"]
  P --> F3["Split key into shards<br/>feed:jobs:0..9"]
  F1 --> OK[Load spreads]
  F2 --> OK
  F3 --> OK
  style OK fill:#e8f5e9
```

</div>

**Cache stampede.** The hot key's expiry and a stampede are the same event: the coordinated miss in [Cache Stampede](./cache-stampede.md) is exactly what happens to a hot key the instant it expires. Handle hot keys and you handle most of the nasty cache production incidents at once.

## 10. Measuring the cache: hit and miss rates

Hit and miss are counted where reads happen. Every read ends in one of two branches: served from the cache is a hit, falling through to the source is a miss. You keep two counters per cache and increment the right one right before returning. Then:

*   **hit rate** = hits / (hits + misses)
*   **miss rate** = 1 - hit rate

In a monolith this is easy: an in-process atomic counter per cache or route, exposed on a metrics endpoint. One process, one counter, no aggregation.

In a distributed setup every instance counts the same events, so you aggregate by summing the counts: aggregate hit rate = sum(hits) / sum(hits + misses). Do not average the per-instance rates. Averaging weights a quiet replica and a hot replica equally, and the result is a lie about the cache.

Redis also offers its own view: `INFO` reports `keyspace_hits` and `keyspace_misses`, so the cache-side rate is keyspace_hits / (keyspace_hits + keyspace_misses). That is the Redis perspective only. It does not see reads answered by a local in-process cache in front of it, and it treats multi-key calls as one op, so use it as a secondary check, not the primary metric.

Miss rate is the metric to watch, not hit rate. A hit rate that stays high while the miss rate climbs at fixed traffic points at TTL or key-shape trouble. For stampede detection, watch cache miss rate and database connections together, the pattern in [development-stories](../software-engineering/development-stories.md).

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  READ["Read key"] --> HIT{"In cache?"}
  HIT -->|"yes"| C1["hits++<br/>serve copy"]
  HIT -->|"no"| C2["misses++<br/>query source"]
  C1 --> M["hit rate = hits / (hits + misses)"]
  C2 --> M
  M --> AGG["monolith: one counter<br/>distributed: sum counts across instances"]
  style AGG fill:#fff3e0
```

</div>

### Is a monolith distributed?

Strictly, yes. A monolith talking to a separate database and external dependencies is a distributed system, because independent components in separate processes coordinate by passing messages over a network, even when the database shares the machine. The label matters less than which kind of cache you use:

*   **In-process cache** lives inside the application process. Zero network round trip, but per instance, so each replica holds its own copy and a write must invalidate everywhere or acceptable divergence.
*   **Distributed cache** is a separate networked process every instance reads. This is the load-bearing one, the one from the layer 5 discussion.

The measurement rules above work for both. The only difference is whether the counters live in one process or must be summed across the fleet.

## 11. What interviews test under caching

Caching questions appear in every system design round, and they cluster into a small set. Map each cluster to its section in this article so a question maps straight to an answer:

| What they test | Sample question | Covered in |
|---|---|---|
| Fundamentals | what is a cache, hit vs miss | section 1-2 |
| Latency ratio | how much slower is a DB read than Redis | section 3 |
| Placement | where would you put a cache | section 4 |
| Eviction | LRU vs LFU, implement an LRU cache | section 5 |
| Write strategies | which pattern fits this workload | section 6 |
| Invalidation | how do cache and DB stay consistent | section 7 |
| Tool choice | Redis vs Memcached | section 8 |
| Failure modes | stampede, penetration, hot key | section 9 |

The framing interviewers reward, from the question banks reviewed: name the source of truth, define the cache key and its scope (per process, shared, per user), describe the workload (read/write ratio, skew, staleness tolerance), choose the load and write path, separate expiration from eviction, protect the miss path on hot keys, and decide what happens when the cache is down. Start answers at the request path, speak in trade-offs, and pick cache-aside as the default unless the workload proves it needs stricter consistency.

## 12. The rules you can keep

*   Cache reads, design writes. Every strategy question is really a question about the write path.
*   Add layers from the outside in. Browser and CDN first, proxy and process cache next, shared cache last.
*   Start with cache-aside plus TTL, and add explicit invalidation only where freshness is a correctness requirement.
*   Measure the miss rate, not the hit count. A growing miss rate at fixed traffic is a TTL problem hiding.
*   Treat a shared cache as load-bearing infrastructure once services depend on it: capacity plan it, monitor it, and test the degraded path when it is down.
*   Never let the miss path scale with the herd. On a hot key, expiry and a stampede are the same event.

### Sources

*   AWS Builders' Library - [Caching Challenges and Strategies](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/) - the canonical practical treatment of caching layers, strategies, and their failure modes
*   Redis documentation - [Redis vs Memcached](https://redis.io/docs/latest/operate/oss_and_stack/management/memcached/) and [Key eviction](https://redis.io/docs/latest/reference/eviction/) - persistence, data types, and eviction policy differences
*   Memcached - [FAQ](https://github.com/memcached/memcached/wiki/FAQ) - threading model and no-persistence design
*   Martín Kleppmann - [Designing Data-Intensive Applications](https://dataintensive.net/) ch 6 - how caching sits in front of databases and the stale data semantics of replication and caching
*   HTTP caching - [MDN HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) and RFC 9111 - `Cache-Control`, `ETag`, `stale-while-revalidate` for browser and proxy layers
*   Jeff Dean and Peter Norvig - [Latency Numbers Every Programmer Should Know](http://norvig.com/21-days.html) - memory, disk, and network latencies that back the 10-100x gap
*   Redis - [Diagnosing latency issues](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/) - intrinsic latency floor (~100-200 µs), TCP ~200 µs vs unix socket ~30 µs
*   Devinterview.io - [50 Caching Interview Questions](https://devinterview.io/questions/software-architecture-and-system-design/caching-interview-questions/), TechPrep - [68 Caching Interview Questions](https://www.techprep.app/blog/caching-interview-questions), and DesignGurus - [Caching for System Design Interviews](http://designgurus.io/system-design-interview/concepts/caching) - the question clusters mapped in section 10
*   PracHub - [Caching Interview Questions: Eviction, Stampedes, and Consistency](https://prachub.com/resources/caching-interview-questions-for-backend-engineers-eviction-stampedes-and-consistency) - expiration vs eviction as separate controls, negative caching, and the answer framing

### See also

*   ./cache-stampede.md - the coordinated miss, and 4 fixes trading wait vs stale
*   ./stale-is-eventual.md - why serving stale is bounded eventual consistency
*   ./strong-vs-eventual-cache.md - lock for strong, stale for eventual, the PACELC trade
*   ../software-engineering/request-coalescing.md - single flight: turning a stampede into one call
*   ../software-engineering/development-stories.md - a cache on the critical path is load-bearing infrastructure