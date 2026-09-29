---
title: "Circular Flow Diagram"
aliases:
  - Circular flow
  - Circular flow of income
  - Einfacher Wirtschaftskreislauf
  - Wirtschaftskreislauf
  - Kreislaufdiagramm
type: model
domain: ["economics"]
courses: ["MikroEcon-H26"]
status: developing
confidence: high
created: 2026-09-29
modified: 2026-09-29
review: 
originators:
  - François Quesnay
  - Frank Knight
tags:
  - model
  - economics
  - markets
draft: false
---

> [!bluf]
> The circular flow diagram (*einfacher Wirtschaftskreislauf*) is the simplest picture of a whole economy. **Households and firms** meet in **two markets**: in the market for **goods and services**, firms sell and households buy; in the market for **factors of production**, households sell labour, land and capital and firms buy them.
>
> Every **real flow** (goods, factors) is matched by an opposite **money flow** (spending, income). One actor's spending is always another actor's income, which is why the economy is a *circle*.

## Question

How are the decisions of millions of households and firms connected into one economy?

## Assumptions

- **Two actors:** households and firms.
- **Two markets:** goods and services, and factors of production.
- **Closed and simple:** no government, no foreign trade, no financial sector, no saving. Everything households earn, they spend; everything firms receive, they pay out.

> [!tip] Test
> Add saving, taxes or imports and money **leaks** out of the circle; add investment, government spending or exports and money is **injected**. That is how the model grows into macroeconomics.

## Mechanism

![[circular-flow.svg]]

1. **Households own the factors of production**: their labour, land and capital.
2. In the **factor market**, households sell the use of these factors to firms. In return they receive **income**: wages for labour, rent for land, interest and profit for capital.
3. **Firms combine the factors** to produce goods and services.
4. In the **goods market**, firms sell these goods and services to households. Households pay for them with the income from step 2: their **spending** becomes firms' **revenue**.
5. Firms use that revenue to pay for factors again, and the circle closes.

| Flow | Direction | Example |
|---|---|---|
| **Real flow** (*Realstrom*) | households → factor market → firms → goods market → households | a soldier's labour, a delivered truck |
| **Money flow** (*Geldstrom*) | households → goods market → firms → factor market → households | a salary, the price paid for the truck |

## Formal Expression

In the closed basic model, the two views of the circle are equal:

$$
\text{households' spending} = \text{firms' revenue}
\qquad
\text{firms' factor payments} = \text{households' income}
$$

And because firms pay out all their revenue as factor payments:

$$
\text{total spending} = \text{total income} = \text{value of output}
$$

These are **not four separate sources of value** but the same circle measured at different points. This identity is the basis of national accounting: GDP can be measured by spending, by income or by production, and in principle all three give the same number.

## Predictions & Evidence

| Prediction | Evidence | Verdict |
|---|---|---|
| Spending cuts by one group reduce income of another | Recessions spread through falling demand: lower spending → lower revenue → layoffs → lower income → lower spending | supported |
| GDP measured by spending and by income give the same total | National accounts report both; they differ only by a "statistical discrepancy" | supported |

## Policy Implications

- **Every expenditure is someone's income.** Cutting or raising spending (including defence procurement) changes income elsewhere in the circle.
- **Sanctions work on the circle.** Cutting a country off from export markets removes revenue for its firms, which then pay less income to households.
- **The model is the entry point to macroeconomics:** adding government (taxes, spending), the financial system (saving, investment) and the rest of the world (exports, imports) gives the full national accounts.

> [!counter] Critiques & Limits
> - **Deliberately incomplete:** no state, no foreign trade, no banks, no saving. Real money flows leak out and get injected in many places.
> - **Says nothing about prices or quantities:** it shows *who* trades with *whom*, not how much or at what price. That is the job of [[Supply and Demand]].
> - **Timeless:** in reality, income is earned before it is spent, firms hold inventories, and flows do not balance at every moment.
> - **Blurs roles:** the same person is both a household (as a consumer and worker) and may own a firm; the neat separation is a modelling choice.

## Origins & Evolution

1. **François Quesnay's *Tableau économique* (1758)** was the first diagram of an economy as a circulation of goods and money between social classes.
2. **Frank Knight** drew an early modern version, the "wheel of wealth", in his Chicago teaching material (1933).
3. **Textbooks after 1945** (Samuelson, later Mankiw) made the two-market, two-actor diagram the standard first model of economics courses.

## Key Connections

- [[Production Possibilities Frontier]]: the other first model of the course; the circular flow shows who trades with whom, the PPF what can be produced
- [[Supply and Demand]]: explains what happens *inside* each of the two markets (prices and quantities)
- [[General Model Theory]]: a textbook case of **reduction**: two actors, two markets, all other sectors left out on purpose

## Self-Test

> [!question]- 1. Which flows connect households and firms?
> **Real flows:** factors of production from households to firms; goods and services from firms to households. **Money flows** in the opposite direction: households' spending to firms (revenue), firms' factor payments to households (income: wages, rent, profit).

> [!question]- 2. What does the basic model leave out?
> Government, foreign trade, the financial system and saving. Including them would add leakages (taxes, saving, imports) and injections (government spending, investment, exports).

> [!question]- 3. Why is "spending = revenue" and "factor payments = income" not four separate sources of value?
> They describe the same circle from different sides. Each money flow is one transaction seen by the payer (spending) and by the receiver (revenue or income).

> [!question]- 4. What is the difference between a real flow and a money flow? Give an example of each.
> A **real flow** is a physical good, service or factor: a worker's labour, a delivered truck. A **money flow** is the payment for it: the wage, the truck's price. They always run in opposite directions.

## Open Questions

- [ ] How does a sudden surge in defence procurement travel through the circle, and which households' incomes rise first?

## Sources

- [@mankiw2021principles], ch. 2 "Thinking Like an Economist". [High confidence: standard textbook]
- [@quesnay1758tableau]: the first circular-flow diagram. [High confidence: primary]
