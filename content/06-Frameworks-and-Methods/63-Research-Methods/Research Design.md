---
title: "Research Design: The Phases of the Research Process"
aliases:
  - Research Design
  - Forschungsdesign
  - Forschungsprozess
  - Phases of the research process
  - Phasen des Forschungsprozesses
type: framework
domain: ["policy"]
courses: ["PS1-HS26", "PolSci-HS26"]
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
draft: false
---

> [!bluf]-
> A research design is the plan that links a **question** to an **answer you can defend**. The standard model of empirical social research has ten steps in two phases:
> - **Conceptual phase** (thinking): research question → theory → hypothesis → concept definition.
> - **Empirical phase** (doing): operationalisation and type of study → selection of units → data collection → data entry → data analysis → publication.
> 
> The rule behind the order: **every step is decided by the one above it.** The question decides the theory, the hypothesis decides what must be measured, and the measurement decides which data you need. Most failed projects did not fail in the analysis. They failed because a step higher up was skipped or left vague.

## Purpose

The model answers one practical problem: an empirical project consists of many decisions, and **a mistake made early cannot be repaired late**. No statistical method rescues a badly measured concept or a sample that cannot answer the question. So the decisions are put in an order in which each can be justified by the one before it.

Use it in two ways:

- **To plan.** Write one sentence for each step *before* you collect anything. Where you cannot write the sentence, the design is not finished.
- **To read.** Take any empirical paper and find each step. A step you cannot find is usually where the paper is weakest.

The sequence follows the textbook model of Schnell, Hill and Esser [@schnell2018methoden]. Diekmann groups the same work into five phases: stating the problem, planning the study, collecting the data, analysing it, reporting it [@diekmann2007empirische]. In English-language political science, King, Keohane and Verba make the same point with four components: research question, theory, data, and use of the data [@king1994designing].

### What a study is for: four aims

Empirical social research is the systematic collection of data on human behaviour and social phenomena, for example by observation, survey or content analysis. Not every study tests a hypothesis:

| Aim | When | What it delivers |
|---|---|---|
| **Exploratory** | The subject is little known and there are no clear expectations | New theory and hypotheses. Mostly qualitative, often interpretive |
| **Descriptive** | The interest is in how things are, not why | Estimates of frequencies and shares. Description and diagnosis instead of explanation |
| **Evaluation** | A practical or political measure is to be judged | An estimate of the effect of one factor: did the measure work? |
| **Testing hypotheses and theories** | There is a theory to check | The influence of one factor on a dependent variable, and the reason for it |

The ten steps below describe the fourth aim. Exploration and testing feed each other in a circle: exploration yields a new hypothesis, the test of it raises new questions, and these are explored again.

> [!info] Two meanings of *Forschungsdesign*
> - **Wide:** the whole plan of a study, from question to publication. This is what the diagram shows.
> - **Narrow:** only the **Untersuchungsform**, the type of study (experiment, survey, case study, …).
> 
> Check which one is meant before you answer a question about "the design".

![[research-process-phases.svg]]

## Components / Steps

### Conceptual phase

1. **Research question** (*Forschungsfrage*)
   
   What do I want to know? A good question is:
   - **open**: its answer is not known in advance, and it is more than a yes/no;
   - **answerable** with evidence, in the time and with the access you have;
   - **relevant**: it matters in the real world, and it adds to what the literature already says [@king1994designing].
   
   Know which kind of question you ask. A **descriptive** question asks *what is the case*. An **explanatory** question asks *why*. Only the second needs a causal hypothesis.
   
1. **Theory building** (*Theoriebildung*)
   
   Why should the answer be one way and not another? A theory is a set of general statements that names a **mechanism**: *X leads to Y because …*. You rarely invent one. You take it from the literature and apply it to your case. Without theory you can still collect data, but you do not know which data matter.
   
1. **Hypothesis formation** (*Hypothesenbildung*)
   
   A hypothesis is the theory turned into a **specific expectation** about your case: *if X, then Y* or *the more X, the more Y*. It must be **falsifiable**: there must be a possible observation that would show it to be wrong [@popper1963conjectures]. It names:
   - the **independent variable** (X, the presumed cause),
   - the **dependent variable** (Y, what is to be explained),
   - the **direction** of the relation.
   
1. **Concept definition** (*Konzeptdefinition*, also *Konzeptspezifikation*)
   
   What do the terms in the hypothesis mean? Words like *trust*, *power* or *security* have many meanings. State which one you use and which dimensions it has. This step is still about meaning, not about measuring.

### The hinge: two decisions taken together

5. **Operationalisation** (*Operationalisierung*)
   
   How do I observe each concept? You assign to every concept one or more **indicators**: observable things that stand for it (an answer on a survey scale, a budget figure, a vote). Two tests decide whether the measurement is good:
   - **Validity** (*Validität*): does the indicator measure the concept, and not something else?
   - **Reliability** (*Reliabilität*): does a repeated measurement give the same result?
   
   A measure can be reliable and still invalid: a scale that always shows 2 kg too much is consistent, and wrong.
   
6. **Type of study** (*Untersuchungsform*)
   
   Which comparison tests the hypothesis? The main choices:
   
   | Choice | Options |
   |---|---|
   | **Control over the cause** | **experiment** (you set X and assign units at random) · **quasi-experiment** (X varies, but not by random assignment) · **non-experimental** (you observe X and Y as they are) |
   | **Time** | **cross-section** (one point in time) · **trend** (same questions, new sample each time) · **panel** (same units, several times) |
   | **Number of cases** | **many cases**, few facts about each (survey, statistics) · **few cases**, many facts about each (case study, comparison) |
   
   The two boxes stand side by side because they limit each other. An experiment needs a cause you can manipulate. A panel needs a measure you can repeat unchanged. A case study allows indicators that no survey could collect.

### Empirical phase

7. **Selection of units** (*Auswahl der Untersuchungseinheiten*)
   
   Who or what is studied? First define the **population** (*Grundgesamtheit*) the claim is about. Then decide: study all of it (*Vollerhebung*) or a **sample** (*Stichprobe*)? Only a **random sample** allows statistical inference from sample to population. With few cases, selection is deliberate. The main danger there: choosing cases by their outcome. If you only study wars, you cannot say what causes war [@king1994designing].
   
1. **Data collection** (*Datenerhebung*)
   
   The three basic methods are **asking** (survey, interview), **observing**, and **content analysis** of documents [@schnell2018methoden]. Data collected by others for another purpose (official statistics, existing surveys) is **secondary data**: cheap, but its concepts and indicators are someone else's.
   
1. **Data entry and preparation** (*Datenerfassung*)
   
   Raw material becomes a data set: answers are coded, entered, checked for errors and documented in a codebook. The step looks trivial and is not. Every coding rule is a small measurement decision.
   
1. **Data analysis** (*Datenanalyse*)
   
   First describe (*what does the data look like?*), then test (*is the expected relation there, and could it be chance?*). The analysis answers the hypothesis. It cannot answer a question the design did not ask.
   
1. **Publication** (*Publikation*)
   
   Report the result **and the way to it**, so that others can check and repeat the study. Results that nobody can check are not yet science. The findings then become part of the literature for the next question: the dashed arrow in the diagram.
   
   Before an article appears in a journal it goes through **peer review**:
   
   1. The researchers write the article and submit it to a journal.
   2. The editors send it to other researchers in the same field (reviewers), usually anonymised.
   3. The reviewers send comments and a recommendation to accept or reject.
   4. The editor decides: **reject**, **revise and resubmit** (several rounds are possible), or **accept**.
   5. If accepted, the article is produced and published.
   
   This takes time. From designing a survey to the printed article, about two years is normal, and a first rejection followed by submission to another journal is common. Preliminary results are often presented at conferences first. For the reader, the journal and its review are a first sign of quality, not a guarantee (see [[Bias in Research]] on publication bias).

## Worked Example

**Topic:** compulsory military service and trust in the armed forces.

| Step | Decision |
|---|---|
| **Research question** | Does serving in a conscript army raise a citizen's trust in the armed forces? |
| **Theory** | Contact: people trust institutions they know from the inside more than those they know only from the media. |
| **Hypothesis** | Citizens who have served trust the armed forces more than citizens who have not. X = service, Y = trust, direction: positive. |
| **Concept definition** | *Trust*: the expectation that the institution fulfils its task competently and in the public interest. *Served*: completed at least basic training. |
| **Operationalisation** | Trust: answer to "How much do you trust the armed forces?" on a scale from 1 to 10. Service: self-report, yes/no. |
| **Type of study** | Non-experimental, cross-sectional survey. An experiment is impossible: nobody can be assigned to military service at random. |
| **Selection of units** | Population: citizens aged 18 and over. Random sample from the population register. |
| **Data collection** | Standardised telephone or online survey. |
| **Data entry** | Code the answers, handle "don't know", check for implausible values. |
| **Data analysis** | Compare mean trust of the two groups. Control for age, sex and political orientation. |
| **Publication** | Report with questionnaire, sample description and limits. |

The table makes the weak point visible, and it lies in the **type of study**, not in the statistics. People are not sorted into service at random: those found unfit, and those who choose civilian service, differ from those who serve *before* any of them has served. A difference in trust may therefore reflect **who serves**, not **what service does**. This is a selection effect. A panel that measures trust before and after service would be the stronger design. That is a decision at step 6 which no analysis at step 10 can replace.

## Strengths & Pitfalls

**Strengths**

- **A checklist against skipped steps.** It forces the decisions that are easy to leave implicit, above all concept definition and selection of units.
- **Makes research checkable.** Each step is a decision that can be stated, criticised and repeated by others.
- **A shared map.** Supervisor, reviewers and readers know where in the process a problem sits.

**Pitfalls**

- **Starting with the data.** "I have a data set, what can I do with it?" turns the order around. The data then decides the question.
- **A topic instead of a question.** "Swiss security policy" is a topic. A question has a question mark and a possible answer.
- **A hypothesis that cannot fail.** "Service may influence trust under certain conditions" is safe and says nothing.
- **Concept and indicator drift apart.** The paper talks about *trust* and measures *satisfaction*.
- **Selection by outcome.** Studying only the cases where Y occurred.
- **Reading the diagram as a one-way street.** See the critique.

> [!counter] Critique
> - **Idealised and linear.** Real research moves back and forth: the data shows that a concept was badly defined, the hypothesis is revised, the sample is extended. The model shows the logic of justification, not the daily practice.
> - **Built for theory-testing, quantitative research.** Qualitative and exploratory studies often run the other way: from material to concepts to theory. For them, hypotheses are a result, not a starting point.
> - **Silent on where questions come from.** The model starts with a research question. It says nothing about who decides what is worth asking: funding, access, politics, the researcher's own interests.
> - **A tidy order can hide a weak inference.** A study can pass every step formally and still say nothing about cause and effect, as the worked example shows.

## Glossary

| Deutsch | English | Definition | Be able to |
|---|---|---|---|
| Forschungsfrage | Research question | The question a study is meant to answer. | apply |
| Theoriebildung | Theory building | Developing an argument for why the expected relation should hold. | apply |
| Hypothesenbildung | Hypothesis formation | Deriving a testable statement from the theory. | apply |
| Konzeptdefinition / Konzeptspezifikation | Concept definition / specification | Stating what a term means and which dimensions it has. | apply |
| Operationalisierung | Operationalisation | Assigning observable indicators to a theoretical concept so that it can be measured. | apply |
| Untersuchungsform | Type of study, research design (narrow sense) | The type of study, for example experiment, survey or case study. | apply |
| Auswahl der Untersuchungseinheiten | Selection of units, sampling | Deciding who or what is studied. | define |
| Grundgesamtheit / Stichprobe | Population / sample | All units a claim is about, and the part of them actually studied. | apply |
| Datenerhebung | Data collection | Gathering information by asking, observing or analysing documents. | define |
| Datenerfassung | Data entry and preparation | Coding, entering and cleaning the collected data. | define |
| Datenanalyse | Data analysis | Evaluating the data to test the hypothesis. | define |
| Begutachtung durch Fachkollegen | Peer review | Assessment of a manuscript by other researchers before publication. | define |
| explorative / deskriptive Studie | Exploratory / descriptive study | A study that looks for hypotheses in a little-known field, or one that describes how things are. | define |
| Evaluierungsstudie | Evaluation study | A study that estimates whether a measure had an effect. | define |
| unabhängige / abhängige Variable | Independent / dependent variable | The supposed cause (X) and the effect to be explained (Y). | apply |
| Validität / Reliabilität | Validity / reliability | Whether an instrument measures what it should, and whether it gives the same result when repeated. | apply |
| Querschnitt / Längsschnitt (Trend, Panel) | Cross-section / longitudinal (trend, panel) | Data collected at one point in time, or at several points. | define |

## Key Connections

- [[CREW]]: the argument of the finished paper. The answer to the research question is the **claim**, the collected data is the **evidence**, and the theory supplies the **warrant**.
- [[General Model Theory]]: operationalisation is a reduction in Stachowiak's sense. An indicator maps a concept and leaves most of it out, for a purpose.
- [[Bias in Research]]: the same steps read from the other side. Each step here is a place where a systematic error can enter.

## Self-Test: Research Design

> [!qard]- 1. Name the ten steps of the research process in order.
> Research question → theory building → hypothesis formation → concept definition → operationalisation **and** type of study (together) → selection of units → data collection → data entry → data analysis → publication.

> [!qard]- 2. What is the difference between concept definition and operationalisation?
> - **Concept definition** says what a term *means* and which dimensions it has.
> - **Operationalisation** says how it is *observed*: which indicator stands for it. The first is about meaning, the second about measurement.

> [!qard]- 3. Why do operationalisation and type of study stand side by side in the diagram?
> Because they are decided together and limit each other. The type of study decides which measurements are possible (an experiment needs a cause you can set, a panel a measure you can repeat). The measurement decides which types of study are feasible.

> [!qard]- 4. What makes a good hypothesis?
> It is derived from a theory, names an independent and a dependent variable and the direction of their relation, and is **falsifiable**: some possible observation would show it to be wrong.

> [!qard]- 5. A measure is reliable but not valid. What does that mean? Give an example.
> It gives the same result every time, but it does not measure the intended concept. Example: counting newspaper articles about the army as a measure of *trust* in the army. The count is repeatable, but it measures attention, not trust.

> [!qard]- 6. In the worked example, why is a cross-sectional survey a weak test?
> Because people are not assigned to service at random. Those who serve differ from those who do not before service begins, so a difference in trust may come from selection, not from service. A panel with measurements before and after would be stronger.

> [!qard]- 7. Apply: "military service may influence trust under certain conditions." What is wrong with this hypothesis, and how do you repair it?
> It cannot fail, so it says nothing. Name X, Y and the direction: "citizens who have served trust the armed forces more than citizens who have not."

> [!qard]- 8. Judge: "I have a data set on conscripts. What could I study with it?" Which rule does this break?
> Every step is decided by the one above it. Starting from the data lets the data choose the question, and a mistake made that early cannot be repaired in the analysis.

## Open Questions

- [ ] How does the model change for a qualitative case study or a legal analysis, where there is no hypothesis test?
- [ ] Where does the literature review sit: before the question, or between question and theory?
- [ ] Which designs allow causal claims when an experiment is impossible, as it almost always is in strategy and security policy?

## Sources

- [@schnell2018methoden]: the phase model of the research process that the diagram follows. I have not checked the step names against the current edition. [Medium confidence]
- [@diekmann2007empirische]: the five-phase version; types of study (cross-section, trend, panel). [Medium confidence]
- [@king1994designing], ch. 1: components of a research design, criteria for a research question, selection on the dependent variable. [High confidence]
- [@popper1963conjectures]: falsifiability as the criterion for a scientific hypothesis. [High confidence: primary]
- The four aims of research and the peer review process from Proseminar I, session of 1 October 2026. [Medium confidence]
- The worked example and the links to CREW and model theory are my own. [Medium confidence]
