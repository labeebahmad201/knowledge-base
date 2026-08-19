# Debugging a Down System: Where to Start

## The problem: a production system is down and everyone is guessing

When a production system goes down, the pattern repeats: multiple engineers scatter, each SSH-ing into a random box, reading logs without a hypothesis, and making the same checks three times. Panic drives people to the most instinctive action (dive into code and find the root cause immediately), which is the wrong instinct. The system keeps degrading while everyone tries to work independently.

The failure is rarely technical skill. It is the absence of a fixed process. A search problem under stress needs a method: a sequence of decisions that works at 3 AM when you are tired, stressed, and looking at a system someone else built. This article is that method, in the order you should execute it.

```mermaid
graph TD
    A["Alert fires or user reports"] --> B["Triage: how bad and how wide?"]
    B --> C["Mitigate: stop the bleeding first"]
    C --> D["Write the timeline as you go"]
    D --> E["Observe: USE and RED checklists"]
    E --> F["Check what changed"]
    F --> G["Bisect by layer"]
    G --> H{"Roll back or fix forward?"}
    H --> I["Verify and monitor before standing down"]
    I --> J["Blameless postmortem"]
    style C fill:#6f6,stroke:#333
    style E fill:#6bf,stroke:#333
    style G fill:#6bf,stroke:#333
```

## The first rule: stabilize before you understand

The single most common mistake in production incident debugging is treating diagnosis as the first job. It is not. Your first job is to reduce customer impact; root-cause analysis is the second job and can usually wait.

Google's SRE book says it bluntly: "Your first response in a major outage may be to start troubleshooting and try to find a root cause as quickly as possible. Ignore that instinct!" Instead: "make the system work as well as it can under the circumstances. This may entail emergency options, such as diverting traffic from a broken cluster to others that are still working, dropping traffic wholesale to prevent a cascading failure, or disabling subsystems to lighten the load. Stopping the bleeding should be your first priority."

Split every incident into two explicit tracks that run in parallel:

```mermaid
flowchart TD
    subgraph Track1["Track 1: Mitigate (first priority)"]
        A1["Roll back last deploy"]
        A2["Shift traffic away from bad zone"]
        A3["Scale out"]
        A4["Enable degraded mode"]
        A5["Shed non-critical load"]
    end
    subgraph Track2["Track 2: Diagnose (parallel, lower urgency)"]
        B1["Form hypotheses"]
        B2["Validate with metrics, logs, traces"]
        B3["Identify root cause"]
    end
    C["Incident detected"] --> Track1
    C --> Track2
```

Mitigation actions are coarse, reversible, and require no understanding of the root cause. Diagnosis is slower and continues after the customer impact is gone. If you have more than one responder, assign the tracks to different people. If you are alone, do the mitigation pass first and time-box it: spend the first ten minutes asking "what can I do right now to make this stop hurting," not "why is this happening."

The payoff is measured: teams that adopt a mitigate-first posture cut incident duration significantly, often by 30 to 50 percent on change-induced incidents, because rollback is faster than diagnosis. If your mean time to recovery is dominated by diagnosis time, that is a process smell, not a tooling problem.

## Write the timeline as you go

The second first-principle habit is cheap and gets skipped under stress: open a scratch doc and log timestamps for everything. When the alert fired, when symptoms actually started (these are rarely the same moment), what you checked, what you changed, what happened after each change.

```mermaid
graph TD
    A["Timeline log entries"] --> B["Alert fired"]
    A --> C["Symptoms started (not the same time)"]
    A --> D["What I checked"]
    A --> E["What I changed"]
    A --> F["What happened after"]
    B --> G{"Postmortem raw material"}
    C --> G
    D --> H{"Stops re-checking same dashboard 3x"}
    E --> H
    F --> H
```

Two reasons this matters. First, it mechanically stops you from re-checking the same dashboard three times at 3 AM, because your notes show you already looked and what you saw. Second, the timeline is the raw material for the postmortem, and a timeline reconstructed from memory two days later is fiction. One line per event is enough: "10:23 alerted, 10:26 error rate 90%, 10:31 rolled back v1.4.2, 10:37 error rate dropping," and so on.

## Triage: assess blast radius, not just "it's down"

Before diagnostic work, answer a small set of questions that determine severity and escalation. The size and shape of the problem determines the size and shape of the response. "It's down" is not a severity; it is a prompt to measure.

The core questions, drawn from Google's debugging incident study, are:

- What is the error rate? Is it 3 percent or 100 percent? The two need completely different responses.
- Which service, endpoint, or region is affected?
- When did it start?
- Did anything deploy or change around that time?
- Is it getting better or worse on its own?

```mermaid
flowchart TD
    A["Is the service down?"] --> B{"How many users affected?"}
    B -->|"Few / single region"| C["Handle in team, lower urgency"]
    B -->|"Many / global"| D["Declare incident, escalate now"]
    D --> E["Set up war room / comms channel"]
    E --> F["Assign Incident Commander + Ops Lead"]
    D --> G["Check dependencies for cascading failure"]
    style D fill:#f66,stroke:#333
    style B fill:#6bf,stroke:#333
```

The severity assessment drives whether you page people, spin up a war room, and alert leadership. Google SRE Workbook: "declaring an incident early is cheap; declaring it late is expensive." There is a real cost to under-declaring: stakeholders assume nothing is being done because they were never told otherwise.

## Observe before you hypothesize: the USE and RED checklists

Once mitigation is underway, resist the urge to SSH into a random box and start reading logs. Logs confirm hypotheses; they are bad at generating them. Generate hypotheses from metrics, using two complementary checklists that cover two different failure classes.

### The USE method: per resource

Brendan Gregg's USE method: for every resource (CPU, memory, disk, network, connection pools, thread pools), check Utilization, Saturation, and Errors. It catches the class of incident where nothing changed in your code but the system ran out of something: capacity exhaustion, noisy neighbors, a leak that finally crossed a threshold.

```mermaid
graph TD
    subgraph Resource["For every resource"]
        A["Utilization: how busy is it?"]
        B["Saturation: how much is queued / waiting?"]
        C["Errors: is it failing?"]
    end
    D["CPU"] --> Resource
    E["Memory"] --> Resource
    F["Disk I/O"] --> Resource
    G["Network"] --> Resource
    H["Connection pools"] --> Resource
    I["Thread pools"] --> Resource
    Resource --> J["Catches: capacity exhaustion, leaks, noisy neighbors"]
```

### The RED method: per service

The RED method is the service-level complement: for every service, check Rate (requests per second), Errors (failed requests per second), and Duration (latency distribution, not averages). It catches the class of incident the USE method misses: a downstream dependency returning errors fast, a slow code path that burns no resource, a traffic spike from a single client.

```mermaid
graph TD
    subgraph Service["For every service"]
        A["Rate: requests per second"]
        B["Errors: failed requests per second"]
        C["Duration: latency distribution (p50/p95/p99)"]
    end
    D["API service"] --> Service
    E["Worker / batch"] --> Service
    F["DB / cache"] --> Service
    Service --> G["Catches: dependency errors, slow paths, traffic spikes"]
```

Use the two methods together as a decision fork:

```mermaid
flowchart TD
    A["RED shows a sick service?"] -->|Yes| B{"USE shows healthy resources underneath?"}
    B -->|"Yes: code or dependency bug"| C["Look at code path + downstream deps"]
    B -->|"No: a resource is saturated"| D["Capacity or workload change problem"]
    A -->|"No"| E["Everything looks healthy?\nre-check what 'down' means"]
    C --> F["Get direction instead of guessing"]
    D --> F
```

If RED shows a sick service but USE shows healthy resources underneath it (plenty of CPU, memory, and no queueing), the problem is in the code or in a dependency. If USE shows a saturated resource, the problem is capacity or a workload change. Either way you now have a direction instead of a guess, which is more than most hops during an outage produce.

## Check what changed first

Before deep diagnosis, do one cheap thing: check what changed. The majority of production incidents follow a change. Industry postmortem datasets and vendor incident analyses consistently attribute somewhere between half and three-quarters of incidents to a recent change. "Change" means more than deploys: it includes configuration pushes, feature flag flips, data backfills, third-party provider updates, scaling decisions, and even DNS or certificate changes.

```mermaid
flowchart TD
    A["What changed recently?"] --> B["Deploys / releases"]
    A --> C["Config pushes / feature flags"]
    A --> D["Data backfills / migrations"]
    A --> E["Third-party dependencies"]
    A --> F["Scaling / capacity decisions"]
    A --> G["DNS / certificates"]
    B --> H["If a change lands near symptom onset"]
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I["Treat it as the prime suspect until proven otherwise"]
    I --> J["Reverting a correlated change is cheap to test"]
```

If a change lands within a few minutes of symptom onset, treat it as the prime suspect until proven otherwise. Correlation is not causation, but at 3 AM correlation is an excellent place to start, and reverting a correlated change is cheap to test. The heuristic only works if changes are visible: install deploy annotations so your CI/CD pipeline posts an event to your metrics system on every change, and you can overlay deploys against error rates in one dashboard instead of cross-referencing day-old memory.

## Bisect by layer

Distributed systems debugging is a search problem, and the fastest search is binary. A request in a typical stack crosses several layers: edge / DNS / TLS, load balancer, the service itself, its dependencies, the database, and the infrastructure underneath. Do not walk this list top to bottom. Pick a midpoint, test it, and cut the search space in half.

```mermaid
graph TD
    subgraph Stack["The request path"]
        A["Client / browser"]
        B["Edge: DNS, TLS, CDN"]
        C["Load balancer / gateway"]
        D["Service"]
        E["Dependencies: APIs, message brokers"]
        F["Database / cache"]
        G["Infrastructure: nodes, networking"]
    end
    A --> B --> C --> D --> E --> F --> G
```

The bisection rule: if the service layer looks healthy from its own metrics but clients see errors, the problem is above the service (edge, load balancer, DNS, TLS). If the service itself is reporting errors, the problem is at the service or below. Each test should eliminate roughly half of the remaining layers.

Test dependencies from inside the caller's network context, not from your laptop: your laptop's view of the database proves nothing about the pod's view. And check node conditions before blaming anything above them. A useful framing is to ask what the system is doing, then why it is doing that, then where its resources and output are going. A malfunctioning system is usually still trying to do something, just not the thing you want it doing.

## Decide: roll back or fix forward

You found a suspect change. Now comes the decision that actually determines incident duration: revert it, or fix it in place. Use a rubric, not a debate.

| Signal | Roll back | Fix forward |
|---|---|---|
| Change is recent and correlated with onset | Yes | No |
| Rollback path is tested and takes minutes | Yes | No |
| Change included a schema migration or data backfill | No | Usually yes |
| Other changes shipped on top of the suspect | Depends on isolation | Often yes |
| Cause is external (provider outage, upstream API) | Nothing to roll back | Mitigate around it |
| Fix is a one-line, well-understood patch with fast CI | Maybe | Possibly |
| It is 3 AM and you are not sure | Yes | No |

```mermaid
flowchart TD
    A{"Suspect change found"} --> B{"Rollback safe and tested?"}
    B -->|"Yes"| C["Roll back. One command, no understanding needed"]
    B -->|"No"| D{"Was there a schema migration?"}
    D -->|"Yes"| E["Fix forward: old code cannot read new data"]
    D -->|"No"| F{"Cause is external?"}
    F -->|"Yes"| G["Mitigate around it, nothing to revert"]
    F -->|"No"| H["Weigh entanglement with later changes"]
    H --> I["Cheaper revert wins at 3 AM"]
    style C fill:#6f6,stroke:#333
```

Default to rollback when the change is recent, suspect, and cheap to revert. Rollback is a mitigation you can execute in one command without understanding the bug. Fix forward when rollback is genuinely riskier than the bug: a migration already rewrote data in a shape the old code cannot read; the suspect change is entangled with later changes you would also have to revert; or the cause is external and there is nothing of yours to revert. Be honest about the cost of fixing forward: it means writing code under pressure, reviewing it under pressure, and shipping it through a pipeline, all while the incident continues.

Two failure modes to avoid. Ego-driven fix-forward: "I can patch this in five minutes" is how five-minute incidents become ninety-minute incidents. And rollback theater: rolling back a change the timestamps already exonerated, which is another reason the written timeline matters.

## Verify, then monitor before standing down

After applying the mitigation, confirm recovery before declaring victory. The hardest part of incident response is knowing when it is over. Some issues take 5 to 10 minutes to propagate through the system after a fix, and npm-style latency or cache invalidation means the metric you care about recovers last.

Watch the metrics that determined the incident for 10 to 15 minutes after mitigation, and watch for the inflection point where the incident started to resolve. Confirm each one returns to baseline:

```mermaid
graph TD
    A["After mitigation, watch for 10-15 min"] --> B["Error rate returns to baseline"]
    A --> C["Latency p95 / p99 drops"]
    A --> D["Queue depth drains"]
    A --> E["Affected users stop declining"]
    B --> F{"All back to baseline?"}
    C --> F
    D --> F
    E --> F
    F -->|"Yes"| G["Stand down, start postmortem"]
    F -->|"No"| H["Mitigation incomplete, go back to observe"]
    style G fill:#6f6,stroke:#333
```

Do not declare victory as soon as one dashboard looks healthy. A single green chart can mask ongoing degradation elsewhere. The verification window is cheap insurance against a full relapse and a second pager at 4 AM.

## Postmortem: make the incident worth something

Within 48 hours, write the postmortem. Its purpose is not to assign blame but to prevent recurrence. Ask "how did our system allow this," not "who caused this." The best teams treat postmortems as learning tools, and the best postmortems are blameless by construction: every response is bound to fail, and the system's job is to handle that gracefully.

A useful postmortem has a minimal structure:

- Summary: what happened, duration, customer impact
- Timeline: the chronological log you wrote during the incident (this is why you kept it)
- Root cause: specific and deep, not "a bug caused it"
- What went well: did the runbook help, did alerting fire promptly
- What went poorly: was the runbook outdated, did comms lag
- Action items: each with an owner and a due date, and each one either preventing recurrence or sharpening the response

The most durable output of an incident is not the fix. It is the timeline: a defensible, timestamped record of what was observed, what was tried, and what worked. That record is what turns an incident into a postmortem worth reading, and a postmortem worth reading is what stops the same incident from happening twice.

```mermaid
graph TD
    A["Incident record"] --> B["What went well"]
    A --> C["What went poorly"]
    B --> D["Action items with owner + due date"]
    C --> D
    D --> E["Fix runbooks and monitoring"]
    D --> F["Prevent recurrence"]
    D --> G["Sharpen response for next time"]
    style D fill:#6f6,stroke:#333
```

## Sources

- Google SRE Book: [Effective Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/)
- Google SRE Workbook: [Incident Response](https://sre.google/workbook/incident-response/)
- Charisma Chan: [Debugging Incidents in Google's Distributed Systems](https://cacm.acm.org/practice/debugging-incidents-in-googles-distributed-systems/) (Communications of the ACM, 2020)
- Stack Overflow Blog: [Don't panic! A playbook for managing any production incident](https://stackoverflow.blog/2023/05/03/dont-panic-a-playbook-for-managing-any-production-incident/)
- Brendan Gregg: [The USE Method](https://www.brendangregg.com/usemethod.html)
- Grafana Labs: [The RED Method](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)