---
title: "Comparative Advantage"
aliases:
  - Komparativer Vorteil
  - Absolute advantage
  - Absoluter Vorteil
  - Gains from trade
  - Handelsvorteile
  - Specialisation and trade
type: model
domain: ["economics", "ir"]
courses: ["MikroEcon-HS26"]
qard-deck: MikroEcon-HS26
status: seedling
confidence: medium
created: 2026-10-01
modified: 2026-10-02
review: 
originators:
  - David Ricardo
tags:
  - model
  - economics
  - trade
draft: false
---

> [!bluf]
> Trade pays even for someone who is better at **everything**. What decides who should produce what is not who needs fewer inputs (**absolute advantage**) but who gives up less of the other good (**comparative advantage**, the lower **opportunity cost**).
>
> If each side specialises in the good where its opportunity cost is lower and then trades, total output rises and **both** can consume more than before. This is why interdependence, not self-sufficiency, is the normal state of economies.

## Question

Why do people and countries specialise and trade, even when one of them could produce every good more cheaply alone?

## Assumptions

- Two producers, two goods, one input (working time).
- Constant opportunity costs: the [[Production Possibilities Frontier]] of each producer is a straight line.
- No transport costs, no trade barriers, and the partner delivers.

> [!tip] Test
> Drop "the partner delivers". If supply can be cut off in a crisis, the gain from trade has to be weighed against the risk of dependence. That is where the security debate sits.

## Mechanism

Two ways to measure the cost of producing a good:

| Measure | Question | Gives |
|---|---|---|
| **Inputs** per unit of output | Who needs less time? | **Absolute advantage** (productivity) |
| **Opportunity cost** | Who gives up less of the other good? | **Comparative advantage** |

A producer can have an absolute advantage in both goods. Nobody can have a comparative advantage in both, because a low opportunity cost in one good is by definition a high opportunity cost in the other.

### Worked example: farmer and rancher

| | Minutes per ounce of meat | Minutes per ounce of potatoes | Output in 8 hours: meat | Output in 8 hours: potatoes |
|---|---|---|---|---|
| **Farmer** | 60 | 15 | 8 oz | 32 oz |
| **Rancher** | 20 | 10 | 24 oz | 48 oz |

The rancher is faster at both: he has the **absolute advantage** in meat and in potatoes.

| Opportunity cost of … | 1 oz meat | 1 oz potatoes |
|---|---|---|
| **Farmer** | 4 oz potatoes | ¼ oz meat |
| **Rancher** | 2 oz potatoes | ½ oz meat |

- The **rancher** gives up less for meat (2 < 4): comparative advantage in **meat**.
- The **farmer** gives up less for potatoes (¼ < ½): comparative advantage in **potatoes**.

| | Farmer: meat | Farmer: potatoes | Rancher: meat | Rancher: potatoes |
|---|---|---|---|---|
| Without trade: production = consumption | 4 | 16 | 12 | 24 |
| With trade: production | 0 | 32 | 18 | 12 |
| Trade | gets 5 | gives 15 | gives 5 | gets 15 |
| With trade: consumption | 5 | 17 | 13 | 27 |
| **Gain** | **+1** | **+1** | **+1** | **+3** |

The price here is 3 oz of potatoes for 1 oz of meat. It lies **between the two opportunity costs** (2 and 4). Any price in that range leaves both better off.

## Formal Expression

Producer A has the comparative advantage in good X if

$$
OC_A(X) < OC_B(X)
$$

and trade benefits both at any price $p$ with

$$
OC_{\text{low}}(X) < p < OC_{\text{high}}(X)
$$

## Predictions & Evidence

| Prediction | Evidence | Verdict |
|---|---|---|
| Countries export goods in which their opportunity cost is low | Broad patterns of trade fit, with many exceptions from policy, transport costs and scale | mixed |
| Opening to trade raises total consumption | Supported on average | supported |
| Everyone inside a country gains | Not predicted by the model at all. Workers in shrinking sectors can lose | not a claim of the model |

## Policy Implications

- **Trade deficits are not bad as such.** Tariffs protect one sector at the cost of total welfare.
- **Division of labour applies to people too.** Whoever is better at everything should still do what they are *relatively* best at and hand over the rest. This is an argument for delegation.
- **Security reading.** Specialisation creates dependence. A small, trade-dependent state gains a lot from trade and is exposed when supply chains are cut or used as pressure. Stockpiles, domestic food production and a home defence industry are deliberate departures from comparative advantage, paid for with efficiency.

> [!counter] Critiques & Limits
> - **Gains for the country are not gains for everyone.** The model shows that total output rises. It says nothing about who gets it.
> - **Static.** Comparative advantage is taken as given. In reality it can be built (education, industrial policy), which is the argument for protecting young industries.
> - **Ignores risk.** Efficiency under normal conditions can mean fragility under blockade, war or pandemic.
> - **Constant costs are unrealistic.** With rising opportunity costs, specialisation is usually partial, not complete.

## Origins & Evolution

1. **Adam Smith** explained the gains from the division of labour and trade, in terms of absolute advantage [@smith1776wealth].
2. **David Ricardo** showed that trade pays even without any absolute advantage, as long as opportunity costs differ [@ricardo1817principles].
3. Modern trade theory builds on Ricardo and adds differences in resources, economies of scale and firm-level effects.

## Glossary

| Deutsch | English | Definition | Be able to |
|---|---|---|---|
| komparativer Vorteil | Comparative advantage | Producing a good at a lower opportunity cost than another producer. | apply |
| absoluter Vorteil | Absolute advantage | Producing a good with fewer inputs than another producer. | apply |
| Opportunitätskosten | Opportunity cost | What must be given up to obtain something: the best alternative forgone. | apply |
| Arbeitsteilung | Division of labour | Splitting production into tasks carried out by different people or countries. | define |
| Spezialisierung | Specialisation | Concentrating on the production of what one does relatively best. | define |
| Handelsgewinn | Gain from trade | The increase in consumption made possible by specialisation and trade. | define |
| Autarkie / Selbstversorgung | Autarky / self-sufficiency | An economy that produces everything it consumes and does not trade. | define |
| Interdependenz | Interdependence | Mutual dependence that arises from specialisation and trade. | define |
| Aussenhandel | Foreign trade | Trade in goods and services across national borders. | translate |

## Key Connections

- [[Production Possibilities Frontier]]: the slope of each producer's frontier *is* the opportunity cost. Trade lets both consume outside their own frontier.
- [[Ten Principles of Economics]]: principle 5 (trade can make everyone better off) and principle 2 (opportunity cost).
- [[Supply and Demand]]: explains at which price inside the range the trade actually happens.
- [[Sovereign Territorial State]]: the tension between economic interdependence and the wish for autonomy.

## Self-Test: Comparative Advantage

> [!qard]- 1. What is the difference between absolute and comparative advantage?
> Absolute: needing fewer inputs per unit of output. Comparative: having the lower opportunity cost.

> [!qard]- 2. The rancher is better at both goods. Why does he still gain from trade?
> His opportunity cost of meat (2 oz potatoes) is lower than the farmer's (4 oz). By producing more meat and buying potatoes for less than they would cost him to grow, he ends up with more of both.

> [!qard]- 3. In which range must the price lie so that both gain?
> Between the two opportunity costs: here between 2 and 4 oz of potatoes per oz of meat.

> [!qard]- 4. Country A needs 5 hours for each of two goods, country B needs 10 and 15 hours. Is trade worthwhile?
> Yes. A's opportunity cost of good 1 is 1 unit of good 2. B's is 10/15 = ⅔. B has the comparative advantage in good 1, A in good 2, although A is faster at both.

> [!qard]- 5. Can one producer have a comparative advantage in both goods?
> No. The opportunity cost of one good is the inverse of the other.

> [!qard]- 6. Calculate: the farmer needs 60 minutes per ounce of meat and 15 per ounce of potatoes, the rancher 20 and 10. Who has the comparative advantage in what?
> Meat costs the farmer 4 oz of potatoes and the rancher 2: the rancher has it in meat. Potatoes cost the farmer ¼ oz of meat and the rancher ½: the farmer has it in potatoes.

> [!qard]- 7. Limit: why might a small state deliberately not follow its comparative advantage?
> The model assumes that the partner delivers. If supply can be cut in a crisis, efficiency becomes fragility. Stockpiles, home food production and a defence industry buy security at the cost of some welfare.

## Open Questions

- [ ] How large is the efficiency loss that Switzerland accepts for security of supply (food, energy, armaments)?
- [ ] When does interdependence prevent conflict, and when does it become a weapon?

## Sources

- [@mankiw2021principles], chapter on interdependence and the gains from trade: the farmer and rancher example. Taken from the lecture of 24 September 2026. [High confidence: standard textbook]
- [@ricardo1817principles]: comparative advantage. The lecture slide gives 1816; the first edition appeared in 1817. [High confidence: primary]
- [@smith1776wealth]: division of labour and trade. [High confidence: primary]
- The security reading is my own. [Low confidence]
