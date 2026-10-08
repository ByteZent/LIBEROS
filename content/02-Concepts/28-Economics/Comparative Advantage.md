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
qard-sets: ["MikroEcon Test 1"]
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
> <!-- qard-important -->
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
> <!-- qard-write -->
> The model assumes that the partner delivers. If supply can be cut in a crisis, efficiency becomes fragility. Stockpiles, home food production and a defence industry buy security at the cost of some welfare.

> [!qard]- 8. Calculate: who has the absolute and who the comparative advantage? The numbers are hours per unit.
> Country A needs 2 hours for a watch and 1 hour for a kilo of cheese. Country B needs 8 and 2 hours.
> <!-- qard-answer -->
> A has the absolute advantage in **both** goods. A has the comparative advantage in **watches**, B in **cheese**.
> <!-- qard-solution -->
> 1. Absolute: A needs less time for both goods ($2 < 8$ and $1 < 2$).
> 2. A watch costs A $2 / 1 = 2$ kilos of cheese and B $8 / 2 = 4$ kilos. A gives up less: advantage in watches.
> 3. A kilo of cheese costs A ½ watch and B ¼ watch. B gives up less: advantage in cheese.
> <!-- qard-variant -->
> North needs 10 hours for a bicycle and 5 hours for a radio. South needs 12 and 4 hours.
> <!-- qard-answer -->
> North has the absolute and the comparative advantage in **bicycles**, South both in **radios**.
> <!-- qard-solution -->
> 1. Absolute: North is faster at bicycles ($10 < 12$), South at radios ($4 < 5$).
> 2. A bicycle costs North $10 / 5 = 2$ radios and South $12 / 4 = 3$ radios. North gives up less.
> 3. A radio costs North ½ bicycle and South ⅓ bicycle. South gives up less.
> <!-- qard-variant -->
> Workshop A needs 6 hours for a table and 3 hours for a chair. Workshop B needs 4 hours and 1 hour.
> <!-- qard-answer -->
> B has the absolute advantage in **both** goods. A has the comparative advantage in **tables**, B in **chairs**.
> <!-- qard-solution -->
> 1. Absolute: B needs less time for both goods ($4 < 6$ and $1 < 3$).
> 2. A table costs A $6 / 3 = 2$ chairs and B $4 / 1 = 4$ chairs. A gives up less: advantage in tables.
> 3. A chair costs A ½ table and B ¼ table. B gives up less: advantage in chairs.

> [!qard]- 9. Calculate with the same countries (watch: 2 and 8 hours, cheese: 1 and 2 hours): each has 16 hours and splits them evenly without trade. Then B makes only cheese and A moves 4 hours from cheese to watches. How does total output change?
> It rises from 5 to **6 watches**, with 12 kilos of cheese as before. This extra output is the gain from trade the two can share.
> <!-- qard-solution -->
> 1. Without trade, A: $8 / 2 = 4$ watches and $8 / 1 = 8$ kilos of cheese.
> 2. Without trade, B: $8 / 8 = 1$ watch and $8 / 2 = 4$ kilos. Together 5 watches, 12 kilos.
> 3. Specialised, B: $16 / 2 = 8$ kilos of cheese.
> 4. Specialised, A: $12 / 2 = 6$ watches and $4 / 1 = 4$ kilos. Together 6 watches, 12 kilos.

> [!qard]- 10. Apply: a watch costs A 2 kilos of cheese and B 4 kilos. They are to trade at 5 kilos of cheese per watch. Who refuses, and why?
> **B.** It can make a watch itself for 4 kilos of cheese and would pay 5 by trading. The price has to lie between the two opportunity costs, between 2 and 4 kilos.

> [!qard]- 11. Calculate: who has the comparative advantage in what? The numbers are output per hour.
> <!-- qard-important -->
> In one hour Anna bakes 6 loaves or 3 cakes, Ben 2 loaves or 2 cakes.
> <!-- qard-answer -->
> **Anna in bread, Ben in cake**, although Anna is more productive at both.
> <!-- qard-solution -->
> 1. The numbers are **output per hour**, not time per unit. The opportunity cost of a good is then: output of the other good divided by output of this good.
> 2. A cake costs Anna $6 / 3 = 2$ loaves and Ben $2 / 2 = 1$ loaf. Ben gives up less.
> 3. A loaf costs Anna ½ cake and Ben 1 cake. Anna gives up less.
> <!-- qard-variant -->
> In one hour Clara sews 10 shirts or 5 pairs of trousers, David 6 shirts or 2 pairs of trousers.
> <!-- qard-answer -->
> **Clara in trousers, David in shirts**, although Clara is more productive at both.
> <!-- qard-solution -->
> 1. Output per hour: the opportunity cost of a good is the output of the other good divided by the output of this good.
> 2. A pair of trousers costs Clara $10 / 5 = 2$ shirts and David $6 / 2 = 3$ shirts. Clara gives up less.
> 3. A shirt costs Clara ½ pair and David ⅓ pair. David gives up less.
> <!-- qard-variant -->
> In one hour workshop X overhauls 4 engines or 8 gearboxes, workshop Y 3 engines or 3 gearboxes.
> <!-- qard-answer -->
> **Y in engines, X in gearboxes**, although X is more productive at both.
> <!-- qard-solution -->
> 1. Output per hour: the opportunity cost of a good is the output of the other good divided by the output of this good.
> 2. An engine costs X $8 / 4 = 2$ gearboxes and Y $3 / 3 = 1$ gearbox. Y gives up less.
> 3. A gearbox costs X ½ engine and Y 1 engine. X gives up less.

> [!qard]- 12. Judge: "A country that makes everything more productively than its neighbours cannot gain from trade."
> False. What counts is not productivity (absolute advantage) but the ratio of opportunity costs. As long as these differ, both sides gain.

> [!qard]- 13. Name the assumptions of the model of comparative advantage.
> Two producers, two goods, one input (working time). Constant opportunity costs. No transport costs and no trade barriers. The partner delivers.

> [!qard]- 14. The model shows that a country gains from trade. Does every person in the country gain?
> No. The model shows only that total output rises. It says nothing about who gets it: workers in shrinking sectors can lose.

> [!qard]- 15. How does trade show up in a country's production possibilities frontier?
> The frontier does not move, because resources and technology are the same. By specialising and trading, the country can **consume** combinations outside its own frontier.

## Open Questions

- [ ] How large is the efficiency loss that Switzerland accepts for security of supply (food, energy, armaments)?
- [ ] When does interdependence prevent conflict, and when does it become a weapon?

## Sources

- [@mankiw2021principles], chapter on interdependence and the gains from trade: the farmer and rancher example. Taken from the lecture of 24 September 2026. [High confidence: standard textbook]
- [@ricardo1817principles]: comparative advantage. The lecture slide gives 1816; the first edition appeared in 1817. [High confidence: primary]
- [@smith1776wealth]: division of labour and trade. [High confidence: primary]
- The security reading is my own. [Low confidence]
