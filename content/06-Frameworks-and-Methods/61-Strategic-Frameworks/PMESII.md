---
title: "PMESII: Political, Military, Economic, Social, Information, Infrastructure"
aliases:
  - PMESII
  - PMESII-PT
  - PMESII analysis
  - Political, Military, Economic, Social, Information, Infrastructure
type: framework
domain: ["strategy", "military", "intelligence", "policy"]
courses: ["L1-HS26"]
qard-deck: L1-HS26
status: seedling
confidence: medium
created: 2026-09-30
modified: 2026-10-02
review: 
tags:
  - framework
  - operational-environment
  - systems-analysis
  - intelligence
draft: false
---

> [!bluf]
> PMESII describes an actor or an operating environment as a **system of six interacting sub-systems**: **P**olitical, **M**ilitary, **E**conomic, **S**ocial, **I**nformation and **I**nfrastructure. It comes from US joint doctrine, where it structures the analysis of the operational environment before planning. Its value is less the checklist than the **links between** the six: where a change in one spreads to the others, and where a small effort produces a large effect. Its weakness is that it easily becomes six separate lists that nobody connects. Pair it with **DIME** (the instruments you can use) and **ASCOPE** (the civil considerations on the ground).

## Purpose

Military power alone rarely decides a conflict. PMESII forces the analyst to look at the **whole system** an operation acts on: who holds power, how the economy works, what holds society together, how information flows and what physical networks everything depends on.

In US joint doctrine it is used in the **joint intelligence preparation of the operational environment**, which treats an adversary or a region as a *system of systems* made of nodes (people, places, things) and links (the relations between them) [@jcs2014joint]. The planners then look for **centres of gravity** and decisive points, and use the result to develop [[Course of Action|courses of action]] [@jcs2020joint].

At the level of **overall (grand) strategy**, PMESII also describes the arena in which a state competes: military strategy is only one of the six fields, which is why military [[Doctrine (Swiss Armed Forces)|doctrine]] can never be the whole of a security strategy.

## Components / Steps

### The six sub-systems

| Sub-system | Key questions | Examples of what to look at |
|---|---|---|
| **Political** | Who holds authority, how is it gained and kept, what is legitimate? | government, parties, elites, factions, legal system, alliances |
| **Military** | What organised capacity for force exists, and how is it used? | armed forces, militias, security services, doctrine, readiness, morale |
| **Economic** | How is wealth produced, distributed and controlled? | trade, energy, finance, labour, sanctions exposure, black markets |
| **Social** | What holds people together and what divides them? | demography, ethnicity, religion, class, tribes, grievances, values |
| **Information** | How does information and meaning flow, and who shapes it? | media, social networks, propaganda, censorship, telecoms, narratives |
| **Infrastructure** | What physical networks keep the system running? | transport, power, water, communications, health, logistics |

The US Army adds two variables, **P**hysical environment and **T**ime, to give **PMESII-PT**. Time matters because many effects only unfold slowly, and because actors value time differently.

### How to use it

1. **Define the system.** Whose system, in which area, for which question? A PMESII of "Country X" in general is too broad to be useful.
2. **Fill each sub-system**, but only with what is relevant to the question.
3. **Map the links.** This is the actual analysis: *if the power grid fails (I), what happens to the economy (E), public mood (S), the government's legitimacy (P) and the army's logistics (M)?* Nodes that connect many links are candidates for decisive points.
4. **Identify strengths, weaknesses and centres of gravity.**
5. **Match with the instruments.** Use **DIME** (Diplomatic, Informational, Military, Economic) to ask which of *your* instruments can act on which of *their* sub-systems.

### Related frameworks

| Framework | Describes | Level |
|---|---|---|
| **PMESII(-PT)** | the *system* you act on | strategic to operational |
| **DIME** (also DIMEFIL: + Financial, Intelligence, Law enforcement) | the *instruments of national power* you act with | strategic |
| **ASCOPE** (Areas, Structures, Capabilities, Organisations, People, Events) | civil considerations in a specific area | operational to tactical |
| **PESTLE** (Political, Economic, Social, Technological, Legal, Environmental) | the business version for a firm's environment | corporate |

A common matrix crosses PMESII (rows) with ASCOPE (columns): *which areas, structures, organisations … matter politically, economically, socially …?*

## Worked Example

**Question:** How vulnerable is a small, neutral, highly connected state such as Switzerland to hybrid pressure short of war? *(My own sketch, deliberately incomplete.)*

| Sub-system | Strength | Vulnerability |
|---|---|---|
| **Political** | stable, consensual, high trust in institutions | slow decisions (consensus, direct democracy) |
| **Military** | militia can mobilise large numbers | limited air defence and ammunition stocks; long procurement |
| **Economic** | wealthy, diversified, strong financial centre | dependent on imported energy and foreign markets; sanctions questions touch neutrality |
| **Social** | cohesive, multilingual federal culture | open society, exposed to polarising campaigns |
| **Information** | free, pluralistic media | fragmented by language region; a target for disinformation |
| **Infrastructure** | dense, well-maintained networks | power, data centres and transit routes are critical and interconnected |

**The links are where the insight is.** A cyberattack on the power grid (Infrastructure) would at once hit the financial centre (Economic), feed a narrative of state failure (Information → Social), and put pressure on a slow consensus system to respond (Political), while the army would be tied down supporting civil authorities (Military). A PMESII that only filled the six rows would miss this chain.

## Strengths & Pitfalls

**Strengths**

- **Breadth.** It stops analysts from seeing only the enemy's army.
- **Common structure.** Intelligence staff and planners, military and civilian, can split the work and still fit it together.
- **Links to planning.** It feeds centres of gravity, decisive points and courses of action directly.

**Pitfalls**

- **Six lists, no system.** The most common failure: each cell is filled, but no one maps how the sub-systems interact.
- **Everything is relevant.** Without a clear question, PMESII produces encyclopaedias, not analysis.
- **False precision.** Node-and-link diagrams look exact, but social and political relationships are fuzzy and change fast.
- **Mirror imaging.** The analyst's own view of what counts as "political" or "legitimate" may not match the society being studied.

> [!counter] Critique
> - **Effects-based heritage.** PMESII grew out of *effects-based operations* around 2000, which promised that a society could be modelled well enough to predict the effects of actions on it. US Joint Forces Command dropped the effects-based approach in 2008, arguing that it assumed more predictability than war allows [@mattis2008usjfcom]. PMESII survives as a descriptive checklist, but the promise of predictable second- and third-order effects should be treated with caution.
> - **A static picture of an adaptive system.** The actors inside each sub-system react to what you do. A PMESII analysis is a snapshot of an opponent who is also running their own [[OODA Loop|loop]].
> - **Categories overlap.** Is a state broadcaster political, social or information? The boundaries are conventions, which is fine as long as nobody mistakes them for reality (see [[General Model Theory]]).

## Key Connections

- [[Course of Action]]: PMESII is part of the analysis that COA development builds on
- [[Doctrine (Swiss Armed Forces)|Doctrine]]: military strategy as one of six fields of overall strategy
- [[VRIO]]: PMESII looks outward at the environment; VRIO looks inward at your own resources
- [[Cognitive Warfare]]: works through the *information* and *social* sub-systems to reach the *political*
- [[General Model Theory]]: PMESII is a model, reduced for a purpose; its categories are choices, not facts

## Self-Test: PMESII

> [!qard]- 1. What do the six letters stand for, and what does -PT add?
> Political, Military, Economic, Social, Information, Infrastructure. The US Army adds Physical environment and Time.

> [!qard]- 2. What is the difference between PMESII and DIME?
> PMESII describes the **system** you act on (yours, the enemy's or a region's). DIME lists the **instruments of national power** you act with: diplomatic, informational, military, economic.

> [!qard]- 3. What is the most common mistake in a PMESII analysis?
> Filling six separate lists without mapping the links between them. The insight lies in how a change in one sub-system spreads to the others.

> [!qard]- 4. Why should you be careful with promises of predictable effects?
> PMESII comes from effects-based thinking, which assumed a society could be modelled precisely. Social and political systems are adaptive and poorly known; the US itself dropped effects-based operations in 2008 for that reason.

> [!qard]- 5. Apply: a cyberattack takes down the power grid. Trace the effect through the sub-systems.
> Infrastructure → Economic (the financial centre stops) → Information and Social (a story of state failure) → Political (pressure on a slow consensus system) → Military (logistics). The links are the analysis, not the six lists.

> [!qard]- 6. Limit: why is a finished PMESII table only a snapshot?
> The actors in each sub-system react to what you do. They run their own loop. The boundaries between the six categories are conventions too. So effects cannot be predicted mechanically.

## Open Questions

- [ ] Can PMESII capture *legitimacy*, which sits across the political, social and information sub-systems at once?
- [ ] How would a Swiss overall strategy use PMESII, given there is no single body that owns all six fields?

## Sources

- [@jcs2014joint]: JP 2-01.3, the system-of-systems view of the operational environment. [High confidence: primary doctrine]
- [@jcs2020joint]: JP 5-0, how the analysis feeds joint planning. [High confidence: primary doctrine]
- [@mattis2008usjfcom]: the memorandum ending effects-based operations at US Joint Forces Command. [High confidence: primary]
- The worked example on Switzerland is my own. [Medium confidence]
