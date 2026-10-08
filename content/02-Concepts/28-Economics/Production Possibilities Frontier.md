---
title: "Production Possibilities Frontier"
aliases:
  - PPF
  - Production possibilities curve
  - Produktionsmöglichkeitenkurve
  - PMK
  - Guns vs butter
type: model
domain: ["economics"]
courses: ["MikroEcon-HS26"]
qard-deck: MikroEcon-HS26
qard-sets: ["MikroEcon Test 1"]
status: developing
confidence: high
created: 2026-09-29
modified: 2026-10-05
review: 
originators:
  - Paul Samuelson
tags:
  - model
  - economics
  - scarcity
  - opportunity-cost
  - defence-economics
draft: false
---

> [!bluf]
> The production possibilities frontier (PPF, *Produktionsmöglichkeitenkurve*) shows the **maximum combinations of two goods** an economy can produce with its **given resources and technology**. It makes three ideas visible at once: **scarcity** (you cannot have everything: points outside are unattainable), **efficiency** (points inside waste resources), and **opportunity cost** (the slope: more of one good means less of the other).
>
> The classic example is **guns vs butter**: every soldier or factory used for defence is not producing civilian goods.

## Question

What can an economy produce with what it has, and what does it cost to produce more of one thing?

## Assumptions

- **Two goods** only (e.g. defence goods and civilian goods), standing for "this" vs "everything else".
- **Fixed resources** (labour, land, capital) and **fixed technology** at the moment considered.
- Resources are **fully and efficiently used** on the frontier itself.

> [!tip] Test
> Relax "fixed resources and technology" and the frontier moves outward: that is **growth**. Relax "fully used" and the economy sits *inside* the curve: that is unemployment or waste.

## Mechanism

![[ppf-guns-butter.svg]]

| Point | Where | Meaning |
|---|---|---|
| **A** | inside the curve | **attainable but inefficient**: resources are idle (unemployment) or badly allocated. You could have more of *both* goods. |
| **B** | on the curve | **efficient**: you can only get more of one good by giving up some of the other. |
| **C** | outside the curve | **unattainable** with today's resources and technology. |

- **The slope is the opportunity cost** (*Opportunitätskosten*). The steepness of the curve at a point tells you how many guns you give up for one more unit of butter.
- **Moving along the curve** = reallocating resources between the goods. **Moving from inside onto the curve** = using idle resources.
- **Shift outward** (PPF₀ → PPF₁): more resources (population, capital) or better technology. That is **economic growth**; point C becomes attainable. A shift can also be biased: a technology that only helps butter production stretches the curve along the butter axis only.

### Why the curve is bowed outward

![[ppf-opportunity-cost.svg]]

- A **straight line** means **constant opportunity cost**: resources are equally good at producing both goods.
- A **bowed-out** (concave) curve means **increasing opportunity cost**. Resources are **specialised**. When an economy first shifts from guns to butter, it moves the resources best suited for butter (farmland, farmers). The last ones moved are those best suited for guns (arms engineers, steelworks), who produce little butter. Each extra unit of butter therefore costs more and more guns.

## Formal Expression

Opportunity cost of good $X$ in units of good $Y$ is the (absolute) slope of the frontier:

$$
OC_X = \left|\frac{\Delta Y}{\Delta X}\right|
$$

If the numbers are given as **time per unit**, the opportunity cost of $X$ is $\dfrac{\text{time for } X}{\text{time for } Y}$. Example: one tank takes 60 hours, one tractor 15 hours, so one tank costs $60/15 = 4$ tractors.

Opportunity costs are **reciprocal**: if 1 tank costs 4 tractors, then 1 tractor costs $1/4$ tank.

## Predictions & Evidence

| Prediction | Evidence | Verdict |
|---|---|---|
| An economy at full employment cannot raise defence output without cutting civilian output | Large wartime mobilisations cut civilian consumption and investment (rationing, conversion of car plants to tank production) | supported |
| An economy with idle resources *can* raise both | The US in 1940–42 raised military output sharply while civilian consumption did not fall at first, because it started from Depression-era unemployment (inside the PPF) | supported |
| Rearmament after long underinvestment is slow | Frontier shifts need capital and skilled labour, which take years to build | supported |

## Policy Implications

- **Defence budgets are a choice along the frontier.** Every increase in defence spending at full employment has an opportunity cost in civilian goods, and the other way round.
- **Growth relaxes the trade-off.** A larger economy can afford both more defence and more civilian goods. Long-run defence capacity depends on the economic base.
- **Unemployment is a free lunch only once.** Moving from inside onto the frontier raises output of both goods; after that, every choice has a cost.
- **Trade does not move the frontier but lets a country *consume* beyond it.** By specialising where its opportunity cost is lowest (comparative advantage) and trading, a country can consume combinations outside its own PPF.

> [!counter] Critiques & Limits
> - **Only two goods:** real economies produce millions; the two-good picture illustrates logic, not magnitudes.
> - **Static:** it shows possibilities at one moment. It says nothing about *how fast* the frontier shifts or how long reallocation takes (converting a car factory to tanks is not instant).
> - **Says nothing about which point is best:** choosing between guns and butter is a **normative** question. The PPF only shows what is *possible*, not what is desirable.
> - **Hard to measure:** where exactly the frontier lies, and how far inside it an economy is, can only be estimated.

## Glossary

| Deutsch | English | Definition | Be able to |
|---|---|---|---|
| Produktionsmöglichkeitenkurve | Production possibilities frontier (PPF) | The maximum combinations of two goods an economy can produce with its given resources and technology. | apply |
| effizient / ineffizient | Efficient / inefficient | On the frontier: more of one good only by giving up some of the other / inside it: more of both would be possible. | apply |
| erreichbar / unerreichbar | Attainable / unattainable | On or inside the frontier / outside it with today's resources and technology. | define |
| konstante / steigende Opportunitätskosten | Constant / increasing opportunity cost | A straight frontier / a frontier bowed outward, because resources are specialised. | apply |
| Wirtschaftswachstum | Economic growth | An outward shift of the frontier through more resources or better technology. | apply |
| Vollbeschäftigung | Full employment | All resources are in use: the economy is on its frontier. | define |
| Reallokation | Reallocation | Moving resources from one good to the other: a movement along the frontier. | define |
| Kanonen oder Butter | Guns or butter | The standard example of the trade-off between defence goods and civilian goods. | translate |

## Key Connections

- [[Circular Flow Diagram]]: the other first model of the course; the circular flow shows who trades with whom, the PPF what can be produced
- [[Supply and Demand]]: rising supply curves reflect the same idea as the bowed-out PPF: producing more costs more at the margin
- [[General Model Theory]]: a strong **reduction** (two goods, fixed resources) made for one purpose: showing scarcity and opportunity cost

## Self-Test: PPF

> [!qard]- 1. Draw a PPF and explain one point inside, on and outside the curve.
> ![[ppf-guns-butter.svg]]
>
> - [ ] One good on each axis, the curve bowed outward
> - [ ] **Inside:** attainable but inefficient (idle or misallocated resources)
> - [ ] **On:** efficient; more of one good only by giving up the other
> - [ ] **Outside:** unattainable with current resources and technology

> [!qard]- 2. What does the slope of the PPF measure?
> <!-- qard-important -->
> The **opportunity cost**: how many units of the good on the vertical axis must be given up to produce one more unit of the good on the horizontal axis.

> [!qard]- 3. Why is the PPF usually bowed outward?
> Because resources are specialised. Shifting production toward one good first uses the resources best suited to it; later, less suitable resources must be used, so each additional unit costs more of the other good: **increasing opportunity cost**.

> [!qard]- 4. What shifts the PPF outward, and what does not?
> - **Shifts it:** more resources (labour, capital, land) or better technology.
> - **Does not:** reducing unemployment (moves the economy from inside onto the curve) or trade (allows consumption outside the curve, but the production frontier stays where it is).

> [!qard]- 5. A country raises its defence budget. Under what condition does this *not* reduce civilian output?
> If the economy is **inside** its PPF (unemployment, idle capacity). Then defence output can rise by using idle resources. At full employment, it must come at the cost of civilian goods.

> [!qard]- 6. Calculate: one tank takes 60 hours, one tractor 15 hours. What is the opportunity cost of a tank, and of a tractor?
> One tank costs 60/15 = 4 tractors. One tractor costs 1/4 tank. Opportunity costs are reciprocal.

> [!qard]- 7. Judge: "the PPF shows that we should spend more on defence." What is wrong with this?
> <!-- qard-write -->
> The PPF shows what is possible and what each choice costs. That is a positive statement. Which point on the curve is best is a normative question the model cannot answer.

> [!qard]- 8. What does the production possibilities frontier show, and under which assumptions?
> <!-- qard-important -->
> The **maximum combinations of two goods** an economy can produce.
>
> Assumptions: two goods only, **given resources and technology**, and on the frontier the resources are fully and efficiently used.

> [!cloze] A point ==inside== the production possibilities frontier is attainable but ==inefficient==. A point ==outside== is ==unattainable== with today's resources and technology.

> [!qard]- 9. Calculate: the opportunity costs on a straight frontier, and whether the combination is attainable.
> With all its resources an economy can make 100 tanks or 400 tractors. Combination: 60 tanks and 200 tractors.
> <!-- qard-answer -->
> A tank costs 4 tractors, a tractor ¼ tank. The combination is **unattainable**: with 60 tanks at most 160 tractors are possible.
> <!-- qard-solution -->
> 1. Opportunity cost of a tank: $400 / 100 = 4$ tractors. The reciprocal: a tractor costs ¼ tank.
> 2. Frontier: tractors $= 400 - 4 \cdot$ tanks.
> 3. With 60 tanks: $400 - 240 = 160$ tractors.
> 4. $200 > 160$: the point lies outside the frontier.
> <!-- qard-variant -->
> With all its resources an economy can make 120 drones or 40 trucks. Combination: 60 drones and 20 trucks.
> <!-- qard-answer -->
> A truck costs 3 drones, a drone ⅓ truck. The combination lies **on the frontier**: attainable and efficient.
> <!-- qard-solution -->
> 1. Opportunity cost of a truck: $120 / 40 = 3$ drones. The reciprocal: a drone costs ⅓ truck.
> 2. Frontier: drones $= 120 - 3 \cdot$ trucks.
> 3. With 20 trucks: $120 - 60 = 60$ drones.
> 4. $60 = 60$: the point is exactly on the frontier.
> <!-- qard-variant -->
> With all its resources an economy can make 50 helicopters or 200 ambulances. Combination: 20 helicopters and 100 ambulances.
> <!-- qard-answer -->
> A helicopter costs 4 ambulances, an ambulance ¼ helicopter. The combination lies **inside** the frontier: attainable but inefficient.
> <!-- qard-solution -->
> 1. Opportunity cost of a helicopter: $200 / 50 = 4$ ambulances. The reciprocal: an ambulance costs ¼ helicopter.
> 2. Frontier: ambulances $= 200 - 4 \cdot$ helicopters.
> 3. With 20 helicopters: $200 - 80 = 120$ ambulances.
> 4. $100 < 120$: 20 more ambulances would be possible.

> [!qard]- 10. Calculate: the frontier runs through (butter, guns) = (0, 100), (10, 90), (20, 70), (30, 40), (40, 0). What does one unit of butter cost in each section, and what does that say about the shape?
> 1, 2, 3 and 4 guns per unit of butter. The opportunity cost **rises**: the frontier is bowed outward.
> <!-- qard-solution -->
> 1. From 0 to 10 butter: $-10$ guns, so $10 / 10 = 1$.
> 2. From 10 to 20: $-20$ guns, so 2.
> 3. From 20 to 30: $-30$ guns, so 3.
> 4. From 30 to 40: $-40$ guns, so 4.
>
> Reason: resources are specialised. The ones best suited to butter move first, the ones that can almost only make guns move last.

> [!qard]- 11. Apply: what happens to the frontier? (a) Unemployment falls. (b) A new technology helps butter production only. (c) Skilled workers immigrate. (d) The country opens up to trade.
> <!-- qard-write -->
> - **(a)** No shift: a move from inside onto the frontier.
> - **(b)** The frontier stretches along the butter axis only.
> - **(c)** An outward shift: more resources (growth).
> - **(d)** No shift, but the country can **consume** combinations outside its frontier.

> [!qard]- 12. Draw: one frontier with constant and one with increasing opportunity cost. Mark equal steps along the butter axis and what each step costs in guns.
> <!-- qard-draw -->
> ![[ppf-opportunity-cost.svg]]
>
> - [ ] Constant: a straight line, every step costs the same
> - [ ] Increasing: bowed outward, every step costs more than the one before
> - [ ] The reason for the bow: resources are specialised

> [!qard]- 13. Draw: economic growth in the frontier for guns and butter, and a point that becomes attainable through it.
> <!-- qard-draw -->
> ![[ppf-guns-butter.svg]]
>
> - [ ] A second frontier outside the first
> - [ ] The cause named: more resources or better technology
> - [ ] A point outside the old frontier and on or inside the new one
> - [ ] Not growth: a move from inside onto the frontier

## Open Questions

- [ ] How long does it take in practice to move along the frontier from civilian to defence production, and what limits the speed?
- [ ] Is European rearmament a movement along the PPF, a use of idle capacity, or does it require a shift of the frontier?

## Sources

- [@mankiw2021principles], ch. 2 "Thinking Like an Economist". [High confidence: standard textbook]
- [@samuelson1948economics]: made the guns-and-butter frontier a textbook standard. [High confidence]
