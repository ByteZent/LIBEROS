---
title: "Elasticity"
aliases:
  - Elasticities
  - Elastizität
  - Elastizitäten
  - Price elasticity of demand
  - Preiselastizität der Nachfrage
  - Price elasticity of supply
  - Preiselastizität des Angebots
  - Income elasticity
  - Cross-price elasticity
  - Midpoint method
type: concept
domain: ["economics"]
courses: ["MikroEcon-HS26"]
qard-deck: MikroEcon-HS26
qard-sets: ["MikroEcon Test 1"]
status: developing
confidence: medium
created: 2026-10-02
modified: 2026-10-05
review: 
originators:
  - Alfred Marshall
tags:
  - concept
  - economics
  - markets
  - defence-economics
draft: false
---

> [!bluf]
> [[Supply and Demand]] tells you the **direction** in which price and quantity move. **Elasticity** tells you **how far**. It measures how strongly buyers or sellers react to a change, as a ratio of two **percentage changes**, so it has no unit and can be compared across goods.
>
> The number to remember is **1**. If the price elasticity of demand is above 1 (**elastic**), quantity reacts more than the price, and a price rise **lowers** what buyers spend in total. Below 1 (**inelastic**), quantity reacts less than the price, and a price rise **raises** total spending.
>
> Three things make a reaction stronger: **close substitutes**, a **narrowly defined** market, and **time**. Almost everything is more elastic in the long run than in the short run, on the demand side and on the supply side.

## Definition

An elasticity is always built the same way: the percentage change of what reacts, divided by the percentage change of what causes the reaction.

> $$
>  \text{Price elasticity of demand} = \frac{\text{Percentage change in quantity demanded}}{\text{Percentage change in price}}
> $$

--- 

> $$
>  \text{Price elasticity of supply} = \frac{\text{Percentage change in quantity supplied}}{\text{Percentage change in price}}
> $$

--- 

> $$
>  \text{Income elasticity of demand} = \frac{\text{Percentage change in quantity demanded}}{\text{Percentage change in income}}
> $$

**Example:**

> $$
> \text{Price elasticity of demand} = \frac{\text{2 percent}}{\text{1 percent}} = 2
> $$

| Elasticity | Reaction of | due to | Sign and reading |
|---|---|---|---|
| **Price elasticity of demand** | quantity demanded | the good's own price | Reported as a positive number (the minus sign is dropped). > 1 elastic, < 1 inelastic, = 1 unit elastic |
| **Income elasticity of demand** | quantity demanded | income | Positive: **normal** good. Negative: **inferior** good. Above 1: luxury. Between 0 and 1: necessity |
| **Cross-price elasticity of demand** | quantity demanded of good 1 | the price of good 2 | Positive: **substitutes**. Negative: **complements** |
| **Price elasticity of supply** | quantity supplied | the good's own price | Positive. > 1 elastic, < 1 inelastic |

In my own words: elasticity answers "by what percentage does the quantity change when the cause changes by one percent?"

## Key Points

### What makes demand elastic

| Determinant | More elastic when … | Example |
|---|---|---|
| **Close substitutes** | buyers can easily switch | Butter (margarine exists) is more elastic than eggs |
| **Necessity or luxury** | the good is a luxury | A doctor's visit is inelastic, a sailing boat elastic. **What counts as a necessity depends on the buyer's preferences, not on the good** |
| **Definition of the market** | the market is drawn narrowly | Food is inelastic, ice cream more elastic, vanilla ice cream very elastic |
| **Income** | the percentage of the income used on the good | if rent were to double one would have to react. If the price of salt doubles one doesn't have to react |
| **Time horizon** | buyers have time to adjust | Petrol: little reaction in the first months, much more over years (other cars, public transport, moving house) |

### What makes supply elastic

| Determinant | More elastic when | Example |
|---|---|---|
| **Availability of goods** | Supply is elastic if more of a good can be produced / created | increase the printing of books |
| **Time horizon** | sellers have time to adjust | Petrol: little reaction in the first months, much more over years (other cars, public transport, moving house) |

### Computing it: the midpoint method

The plain percentage change depends on the starting point, so the elasticity from A to B differs from the one from B to A.
The **midpoint method** fixes this by dividing each change by the **average** of the old and the new value:

$$
E_D = \frac{(Q_2 - Q_1)\,/\,[(Q_2 + Q_1)/2]}{(P_2 - P_1)\,/\,[(P_2 + P_1)/2]}
$$

Example: the price rises from 4 to 6 and the quantity falls from 120 to 80.

- Plain method, A to B: +50 % price, −33 % quantity, elasticity 0.67. From B to A: −33 % price, +50 % quantity, elasticity 1.5.
- Midpoint method: the price changes by 2/5 = 40 %, the quantity by 40/100 = 40 %. Elasticity = **1** in both directions.

### The five cases

| Elasticity      | Name                | Shape of the curve | Meaning                                                |
| --------------- | ------------------- | ------------------ | ------------------------------------------------------ |
| 0               | Perfectly inelastic | Vertical           | Quantity does not react at all                         |
| between 0 and 1 | Inelastic           | Steep              | Quantity reacts less than the price                    |
| 1               | Unit elastic        |                    | Quantity reacts exactly as much as the price           |
| above 1         | Elastic             | Flat               | Quantity reacts more than the price                    |
| infinite        | Perfectly elastic   | Horizontal         | The smallest price change empties or floods the market |
|                 |                     |                    |                                                        |

![[elasticity-five-cases.svg]]

Rule of thumb: through a given point, the **flatter** curve is the more elastic one. The same five cases exist for supply.

### Examples of Elasticities


| Good          | Elasticity |
| ------------- | ---------- |
| Eggs          | 0.1        |
| Healthcare    | 0.2        |
| Cigarettes    | 0.4        |
| Rice          | 0.5        |
| Housing       | 0.7        |
| Beef          | 1.6        |
| Peanut Butter | 1.7        |
| Mountain Dew  | 4.4        |

![[elasticity-examples.svg]]

**The meaning behind the table above:**
- Eggs do not react easily to changes in price. There isn't really a product that can replace it
- Mountain Dew reacts very directly with price. **If the price rises a bit, the demand drops sharply.** Why? There are a lot of substitutes that can replace Mountain Dew. (Red Bull, Monster Energy etc.)


### Elasticity and total revenue

**Total revenue** is price times quantity, $TR = P \times Q$. It is what buyers pay and sellers receive.

| Demand is … | A price rise makes total revenue … | Why |
|---|---|---|
| **Inelastic** (< 1) | **rise** | Quantity falls by a smaller percentage than the price rises |
| **Unit elastic** (= 1) | stay the same | The two changes cancel out |
| **Elastic** (> 1) | **fall** | Quantity falls by a larger percentage than the price rises |

![[elasticity-total-revenue.svg]]

### Slope is not elasticity

![[elasticity-linear-demand.svg]]

A straight demand curve has a constant slope and a **changing** elasticity. The slope is a ratio of changes, the elasticity a ratio of *percentage* changes. At a high price and low quantity, a step of one franc is a small percentage of the price and a large percentage of the quantity: demand is elastic. At a low price and high quantity it is the reverse: demand is inelastic. Total revenue is largest where the elasticity is 1.

### Supply

- The price elasticity of supply depends on **how flexibly sellers can change production**. Land on a lake shore has an inelastic supply, because no more of it can be made. Manufactured goods have an elastic supply, because factories can run longer.
- **Time is the main determinant.** In the short run firms work with the plants they have. In the long run they build or close plants, and firms enter or leave the market.
- **Capacity bends the curve.** With idle capacity a small price rise brings a lot of extra output (elastic). Near full capacity more output needs new plants, so even a large price rise brings little (inelastic).

![[elasticity-supply-capacity.svg]]

## Application

**Three standard cases**

- **Good news for farming, bad news for farmers.** A better wheat variety shifts supply to the right. Demand for basic food is inelastic, so the price falls by more than the quantity rises, and the farmers' total revenue **falls**. Each farmer still adopts the variety, because a single farmer cannot move the price.
- **Why a cartel's power fades.** In the short run both the supply and the demand for oil are inelastic, so a cut in output raises the price sharply. Over years buyers save energy and other producers expand, both curves become more elastic, and the same cut raises the price far less.
- **Drug interdiction or education?** Interdiction shifts supply to the left. Demand of addicts is inelastic, so the price rises more than the quantity falls and total spending on drugs **rises**, which can raise drug-related crime. Education shifts demand to the left and lowers both the price and the quantity.

**Security and defence**

- **Rearmament runs into inelastic short-run supply.** After 2022 demand for ammunition rose fast while plants were at capacity. With a steep supply curve the result is mostly higher prices and longer delivery times. Only new plants, which take years, make supply elastic (see [[Supply and Demand]]).
- **Sanctions bite where demand is inelastic and substitutes are few**, and they fade as the target finds other suppliers and routes. The effect of a sanction has a half-life for the same reason as the cartel's power.
- **Energy as a lever.** A state that supplies a good with inelastic short-run demand (gas in winter) holds power over its buyers for as long as they cannot switch. Stocks and alternative suppliers are ways to make one's own demand more elastic before the crisis.
- **Taxes and prices as policy tools.** A tax on a good with inelastic demand raises revenue and changes behaviour little. A tax on a good with elastic demand changes behaviour and raises little revenue. The aim decides which is wanted.

> [!counter] Critiques & Limits
> - **Estimates differ.** An elasticity is estimated from market data with statistical assumptions that may not hold. Different studies report different numbers for the same good.
> - **Not one number per good.** The elasticity changes along the curve, with the time horizon and with how the market is defined. "The elasticity of petrol" means little without these.
> - **Ceteris paribus.** Each elasticity holds everything else constant. In a real shock, income, other prices and expectations move at the same time.
> - **Reaction in quantity only.** Buyers also react by switching quality, by hoarding or by going to informal markets, which the measure does not show.

## Glossary

| Deutsch | English | Definition | Be able to |
|---|---|---|---|
| Elastizität | Elasticity | How strongly quantity demanded or supplied reacts to a change in one of its determinants, as a ratio of percentage changes. | apply |
| Preiselastizität der Nachfrage | Price elasticity of demand | Percentage change in quantity demanded divided by the percentage change in the good's own price. | apply |
| Preiselastizität des Angebots | Price elasticity of supply | Percentage change in quantity supplied divided by the percentage change in the good's own price. | apply |
| Einkommenselastizität der Nachfrage | Income elasticity of demand | Percentage change in quantity demanded divided by the percentage change in income. | apply |
| Kreuzpreiselastizität der Nachfrage | Cross-price elasticity of demand | Percentage change in the quantity demanded of one good divided by the percentage change in the price of another. | apply |
| Mittelwertmethode | Midpoint method | Computing a percentage change by dividing the change by the average of the old and the new value. | apply |
| Gesamterlös (Umsatz) | Total revenue | Price times quantity sold: what buyers pay and sellers receive. | apply |
| elastisch / unelastisch | Elastic / inelastic | Elasticity above 1 / below 1. | define |
| vollkommen unelastisch | Perfectly inelastic | Elasticity of zero: the quantity does not react to the price. | define |
| vollkommen elastisch | Perfectly elastic | Infinite elasticity: the curve is horizontal. | define |
| notwendiges Gut / Luxusgut | Necessity / luxury | A good with inelastic demand / with elastic demand. Which one a good is depends on the buyer's preferences. | define |

## Key Connections

- [[Supply and Demand]]: gives the direction of a change. Elasticity adds the size.
- [[Consumer Choice]]: explains *why* demand reacts as it does, through the income and the substitution effect.
- [[Ten Principles of Economics]]: principle 4, people respond to incentives. Elasticity measures how much.
- [[Comparative Advantage]]: dependence on a trading partner is dangerous in proportion to how inelastic one's demand for his goods is.

## Self-Test: Elasticity

> [!qard]- 1. What does an elasticity measure, and why is it expressed in percentages?
> How strongly a quantity reacts to a change in one of its determinants. As a ratio of two percentage changes it has no unit, so it can be compared across goods and currencies.

> [!qard]- 2. When is demand called elastic, inelastic and unit elastic?
> - **Elastic:** elasticity above 1, quantity reacts more than the price
> - **Inelastic:** below 1, quantity reacts less
> - **Unit elastic:** exactly 1

> [!qard]- 3. Name the four determinants of the price elasticity of demand.
> Availability of close substitutes, necessity or luxury, how narrowly the market is defined, and the time horizon.

> [!qard]- 4. What does the sign of the income elasticity and of the cross-price elasticity tell you?
> - **Income elasticity:** positive for a normal good, negative for an inferior good.
> - **Cross-price elasticity:** positive for substitutes, negative for complements.

> [!qard]- 5. Calculate with the midpoint method: the price rises from 4 to 6, the quantity demanded falls from 120 to 80.
> - **Price:** 2 / 5 = 40 %
> - **Quantity:** 40 / 100 = 40 %.
> - **Elasticity** = 1, unit elastic.
> 
> The plain method would give 0.67 one way and 1.5 the other.

> [!qard]- 6. Explain: why does a straight demand curve not have one elasticity?
> Its slope is constant, but elasticity uses percentage changes. At a high price and low quantity the same step is a small percentage of the price and a large one of the quantity (elastic). At a low price it is the reverse (inelastic).

> [!qard]- 7. Apply: a public transport operator raises fares by 10 % and passenger numbers fall by 4 %. What happens to revenue, and what does that say about demand?
> <!-- qard-important -->
> Revenue rises. The elasticity is 0.4, so demand is inelastic: the quantity falls by a smaller percentage than the price rises.

> [!qard]- 8. Apply: a new wheat variety raises every farmer's harvest. Why can the farmers as a group end up poorer?
> <!-- qard-write -->
> Supply shifts right and demand for basic food is inelastic. The price falls by a larger percentage than the quantity rises, so total revenue falls.

> [!qard]- 9. Compare: the short-run and the long-run effect of a cut in oil supply.
> <!-- qard-write -->
> - **Short run:** supply and demand are both inelastic, so the price jumps.
> - **Long run:** buyers save and switch, other producers expand, both curves are more elastic, and the same cut moves the price far less.

> [!qard]- 10. Judge: "a higher price always brings in more revenue." When is this false?
> When demand is elastic. Then the quantity falls by a larger percentage than the price rises and total revenue falls. It is true only while demand is inelastic.

> [!cloze] The price elasticity of demand is the ==percentage change in quantity demanded== divided by the ==percentage change in price==.

> [!qard]- 11. Name the four elasticities: what reacts to what in each?
> <!-- qard-important -->
> - **Price elasticity of demand:** quantity demanded to the good's own price.
> - **Income elasticity:** quantity demanded to income.
> - **Cross-price elasticity:** quantity demanded of good 1 to the price of good 2.
> - **Price elasticity of supply:** quantity supplied to the good's own price.

> [!qard]- 12. Calculate with the midpoint method: the price elasticity of demand, and how total revenue reacts.
> <!-- qard-important -->
> The price rises from 10 to 14, the quantity demanded falls from 130 to 110.
> <!-- qard-answer -->
> The elasticity is **0.5**: demand is inelastic. Total revenue **rises** from 1,300 to 1,540.
> <!-- qard-solution -->
> 1. Price: $4 / 12 = 33.3$ per cent (the change divided by the average of 10 and 14).
> 2. Quantity: $20 / 120 = 16.7$ per cent.
> 3. Elasticity: $16.7 / 33.3 = 0.5$.
> 4. Revenue: $10 \cdot 130 = 1300$ and $14 \cdot 110 = 1540$. The quantity falls by a smaller percentage than the price rises.
> <!-- qard-variant -->
> The price falls from 12 to 8, the quantity demanded rises from 80 to 120.
> <!-- qard-answer -->
> The elasticity is **1**: demand is unit elastic. Total revenue **stays** at 960.
> <!-- qard-solution -->
> 1. Price: $4 / 10 = 40$ per cent.
> 2. Quantity: $40 / 100 = 40$ per cent.
> 3. Elasticity: $40 / 40 = 1$.
> 4. Revenue: $12 \cdot 80 = 960$ and $8 \cdot 120 = 960$. The two changes cancel out.
> <!-- qard-variant -->
> The price rises from 20 to 30, the quantity demanded falls from 90 to 30.
> <!-- qard-answer -->
> The elasticity is **2.5**: demand is elastic. Total revenue **falls** from 1,800 to 900.
> <!-- qard-solution -->
> 1. Price: $10 / 25 = 40$ per cent.
> 2. Quantity: $60 / 60 = 100$ per cent.
> 3. Elasticity: $100 / 40 = 2.5$.
> 4. Revenue: $20 \cdot 90 = 1800$ and $30 \cdot 30 = 900$. The quantity falls by a larger percentage than the price rises.

> [!qard]- 13. Calculate: income rises by 10 per cent. Demand for bus rides falls by 5 per cent, for restaurant meals it rises by 20 per cent, for bread by 2 per cent. Give the income elasticities and classify the goods.
> - **Bus rides:** −0.5, an inferior good.
> - **Restaurant meals:** 2, a normal good and a luxury (above 1).
> - **Bread:** 0.2, a normal good and a necessity (between 0 and 1).
> <!-- qard-solution -->
> Each time the percentage change in quantity divided by the percentage change in income: $-5 / 10 = -0.5$, $20 / 10 = 2$, $2 / 10 = 0.2$. For the income elasticity the sign matters.

> [!qard]- 14. Calculate: the price of coffee rises by 10 per cent. Demand for tea rises by 3 per cent, demand for coffee cream falls by 8 per cent. What do the cross-price elasticities say?
> - **Tea:** +0.3, positive, so a **substitute**.
> - **Coffee cream:** −0.8, negative, so a **complement**.
> <!-- qard-solution -->
> The percentage change in the quantity of one good divided by the percentage change in the price of the other: $3 / 10 = 0.3$ and $-8 / 10 = -0.8$.

> [!qard]- 15. Calculate: a cinema cuts its price from 20 to 16 francs and the audience grows from 200 to 300. How elastic is demand (midpoint method), and did the price cut pay?
> The elasticity is **1.8**: demand is elastic. Total revenue rises from 4,000 to **4,800** francs.
> <!-- qard-solution -->
> 1. Price: $4 / 18 = 22.2$ per cent.
> 2. Quantity: $100 / 250 = 40$ per cent.
> 3. Elasticity: $40 / 22.2 = 1.8$.
> 4. Revenue: $20 \cdot 200 = 4000$ and $16 \cdot 300 = 4800$. With elastic demand a price cut raises revenue.

> [!qard]- 16. Calculate: $Q_D = 14 - 2P$. What is total revenue at $P = 2$, $P = 3.5$ and $P = 5$, and what follows?
> 20, **24.5** and 20. Revenue is largest in the middle of the line, where the elasticity is 1. Above it demand is elastic, below it inelastic.
> <!-- qard-solution -->
> 1. $P = 2$: $Q = 10$, revenue $2 \cdot 10 = 20$.
> 2. $P = 3.5$: $Q = 7$, revenue $3.5 \cdot 7 = 24.5$.
> 3. $P = 5$: $Q = 4$, revenue $5 \cdot 4 = 20$.

> [!qard]- 17. Calculate for $Q_D = 14 - 2P$ the elasticity (midpoint method) between $P = 5$ and $P = 6$ and between $P = 1$ and $P = 2$. What does the comparison show?
> **3.67** at the top (elastic), **0.27** at the bottom (inelastic). The slope is the same everywhere, the elasticity is not.
> <!-- qard-solution -->
> 1. From 5 to 6: the quantity falls from 4 to 2. Quantity: $2 / 3 = 66.7$ per cent, price: $1 / 5.5 = 18.2$ per cent. Elasticity: $66.7 / 18.2 = 3.67$.
> 2. From 1 to 2: the quantity falls from 12 to 10. Quantity: $2 / 11 = 18.2$ per cent, price: $1 / 1.5 = 66.7$ per cent. Elasticity: $18.2 / 66.7 = 0.27$.

> [!qard]- 18. Name the five cases of price elasticity with their value and the shape of the curve.
> - **Perfectly inelastic:** 0, vertical.
> - **Inelastic:** between 0 and 1, steep.
> - **Unit elastic:** exactly 1.
> - **Elastic:** above 1, flat.
> - **Perfectly elastic:** infinite, horizontal.

> [!qard]- 19. Compare: rank food, ice cream and vanilla ice cream by the price elasticity of demand, and give the reason.
> Food (inelastic) < ice cream < vanilla ice cream (very elastic). The more **narrowly the market is defined**, the more close substitutes there are, and the more easily buyers switch.

> [!qard]- 20. What does the price elasticity of supply depend on?
> On how flexibly sellers can change production.
>
> - **Time:** in the short run the plants are given, in the long run plants are built and firms enter.
> - **Capacity:** with idle capacity supply is elastic, near full capacity inelastic.

> [!qard]- 21. Apply: the state wants to reduce drug use, by interdiction or by education. How does each act on price, quantity and total spending?
> <!-- qard-write -->
> - **Interdiction:** supply shifts left. Demand of addicts is inelastic, so the price rises more than the quantity falls and total spending **rises**.
> - **Education:** demand shifts left. Price, quantity and spending fall.

> [!qard]- 22. Apply: a tax is meant (a) to raise as much revenue as possible or (b) to change behaviour. On which kind of good is it put in each case?
> - **(a)** A good with **inelastic** demand: the quantity hardly reacts, revenue is high.
> - **(b)** A good with **elastic** demand: the quantity reacts strongly, revenue stays small.

> [!qard]- 23. Apply: a state supplies gas in winter to neighbours who cannot switch. Why does that give it power, and how can the buyers protect themselves?
> <!-- qard-write -->
> Short-run demand is **inelastic**: the buyers must accept almost any price. Protection is whatever makes their own demand more elastic before the crisis: stocks and alternative suppliers. The lever fades as buyers find ways to switch.

> [!qard]- 24. Draw: the five cases of the price elasticity of demand, one curve each, from perfectly inelastic to perfectly elastic.
> <!-- qard-draw -->
> ![[elasticity-five-cases.svg]]
>
> - [ ] Perfectly inelastic: vertical, elasticity 0
> - [ ] Inelastic: steep, below 1
> - [ ] Unit elastic: exactly 1
> - [ ] Elastic: flat, above 1
> - [ ] Perfectly elastic: horizontal, infinite

> [!qard]- 25. Draw: a straight demand curve. Mark where demand is elastic, unit elastic and inelastic, and where total revenue is largest.
> <!-- qard-draw -->
> ![[elasticity-linear-demand.svg]]
>
> - [ ] Elastic on the upper part: high price, low quantity
> - [ ] Inelastic on the lower part: low price, high quantity
> - [ ] Unit elastic in the middle
> - [ ] Total revenue largest in the middle, drawn as the rectangle $P \times Q$
> - [ ] The slope is the same along the whole line

## Open Questions

- [ ] How inelastic is the short-run supply of ammunition and air defence missiles in Europe, and how many years until it becomes elastic?
- [ ] Which Swiss imports have the most inelastic demand, and what would it cost to make that demand more elastic (stocks, second suppliers)?

## Sources

- [@mankiw2021principles], ch. 5 "Elasticity and Its Application": definitions, determinants, midpoint method, total revenue, the three applications. [High confidence: standard textbook]
- [@marshall1890principles]: introduced the elasticity of demand into economics. [High confidence]
