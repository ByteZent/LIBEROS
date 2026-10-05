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
status: seedling
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

| Elasticity | Reaction of … | to a change in … | Sign and reading |
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
| **Necessity or luxury** | the good is a luxury | A doctor's visit is inelastic, a sailing boat elastic. What counts as a necessity depends on the buyer's preferences, not on the good |
| **Definition of the market** | the market is drawn narrowly | Food is inelastic, ice cream more elastic, vanilla ice cream very elastic |
| **Time horizon** | buyers have time to adjust | Petrol: little reaction in the first months, much more over years (other cars, public transport, moving house) |

### Computing it: the midpoint method

The plain percentage change depends on the starting point, so the elasticity from A to B differs from the one from B to A. The **midpoint method** fixes this by dividing each change by the **average** of the old and the new value:

$$
E_D = \frac{(Q_2 - Q_1)\,/\,[(Q_2 + Q_1)/2]}{(P_2 - P_1)\,/\,[(P_2 + P_1)/2]}
$$

Example: the price rises from 4 to 6 and the quantity falls from 120 to 80.

- Plain method, A to B: +50 % price, −33 % quantity, elasticity 0.67. From B to A: −33 % price, +50 % quantity, elasticity 1.5.
- Midpoint method: the price changes by 2/5 = 40 %, the quantity by 40/100 = 40 %. Elasticity = **1** in both directions.

### The five cases

| Elasticity | Name | Shape of the curve | Meaning |
|---|---|---|---|
| 0 | Perfectly inelastic | Vertical | Quantity does not react at all |
| between 0 and 1 | Inelastic | Steep | Quantity reacts less than the price |
| 1 | Unit elastic | | Quantity reacts exactly as much as the price |
| above 1 | Elastic | Flat | Quantity reacts more than the price |
| infinite | Perfectly elastic | Horizontal | The smallest price change empties or floods the market |

Rule of thumb: through a given point, the **flatter** curve is the more elastic one. The same five cases exist for supply.

### Elasticity and total revenue

**Total revenue** is price times quantity, $TR = P \times Q$. It is what buyers pay and sellers receive.

| Demand is … | A price rise makes total revenue … | Why |
|---|---|---|
| **Inelastic** (< 1) | **rise** | Quantity falls by a smaller percentage than the price rises |
| **Unit elastic** (= 1) | stay the same | The two changes cancel out |
| **Elastic** (> 1) | **fall** | Quantity falls by a larger percentage than the price rises |

### Slope is not elasticity

![[elasticity-linear-demand.svg]]

A straight demand curve has a constant slope and a **changing** elasticity. The slope is a ratio of changes, the elasticity a ratio of *percentage* changes. At a high price and low quantity, a step of one franc is a small percentage of the price and a large percentage of the quantity: demand is elastic. At a low price and high quantity it is the reverse: demand is inelastic. Total revenue is largest where the elasticity is 1.

### Supply

- The price elasticity of supply depends on **how flexibly sellers can change production**. Land on a lake shore has an inelastic supply, because no more of it can be made. Manufactured goods have an elastic supply, because factories can run longer.
- **Time is the main determinant.** In the short run firms work with the plants they have. In the long run they build or close plants, and firms enter or leave the market.
- **Capacity bends the curve.** With idle capacity a small price rise brings a lot of extra output (elastic). Near full capacity more output needs new plants, so even a large price rise brings little (inelastic).

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
> - Elastic: elasticity above 1, quantity reacts more than the price
> - Inelastic: below 1, quantity reacts less
> - Unit elastic: exactly 1

> [!qard]- 3. Name the four determinants of the price elasticity of demand.
> Availability of close substitutes, necessity or luxury, how narrowly the market is defined, and the time horizon.

> [!qard]- 4. What does the sign of the income elasticity and of the cross-price elasticity tell you?
> Income elasticity: positive for a normal good, negative for an inferior good. Cross-price elasticity: positive for substitutes, negative for complements.

> [!qard]- 5. Calculate with the midpoint method: the price rises from 4 to 6, the quantity demanded falls from 120 to 80.
> Price: 2 / 5 = 40 %. Quantity: 40 / 100 = 40 %. Elasticity = 1, unit elastic. The plain method would give 0.67 one way and 1.5 the other.

> [!qard]- 6. Explain: why does a straight demand curve not have one elasticity?
> Its slope is constant, but elasticity uses percentage changes. At a high price and low quantity the same step is a small percentage of the price and a large one of the quantity (elastic). At a low price it is the reverse (inelastic).

> [!qard]- 7. Apply: a public transport operator raises fares by 10 % and passenger numbers fall by 4 %. What happens to revenue, and what does that say about demand?
> Revenue rises. The elasticity is 0.4, so demand is inelastic: the quantity falls by a smaller percentage than the price rises.

> [!qard]- 8. Apply: a new wheat variety raises every farmer's harvest. Why can the farmers as a group end up poorer?
> Supply shifts right and demand for basic food is inelastic. The price falls by a larger percentage than the quantity rises, so total revenue falls.

> [!qard]- 9. Compare: the short-run and the long-run effect of a cut in oil supply.
> Short run: supply and demand are both inelastic, so the price jumps. Long run: buyers save and switch, other producers expand, both curves are more elastic, and the same cut moves the price far less.

> [!qard]- 10. Judge: "a higher price always brings in more revenue." When is this false?
> When demand is elastic. Then the quantity falls by a larger percentage than the price rises and total revenue falls. It is true only while demand is inelastic.

## Open Questions

- [ ] How inelastic is the short-run supply of ammunition and air defence missiles in Europe, and how many years until it becomes elastic?
- [ ] Which Swiss imports have the most inelastic demand, and what would it cost to make that demand more elastic (stocks, second suppliers)?

## Sources

- [@mankiw2021principles], ch. 5 "Elasticity and Its Application": definitions, determinants, midpoint method, total revenue, the three applications. [High confidence: standard textbook]
- [@marshall1890principles]: introduced the elasticity of demand into economics. [High confidence]
