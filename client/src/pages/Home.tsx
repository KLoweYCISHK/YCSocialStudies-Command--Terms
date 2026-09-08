import { FormEvent, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FilePlus2,
  Lightbulb,
  Menu,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type TierKey = "foundation" | "relational" | "source";
type YearGroup = "year7" | "year8" | "year9";

type RubricRow = {
  marks: string;
  descriptor: string;
};

type Term = {
  id: string;
  label: string;
  tier: TierKey;
  eyebrow: string;
  summary: string;
  ask: string;
  examples: string[];
  rubric: RubricRow[];
  tips: string[];
  distinction?: string;
};

type Assessment = {
  id: string;
  name: string;
  tier: TierKey;
  tiers: TierKey[];
  yearGroup: YearGroup;
  questions: string;
  answers: string;
  createdAt: string;
};

const yearGroupLabels: Record<YearGroup, string> = {
  year7: "Year 7",
  year8: "Year 8",
  year9: "Year 9",
};

const tierMeta: Record<
  TierKey,
  { label: string; shortLabel: string; kicker: string; color: string; soft: string; description: string }
> = {
  foundation: {
    label: "Foundation knowledge",
    shortLabel: "Foundation",
    kicker: "Remember & report",
    color: "coral",
    soft: "coral-soft",
    description: "Short, accurate responses that show recall, recognition and clear reporting.",
  },
  relational: {
    label: "Relational analysis",
    shortLabel: "Relational",
    kicker: "Connect & reason",
    color: "teal",
    soft: "teal-soft",
    description: "PEEL-ready responses that connect causes, effects, viewpoints and source evidence, including defended viewpoints.",
  },
  source: {
    label: "Evaluative command terms",
    shortLabel: "Evaluative",
    kicker: "Judge & weigh",
    color: "plum",
    soft: "plum-soft",
    description: "Reach higher-order judgements through analysis, evaluation, synthesis, assessment and application.",
  },
};

const terms: Term[] = [
  {
    id: "define",
    label: "Define",
    tier: "foundation",
    eyebrow: "1 · Core meaning",
    summary: "Give the precise meaning of a keyword.",
    ask: "A definition should capture the essential idea in one clear, accurate sentence. Do not give a loose association or an example instead of the meaning.",
    examples: ["Define ‘nomadic’. [2 marks]", "Define ‘urbanisation’. [2 marks]", "Define ‘scarcity’. [2 marks]"],
    rubric: [
      { marks: "2", descriptor: "One clear, accurate sentence that fully captures the core meaning; nothing important is missing." },
      { marks: "1", descriptor: "The general idea is present but a key part is missing, vague or imprecise." },
      { marks: "0", descriptor: "Missing, incorrect or no real understanding is shown." },
    ],
    tips: ["Use the key feature that makes the word different from related terms.", "Avoid using the word itself to define the word."],
  },
  {
    id: "identify-source",
    label: "Identify · source",
    tier: "relational",
    eyebrow: "2 · Pull from a source",
    summary: "Find specific points directly in a source, without adding outside knowledge.",
    ask: "The number of marks tells students how many separate points to find. Accept paraphrasing, but each point must be traceable to the source.",
    examples: ["Read Source A. Identify what it suggests about why England was able to industrialise. [3 marks]", "Identify two details the photograph reveals about the settlement. [2 marks]"],
    rubric: [
      { marks: "1 per point", descriptor: "Award one mark for each separate, valid point taken directly from the source, up to the maximum." },
      { marks: "0", descriptor: "The point is not in the source, is incorrect, or simply repeats the question." },
    ],
    tips: ["Underline separate details before writing.", "Do not reward a correct fact if it cannot be found in the source."],
  },
  {
    id: "identify-knowledge",
    label: "Identify · own knowledge",
    tier: "foundation",
    eyebrow: "3 · Recall facts",
    summary: "Recall correct, relevant facts from what has been learned.",
    ask: "Each mark usually represents one distinct, correct point. Short phrases are fine if the point is clearly identifiable.",
    examples: ["Identify three causes of the Industrial Revolution in Britain. [3 marks]", "Identify three causes of coastal erosion. [3 marks]", "Identify three factors of production used in manufacturing. [3 marks]"],
    rubric: [
      { marks: "1 per point", descriptor: "One mark for each separate, correct and relevant fact recalled from class knowledge." },
      { marks: "0", descriptor: "The point is incorrect, repeated, irrelevant or missing." },
    ],
    tips: ["Count the number of marks and aim for that many distinct points.", "Do not develop unless the question asks for development."],
  },
  {
    id: "describe-source",
    label: "Describe · source",
    tier: "relational",
    eyebrow: "4 · See & say",
    summary: "Turn what you can see in a diagram, photograph, map or artefact into full descriptive sentences.",
    ask: "Each point should name a feature and add something specific about it. This is more developed than a label or a short identification.",
    examples: ["Study Source B. Describe the design and materials of the Mongol ger shown in the diagram. [3 marks]", "Describe the features of the river meander shown in the photograph. [3 marks]"],
    rubric: [
      { marks: "1 per detail", descriptor: "One mark for each accurate, specific detail described in a full sentence, up to the maximum." },
      { marks: "0", descriptor: "A feature is merely named, inaccurate, or not taken from the source." },
    ],
    tips: ["Use ‘The source shows…’ to keep the answer anchored.", "Add material, shape, location, pattern or purpose to a simple label."],
  },
  {
    id: "describe-knowledge",
    label: "Describe · own knowledge",
    tier: "foundation",
    eyebrow: "5 · Develop an account",
    summary: "Give an account from memory in more developed sentences than Identify.",
    ask: "Build simple points into connected ideas, using words such as ‘because’, ‘which meant’ or ‘for example’. Precise subject vocabulary lifts the top band.",
    examples: ["Describe why Britain became the first country to industrialise. [4 marks]", "Describe the effects of deforestation on a local ecosystem. [4 marks]", "Describe the advantages of operating as a sole trader. [4 marks]"],
    rubric: [
      { marks: "4", descriptor: "Four simple points or two developed points, with precise and relevant subject detail." },
      { marks: "3", descriptor: "Three simple points or one developed point; the reasoning makes sense." },
      { marks: "2", descriptor: "Two simple points in accurate everyday language." },
      { marks: "1", descriptor: "One relevant fact or example with nothing else to support it." },
      { marks: "0", descriptor: "No creditable response or total confusion about the topic." },
    ],
    tips: ["For four marks, think ‘two because chains’ rather than four bare facts.", "Encourage precise terms such as ‘Enclosure Movement’ rather than ‘farming changed’."],
  },
  {
    id: "state",
    label: "State",
    tier: "foundation",
    eyebrow: "6 · One fact",
    summary: "Give a single correct fact, feature or short statement — no development needed.",
    ask: "State is not Define: Define asks for the meaning of a keyword, while State asks for a fact, feature or detail about something.",
    examples: ["State one method the Mongols used to force walled cities to surrender. [1 mark]", "State one cause of desertification. [1 mark]", "State one function of money. [1 mark]"],
    rubric: [
      { marks: "1 per point", descriptor: "One separate, correct and relevant fact or feature; a short phrase is enough." },
      { marks: "0", descriptor: "The fact is incorrect, irrelevant or missing." },
    ],
    tips: ["Answer the exact noun in the question.", "Do not spend time explaining when one mark is available."],
    distinction: "State = a fact. Define = the meaning of a word.",
  },
  {
    id: "list",
    label: "List",
    tier: "foundation",
    eyebrow: "7 · Name a set",
    summary: "Name a set of correct items; short words or phrases are a complete answer.",
    ask: "There is no expectation of a full sentence, explanation or development. The mark count tells students how many distinct items to name.",
    examples: ["List three types of historical source that could be used to study the Mongol Empire. [3 marks]", "List three renewable sources of energy. [3 marks]", "List three types of business ownership. [3 marks]"],
    rubric: [
      { marks: "1 per item", descriptor: "One mark for each correct, distinct item named, up to the maximum." },
      { marks: "0", descriptor: "The item is incorrect, repeated, worded differently from an already credited item, or missing." },
    ],
    tips: ["Number your items so you and the marker can count them.", "Do not turn a list into a paragraph."],
  },
  {
    id: "label",
    label: "Label",
    tier: "foundation",
    eyebrow: "8 · Place the term",
    summary: "Identify parts of a diagram, map or graph by placing the correct term in the correct place.",
    ask: "This is a visual, source-based skill. Students are naming accurately and placing that name correctly — not describing or explaining.",
    examples: ["Label the river valley diagram using: source · meander · floodplain · mouth. [4 marks]", "Label the supply and demand graph using: demand curve · supply curve · equilibrium price · equilibrium quantity. [4 marks]"],
    rubric: [
      { marks: "1 per label", descriptor: "One mark for each term correctly placed against the matching feature; minor spelling errors may be accepted if clear." },
      { marks: "0", descriptor: "The label is missing, points to the wrong feature, or is unrecognisable." },
    ],
    tips: ["Check the arrow reaches the feature, not the surrounding space.", "Use the vocabulary supplied in the question where possible."],
  },
  {
    id: "locate",
    label: "Locate",
    tier: "foundation",
    eyebrow: "9 · Find precisely",
    summary: "Find and mark a place, or name it with enough geographic precision to prove exactly where it is.",
    ask: "The required precision matters. A general area may earn partial credit, but not full marks if the question asks for a specific region.",
    examples: ["On the map provided, locate and mark the Amazon Rainforest. [2 marks]"],
    rubric: [
      { marks: "2", descriptor: "The location is marked or named with the specific level of precision requested." },
      { marks: "1", descriptor: "The general area is right but lacks the precision asked for." },
      { marks: "0", descriptor: "The location is missing, incorrect or marked in the wrong place." },
    ],
    tips: ["Read whether the question asks for a continent, country, region or site.", "If marking a map, use a clear dot or boundary and a legible label."],
  },
  {
    id: "sequence",
    label: "Sequence",
    tier: "foundation",
    eyebrow: "10 · Put in order",
    summary: "Put events, stages or images in the correct order, usually chronological in Social Studies.",
    ask: "Award fairly: a mostly correct sequence shows more understanding than an all-or-nothing approach suggests.",
    examples: ["Put the stages of the water cycle in the correct order: evaporation · condensation · precipitation · collection. [4 marks]"],
    rubric: [
      { marks: "4", descriptor: "The entire sequence is correct." },
      { marks: "2–3", descriptor: "Most of the sequence is correct; for example, only one adjacent pair is swapped." },
      { marks: "1", descriptor: "Some understanding is shown, but several items are out of order." },
      { marks: "0", descriptor: "No accurate understanding of the order is shown." },
    ],
    tips: ["Look for trigger words such as first, then, after and finally.", "Ask what must happen before the next stage can begin."],
  },
  {
    id: "outline-source",
    label: "Outline · source / diagram",
    tier: "relational",
    eyebrow: "11 · Report a trend",
    summary: "Give a brief, accurate account of a trend, change or pattern using specific detail directly from a source.",
    ask: "Because the information is visible, the skill is accurate reading and reporting rather than recall.",
    examples: ["Study Graph A. Outline what happened to the percentage of Britain’s population living in urban areas between 1750 and 1900. [2 marks]"],
    rubric: [
      { marks: "2", descriptor: "The overall trend is accurate and supported with at least one specific figure, percentage or date." },
      { marks: "1", descriptor: "The trend is general with no data, or data is quoted with no description of the trend." },
      { marks: "0", descriptor: "The trend is inaccurate, missing or not linked to the source." },
    ],
    tips: ["Start with the overall movement, then add one data point.", "Use dates and figures exactly where the source provides them."],
  },
  {
    id: "outline-knowledge",
    label: "Outline · own knowledge",
    tier: "foundation",
    eyebrow: "12 · Cover the main points",
    summary: "Give the main points or stages from memory, with brief supporting detail but without full development.",
    ask: "Outline wants breadth: two or more clear points briefly. Describe wants depth: fewer points explained more fully.",
    examples: ["Outline the ways the Yam system helped the Mongol Empire to function. [4 marks]", "Outline the ways that tourism can benefit a coastal town’s economy. [4 marks]", "Outline the reasons why a business might choose to expand overseas. [4 marks]"],
    rubric: [
      { marks: "3–4", descriptor: "Two or more valid points, each a clear, complete statement with specific supporting detail." },
      { marks: "1–2", descriptor: "One point with specific detail, or two points with little or no supporting detail." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["At a four-mark tariff, two supported points are enough for full marks.", "Raise the total marks if you want more points covered; do not demand extra depth at the same tariff."],
    distinction: "Outline = breadth. Describe = depth.",
  },
  {
    id: "compare",
    label: "Compare & contrast",
    tier: "relational",
    eyebrow: "1 · Two sides, explicitly linked",
    summary: "Identify both similarities and differences between two things, using comparative language throughout.",
    ask: "Make the comparison explicit: use ‘both’, ‘similarly’, ‘whereas’ and ‘in contrast’ rather than writing two separate descriptions.",
    examples: ["Compare and contrast the methods Genghis Khan and Kublai Khan used to expand and govern the Mongol Empire. [6 marks]", "Compare and contrast what Sources K and L reveal about the impact of Mongol rule. [6 marks]"],
    rubric: [
      { marks: "5–6", descriptor: "Explicit similarities and/or differences are supported with relevant detail from both sides; comparative language is used throughout." },
      { marks: "3–4", descriptor: "Valid comparisons are made with relevant detail, but the answer may be one-sided or inconsistent." },
      { marks: "1–2", descriptor: "Relevant facts about each side are given as separate descriptions." },
      { marks: "0", descriptor: "No relevant comparison is made." },
    ],
    tips: ["Build paragraphs around a comparison, not around one side at a time.", "A quick stem: ‘Both…, however…’"],
  },
  {
    id: "explain",
    label: "Explain",
    tier: "relational",
    eyebrow: "2 · Show the causal chain",
    summary: "Give reasons why something happened or is true, showing how the cause leads to the effect.",
    ask: "A strong PEEL paragraph moves from point to evidence to how/why it creates the outcome, then links back to the question.",
    examples: ["Explain how the Industrial Revolution transformed cities like Manchester. [6 marks]", "Explain why coastal areas are at increasing risk of flooding. [6 marks]"],
    rubric: [
      { marks: "5–6", descriptor: "Two well-developed causal chains explain how or why, using linking language and at least one precise subject term." },
      { marks: "3–4", descriptor: "Valid reasons are developed, but the causal chain is incomplete in places." },
      { marks: "1–2", descriptor: "Valid reasons are identified with little or no explanation of how or why they lead to the outcome." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Use ‘this meant that’, ‘as a result’ and ‘which led to’.", "If the answer only lists causes, it is not yet an explanation."],
  },
  {
    id: "justify",
    label: "Justify",
    tier: "relational",
    eyebrow: "3 · Defend a position",
    summary: "Support a viewpoint, decision or claim with reasons, explaining why those reasons are convincing.",
    ask: "Take a clear position early, then build the case for why it is the strongest choice or most important factor.",
    examples: ["Justify why the Silk Road was important to the success of the Mongol Empire. [6 marks]", "Justify your choice of the most effective method to protect a coastline from erosion. [6 marks]"],
    rubric: [
      { marks: "5–6", descriptor: "A clear position is supported with well-developed relevant reasons and explains why they are convincing or important." },
      { marks: "3–4", descriptor: "A position is taken with valid reasons, but the reasoning is not fully developed." },
      { marks: "1–2", descriptor: "A position or reason is stated with little or no supporting justification." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Use ‘the most important reason is… because…’.", "Justify defends one position; Discuss weighs more than one before concluding."],
  },
  {
    id: "calculate",
    label: "Calculate",
    tier: "relational",
    eyebrow: "4 · Method + answer",
    summary: "Reach a numeric answer by applying a known method or formula to the figures given.",
    ask: "Show working. Credit is available for a correct method even when an arithmetic slip affects the final answer.",
    examples: ["A business sells 500 units at $12 each. Calculate its total revenue. [2 marks]", "Country X has a population of 4,800,000 and an area of 240,000 km². Calculate its population density. [2 marks]"],
    rubric: [
      { marks: "2", descriptor: "Correct method and working are shown, with a correct final answer and unit where relevant." },
      { marks: "1", descriptor: "Correct method is shown but the final answer has an arithmetic slip, or the correct answer is given without working." },
      { marks: "0", descriptor: "Incorrect method and answer, or no attempt." },
    ],
    tips: ["Write the formula before substituting numbers.", "Decide in advance whether missing units lose the final mark."],
  },
  {
    id: "suggest",
    label: "Suggest",
    tier: "relational",
    eyebrow: "5 · Apply a plausible idea",
    summary: "Offer a plausible, reasoned idea in a situation where more than one answer may be acceptable.",
    ask: "A suggestion must fit the specific context. It tests reasoning, not recall of one fixed fact.",
    examples: ["Suggest why the Mongols allowed conquered peoples to keep their own religions. [4 marks]", "Suggest one way a coastal town could reduce the impact of rising sea levels. [4 marks]"],
    rubric: [
      { marks: "3–4", descriptor: "A plausible, well-reasoned suggestion is clearly linked to the context and explains why it would work or apply." },
      { marks: "1–2", descriptor: "A plausible suggestion is given, but with limited or no explanation of why it fits the context." },
      { marks: "0", descriptor: "No plausible or relevant suggestion is made." },
    ],
    tips: ["Name the idea, then add ‘This would… because…’.", "Suggest is not Identify: it invites a reasoned idea for a scenario."],
  },
  {
    id: "discuss",
    label: "Discuss",
    tier: "relational",
    eyebrow: "6 · Weigh both sides",
    summary: "Present more than one side of an issue, develop each side, and reach a supported conclusion.",
    ask: "A one-sided answer, however detailed, has not fully answered Discuss. The conclusion must weigh the arguments rather than simply repeat one.",
    examples: ["Discuss whether Genghis Khan should be remembered mainly as a destroyer or as a unifier. [8 marks]", "Discuss whether the advantages of tourism outweigh the disadvantages for a coastal town. [8 marks]"],
    rubric: [
      { marks: "7–8", descriptor: "Both sides are developed with relevant points and a clear conclusion weighs them against each other." },
      { marks: "5–6", descriptor: "Both sides are covered, but the conclusion is weak, missing or simply restates one side." },
      { marks: "3–4", descriptor: "Only one side is developed, even if the other is mentioned." },
      { marks: "1–2", descriptor: "A relevant point is made with little or no development." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Plan one paragraph for each side before you write.", "End with ‘Overall… because…’ and commit to which side is stronger."],
    distinction: "Discuss = balance first, judgement second. Justify = position first.",
  },
  {
    id: "analyse",
    label: "Analyse",
    tier: "source",
    eyebrow: "7 · Examine & rank",
    summary: "Break a topic into parts, examine relationships and judge which factor or impact matters most.",
    ask: "Analyse goes beyond Explain: the answer must weigh relative significance and justify a ranking, with evidence throughout.",
    examples: ["Analyse the impact of the Mongol Empire on trade between Europe and Asia. [8 marks]", "Analyse the impact of deforestation on global climate change. [8 marks]"],
    rubric: [
      { marks: "7–8", descriptor: "Multiple impacts or factors are examined in depth, with clear explanation and a supported judgement about relative significance." },
      { marks: "5–6", descriptor: "Multiple relevant impacts or factors are examined with development, but there is limited or no judgement." },
      { marks: "3–4", descriptor: "Relevant factors are identified with partial development, but analysis lacks depth." },
      { marks: "1–2", descriptor: "Relevant point(s) are identified with little or no development." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Ask: which factor matters most, and why?", "Examine one issue in depth; Discuss instead weighs opposing viewpoints."],
    distinction: "Explain accounts for why. Analyse also ranks significance.",
  },
  {
    id: "evaluate",
    label: "Evaluate",
    tier: "source",
    eyebrow: "8 · Weigh evidence",
    summary: "Make a supported judgement about the value, impact, success or importance of something.",
    ask: "Consider strengths and limitations, or competing factors, before reaching a clear judgement that is supported by evidence.",
    examples: ["Evaluate the success of the Mongol Empire’s methods of control. [8 marks]", "Evaluate the effectiveness of a coastal management strategy. [8 marks]"],
    rubric: [
      { marks: "7–8", descriptor: "Several relevant factors are weighed and a clear, evidence-based judgement is reached." },
      { marks: "5–6", descriptor: "Relevant factors are developed and a judgement is present, but the weighing is uneven." },
      { marks: "3–4", descriptor: "Some relevant explanation is given, but evaluation or judgement is limited." },
      { marks: "1–2", descriptor: "A relevant point is made with little development or evaluation." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Use evidence to explain why one factor is stronger, more successful or more important.", "Do not leave the judgement until the final line only; weigh as you go."],
  },
  {
    id: "synthesis",
    label: "Synthesis",
    tier: "source",
    eyebrow: "9 · Combine into a new whole",
    summary: "Bring together ideas, evidence or perspectives from different places to create a coherent overall understanding.",
    ask: "Make connections across sources, topics or factors. The answer should do more than place ideas side by side; it should combine them into a new, supported insight.",
    examples: ["Using Sources A, B and C, synthesise what they reveal about the impact of industrialisation. [8 marks]", "Synthesise the evidence to explain the most important challenge facing the coastal town. [8 marks]"],
    rubric: [
      { marks: "7–8", descriptor: "Evidence from different sources or factors is integrated into a coherent, insightful conclusion." },
      { marks: "5–6", descriptor: "Several pieces of evidence are connected, though the synthesis is not consistently developed." },
      { marks: "3–4", descriptor: "Relevant evidence is selected but mostly presented separately." },
      { marks: "1–2", descriptor: "A relevant detail is used with little connection to other evidence." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Use ‘taken together’, ‘this suggests overall’ and ‘the evidence points to’. ", "Make the connection between evidence explicit."],
  },
  {
    id: "judge",
    label: "Judge / To what extent…",
    tier: "source",
    eyebrow: "10 · Reach a degree judgement",
    summary: "Decide how far you agree with a claim, using evidence to show the degree or limits of your judgement.",
    ask: "Test the claim against evidence and counter-evidence, then answer the exact degree question: fully, largely, partly or only to a limited extent.",
    examples: ["To what extent was the Silk Road important to the success of the Mongol Empire? [8 marks]", "To what extent has the coastal town adapted successfully to rising sea levels? [8 marks]"],
    rubric: [
      { marks: "7–8", descriptor: "A clear degree judgement is supported by balanced evidence and a convincing explanation of limits or exceptions." },
      { marks: "5–6", descriptor: "A judgement is supported with relevant evidence, but the degree or counter-evidence is less developed." },
      { marks: "3–4", descriptor: "Relevant arguments are offered, but the judgement is vague or unsupported." },
      { marks: "1–2", descriptor: "A simple opinion or relevant point is given with little evidence." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Use a conclusion frame such as ‘to a large extent… however…’. ", "Answer ‘how far?’ rather than only ‘yes’ or ‘no’."],
  },
  {
    id: "assess",
    label: "Assess",
    tier: "source",
    eyebrow: "11 · Consider & decide",
    summary: "Consider the evidence for different factors or options and reach a reasoned decision about their significance or value.",
    ask: "Assess questions require more than explanation: compare the evidence, identify what matters most and make the decision visible.",
    examples: ["Assess the importance of different factors in the growth of the Mongol Empire. [8 marks]", "Assess which strategy would best reduce flood risk in the town. [8 marks]"],
    rubric: [
      { marks: "7–8", descriptor: "Several factors are considered, compared and prioritised in a well-supported final assessment." },
      { marks: "5–6", descriptor: "Relevant factors are considered with a reasoned decision, but prioritisation is uneven." },
      { marks: "3–4", descriptor: "Factors are explained but the final assessment is limited or unclear." },
      { marks: "1–2", descriptor: "A relevant factor is identified with little assessment." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Use ‘most significant’, ‘less important’ and ‘overall’ to show prioritisation.", "Make the final decision directly answer the wording of the question."],
  },
  {
    id: "apply",
    label: "Apply",
    tier: "source",
    eyebrow: "12 · Use knowledge in context",
    summary: "Use a concept, rule, method or knowledge in a new or specific situation.",
    ask: "Apply is about transfer: select the relevant knowledge and use it accurately in the context given, rather than reciting everything you know.",
    examples: ["Apply your knowledge of push and pull factors to explain why this settlement has grown. [4 marks]", "Apply the formula to calculate the population density of Country X. [2 marks]"],
    rubric: [
      { marks: "Full marks", descriptor: "Relevant knowledge or method is accurately selected and clearly used in the specific context." },
      { marks: "Partial", descriptor: "Some relevant knowledge is applied, but the connection to the context is incomplete or inaccurate." },
      { marks: "0", descriptor: "Knowledge is irrelevant, not applied to the context or missing." },
    ],
    tips: ["Underline the context before choosing what knowledge to use.", "Avoid writing a memorised response that never mentions the specific case."],
  },
  {
    id: "message",
    label: "What is the message?",
    tier: "relational",
    eyebrow: "7 · Interpret the source",
    summary: "Identify the overall point a source is trying to make, beyond its literal content.",
    ask: "State the message directly — ‘This source suggests that…’ — and support it with specific details, symbols, captions or word choices.",
    examples: ["What is the message of Source A? Use the source and your own knowledge. [8 marks]"],
    rubric: [
      { marks: "7–8", descriptor: "The message is clear and thoroughly supported with more than one specific source detail; the interpretation is rounded." },
      { marks: "5–6", descriptor: "The message is clearly stated and supported with at least one specific detail or symbol." },
      { marks: "3–4", descriptor: "The content is described or a message is stated, but there is little specific reference to how it is conveyed." },
      { marks: "1–2", descriptor: "Only literal description or a vague, unsupported claim is offered." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Move from ‘what I can see’ to ‘what the creator wants me to think’.", "Push students towards ‘This suggests…’ or ‘This shows…’."],
    distinction: "The message is not the same as the literal content.",
  },
  {
    id: "produced",
    label: "Why produced at this time?",
    tier: "relational",
    eyebrow: "8 · Purpose + context",
    summary: "Explain the purpose behind a source’s creation and link that purpose to the specific moment it was made.",
    ask: "Bring in contextual knowledge: what was happening then, who was the source aimed at, and what prompted its creation?",
    examples: ["Why was Source A produced at this time? Use the source and your own knowledge. [8 marks]"],
    rubric: [
      { marks: "7–8", descriptor: "Purpose is explained and linked to well-developed context about the specific moment, including audience or intended influence." },
      { marks: "5–6", descriptor: "Purpose is clearly explained and linked to specific contextual knowledge about the time." },
      { marks: "3–4", descriptor: "A purpose is suggested, but reference to timing or context is limited or generic." },
      { marks: "1–2", descriptor: "A purpose is suggested with no context or only a vague comment." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Name the specific event or circumstance that prompted the source.", "Remember: this rewards contextual knowledge as much as source reading."],
  },
  {
    id: "useful",
    label: "How useful is this source?",
    tier: "relational",
    eyebrow: "9 · Evaluate usefulness",
    summary: "Weigh content, provenance and limitations to reach a judgement about usefulness for a specific purpose.",
    ask: "Consider what the source says, who made it, when and why, then explain what that means for how useful it is — not just whether it is biased.",
    examples: ["How useful is Source A for finding out why England was able to industrialise first? [8 marks]", "How useful is Source B for understanding the causes of the Aral Sea’s shrinkage? [8 marks]"],
    rubric: [
      { marks: "7–8", descriptor: "Content and provenance are considered in depth, with a well-supported judgement that weighs limitations against what the source shows." },
      { marks: "5–6", descriptor: "Both content and provenance are considered to reach a judgement, but weighing is less developed." },
      { marks: "3–4", descriptor: "Content is considered with limited provenance, or provenance is mentioned without linking it to usefulness." },
      { marks: "1–2", descriptor: "The answer only describes what the source says, with no evaluation of usefulness." },
      { marks: "0", descriptor: "No relevant or creditable response." },
    ],
    tips: ["Always complete the sentence: ‘Useful for finding out…’", "Bias does not automatically mean ‘not useful’ — a biased source can reveal attitudes."],
    distinction: "Content → provenance → evaluation / judgement.",
  },
];

const starterAssessments: Assessment[] = [
  {
    id: "mongol-empire",
    name: "Rise of the Mongol Empire",
    tier: "foundation",
    tiers: ["foundation"],
    yearGroup: "year7",
    questions: "State one method the Mongols used to force walled cities to surrender. [1 mark]\n\nList three types of historical source that could be used to study the Mongol Empire. [3 marks]",
    answers: "Captured prisoners (hashar) were marched in front of the army.\n\nChronicles; maps; artefacts.",
    createdAt: "08 Sep 2026",
  },
  {
    id: "industrial-revolution-source",
    name: "Industrial Revolution source practice",
    tier: "source",
    tiers: ["source"],
    yearGroup: "year8",
    questions: "What is the message of Source A? Use the source and your own knowledge. [8 marks]\n\nHow useful is Source A for finding out why England industrialised first? [8 marks]",
    answers: "Teacher model: start with ‘This source suggests…’ and support the interpretation with two specific details.\n\nTeacher model: content → provenance → limitations → supported judgement.",
    createdAt: "08 Sep 2026",
  },
];

const tierOrder: TierKey[] = ["foundation", "relational", "source"];
const tierRank: Record<TierKey, number> = { foundation: 1, relational: 2, source: 3 };

function highestTier(tiers: TierKey[]): TierKey {
  return tiers.reduce((highest, tier) => tierRank[tier] > tierRank[highest] ? tier : highest, tiers[0] ?? "foundation");
}

function getStoredAssessments(): Assessment[] {
  if (typeof window === "undefined") return starterAssessments;
  try {
    const stored = window.localStorage.getItem("command-terms-assessments");
    return stored ? JSON.parse(stored).map((assessment: Assessment) => ({ ...assessment, yearGroup: assessment.yearGroup ?? "year7", tiers: assessment.tiers ?? [assessment.tier] })) : starterAssessments;
  } catch {
    return starterAssessments;
  }
}

function AppMark() {
  return (
    <div className="app-mark" aria-hidden="true">
      <img src="/manus-storage/YCYW_05ccf744.png" alt="" />
    </div>
  );
}

function TierBadge({ tier }: { tier: TierKey }) {
  return <span className={`tier-badge ${tierMeta[tier].soft}`}>{tierMeta[tier].shortLabel}</span>;
}

function Pyramid({ activeTier, onSelect }: { activeTier: TierKey; onSelect: (tier: TierKey) => void }) {
  const segments: { tier: TierKey; width: string; number: string }[] = [
    { tier: "source", width: "52%", number: "03" },
    { tier: "relational", width: "76%", number: "02" },
    { tier: "foundation", width: "100%", number: "01" },
  ];

  return (
    <div className="pyramid-wrap">
      <div className="pyramid-label pyramid-label-top">Higher-order thinking</div>
      <div className="pyramid" aria-label="Command term progression pyramid">
        {segments.map(({ tier, width, number }) => (
          <button
            key={tier}
            type="button"
            className={`pyramid-segment pyramid-${tier} ${activeTier === tier ? "is-selected" : ""}`}
            style={{ width }}
            onClick={() => onSelect(tier)}
            aria-label={`View ${tierMeta[tier].label} command terms`}
            aria-pressed={activeTier === tier}
          >
            <span className="pyramid-number">{number}</span>
            <span>
              <strong>{tierMeta[tier].shortLabel}</strong>
              <small>{tierMeta[tier].kicker}</small>
            </span>
            <ChevronRight size={17} strokeWidth={2.4} />
          </button>
        ))}
      </div>
      <div className="pyramid-label pyramid-label-bottom">Everyday classroom language →</div>
      <div className="pyramid-guidance"><ClipboardList size={16} /><span><strong>Plan across the period.</strong> Students should be assessed on every level at some point — for example, a Year 8 assessment can include both Foundation and Relational questions.</span></div>
    </div>
  );
}

export default function Home() {
  const [activeTier, setActiveTier] = useState<TierKey>("foundation");
  const [selectedTermId, setSelectedTermId] = useState("define");
  const [searchQuery, setSearchQuery] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>(getStoredAssessments);
  const [activeYearGroup, setActiveYearGroup] = useState<YearGroup | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [assessmentForm, setAssessmentForm] = useState({ name: "", tiers: ["foundation"] as TierKey[], yearGroup: "year7" as YearGroup, questions: [""], answers: "" });

  const filteredTerms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return terms.filter((term) => {
      const matchesTier = term.tier === activeTier;
      const matchesQuery = !query || [term.label, term.summary, term.ask, ...term.examples].join(" ").toLowerCase().includes(query);
      return matchesTier && matchesQuery;
    });
  }, [activeTier, searchQuery]);

  const selectedTerm = filteredTerms.find((term) => term.id === selectedTermId) ?? filteredTerms[0] ?? terms.find((term) => term.tier === activeTier) ?? terms[0];
  const visibleAssessments = assessments.filter((assessment) => highestTier(assessment.tiers) === activeTier && (activeYearGroup === "all" || assessment.yearGroup === activeYearGroup));

  function selectTier(tier: TierKey, shouldScroll = true) {
    setActiveTier(tier);
    const next = terms.find((term) => term.tier === tier);
    if (next) setSelectedTermId(next.id);
    if (shouldScroll) window.setTimeout(() => document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  }

  function selectTerm(term: Term) {
    setSelectedTermId(term.id);
    setActiveTier(term.tier);
  }

  function saveAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedQuestions = assessmentForm.questions.map((question) => question.trim()).filter(Boolean);
    if (!assessmentForm.name.trim() || cleanedQuestions.length === 0 || assessmentForm.tiers.length === 0) return;
    const assessmentDetails = {
      name: assessmentForm.name.trim(),
      tier: assessmentForm.tiers[0],
      tiers: assessmentForm.tiers,
      yearGroup: assessmentForm.yearGroup,
      questions: cleanedQuestions.join("\n\n"),
      answers: assessmentForm.answers.trim(),
    };
    const newAssessment: Assessment = {
      id: `${Date.now()}`,
      ...assessmentDetails,
      createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    const next = editingAssessmentId
      ? assessments.map((assessment) => assessment.id === editingAssessmentId ? { ...assessment, ...assessmentDetails } : assessment)
      : [newAssessment, ...assessments];
    setAssessments(next);
    window.localStorage.setItem("command-terms-assessments", JSON.stringify(next));
    setAssessmentForm({ name: "", tiers: [activeTier], yearGroup: assessmentForm.yearGroup, questions: [""], answers: "" });
    setShowAddForm(false);
    setEditingAssessmentId(null);
    setSaveMessage(editingAssessmentId ? "Assessment updated." : "Assessment saved to this browser.");
    window.setTimeout(() => setSaveMessage(""), 3200);
  }

  function startNewAssessment() {
    setEditingAssessmentId(null);
    setAssessmentForm({ name: "", tiers: [activeTier], yearGroup: "year7", questions: [""], answers: "" });
    setShowAddForm(true);
  }

  function startEditingAssessment(assessment: Assessment) {
    setEditingAssessmentId(assessment.id);
    setAssessmentForm({ name: assessment.name, tiers: assessment.tiers, yearGroup: assessment.yearGroup, questions: assessment.questions.split(/\n\n+/).filter(Boolean), answers: assessment.answers });
    setShowAddForm(true);
    window.setTimeout(() => document.getElementById("assessments")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  }

  function closeAssessmentForm() {
    setShowAddForm(false);
    setEditingAssessmentId(null);
  }

  function deleteAssessment(id: string) {
    const next = assessments.filter((assessment) => assessment.id !== id);
    setAssessments(next);
    window.localStorage.setItem("command-terms-assessments", JSON.stringify(next));
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#library">Skip to command-term library</a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="YC Social Studies Assessments home">
            <AppMark />
            <span>
              <strong>YC Social Studies</strong>
              <small>Assessments</small>
            </span>
          </a>
          <button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <nav className={`site-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Main navigation">
            <a href="#overview" onClick={() => setMobileMenuOpen(false)}>Overview</a>
            <a href="#library" onClick={() => setMobileMenuOpen(false)}>Command terms</a>
            <a href="#assessments" onClick={() => setMobileMenuOpen(false)}>Assessment bank</a>
            <span className="nav-divider" aria-hidden="true" />
            <span className="staff-pill"><span className="status-dot" />Staff view</span>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" id="overview">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="overline"><Sparkles size={14} /> A shared language for better questions</div>
              <h1>Make every <em>command</em> count.</h1>
              <p className="hero-intro">A practical, accessible guide to what students need to do, what strong answers look like, and how to keep classroom assessments consistent.</p>
              <div className="hero-actions">
                <a className="primary-button" href="#library">Explore the terms <ArrowDown size={17} /></a>
                <a className="text-button" href="#assessments">Open assessment bank <ArrowUpRight size={16} /></a>
              </div>
              <div className="hero-meta" aria-label="App contents">
                <span><strong>{terms.length}</strong> command terms</span>
                <span><strong>3</strong> thinking levels</span>
                <span><strong>Local</strong> saved examples</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="visual-note"><span className="note-pin" />Start here: show the shape of thinking first.</div>
              <Pyramid activeTier={activeTier} onSelect={selectTier} />
            </div>
          </div>
          <div className="hero-edge" aria-hidden="true" />
        </section>

        <section className="orientation-section">
          <div className="content-width orientation-grid">
            <div>
              <div className="section-label">How to use this hub</div>
              <h2>One visual map.<br /><span>Three useful lenses.</span></h2>
            </div>
            <div className="orientation-copy">
              <p>Use the pyramid to orient new staff, then select a level to open the command terms, mark schemes and teacher prompts that sit inside it.</p>
              <div className="quick-links" role="list" aria-label="Thinking levels">
                {tierOrder.map((tier, index) => (
                  <button key={tier} className={`quick-link ${activeTier === tier ? "is-active" : ""}`} onClick={() => selectTier(tier)} role="listitem" type="button">
                    <span className={`quick-number quick-${tier}`}>0{index + 1}</span>
                    <span><strong>{tierMeta[tier].label}</strong><small>{tierMeta[tier].description}</small></span>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="library-section" id="library">
          <div className="content-width">
            <div className="section-heading-row">
              <div>
                <div className="section-label">The reference library</div>
                <h2>Browse by <span>thinking level.</span></h2>
              </div>
              <div className="search-wrap">
                <Search size={18} aria-hidden="true" />
                <label className="sr-only" htmlFor="term-search">Search command terms</label>
                <input id="term-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the library…" />
                {searchQuery && <button type="button" className="clear-search" onClick={() => setSearchQuery("")} aria-label="Clear search"><X size={16} /></button>}
              </div>
            </div>

            <div className="library-toolbar">
              <div className="tier-tabs" role="tablist" aria-label="Filter command terms by level">
                {tierOrder.map((tier) => (
                  <button key={tier} type="button" role="tab" aria-selected={activeTier === tier} className={`tier-tab tier-tab-${tier} ${activeTier === tier ? "is-active" : ""}`} onClick={() => selectTier(tier)}>
                    <span className="tab-dot" />{tierMeta[tier].label}<span className="tab-count">{terms.filter((term) => term.tier === tier).length}</span>
                  </button>
                ))}
              </div>
              <span className="result-count">{filteredTerms.length} terms shown</span>
            </div>

            <div className="library-layout">
              <div className="term-list" aria-label={`${tierMeta[activeTier].label} command terms`}>
                {filteredTerms.length === 0 ? (
                  <div className="empty-state"><CircleHelp size={22} /><strong>No terms found</strong><span>Try a different search or clear the filter.</span></div>
                ) : filteredTerms.map((term, index) => (
                  <button key={term.id} type="button" className={`term-card ${selectedTerm?.id === term.id ? "is-selected" : ""}`} onClick={() => selectTerm(term)}>
                    <span className="term-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="term-card-copy"><strong>{term.label}</strong><small>{term.summary}</small></span>
                    <ChevronRight size={18} className="term-chevron" />
                  </button>
                ))}
              </div>

              {selectedTerm && (
                <article className={`term-detail detail-${selectedTerm.tier}`} aria-live="polite">
                  <div className="detail-header">
                    <div><TierBadge tier={selectedTerm.tier} /><p className="detail-eyebrow">{selectedTerm.eyebrow}</p></div>
                    <span className="detail-id">{String(terms.findIndex((term) => term.id === selectedTerm.id) + 1).padStart(2, "0")}</span>
                  </div>
                  <h3>{selectedTerm.label}</h3>
                  <p className="detail-summary">{selectedTerm.summary}</p>
                  <div className="detail-block ask-block">
                    <div className="block-heading"><span className="icon-disc"><CircleHelp size={15} /></span><strong>What this command term asks for</strong></div>
                    <p>{selectedTerm.ask}</p>
                  </div>
                  <div className="detail-columns">
                    <div className="detail-block">
                      <div className="block-heading"><span className="icon-disc"><ClipboardList size={15} /></span><strong>Example questions</strong></div>
                      <ul className="example-list">{selectedTerm.examples.map((example) => <li key={example}>{example}</li>)}</ul>
                    </div>
                    <div className="detail-block">
                      <div className="block-heading"><span className="icon-disc"><Check size={15} /></span><strong>Teacher tops</strong></div>
                      <ul className="tips-list">{selectedTerm.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
                    </div>
                  </div>
                  <div className="rubric-block">
                    <div className="block-heading"><span className="icon-disc"><BookOpen size={15} /></span><strong>Mark scheme at a glance</strong><span className="muted-heading">{selectedTerm.rubric.length} bands</span></div>
                    <div className="rubric-table" role="table" aria-label={`Mark scheme for ${selectedTerm.label}`}>
                      {selectedTerm.rubric.map((row) => <div className="rubric-row" role="row" key={`${row.marks}-${row.descriptor}`}><span className="marks-cell" role="cell">{row.marks}</span><span role="cell">{row.descriptor}</span></div>)}
                    </div>
                  </div>
                  {selectedTerm.distinction && <div className="distinction-note"><Lightbulb size={16} /><span><strong>Useful distinction:</strong> {selectedTerm.distinction}</span></div>}
                </article>
              )}
            </div>
          </div>
        </section>

        <section className="assessment-section" id="assessments">
          <div className="content-width">
            <div className="assessment-intro">
              <div>
                <div className="section-label">Your team’s examples</div>
                <h2>Keep the <span>practice bank</span> close.</h2>
              </div>
              <button className="primary-button add-button" type="button" onClick={() => showAddForm ? closeAssessmentForm() : startNewAssessment()}>
                {showAddForm ? <X size={17} /> : <Plus size={17} />} {showAddForm ? "Close form" : "Add an assessment"}
              </button>
            </div>

            {saveMessage && <div className="save-message" role="status"><Check size={16} />{saveMessage}</div>}

            {showAddForm && (
              <form className="assessment-form" onSubmit={saveAssessment}>
                <div className="form-heading"><FilePlus2 size={19} /><div><strong>{editingAssessmentId ? "Edit team assessment" : "Add a team assessment"}</strong><span>Keep the prompt and the model answer together for future planning.</span></div></div>
                <div className="form-grid">
                  <div className="field-group"><label htmlFor="assessment-name">Assessment name <span>*</span></label><input id="assessment-name" required value={assessmentForm.name} onChange={(event) => setAssessmentForm({ ...assessmentForm, name: event.target.value })} placeholder="e.g. Rise of the Mongol Empire" /></div>
                  <div className="field-group field-wide"><label>Thinking levels <span>*</span></label><div className="level-tag-options" role="group" aria-label="Thinking levels included in this assessment">{tierOrder.map((tier) => { const isSelected = assessmentForm.tiers.includes(tier); return <button key={tier} type="button" className={`level-tag-option ${isSelected ? `is-selected level-tag-${tier}` : ""}`} onClick={() => setAssessmentForm({ ...assessmentForm, tiers: isSelected ? (assessmentForm.tiers.length > 1 ? assessmentForm.tiers.filter((item) => item !== tier) : assessmentForm.tiers) : [...assessmentForm.tiers, tier] })} aria-pressed={isSelected}><span className={`mini-dot mini-dot-${tier}`} />{tierMeta[tier].label}{isSelected && <Check size={14} />}</button>; })}</div><span className="field-help">Select every level represented in the assessment — for example, Year 8 may include Foundation and Relational questions.</span></div>
                  <div className="field-group"><label htmlFor="assessment-year">Year group</label><select id="assessment-year" value={assessmentForm.yearGroup} onChange={(event) => setAssessmentForm({ ...assessmentForm, yearGroup: event.target.value as YearGroup })}>{(Object.keys(yearGroupLabels) as YearGroup[]).map((yearGroup) => <option key={yearGroup} value={yearGroup}>{yearGroupLabels[yearGroup]}</option>)}</select></div>
                  <div className="field-group field-wide question-field-group">
                    <div className="question-label-row"><label>Example questions <span>*</span></label><button className="add-question-button" type="button" onClick={() => setAssessmentForm({ ...assessmentForm, questions: [...assessmentForm.questions, ""] })}><Plus size={14} /> Add question</button></div>
                    <div className="question-list">
                      {assessmentForm.questions.map((question, index) => (
                        <div className="question-input-row" key={`question-${index}`}>
                          <span className="question-number" aria-hidden="true">{index + 1}</span>
                          <textarea id={`assessment-question-${index}`} rows={3} value={question} onChange={(event) => setAssessmentForm({ ...assessmentForm, questions: assessmentForm.questions.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} placeholder={index === 0 ? "e.g. State one method the Mongols used to force walled cities to surrender. [1 mark]" : "Add another question…"} aria-label={`Example question ${index + 1}`} />
                          <button className="remove-question-button" type="button" onClick={() => setAssessmentForm({ ...assessmentForm, questions: assessmentForm.questions.filter((_, itemIndex) => itemIndex !== index) })} disabled={assessmentForm.questions.length === 1} aria-label={`Remove question ${index + 1}`}><Trash2 size={15} /></button>
                        </div>
                      ))}
                    </div>
                    <span className="field-help">Add as many separate questions as you need for this assessment.</span>
                  </div>
                  <div className="field-group field-wide"><label htmlFor="assessment-answers">Example answers / teacher notes <span className="optional">optional</span></label><textarea id="assessment-answers" rows={4} value={assessmentForm.answers} onChange={(event) => setAssessmentForm({ ...assessmentForm, answers: event.target.value })} placeholder="Add a model answer, mark points or teaching notes…" /></div>
                </div>
                <div className="form-actions"><span>Fields marked * are required.</span><button className="primary-button" type="submit">{editingAssessmentId ? "Update assessment" : "Save assessment"} <Check size={17} /></button></div>
              </form>
            )}

            <div className="assessment-toolbar">
              <div className="mini-tabs" role="tablist" aria-label="Assessment examples by level">
                {tierOrder.map((tier) => <button key={tier} type="button" className={`mini-tab ${activeTier === tier ? "is-active" : ""}`} onClick={() => selectTier(tier, false)}><span className={`mini-dot mini-dot-${tier}`} />{tierMeta[tier].shortLabel}<b>{assessments.filter((assessment) => highestTier(assessment.tiers) === tier).length}</b></button>)}
              </div>
              <div className="assessment-filters"><label htmlFor="year-filter">Show</label><select id="year-filter" value={activeYearGroup} onChange={(event) => setActiveYearGroup(event.target.value as YearGroup | "all")}><option value="all">All year groups</option>{(Object.keys(yearGroupLabels) as YearGroup[]).map((yearGroup) => <option key={yearGroup} value={yearGroup}>{yearGroupLabels[yearGroup]}</option>)}</select><span>{visibleAssessments.length} saved {visibleAssessments.length === 1 ? "example" : "examples"}</span></div>
            </div>

            {visibleAssessments.length === 0 ? (
              <div className="assessment-empty"><div className="empty-icon"><FilePlus2 size={22} /></div><div><strong>No {tierMeta[activeTier].shortLabel.toLowerCase()} assessments yet</strong><p>Be the first to add an example your team has used.</p></div><button className="outline-button" type="button" onClick={() => setShowAddForm(true)}>Add example <Plus size={16} /></button></div>
            ) : (
              <div className="assessment-grid">
                {visibleAssessments.map((assessment) => (
                  <article className="assessment-card" key={assessment.id}>
                    <div className="assessment-card-top"><div className="assessment-badges">{assessment.tiers.map((tier) => <TierBadge tier={tier} key={tier} />)}<span className="year-badge">{yearGroupLabels[assessment.yearGroup]}</span></div><span className="saved-date">Filed under {tierMeta[highestTier(assessment.tiers)].shortLabel} · {assessment.createdAt}</span></div>
                    <h3>{assessment.name}</h3>
                    <div className="assessment-part"><span className="part-label">QUESTIONS</span><p>{assessment.questions}</p></div>
                    <div className="assessment-part answer-part"><span className="part-label">ANSWERS / NOTES</span><p>{assessment.answers || "No answer notes added yet."}</p></div>
                    <div className="assessment-card-actions"><button className="edit-button" type="button" onClick={() => startEditingAssessment(assessment)}><FilePlus2 size={14} /> Edit</button><button className="delete-button" type="button" onClick={() => deleteAssessment(assessment.id)}><Trash2 size={14} /> Remove</button></div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="footer-cta">
          <div className="content-width footer-cta-inner"><div><span className="overline"><Sparkles size={14} /> Ready when you are</span><h2>Start with the shape.<br /><em>Then sharpen the question.</em></h2></div><a className="primary-button light-button" href="#top">Back to top <ArrowUpRight size={17} /></a></div>
        </section>
      </main>
      <footer className="site-footer"><div className="content-width"><span>YC Social Studies Assessments</span><span>Built for shared planning • saved locally in your browser</span></div></footer>
    </div>
  );
}
