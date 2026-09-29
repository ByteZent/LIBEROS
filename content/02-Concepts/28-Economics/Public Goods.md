---
title: Public Goods
aliases:
  - Public Good
  - Samuelson Condition
type: model
domain:
  - economics
  - policy
  - security
courses: []
status: developing
confidence: high
originators:
  - Paul Samuelson
  - Richard Musgrave
created: 2026-09-29
modified: 2026-09-29
review: 2026-10-06
tags:
  - model
  - public-economics
  - market-failure
---

> [!bluf]
> A public good is **non-rival** (my use doesn't reduce yours) and **non-excludable** (non-payers can't be kept out). Markets therefore under-provide it, because everyone has an incentive to free-ride. This is the core economic justification for state provision financed by taxation. **National defence** is the textbook example, which makes this model the bridge between public economics and security policy.

## Question

Why do markets fail to supply some goods that everyone values, such as defence, basic research, clean air or the rule of law?

## Assumptions

- Individuals maximise their own utility and can't be forced to reveal their true valuation.
- The good is **non-rival** in consumption: the marginal cost of one more user is zero.
- The good is **non-excludable**, or exclusion is prohibitively costly.

> [!tip] Test
> Relax *non-excludability* (technology or law makes exclusion possible) and the good becomes a **club good**, which can be sold. Much of the policy debate is about whether exclusion is feasible or desirable.

## Mechanism

1. Because nobody can be excluded, each person benefits whether or not they pay.
2. So each person's best strategy is to under-state their valuation and let others pay: **free-riding**.
3. Voluntary contributions fall short of the efficient level, so the good is **under-provided**.
4. Collective action (usually the state, through compulsory taxation) can close the gap.

## Formal Expression

The two dimensions give four types of goods:

|  | **Excludable** | **Non-excludable** |
|---|---|---|
| **Rival** | Private goods (bread) | Common-pool resources (fisheries) |
| **Non-rival** | Club goods (toll road, streaming) | Public goods (defence, lighthouse) |

**Samuelson condition** for efficient provision: because everyone consumes the same quantity, *individual* marginal valuations are summed (vertical summation):

$$
\sum_{i=1}^{n} MRS_i = MRT
$$

The sum of all individuals' marginal rates of substitution between the public and a private good must equal the marginal rate of transformation (marginal cost). A private market only equates *each* $MRS_i$ with the price, so it misses this condition.

## Predictions & Evidence

| Prediction | Evidence | Verdict |
|---|---|---|
| Voluntary provision falls below the optimum | Public-goods lab experiments: contributions start around 40–60% and decay with repetition | supported |
| Larger groups free-ride more (Olson) | Strong in anonymous settings; communities with monitoring and sanctions do better (Ostrom) | mixed |
| In alliances, large members carry a disproportionate share of defence costs (Olson & Zeckhauser) | Persistent NATO burden-sharing asymmetry | largely supported |

## Policy Implications

- **Tax-financed state provision.** Compulsory financing removes the free-rider option.
- **Alliance burden-sharing.** Collective defence is a public good *among allies*. Smaller members can free-ride on the larger members' [[Deterrence]], which explains the long-running NATO 2%-of-GDP debate.
- **Subsidies and IP rights** for semi-public goods like research: creating artificial excludability to restore incentives.
- **Institutions as public goods.** The [[Rule of Law]] benefits everyone and is costly to maintain, so it is also under-provided without collective commitment.

> [!counter] Critiques & Limits
> - **Coase (1974), "The Lighthouse in Economics":** British lighthouses were long privately financed through port fees. "Publicness" is often an institutional choice, not a technical fact.
> - **Government failure (public choice):** the state faces its own information and incentive problems, so market failure alone doesn't prove state provision is better.
> - **Ostrom:** communities often manage shared resources without either the state or the market.

## Key Connections

- [[Deterrence]]: collective defence as a public good; alliance free-riding
- [[Rule of Law]]: an institutional public good
- [[Policy Cycle]]: market failure as the classic *problem definition* that puts an issue on the agenda

## Open Questions

- [ ] Is cyber defence a public good? Much critical infrastructure is private, so exclusion is partly possible.
- [ ] Does neutrality make a state a free-rider on its neighbours' alliance security?

## Sources

- Paul A. Samuelson, "The Pure Theory of Public Expenditure," *Review of Economics and Statistics* 36, no. 4 (1954). [High confidence: primary]
- Richard A. Musgrave, *The Theory of Public Finance* (McGraw-Hill, 1959). [High confidence]
- Mancur Olson & Richard Zeckhauser, "An Economic Theory of Alliances," *Review of Economics and Statistics* 48, no. 3 (1966). [High confidence]
- Mancur Olson, *The Logic of Collective Action* (Harvard UP, 1965). [High confidence]
- Ronald H. Coase, "The Lighthouse in Economics," *Journal of Law and Economics* 17, no. 2 (1974). [High confidence]
- Elinor Ostrom, *Governing the Commons* (Cambridge UP, 1990). [High confidence]
