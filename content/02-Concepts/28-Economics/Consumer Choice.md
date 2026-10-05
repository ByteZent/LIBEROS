---
title: "Consumer Choice"
aliases:
  - Theory of consumer choice
  - Consumer decisions
  - Konsumentenentscheidungen
  - Haushaltstheorie
  - Budget constraint
  - Budgetbeschränkung
  - Indifference curve
  - Indifferenzkurve
  - Marginal rate of substitution
  - Income and substitution effect
  - Giffen good
type: model
domain: ["economics"]
courses: ["MikroEcon-HS26"]
qard-deck: MikroEcon-HS26
status: seedling
confidence: medium
created: 2026-10-02
modified: 2026-10-05
review: 
tags:
  - model
  - economics
  - decision-making
draft: false
---

> [!bluf]
> The model explains what stands behind a demand curve. A consumer has a **budget constraint** (what she *can* buy) and **preferences**, drawn as **indifference curves** (what she *wants*). She chooses the affordable bundle on the highest indifference curve she can reach.
>
> At that **optimum** the two slopes are equal: the rate at which she is willing to swap the goods (**marginal rate of substitution**) equals the rate at which the market swaps them (**relative price**).
>
> A price change then works in two ways. The **substitution effect** pushes her towards the good that became relatively cheaper. The **income effect** comes from being richer or poorer in real terms. Usually both point the same way and demand slopes down. Where they pull against each other, the model can explain odd results: a good that is bought *more* when it gets dearer, and people who work *less* when the wage rises.

## Question

How does a household decide what to buy with a limited income, and how does that decision change when prices or income change?

## Assumptions

- **Two goods** only, standing for "this good" and "everything else".
- The consumer **spends her whole income** and takes prices as given.
- She can **rank** all bundles and prefers **more to less**.
- She is willing to give up less of a good the less she has of it (**diminishing marginal rate of substitution**).
- She chooses the best bundle she can afford: she **optimises**.

> [!tip] Test
> Drop "she optimises". Real people use rules of thumb, are anchored by irrelevant numbers and stick with defaults (see [[Heuristics and Anchoring]]). The model then describes the logic of a good choice, not the way the choice is actually made.

## Mechanism

### 1. Budget constraint: what she can afford

Income 1,000, pizza 10, cola 2 per litre. She can buy 100 pizzas, or 500 litres, or any mix on the straight line between them.

- The **slope** of the line is the **relative price**: one pizza costs five litres of cola. It is the opportunity cost of pizza in terms of cola.
- **More income** shifts the line outward, **parallel**: the relative price has not changed.
- **A price change rotates** the line around the point on the other axis. If cola falls to 1, she can still buy only 100 pizzas, but now up to 1,000 litres.

### 2. Preferences: what she wants

An **indifference curve** connects all bundles that make her equally well off. Its slope is the **marginal rate of substitution (MRS)**: how much of one good she is willing to give up for one more unit of the other.

| Property | Reason |
|---|---|
| Higher curves are preferred | More is better than less |
| Curves slope downward | If she gets less of one good, she needs more of the other to stay equally well off |
| Curves do not cross | Otherwise one bundle would be equally good as, and better than, another |
| Curves are bowed inward | She gives up a good more willingly when she has a lot of it |

Two extreme shapes:

- **Perfect substitutes:** straight lines, constant MRS (coins of five and ten).
- **Perfect complements:** right angles (left and right shoes). Extra units of one alone are worth nothing.

### 3. Optimum: what she chooses

![[consumer-optimum.svg]]

The optimum is the point where the highest reachable indifference curve just **touches** the budget constraint. A bundle on a higher curve is not affordable. A bundle where a lower curve cuts the budget line is affordable but worse.

### 4. What happens when something changes

| Change | Budget constraint | Result |
|---|---|---|
| Income rises | Shifts outward, parallel | More of every **normal** good, less of an **inferior** good (bus rides) |
| One price falls | Rotates outward | New optimum: split the move into two effects |

When the price of cola falls:

| | **Income effect** | **Substitution effect** | Total |
|---|---|---|---|
| **Cola** (now cheaper) | She is richer: buys more | Cola is relatively cheaper: buys more | **More** |
| **Pizza** | She is richer: buys more | Pizza is relatively dearer: buys less | **Open** |

- The **substitution effect** is a move *along* the same indifference curve to a point with a different MRS.
- The **income effect** is the move to a *higher or lower* indifference curve.
- **Deriving the demand curve:** find the optimum for each price of a good and plot price against the quantity chosen. The demand curve of [[Supply and Demand]] is the summary of these optimal choices.

## Formal Expression

Budget constraint with income $I$:

$$
P_X \cdot X + P_Y \cdot Y = I
$$

Optimum:

$$
MRS = \frac{P_X}{P_Y}
$$

The same condition in terms of **utility**. The MRS equals the ratio of marginal utilities, so

$$
\frac{MU_X}{MU_Y} = \frac{P_X}{P_Y}
\quad\Longleftrightarrow\quad
\frac{MU_X}{P_X} = \frac{MU_Y}{P_Y}
$$

At the optimum the last franc spent on each good brings the **same extra utility**. If it did not, she could gain by moving money from the good with less utility per franc to the one with more.

## Predictions & Evidence

| Prediction | Evidence | Verdict |
|---|---|---|
| Demand curves slope downward | True for almost all goods | supported |
| A demand curve *can* slope upward: a **Giffen good** is an inferior good whose income effect outweighs the substitution effect | A field experiment with rice subsidies for poor households in Hunan (Jensen and Miller, 2008) found such behaviour. Potatoes during the Irish famine are the historical candidate | possible, very rare |
| A higher wage can lower hours worked (backward-bending labour supply) | Over a century, wages rose and the working week became shorter. Lottery winners tend to work less | supported in the long run |
| A higher interest rate can raise or lower saving | Studies disagree: substitution and income effect roughly offset | open |

## Policy Implications

- **Labour supply.** A wage is the price of leisure. A higher wage makes leisure dearer (substitution effect: work more) and makes the worker richer (income effect: take more leisure). Which one wins cannot be told from theory. This matters for every question about pay, taxes and service allowances.
- **Saving.** The interest rate is the price of consuming today instead of tomorrow. The same two effects pull in opposite directions, so a tax break on interest need not raise saving.
- **Cash or goods in kind.** A transfer in cash shifts the budget constraint outward and lets the household pick its own optimum. A transfer in kind fixes part of the bundle. For the recipient, cash is never worse than the same value in kind.
- **Reading a reaction to a price.** When a price rise does not reduce the quantity bought, ask about the income effect before calling the buyers irrational: for the poor, a dearer staple leaves no money for anything else.
- **Security reading.** Rationing in a crisis replaces the price as the constraint. Households then cannot reach their optimum, and the gap between what they would buy and what they may buy is what a black market trades on.

> [!counter] Critiques & Limits
> - **Nobody draws indifference curves.** The model does not claim that people calculate. It claims that they choose *as if* they did. That makes it a model of outcomes, not of the decision process.
> - **Behavioural findings.** Anchoring, loss aversion, present bias and defaults produce systematic deviations from the optimum (see [[Heuristics and Anchoring]] and [[Cognitive Dissonance]]).
> - **Preferences are taken as given and stable.** Where they come from, and how advertising, habit and other people shape them, lies outside the model (see [[Value Change (Inglehart)]]).
> - **Hard to refute.** Almost any choice can be described afterwards as optimal for *some* preferences (see [[Falsificationism]]). The testable content lies in how choices *change* when prices and income change.
> - **Two goods, one person, full information.** Households of several people, goods of unknown quality and choices under uncertainty need extensions.

## Glossary

| Deutsch | English | Definition | Be able to |
|---|---|---|---|
| Budgetbeschränkung (Budgetgerade) | Budget constraint | The limit on the bundles of goods a consumer can afford with a given income and given prices. | apply |
| Indifferenzkurve | Indifference curve | A curve connecting all bundles of goods that give the consumer the same satisfaction. | apply |
| Grenzrate der Substitution | Marginal rate of substitution | The rate at which a consumer is willing to give up one good for another: the slope of the indifference curve. | apply |
| relativer Preis | Relative price | The price of one good in units of another: the slope of the budget constraint. | apply |
| Einkommenseffekt | Income effect | The change in consumption that comes from a price change moving the consumer to a higher or lower indifference curve. | apply |
| Substitutionseffekt | Substitution effect | The change in consumption that comes from a price change moving the consumer along an indifference curve to a point with a different marginal rate of substitution. | apply |
| Giffen-Gut | Giffen good | A good for which a higher price raises the quantity demanded. | define |
| Grenznutzen | Marginal utility | The extra utility from one more unit of a good. | define |
| inferiores Gut | Inferior good | A good of which less is demanded when income rises. | define |
| vollkommene Substitute | Perfect substitutes | Two goods with straight indifference curves. | define |
| vollkommene Komplemente | Perfect complements | Two goods with right-angled indifference curves. | define |
| Nutzen | Utility | A measure of the satisfaction a consumer gets from a bundle of goods. | define |
| Präferenzen | Preferences | What the consumer wants, drawn as indifference curves. | define |
| Haushaltsoptimum | Consumer's optimum | The affordable bundle on the highest indifference curve: marginal rate of substitution equals relative price. | apply |

## Key Connections

- [[Supply and Demand]]: the demand curve is derived from these optimal choices.
- [[Elasticity]]: how strongly the quantity reacts is the sum of income and substitution effect.
- [[Production Possibilities Frontier]]: the same picture for a whole economy. The frontier is the constraint, and its slope is an opportunity cost.
- [[Ten Principles of Economics]]: principles 1 to 4 in one diagram: trade-offs, opportunity cost, thinking at the margin, incentives.
- [[Heuristics and Anchoring]]: how real choices deviate from the optimum.

## Self-Test: Consumer Choice

> [!qard]- 1. What do the budget constraint and the indifference curves each show?
> The budget constraint shows which bundles the consumer **can afford** with her income at given prices. The indifference curves show her **preferences**: each connects bundles she finds equally good.

> [!qard]- 2. What do the slopes of the budget constraint and of an indifference curve measure?
> The budget constraint: the relative price, the rate at which the market swaps the goods. The indifference curve: the marginal rate of substitution, the rate at which the consumer is willing to swap them.

> [!qard]- 3. Name the four properties of indifference curves.
> Higher curves are preferred. They slope downward. They do not cross. They are bowed inward.

> [!qard]- 4. What holds at the consumer's optimum?
> The highest reachable indifference curve touches the budget constraint: MRS = relative price. In utility terms, the last franc spent on each good brings the same extra utility.

> [!qard]- 5. Define the income effect and the substitution effect.
> Substitution effect: the move along the same indifference curve towards the good that became relatively cheaper. Income effect: the move to a higher or lower indifference curve because the price change made the consumer richer or poorer.

> [!qard]- 6. Calculate: income 1,000, pizza costs 10, cola 2. Give the two end points of the budget line and its slope. What changes if cola falls to 1?
> 100 pizzas or 500 litres. Slope: one pizza costs 5 litres. With cola at 1 the line rotates: still 100 pizzas, now 1,000 litres, and one pizza costs 10 litres.

> [!qard]- 7. Compare: how does the budget constraint move when income rises, and how when one price falls?
> Higher income: a parallel shift outward, because the relative price is unchanged. A lower price: a rotation outward around the point on the other good's axis, because the relative price has changed.

> [!qard]- 8. Apply: the wage rises. Why can the hours worked go up or down?
> Leisure becomes dearer, so the substitution effect says work more. The worker is richer, so the income effect says take more leisure. If the income effect is the larger one, hours fall.

> [!qard]- 9. Explain: what has to be true for a good to be a Giffen good?
> It must be an inferior good, and its income effect must outweigh the substitution effect. A dearer staple makes a poor household so much poorer that it gives up better food and buys more of the staple.

> [!qard]- 10. Limit: a critic says "nobody calculates marginal rates of substitution". Does that refute the model?
> No. The model claims that people choose *as if* they optimised, and it is tested on how choices change with prices and income. The fair objection is that real choices deviate systematically (anchoring, defaults).

## Open Questions

- [ ] Is military service pay better analysed as a wage (with income and substitution effect) or as compensation for a duty that leaves no choice of hours?
- [ ] How do rationing and price ceilings change the household's optimum, and who loses most?

## Sources

- [@mankiw2021principles], ch. 21 "The Theory of Consumer Choice": budget constraint, indifference curves, optimum, income and substitution effects, the three applications. [High confidence: standard textbook]
