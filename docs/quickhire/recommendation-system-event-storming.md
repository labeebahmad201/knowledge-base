# Modeling a Recommendation System with Event Storming (QuickHire)

## The problem: "the recommendation feed is just a GET call"

You are modeling QuickHire, a marketplace where clients post jobs and freelancers bid on them. You stormed the core flow and the sticky notes flowed easily: `Job Posted`, `Bid Submitted`, `Bid Accepted`, `Job Completed`. Then you hit a wall.

The wall is the recommendation system. A freelancer opens the app and the home screen shows a feed of suggested jobs: "jobs matched to your skills, ordered by how relevant they are." You reach for an orange sticky and try to write the event for it. The natural attempt is `Recommendations Retrieved`.

And then nothing works.

```mermaid
graph TD
    USER["Freelancer opens the app<br/>(actor)"] --> ASK["\"Where are my recommendations?\""]
    ASK --> TRY["Try to model it as an event:<br/>'Recommendations Retrieved'"]
    TRY --> PAIN1["But nothing changed on the wall<br/>a GET call creates no state change"]
    TRY --> PAIN2["No aggregate was modified<br/>no business rule fired"]
    TRY --> PAIN3["Where does a GET go on the<br/>timeline? It is not caused by<br/>another event"]
    style USER fill:#ffe680,stroke:#333
    style ASK fill:#ffe680,stroke:#333
    style TRY fill:#ffc9c9,stroke:#fa5252
    style PAIN1 fill:#ffc9c9,stroke:#fa5252
    style PAIN2 fill:#ffc9c9,stroke:#fa5252
    style PAIN3 fill:#ffc9c9,stroke:#fa5252
```

You feel stuck because you are looking at the wrong end of the system. Event Storming models state changes, and a recommendation feed is not a state change. It is a projection of everything that *did* change, precomputed and ready to be read. You cannot storm a projection with events. You can only storm the events that feed it.

The fix is a mental model with two sides.

## The mental model: events in, query out

A recommendation system has exactly two halves.

The **write side** collects events that are evidence about the people and jobs in the marketplace. These are orange sticky notes, and they already exist in your other contexts: `Job Posted`, `Bid Submitted`, `Job Completed`, `Review Submitted`, `Profile Updated`, `Job Saved`.

The **read side** is a precomputed store that the write side keeps updated. When the freelancer hits `GET /recommendations`, the system does not recompute anything from scratch at that moment. It reads the store. The GET is a query against a projection, which is exactly what Event Storming calls a **read model**, the green sticky note.

```mermaid
graph TD
    WRITE["Write side (events, orange)<br/><br/>Bid Submitted<br/>Job Completed<br/>Review Submitted"] --> FEED["Recommendation store<br/>(projection / scoring)"]
    FEED --> READ["Read side<br/><br/>GET /recommendations<br/>(read model, green)"]
    style WRITE fill:#ffa07a,stroke:#333
    style FEED fill:#d0bfff,stroke:#333
    style READ fill:#b2f2bb,stroke:#333
```

Everything that felt missing, the events that "should" surround the GET, does not exist because a read does not produce events. The events are on the other side, feeding the store. Once you see the two halves, the model falls into place.

## Step 1: dump the evidence events

The recommender needs raw material. Model a standard freelancer journey on QuickHire and write down every event that tells the system something about jobs, skills, and matches. Do not filter yet, just dump.

```
[Job Posted]
[Bid Submitted]
[Bid Rejected]
[Bid Accepted]
[Job Completed]
[Review Submitted]
[Profile Updated]
[Skill Added]
[Job Saved]
[Job Viewed]
[Profile Viewed]
[Job Archived]
```

```mermaid
graph TD
    subgraph EVIDENCE["Evidence events (orange stickies)"]
        A["Job Posted"]
        B["Bid Submitted"]
        C["Bid Rejected"]
        D["Bid Accepted"]
        E["Job Completed"]
        F["Review Submitted"]
        G["Profile Updated"]
        H["Skill Added"]
        I["Job Saved"]
        J["Profile Viewed"]
    end
    style EVIDENCE fill:#ff9,stroke:#333
    style A fill:#ffa07a,stroke:#333
    style B fill:#ffa07a,stroke:#333
    style C fill:#ffa07a,stroke:#333
    style D fill:#ffa07a,stroke:#333
    style E fill:#ffa07a,stroke:#333
    style F fill:#ffa07a,stroke:#333
    style G fill:#ffa07a,stroke:#333
    style H fill:#ffa07a,stroke:#333
    style I fill:#ffa07a,stroke:#333
    style J fill:#ffa07a,stroke:#333
```

These are all real domain events that already exist in your other bounded contexts. That is the first discovery: the recommendation system introduces almost **no new events**. It consumes events that the marketplace was going to emit anyway.

## Step 2: classify which events feed the recommender

Not all evidence is equal. Some events are strong signals about relevance, others are noise. Classify each event by what it tells the recommender:

| Event | What it tells the recommender | Feed rank |
|---|---|---|
| Bid Submitted | Freelancer's skills matched a job. Strong relevance signal | High |
| Bid Accepted | The match was validated by the client. Strongest signal | Highest |
| Job Completed | The match produced real work. Validates skill quality | High |
| Review Submitted | Quality signal for future recommendations | High |
| Job Saved | Freelancer expressed interest without bidding. Good implicit signal | Medium |
| Job Viewed | Weak interest. Click-through signal | Medium |
| Profile Viewed | Client looked at the freelancer. Reverse-direction signal | Medium |
| Skill Added | Changes which jobs this freelancer matches | Refreshes match |
| Profile Updated | Changes the match vector | Refreshes match |
| Job Archived | Job is gone. Should stop being recommended | Removes from feed |

The classification matters because it decides which events the recommendation policy subscribes to and how much weight each one gets. The feed logic is a policy, not a human sitting and scoring jobs by hand.

```mermaid
graph TD
    subgraph STRONG["Strong signals (high weight)"]
        BID["Bid Accepted"]
        DONE["Job Completed"]
        REV["Review Submitted"]
    end
    subgraph MEDIUM["Implicit signals (medium weight)"]
        SAV["Job Saved"]
        VIEWED["Job Viewed"]
        PV["Profile Viewed"]
    end
    subgraph STATE["Match refresh / removal"]
        SKILL["Skill Added"]
        PROF["Profile Updated"]
        ARCH["Job Archived"]
    end
    STRONG --> SCORE["Scoring projection"]
    MEDIUM --> SCORE
    STATE --> SCORE
    style STRONG fill:#ffe680,stroke:#333
    style MEDIUM fill:#ffe680,stroke:#333
    style STATE fill:#ffe680,stroke:#333
    style BID fill:#ffa07a,stroke:#333
    style DONE fill:#ffa07a,stroke:#333
    style REV fill:#ffa07a,stroke:#333
    style SAV fill:#ffa07a,stroke:#333
    style VIEWED fill:#ffa07a,stroke:#333
    style PV fill:#ffa07a,stroke:#333
    style SKILL fill:#ffa07a,stroke:#333
    style PROF fill:#ffa07a,stroke:#333
    style ARCH fill:#ffa07a,stroke:#333
    style SCORE fill:#d0bfff,stroke:#333
```

## Step 3: model the actors and commands for the evidence

Each evidence event already has a command and an actor in its source context. Reuse them, do not invent new ones:

| Event | Command (blue) | Actor (yellow) |
|---|---|---|
| Job Posted | Post Job | Client |
| Bid Submitted | Submit Bid | Freelancer |
| Bid Accepted | Accept Bid | Client |
| Job Completed | Mark Job Completed | Freelancer |
| Review Submitted | Write Review | Client |
| Skill Added | Add Skill | Freelancer |
| Job Saved | Save Job | Freelancer |
| Job Viewed | View Job | Freelancer |

```mermaid
graph TD
    CLIENT["Client<br/>(actor)"] --> POSTCMD["Post Job<br/>(command)"]
    POSTCMD --> POSTEV["Job Posted<br/>(event)"]
    FREELANCER["Freelancer<br/>(actor)"] --> BIDCMD["Submit Bid<br/>(command)"]
    BIDCMD --> BIDEV["Bid Submitted<br/>(event)"]
    CLIENT --> ACCCMD["Accept Bid<br/>(command)"]
    ACCCMD --> ACCEV["Bid Accepted<br/>(event)"]
    CLIENT --> REVCMD["Write Review<br/>(command)"]
    REVCMD --> REVEV["Review Submitted<br/>(event)"]
    style CLIENT fill:#ffe680,stroke:#333
    style FREELANCER fill:#ffe680,stroke:#333
    style POSTCMD fill:#80b3ff,stroke:#333
    style BIDCMD fill:#80b3ff,stroke:#333
    style ACCCMD fill:#80b3ff,stroke:#333
    style REVCMD fill:#80b3ff,stroke:#333
    style POSTEV fill:#ffa07a,stroke:#333
    style BIDEV fill:#ffa07a,stroke:#333
    style ACCEV fill:#ffa07a,stroke:#333
    style REVEV fill:#ffa07a,stroke:#333
```

Notice that none of these actors belong to the recommendation system. The recommendation system has no human users of its own. It is a polite background worker that watches what everyone else does.

## Step 4: where the GET call actually goes

Now the part that stumped you. `GET /recommendations` appears on the board as a **green read model**, not an orange event. It sits at the end of the chain, between the freelancer and the next command they will issue.

```mermaid
graph TD
    FREELANCER["Freelancer<br/>(actor)"] --> QUERY["GET /recommendations<br/>(query)"]
    QUERY --> PROJECTION["Recommendation projection<br/>(read)"]
    PROJECTION --> FEED["Recommended Jobs Feed<br/>(read model, green)<br/><br/>{ jobId, title, budget,<br/>matchScore, reason,<br/>clientRating, postedAt }"]
    style FREELANCER fill:#ffe680,stroke:#333
    style QUERY fill:#80b3ff,stroke:#333
    style PROJECTION fill:#d0bfff,stroke:#333
    style FEED fill:#b2f2bb,stroke:#333
```

The feed is what the freelancer *sees* before they *act*. And per the read model rule: read models do not emit events, they enable commands. Looking at the feed, the freelancer can `View Job`, `Save Job`, or `Submit Bid`. Those commands produce more orange events, which flow back into the projection and improve tomorrow's feed.

```mermaid
graph TD
    FEED["Recommended Jobs Feed<br/>(read model, green)"] --> FREELANCER["Freelancer<br/>(actor)"]
    FREELANCER --> SAVE["Save Job<br/>(command)"]
    FREELANCER --> VIEW["View Job<br/>(command)"]
    FREELANCER --> BID["Submit Bid<br/>(command)"]
    SAVE --> SAVEEV["Job Saved<br/>(event)"]
    VIEW --> VIEWEV["Job Viewed<br/>(event)"]
    BID --> BIDDEV["Bid Submitted<br/>(event)"]
    SAVEEV --> POL["Ingest & Score<br/>(policy)"]
    VIEWEV --> POL
    BIDDEV --> POL
    POL --> PROJ["Recommendation projection"]
    PROJ --> FEED
    style FEED fill:#b2f2bb,stroke:#333
    style FREELANCER fill:#ffe680,stroke:#333
    style SAVE fill:#80b3ff,stroke:#333
    style VIEW fill:#80b3ff,stroke:#333
    style BID fill:#80b3ff,stroke:#333
    style SAVEEV fill:#ffa07a,stroke:#333
    style VIEWEV fill:#ffa07a,stroke:#333
    style BIDDEV fill:#ffa07a,stroke:#333
    style POL fill:#d0bfff,stroke:#333
    style PROJ fill:#d0bfff,stroke:#333
```

The loop is now closed on the board: events in, projection recomputed, GET reads it, user acts, more events in.

## The terminal read model: when the flow just ends

The recommendation feed feeds the loop, but not every read model has to. Some read models are *terminal*: they exist to be looked at, and nothing happens after them. The canonical example is an analytics dashboard.

Storm it like any other read model: green sticky at the end of the chain. The difference is that the arrow downstream of the green note does not exist — no command, no event, no policy. The flow terminates at the read model, and that is a valid, complete model.

```mermaid
graph TD
    OC["Order Completed<br/>(event)"]
    PV["Payment Received<br/>(event)"]
    RP["Review Posted<br/>(event)"]
    PROJ["Analytics projection<br/>(ingest & aggregate)"]
    DASH["Analytics Dashboard<br/>(read model, green)<br/><br/>{ weekly MRR, active freelancers,<br/>completed jobs, avg. time-to-hire }"]
    OC --> PROJ
    PV --> PROJ
    RP --> PROJ
    PROJ --> DASH
    style OC fill:#ffa07a,stroke:#333
    style PV fill:#ffa07a,stroke:#333
    style RP fill:#ffa07a,stroke:#333
    style PROJ fill:#d0bfff,stroke:#333
    style DASH fill:#b2f2bb,stroke:#333
```

The dashboard still needs a way to stay fresh — a poll, a scheduled job, a push feed — but that refresh is a **yellow policy** (`Refresh every 5 min`), not a domain event, and it only re-delivers the same projection. It does not turn the dashboard into part of the write side.

```mermaid
graph TD
    PROJ["Analytics projection"] --> DASH["Analytics Dashboard<br/>(read model, green)"]
    REFRESH["Refresh every 5 min<br/>(policy, yellow)"] -. re-queries the same data .-> DASH
    style PROJ fill:#d0bfff,stroke:#333
    style DASH fill:#b2f2bb,stroke:#333
    style REFRESH fill:#ffe680,stroke:#333
```

Contrast this with the recommendation feed: the feed's story only works *because* the freelancer acts on it. A dashboard genuinely ends the story. Model it as a green note with events feeding in and nothing coming out — and resist the urge to invent an event after it. "Analytics View" only earns event status if the viewing itself drives behavior, exactly like `Recommendation Viewed` below.

## The rare exception: when "Recommendations Viewed" IS an event

There is one case where the recommendation feed produces its own domain event. The recognition of the feed itself can be treated as a signal.

On a marketplace where discovery is the product, the moment a freelancer sees a recommendation is valuable: it is an impression. If the business cares to rank *how often a recommendation earns a view* versus a competing recommendation, you model `Recommendation Viewed` as an event that feeds a ranking policy. This is the special case where a "page visit" becomes a domain event, because the viewing itself drives real behavior.

```mermaid
graph TD
    PROJ["Recommendation projection"] --> FEEDEV["Recommendation Viewed<br/>(event, orange)"]
    FEEDEV --> RANK["Impression-ranking policy<br/>(lilac)"]
    RANK --> PROJ2["Ranking feedback<br/>(projection)"]
    style PROJ fill:#d0bfff,stroke:#333
    style FEEDEV fill:#ffa07a,stroke:#333
    style RANK fill:#d0bfff,stroke:#333
    style PROJ2 fill:#d0bfff,stroke:#333
```

Use this only when the feed is the core value proposition and you need impression data to tune ranking. For most marketplaces, the implicit events (`Job Saved`, `Job Viewed`) are enough and you can skip this.

## Step 5: name the bounded context

The recommendation system is its own bounded context. It has its own language ("relevance", "match score", "impression"), its own store, and its own rules. It communicates with the marketplace exclusively through subscribed events on one side and a read API on the other.

```mermaid
graph TD
    subgraph MARKETPLACE["Jobs / Marketplace Context"]
        A["Job Posted"]
        B["Bid Submitted"]
        C["Job Completed"]
        D["Review Submitted"]
    end
    subgraph PROFILE["Profile Context"]
        E["Skill Added"]
        F["Profile Updated"]
    end
    subgraph REC["Recommendation Context"]
        INGEST["Ingest & Score policy<br/>(lilac)"]
        STORE["Scoring projection<br/>(aggregate / store)"]
        API["GET /recommendations"]
    end
    A --> INGEST
    B --> INGEST
    C --> INGEST
    D --> INGEST
    E --> INGEST
    F --> INGEST
    INGEST --> STORE
    STORE --> API
    style MARKETPLACE fill:#e8e8e8,stroke:#999
    style PROFILE fill:#e8e8e8,stroke:#999
    style REC fill:#d0bfff,stroke:#333,stroke-width:2
    style A fill:#ffa07a,stroke:#333
    style B fill:#ffa07a,stroke:#333
    style C fill:#ffa07a,stroke:#333
    style D fill:#ffa07a,stroke:#333
    style E fill:#ffa07a,stroke:#333
    style F fill:#ffa07a,stroke:#333
    style INGEST fill:#d0bfff,stroke:#333
    style STORE fill:#d0bfff,stroke:#333
    style API fill:#b2f2bb,stroke:#333
```

The recommendation context never queries the marketplace databases directly. The policy consumes the event payloads it needs, so the projection is self-sufficient. The GET endpoint reads only the projection.

## Common mistakes

**Modeling `Recommendations Retrieved` as an orange event.** It looks like an event but it changes nothing. It is the green read model. If you put it on the orange timeline, realize the past tense is wrong and the timeline gains a "ghost" that no command produces and no policy consumes.

```mermaid
graph TD
    WRONG["Recommendations Retrieved<br/>(orange? no - RED)<br/><br/>No command caused it,<br/>no aggregate changed,<br/>it is a query"] --> FIX["Should be:<br/>green read model fed by events"]
    style WRONG fill:#ffc9c9,stroke:#fa5252
    style FIX fill:#b2f2bb,stroke:#333
```

**Adding actors to the recommendation context.** The recommender has no human actors of its own. The actors (Client, Freelancer) live in their source contexts. If you find yourself drawing a "Recommender" user, you have drifts from the model.

**Letting the GET recompute from scratch.** If the GET call reads source aggregates across contexts, it is a boundary violation. The recompute is a policy job that runs as events arrive. The GET only reads the result.

**Skipping the feedback loop.** A recommendation system that does not observe its own outcomes gets stale. End the page at the read model *and* draw the user acting on it, because user action events are the next batch of fuel.

## What you get at the end

- A write side made of evidence events that already exist in your other contexts. No new events needed, just classification.
- A recommendation context with one policy (ingest and score), one projection store, and one read API.
- A green read model for `GET /recommendations` at the boundary between the actor and their next command.
- A closed feedback loop from feed to user action back to feed.

The GET call that stumped you was never supposed to be an event. It is the green sticky that the orange sticky notes have been feeding all along.