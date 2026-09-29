---
title: "Supply and Demand"
aliases:
  - s&d
  - Supply and demand model
  - Angebot und Nachfrage
type: model
domain: ["economics"]
courses: ["MikroEcon-H26"]
status: developing
confidence: high
created: 2026-09-29
modified: 2026-09-29
review: 
originators:
  - Antoine Augustin Cournot
  - Fleeming Jenkin
  - Alfred Marshall
tags:
  - model
  - markets
  - economics
  - prices
draft: false
---

> [!bluf]
> The model of supply and demand is an economic model that explains how the **price and the traded quantity of a good** are determined in a market. A **market is a group of buyers and sellers** of a particular good or service.
>
> It shows how much sellers are willing to sell and how much buyers are willing to buy at each price. Where the two meet is the **equilibrium**: the price at which the quantity supplied equals the quantity demanded. If the price is too high, a surplus pushes it down; if it is too low, a shortage pushes it up.
>
> The one skill that matters most: **a change in the good's own price moves you *along* a curve; a change in anything else *shifts* the curve.** Price and quantity *together* tell you which curve moved.

## Definition

The supply and demand model is a fundamental model in economics that describes how prices are determined in a **competitive market**.
It links the quantity of a good that producers are willing to sell with the quantity that consumers are willing to buy, each as a function of the price.

The model also shows how the curves **shift** when the market is disrupted by factors other than the good's own price, and how price and quantity then move to a new equilibrium.

## Assumptions

- **Perfect competition:** many buyers and sellers, each too small to influence the price. Everyone is a **price taker**.
- **Homogeneous good:** all sellers offer the same product.
- **Ceteris paribus:** each curve is drawn holding everything except the good's own price constant.
- **Prices adjust freely** and the market ends up in equilibrium.

> [!tip] Test
> Relax the first assumption (a single seller sets the price) and the supply curve disappears: that is monopoly, a different model. Relax "prices adjust freely" (a legal price cap) and a lasting shortage appears.

## Demand

- **Quantity demanded** (*nachgefragte Menge*): the amount of a good that buyers are willing **and able** to buy at a given price.
- **Law of demand:** ceteris paribus, when the price of a good rises, the quantity demanded falls. The **demand curve** therefore slopes **downward**.
- **Market demand** is the **horizontal sum** of all individual demand curves: at each price, add up what every buyer wants.
- **Why downward?** At a higher price, buyers switch to substitutes and can afford less with the same income.

Convention: the **price** is on the vertical axis and the **quantity** on the horizontal axis.

**What shifts the demand curve** (everything that is *not* the good's own price):

| Determinant | Logic | Shifts **right** when … |
|---|---|---|
| **Income** | Normal good: more income, more demand. Inferior good (bus rides, cheap noodles): more income, *less* demand. | income rises (normal good) |
| **Price of substitutes** | Goods used *instead of* each other (butter vs margarine). A dearer substitute makes this good more attractive. | the substitute's price rises |
| **Price of complements** | Goods used *together* (cars and petrol). A dearer complement makes this good less useful. | the complement's price falls |
| **Tastes / preferences** | Fashion, information, habits | the good becomes more popular |
| **Expectations** | Expected future prices or income | buyers expect higher prices later, so they buy now |
| **Number of buyers** | Market demand is the sum of individual demand | the number of buyers rises |

"Normal", "inferior", "substitute" and "complement" describe **how buyers react**, not the quality of a good.

## Supply

- **Quantity supplied** (*angebotene Menge*): the amount that sellers are willing **and able** to sell at a given price.
- **Law of supply:** ceteris paribus, when the price rises, the quantity supplied rises. The **supply curve** therefore slopes **upward**.
- **Market supply** is the **horizontal sum** of all individual supply curves.
- **Why upward?** A higher price makes it profitable to produce extra units that cost more to make (rising marginal cost), and attracts more production.

**What shifts the supply curve:**

| Determinant | Logic | Shifts **right** when … |
|---|---|---|
| **Input prices** | Wages, raw materials, energy. Dearer inputs make each unit more costly. | input prices fall |
| **Technology** | Better technology lowers the cost per unit | productivity rises |
| **Expectations** | Expected future prices (sellers may hold back stock to sell later) | sellers expect lower prices later, so they sell now |
| **Number of sellers** | Market supply is the sum of individual supply | the number of sellers rises |

## Movement along vs shift of the curve

This is the most tested distinction, and it is mostly about **words**:

| | Cause | In the diagram | Say |
|---|---|---|---|
| **Movement along** the curve | The good's **own price** changes | slide along the same curve | "the **quantity** demanded / supplied changes" |
| **Shift** of the curve | Any **other determinant** changes | the whole curve moves left or right | "**demand** / **supply** changes" |

![[supply-demand-movement-vs-shift.svg]]

## Equilibrium

In equilibrium, the quantity buyers want equals the quantity sellers offer:

$$
Q_D(P^*) = Q_S(P^*) = Q^*
$$

$P^*$ is the **equilibrium price** (*Gleichgewichtspreis*), $Q^*$ the **equilibrium quantity** (*Gleichgewichtsmenge*).

- **Price above $P^*$:** quantity supplied > quantity demanded. This is a **surplus** (*Angebotsüberschuss*). Sellers cannot sell everything, so they cut prices.
- **Price below $P^*$:** quantity demanded > quantity supplied. This is a **shortage** (*Nachfrageüberschuss*). Buyers compete for the good and bid the price up.

In both cases the price moves back toward $P^*$. Economists call this self-correction the **law of supply and demand**.

![[supply-demand-equilibrium.svg]]

## Analysing a change: three steps

1. **Which curve?** Does the event shift demand, supply, or both?
2. **Which direction?** Right (increase) or left (decrease)? Justify it with a *specific* determinant from the tables above.
3. **Compare equilibria:** what happens to $P^*$ and $Q^*$?

### The four basic cases

| Demand | Supply | Price | Quantity | Example |
|---|---|---|---|---|
| ↑ | – | ↑ | ↑ | hot summer, market for ice cream |
| ↓ | – | ↓ | ↓ | a complement becomes more expensive |
| – | ↑ | ↓ | ↑ | cost-saving technology |
| – | ↓ | ↑ | ↓ | an input (sugar for ice cream) becomes more expensive |

![[supply-demand-four-cases.svg]]

### Double shifts: one effect is ambiguous

When **both** curves shift, only one variable has a certain direction. The other depends on **which shift is larger**, and the basic model cannot tell you that.

| Demand | Supply | Price | Quantity |
|---|---|---|---|
| ↑ | ↑ | **?** | ↑ |
| ↓ | ↓ | **?** | ↓ |
| ↑ | ↓ | ↑ | **?** |
| ↓ | ↑ | ↓ | **?** |

![[supply-demand-double-shift.svg]]

> [!warning] The most common misdiagnosis
> A rising price does **not** prove that demand has risen. It can just as well come from falling supply. Look at price **and** quantity together:
> - $P\uparrow,\ Q\uparrow$ → demand increased
> - $P\uparrow,\ Q\downarrow$ → supply decreased
>
> And after a demand increase, the higher price makes sellers offer more: that is a *higher quantity supplied* (a movement along $S$), **not** an increase in supply.

## Formal Expression

A linear example. Demand and supply:

$$
Q_D = 100 - 2P \qquad Q_S = 20 + 2P
$$

Set them equal: $100 - 2P = 20 + 2P \Rightarrow P^* = 20,\ Q^* = 60$.

Now incomes rise and demand shifts right to $Q_D = 120 - 2P$:
$120 - 2P = 20 + 2P \Rightarrow P^* = 25,\ Q^* = 70$. Price and quantity both rise, as in the first of the four basic cases.

Check a disequilibrium: at $P = 25$ with the *old* demand, $Q_D = 50$ and $Q_S = 70$, so there is a surplus of 20 units, and the price falls.

## Key Points

- A **market** is the group of buyers and sellers of one good; the model assumes they are all **price takers**.
- **Demand slopes down, supply slopes up.** Market curves are **horizontal sums** of individual curves.
- **Own price → movement along the curve. Anything else → shift of the curve.** Keep the vocabulary strict: *quantity demanded* vs *demand*.
- **Equilibrium** is where $Q_D = Q_S$. Surpluses and shortages are removed by price changes.
- **Three steps** for every question: which curve, which direction, compare equilibria.
- **Double shifts** leave either price or quantity ambiguous.
- **Prices are signals.** They coordinate millions of decentralised decisions and ration scarce goods, without anyone planning it.
- The model gives **directions**, not **magnitudes**. For "how much", you need elasticities.

## Origins & Evolution

1. **Antoine Augustin Cournot** (1838) first wrote demand as a mathematical function of price.
2. **Fleeming Jenkin** (1870), a Scottish engineer, drew what are probably the first supply and demand curves in the form used today.
3. **Alfred Marshall** (*Principles of Economics*, 1890) made the diagram the core of economics teaching. He compared supply and demand to the **two blades of a pair of scissors**: asking which one sets the price is like asking which blade cuts. Marshall's analysis is **partial equilibrium** (one market at a time, *ceteris paribus*); his convention of putting price on the vertical axis is why the axes still look "backwards" to mathematicians.
4. **Léon Walras** (1874) developed **general equilibrium**: all markets clearing at once, linked through prices.
5. **Friedrich Hayek** ("The Use of Knowledge in Society", 1945) reframed prices as an **information system**: a price change tells everyone that something has become scarcer, without them needing to know why.

## Application

### Policy: when governments fix prices

- **Price ceiling** below $P^*$ (e.g. rent control): legal price is too low, so a persistent **shortage** follows. Queues, waiting lists and black markets ration the good instead of the price.
- **Price floor** above $P^*$ (e.g. a minimum wage, agricultural price supports): a persistent **surplus** (unemployment, unsold produce).
- **Taxes and subsidies** shift supply or demand and change both the price buyers pay and the price sellers receive.

Whether such an intervention is *justified* is a **normative** question. The model only answers the **positive** question of what the effect is.

### Security and defence

- **Sanctions and embargoes** are supply shocks: cutting a country's oil exports shifts world supply left, so $P\uparrow, Q\downarrow$, which also hurts importers.
- **War creates demand shocks.** After 2022, European demand for artillery ammunition surged while production capacity could not expand quickly: a sharp demand shift against a steep short-run supply curve means mostly higher prices and long delivery times, not more output.
- **Disasters:** a catastrophe can raise demand (for water, generators, building materials) and cut supply at the same time. Prices rise sharply, which dampens use and draws in supply. Whether such "emergency prices" should be allowed is again a normative question.

> [!counter] Critiques & Limits
> - **Market power:** the model assumes price takers. With few sellers (monopoly, oligopoly) there is no supply curve in this sense; firms *set* prices.
> - **Product differentiation:** real goods are rarely identical; brands and quality differences give sellers some pricing power.
> - **Adjustment is not instant:** prices can be sticky (contracts, menu costs, social norms), so shortages or surpluses can last.
> - **Imperfect information:** buyers and sellers may not know prices or quality (used cars, health care).
> - **Distribution and fairness:** the model says nothing about who *should* get the good. An efficient equilibrium can still be one many consider unjust.
> - **Partial equilibrium:** it looks at one market in isolation; large shocks spill over into other markets (general equilibrium effects).
> - **No magnitudes without elasticities:** it predicts directions, not sizes.

## Key Connections

- [[General Model Theory]]: supply and demand is a textbook model in Stachowiak's sense. *Mapping:* real markets. *Reduction:* price-taking, identical goods, ceteris paribus. *Pragmatism:* built for predicting the direction of price and quantity changes in competitive markets, not for monopolies or fairness questions.

## Self-Test

> [!question]- 1. Why is a higher price of the good itself not a shift of the demand curve?
> Because the price is on the axis. A change in the good's own price moves buyers **along** the existing curve and changes the *quantity demanded*. Only factors that are not on the axes (income, prices of related goods, tastes, expectations, number of buyers) shift the curve.

> [!question]- 2. How does a rise in income affect a normal good and an inferior good?
> - **Normal good:** demand shifts right.
> - **Inferior good:** demand shifts left, because buyers switch to better alternatives they can now afford.

> [!question]- 3. Why does a higher input price shift the supply curve to the left?
> It raises the cost of producing each unit. At every price, sellers are willing to supply less (or need a higher price for the same quantity). So the whole curve shifts left (or up).

> [!question]- 4. How does the market remove a shortage?
> At a price below $P^*$, buyers want more than is offered. Buyers compete and bid the price up. The higher price lowers the quantity demanded and raises the quantity supplied until they are equal at $P^*$.

> [!question]- 5. Demand rises and supply falls at the same time. What is certain, what is not?
> The **price rises for certain** (both shifts push it up). The effect on **quantity is ambiguous**: it depends on which shift is larger.

> [!question]- 6. The price of a good has risen. Can you conclude that demand has increased?
> No. A supply decrease also raises the price. Look at the quantity: $P\uparrow, Q\uparrow$ points to higher demand; $P\uparrow, Q\downarrow$ points to lower supply.

## Open Questions

- [ ] How steep is short-run supply in defence industries, and what does that mean for how fast rearmament can happen?
- [ ] Where is the line between "prices as signals" in a disaster and exploitation, and who should draw it?

## Sources

- [@mankiw2021principles], ch. 4 "The Market Forces of Supply and Demand". [High confidence: standard textbook]
- [@marshall1890principles]: the scissors analogy and partial equilibrium. [High confidence: primary]
- [@cournot1838recherches]: the first demand function. [High confidence: primary]
- [@jenkin1870graphic]: early graphical supply and demand curves. [High confidence: primary]
- [@hayek1945use]: prices as an information system. [High confidence: primary]
