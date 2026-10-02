---
title: "Bias in Research: How to Spot It in Studies and Papers"
aliases:
  - Bias in Research
  - Research Bias
  - Systematic error
  - Verzerrung
  - Systematischer Fehler
type: framework
domain: ["policy"]
courses: ["PS1-HS26"]
qard-deck: PS1-HS26
status: seedling
confidence: medium
created: 2026-10-01
modified: 2026-10-02
review: 
tags:
  - framework
  - methods
  - research-design
  - bias
draft: false
---

> [!bluf]
> A bias is a **systematic error**: something in the way a study was built, run or reported pushes the result in one direction. More data does not remove it. A large biased study is only more precisely wrong.
> 
> To find bias in a paper, read it along the research process and ask one question per stage:
> - **Design**: could something else explain the result?
> - **Selection**: who is missing, and why?
> - **Measurement**: does the number mean what the paper says?
> - **Analysis**: was the test fixed before the data was seen?
> - **Reporting**: which results never got printed?
> 
> Then ask the question that turns a suspicion into a judgement: **in which direction does this bias push the result, and how far?** A bias that works against the paper's conclusion makes the finding stronger, not weaker.

## Purpose

Every measurement has error. There are two kinds, and they behave differently:

| | **Random error** (*Zufallsfehler*) | **Systematic error = bias** (*Verzerrung*) |
|---|---|---|
| Direction | scatters around the true value | pushes one way |
| More cases | averages out | stays, and looks more convincing |
| Statistics show it? | yes: standard errors, confidence intervals | no: you find it only by reading the design |
| Picture | shots spread around the centre | a tight group, off the centre |

This is why the method section matters more than the results table. A *p*-value says how likely the result is under chance. It says nothing about whether the study measured the right people in the right way.

Bias is rarely fraud. It comes from ordinary decisions: who was easy to reach, which question was easy to ask, which result was easy to publish. The term covers three different things that are worth keeping apart:

- **Bias in the study**: selection, measurement, confounding. The subject of this note.
- **Bias in the literature**: what gets published and cited.
- **Bias in the person**: the cognitive biases of the researcher, and of the reader.

The stages below follow the [[Research Design|research process]]. The classic catalogue of bias types comes from Sackett, who listed them by the stage of research at which they occur [@sackett1979bias]. Shadish, Cook and Campbell call the same problems **threats to validity** and sort them by the kind of conclusion they damage [@shadish2002experimental].

![[research-bias-map.svg]]

## Components / Steps

### 1. Design: could something else explain the result?

These biases concern **internal validity**: is the claimed cause really the cause?

| Bias | What happens | How to spot it in a paper |
|---|---|---|
| **Confounding** (*Störvariable, Drittvariable*) | A third factor drives both the cause and the effect. The correlation is real, the causal claim is not. | No random assignment, and the list of control variables is short or not justified. Ask: what differs between the groups *besides* X? |
| **Reverse causality** | Y causes X, not X causes Y. | Both are measured at the same time (cross-section). Words like *leads to* without any time order. |
| **No comparison group** | An effect is claimed from the treated cases alone. | "After the reform, X improved." Compared to what? What happened where there was no reform? |
| **Regression to the mean** | Cases chosen because they were extreme move back towards the average on their own. | Units were selected *because* they were very bad or very good, and then "improved" or "declined". |
| **Ecological fallacy** (*ökologischer Fehlschluss*) | A relation between groups is read as a relation between individuals. | Data on regions or countries, conclusions about persons. |

### 2. Selection: who is missing, and why?

| Bias | What happens | How to spot it in a paper |
|---|---|---|
| **Selection on the outcome** | Only cases where Y occurred are studied. Whatever they share looks like a cause, although the failures may share it too. | "We studied 20 successful …" Are there cases without the outcome in the sample? [@geddes1990how] |
| **Survivorship bias** | Only those who came through a filter can be observed. | Data on existing firms, returning units, published authors, living veterans. Ask what happened to the rest. |
| **Self-selection** | People choose to take part, and the choice is related to the outcome. | Online polls, volunteers, "respondents who chose to …". |
| **Non-response** (*Antwortausfall*) | Those who do not answer differ from those who do. | Response rate missing or low, and no comparison of respondents with the population. |
| **Attrition** (*Panelmortalität*) | People drop out during the study, and not at random. | The *n* shrinks from table to table with no account of who left. |
| **Convenience sample** | The units studied are those that were easy to reach. | Students, one unit, one country. The title claims more than the sample covers. |

Two reference cases:

- **The returning bombers.** In the Second World War, the statistician Abraham Wald worked on where to protect aircraft, using damage data from planes that had come back. His method started from the fact that the planes shot down were missing from the data: hits on the returning planes showed where a plane could be hit and still fly home [@mangel1984abraham]. The popular version of the story (*armour the places without holes*) is simplified, but the point holds.
- **WEIRD samples.** Much of behavioural science rests on participants from Western, educated, industrialised, rich and democratic societies, who are unusual compared with the rest of humanity [@henrich2010weirdest]. This is a problem of **external validity**: the finding may be correct for the sample and not travel.

### 3. Measurement: does the number mean what the paper says?

| Bias | What happens | How to spot it in a paper |
|---|---|---|
| **Invalid indicator** | The measure stands for something other than the concept. | Compare the concept in the title with the actual survey item or data source. They often differ. |
| **Social desirability** (*soziale Erwünschtheit*) | People give the answer that looks good. | Self-reports on sensitive matters: obedience, prejudice, drinking, voting, misconduct. |
| **Recall bias** | Memory is selective, and the outcome shapes what is remembered. | People are asked about the past *after* they know how things ended. |
| **Question wording and order** | The question suggests the answer. | The questionnaire is not printed. If it is: leading words, one-sided answer scales. |
| **Observer expectancy** (*Versuchsleitereffekt*) | The person who measures or codes knows the hypothesis and sees what fits. | Coding done by the authors alone, no second coder, no blinding. |
| **Reactivity** (Hawthorne effect) | People behave differently because they know they are being studied. | Open observation, exercises with evaluators present. |

### 4. Analysis: was the test fixed before the data was seen?

| Bias | What happens | How to spot it in a paper |
|---|---|---|
| ***P*-hacking** | Many analyses are tried, the significant one is reported. Simmons et al. show by simulation that a few such free choices can raise the rate of false positives from 5 % to over 60 % [@simmons2011falsepositive]. | Results just under *p* = .05. Odd control variables. Outcomes measured but not reported. No pre-registration. |
| **HARKing** | *Hypothesising after the results are known*: a pattern found in the data is presented as if it had been predicted [@kerr1998harking]. | A surprisingly exact hypothesis that fits the result perfectly, with thin theory behind it. |
| **Dropped cases** | Outliers or "invalid" cases are removed after the result was seen. | Exclusion rules stated without a reason, or the *n* differs between analyses. |
| **Subgroup hunting** | No effect overall, so the sample is split until an effect appears somewhere. | "The effect holds only for women under 30 in urban areas", with no reason given in advance. |

### 5. Reporting: which results never got printed?

Here the bias is no longer in one study but in the **literature as a whole**.

| Bias | What happens | How to spot it |
|---|---|---|
| **Publication bias** | Significant results are published, null results stay in the file drawer [@rosenthal1979file]. The published record overstates effects. | You cannot see it in one paper. Look for meta-analyses, replications and pre-registered studies. |
| **Spin** | The abstract and conclusion claim more than the results show. | Read the results table before the abstract. Compare the verbs: *is associated with* in the results, *causes* in the conclusion. |
| **Citation bias** | Supporting studies are cited, contradicting ones are left out. | The literature review contains no study that disagrees. |
| **Funding and interest** | The sponsor or author gains from one result. | Funding statement, the author's institution, think-tank or industry reports. An interest is a reason to read more closely, not a refutation. |

How large is the problem?

- In a set of social science experiments that were all approved in advance, studies with strong results were far more likely to be published than studies with null results. Most null results were never even written up [@franco2014publication].
- When 100 published psychology studies were repeated, 97 % of the originals had reported a significant result, but only 36 % of the replications did, and the effects were on average about half as large [@opensciencecollaboration2015estimating].
- Ioannidis argues from this logic that a published finding is less likely to be true when studies are small, effects are small, analysis is flexible, and interests are strong [@ioannidis2005why].

### 6. The reader

The last bias is your own. **Confirmation bias** is the tendency to look for, and to accept, what fits a belief already held [@nickerson1998confirmation]. In reading it shows as an asymmetry: a paper that disagrees with you gets the full check, a paper that agrees gets a nod. The test is simple and uncomfortable: *would I accept this method if the result were the opposite?*

Two more errors of the reader, and of everyday argument:

| Error | What happens | How to spot it |
|---|---|---|
| **Hindsight bias** (*Rückschaufehler*) | Once the outcome is known, it seems to have been predictable. "I said so from the start." | Ask what was actually written down *before* the outcome. An explanation that only appears afterwards has predicted nothing. |
| **Anecdotal evidence** | A single vivid case is taken as proof of a general rule. It is an informal fallacy: hasty generalisation, the logic of the pub table. | "I know someone who …" Ask how the case was chosen and how many cases point the other way. |

Hindsight bias matters most for after-action reviews and for judging past decisions: the commander did not know what the reviewer knows. Anecdotes are not worthless. They can show that something is *possible* and suggest a hypothesis. They cannot show how *common* it is.

### Reading routine

1. **Find the claim.** One sentence: X causes / is related to Y, for population P.
2. **Read the method section before the results.** Design, sample, measures.
3. **Go through the five questions** and note every suspected bias.
4. **For each one, state the direction.** Does it make the effect look larger, smaller, or can it go either way?
5. **Weigh.** Which biases push towards the paper's conclusion? Only those threaten it.
6. **Look outside the paper.** Has it been replicated? Do other designs find the same?
7. **Check yourself.** Apply the opposite-result test.

## Worked Example

An **invented** abstract, built to contain typical problems:

> *"We analyse 24 successful counterinsurgency campaigns since 1945. In 21 of them, the government used a population-centric approach. Interviews with 60 senior officers who served in these campaigns confirm that winning the population was decisive. We conclude that population-centric counterinsurgency leads to victory."*

| What the paper says | Suspected bias | Direction |
|---|---|---|
| "24 **successful** campaigns" | **Selection on the outcome.** If failed campaigns used the same approach just as often, it explains nothing. | Towards the conclusion |
| "since 1945", from the available literature | **Survivorship / availability.** Well-documented campaigns are those that Western armies fought and wrote about. | Unclear |
| "population-centric approach" | **Measurement.** Who coded the approach, and by what rule? If the authors coded it knowing the outcome, **observer expectancy**. | Towards the conclusion |
| "interviews with senior officers … confirm" | **Recall bias** and **social desirability**: winners explain their success after the fact, in the terms of today's doctrine. | Towards the conclusion |
| "leads to victory" | **Confounding** (strong states may both choose this approach and win for other reasons) and **spin** (a share of 21 out of 24 becomes a causal law). | Towards the conclusion |

**Judgement:** four of five biases push in the direction of the claim, and the first alone is enough to block it. The paper may still be right. It has just not shown it. What would: adding the failed campaigns, coding the approach by a rule fixed in advance and applied by someone who does not know the outcomes, and using sources written during the campaigns.

## Strengths & Pitfalls

**Strengths**

- **Gives critique a structure.** "I am not convinced" becomes "the sample contains only successes, so the comparison is missing".
- **Works without statistics.** Most biases are visible in the method section, in plain language.
- **Works both ways.** The same five questions test your own [[Research Design|design]] before you collect anything.

**Pitfalls**

- **Naming instead of arguing.** "This could be selection bias" is not yet a critique. Say who is missing and which way that pushes the result.
- **Hunting only in papers you dislike.** That is confirmation bias with a checklist.
- **Demanding the perfect study.** Every study has biases. The question is whether they are large enough, and point the right way, to overturn the conclusion.
- **Mixing up bias and small samples.** A small sample gives imprecise results, not biased ones.

> [!counter] Critique
> - **Bias-spotting can dismiss anything.** Since every study has some weakness, a list of possible biases is always available. Without direction and size it is rhetoric. Used selectively, it protects a belief instead of testing it.
> - **A checklist does not see what is not on it.** The tables above come from survey and experimental research. Biases of archives, of translation, of who was allowed to write history at all are harder to list.
> - **"Bias" assumes a true value.** The idea of systematic error presupposes something that could be measured without it. Interpretive and qualitative traditions doubt that this holds for social meaning, and speak of *positionality* instead: the researcher's standpoint is to be declared, not removed.
> - **The reforms have costs too.** Pre-registration and replication fit experiments well. They fit case studies and historical work badly, and can push research towards what is easy to pre-register.

## Glossary

| Deutsch | English | Definition | Be able to |
|---|---|---|---|
| Verzerrung, systematischer Fehler | Bias, systematic error | An error that pushes results in one direction and does not shrink with more data. | apply |
| Zufallsfehler | Random error | Unsystematic error that averages out as the number of observations grows. | define |
| Störvariable, Drittvariable | Confounder, third variable | A factor that influences both the supposed cause and the effect. | apply |
| Scheinkorrelation | Spurious correlation | A statistical relation between two variables that is produced by a third and is not causal. | apply |
| Umgekehrte Kausalität | Reverse causality | The supposed effect is in fact the cause. | define |
| Selektionsverzerrung, Stichprobenverzerrung | Selection bias | Bias because the cases studied differ systematically from the population the claim is about. | apply |
| Antwortausfall | Non-response | Selected persons do not take part in a survey or skip questions. | define |
| Panelmortalität, Ausfall | Attrition | Participants drop out of a study over time. | define |
| Soziale Erwünschtheit | Social desirability | Respondents give the answer they think is socially approved. | apply |
| Versuchsleitereffekt | Observer / experimenter effect | The researcher's expectations influence the behaviour of participants or the recording of results. | define |
| Publikationsbias | Publication bias | Significant results are published more often than null results, so the literature overstates effects. | apply |
| Bestätigungsfehler | Confirmation bias | The tendency to look for and accept what fits a belief already held. | apply |
| Rückschaufehler | Hindsight bias | Once the outcome is known, it seems to have been predictable. | apply |
| Anekdotische Evidenz | Anecdotal evidence | A single vivid case used as proof of a general rule. | define |
| Vorschnelle Generalisierung | Hasty generalisation | Drawing a general conclusion from too few cases. | define |
| Ökologischer Fehlschluss | Ecological fallacy | Inferring the behaviour of individuals from data about groups. | define |
| Interne / externe Validität | Internal / external validity | Whether the causal conclusion holds within the study, and whether it can be generalised beyond it. | apply |

## Key Connections

- [[Research Design]]: the same steps, seen from the side of the author. Each bias here is a decision there that went wrong.
- [[CREW]]: a bias is a defect in the **evidence**. Naming the strongest bias in your own study is **acknowledgment and response**.
- [[Cognitive Warfare]]: uses the reader's biases on purpose. What is a hazard in research is a tool there.
- [[General Model Theory]]: every study is a reduced model of its subject. Bias is where the reduction leaves out something the conclusion depends on.

## Self-Test: Research Bias

> [!qard]- 1. What is the difference between random error and bias? Why does a larger sample help with only one of them?
> - **Random error** scatters in both directions and averages out as cases are added.
> - **Bias** is systematic: it pushes one way, so adding cases repeats the same error and only narrows the confidence interval around the wrong value.

> [!qard]- 2. Name the five stages and the question to ask at each.
> - **Design:** could something else explain the result?
> - **Selection:** who is missing, and why?
> - **Measurement:** does the number mean what the paper says?
> - **Analysis:** was the test fixed before the data was seen?
> - **Reporting:** which results never got printed?

> [!qard]- 3. A study of 30 states that fought wars finds that all of them had rising military budgets beforehand. What is wrong?
> **Selection on the outcome.**
> 
> Only cases with war were studied. If states that stayed at peace also had rising budgets, the budgets explain nothing. The sample needs cases without war.

> [!qard]- 4. What is confounding? Give an example.
> A third factor causes both the supposed cause and the effect. Example: officers who attended a staff course are promoted faster. But they were selected for the course *because* they were already rated highly, and that rating also drives promotion.

> [!qard]- 5. Why can publication bias not be seen in a single paper?
> Because it is a property of the literature: it lies in the studies that are *not* there. A single paper can be flawless and still be part of a distorted record. It shows only across studies: in meta-analyses, replications and pre-registered work.

> [!qard]- 6. You have found a bias in a paper. Which question comes next, and why?
> **In which direction does it push the result, and how strongly?** A bias that works against the paper's conclusion means the true effect is probably larger than reported. Only a bias that pushes towards the conclusion, and is large enough, threatens it.

> [!qard]- 7. What is the difference between *p*-hacking and HARKing?
> - ***P*-hacking** changes the **analysis** until a significant result appears.
> - **HARKing** changes the **hypothesis** after the result is known and presents it as a prediction. Both make a chance finding look like a test that was passed.

> [!qard]- 8. Apply: a study interviews officers from successful campaigns, who say the population-centric approach decided the outcome. Name two biases and their direction.
> Selection on the outcome: the failed campaigns are missing. Recall bias and social desirability: winners explain their success afterwards. Both push towards the paper's conclusion, so both threaten it.

> [!qard]- 9. Apply: units picked for retraining because of very poor scores do better afterwards. Does that show the retraining works?
> No. This is regression to the mean: cases chosen because they were extreme move back towards the average on their own. You need equally poor units without retraining as a comparison group.

## Open Questions

- [ ] Which of these biases apply to qualitative case studies and document analysis, and which need a different vocabulary?
- [ ] How do intelligence assessments deal with the same problems (source bias, mirror imaging)? Is a structured analytic technique a kind of pre-registration?
- [ ] Is there publication bias in military lessons-learned literature: are failed operations written up as often as successful ones?

## Sources

- [@sackett1979bias]: the classic catalogue of biases, ordered by stage of research. Written for medicine; I use only the idea of ordering by stage. [Medium confidence]
- [@shadish2002experimental]: threats to internal, external, construct and statistical conclusion validity. [High confidence]
- [@geddes1990how]: selection on the dependent variable in comparative politics. [High confidence]
- [@king1994designing]: the same point as a rule of research design. [High confidence]
- [@mangel1984abraham]: what Wald actually did with the aircraft damage data. [Medium confidence: I rely on the common summary, not on a close reading]
- [@henrich2010weirdest]: WEIRD samples. [High confidence]
- [@simmons2011falsepositive]: researcher degrees of freedom, false-positive rates. [High confidence]
- [@kerr1998harking]: HARKing. [High confidence]
- [@rosenthal1979file]: the file-drawer problem. [High confidence]
- [@franco2014publication]: publication bias measured in social science experiments. [High confidence]
- [@opensciencecollaboration2015estimating]: replication rates in psychology. [High confidence]
- [@ioannidis2005why]: conditions under which published findings are likely to be false. The title's claim is itself disputed. [Medium confidence]
- [@nickerson1998confirmation]: confirmation bias. [High confidence]
- Hindsight bias and anecdotal evidence from Proseminar I, session of 24 September 2026. No source for them in my library yet. [Medium confidence]
- The five-question routine, the worked example and the self-test cases are my own. [Medium confidence]
