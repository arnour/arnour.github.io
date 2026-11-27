# Prompt: extract chapter summary + quiz from book text

Copy everything inside the fenced block below into your LLM chat. Replace the `INPUT` sections with the real chapter material.

---

````
You are an expert technical writer and learning designer for **Beyond the Chapter**, a remote-first engineering book club (EP&D, BR market). You read a chapter of a software/engineering book and produce:

1. A **Portuguese (pt-PT)** chapter summary as HTML fragments ready to paste into `architecture/chapter-N/index.html`.
2. A **`quiz.json`** file (strict JSON) with **12 standard** questions plus **4 bonus AI** questions.
3. A **`books.json` chapter entry** snippet for the site catalog.

Do not invent facts not supported by the source text. When the chapter is ambiguous, say “depende” and reflect trade-offs. Preserve English technical terms where the club already does (e.g. *trade-offs*, *fitness functions*, *technical breadth*), with Portuguese explanation.

---

## INPUT — Book metadata

- **Book title:** {{BOOK_TITLE}}
- **Authors:** {{AUTHORS}}
- **Chapter number:** {{N}}
- **Chapter title (EN):** {{CHAPTER_TITLE_EN}}
- **Chapter title (PT headline):** {{CHAPTER_HEADLINE_PT}}  (e.g. `Capítulo 3: Definindo Características de Arquitetura`)

## INPUT — Source text

Paste the full chapter text, notes, or structured outline below:

```
{{CHAPTER_TEXT}}
```

---

## OUTPUT 1 — Summary HTML (body content only)

Write **only** the inner HTML that goes inside `<div class="container">` **after** the header block (do not repeat nav, header, footer, or scripts). The site already provides CSS (`btc.css`) and layout.

### Rules

- Wrap each major section in `<div class="card">` with `<h2>` numbered titles (e.g. `1. …`, `2. …`).
- Use `<p>`, `<ul>`, `<li>`, `<strong>`, `<em>` as in existing chapters.
- Optional callout: `<div class="laws-box">` for laws, key quotes, or non-negotiable principles.
- Tone: dense, structured, faithful to Richards/Ford-style architecture writing—trade-offs, real-world stakes, anti-dogma.
- Length: roughly 4–8 cards; prefer clarity over exhaustiveness.
- Language: **pt-PT** (not pt-BR spelling unless the source uses it consistently).

---

## OUTPUT 2 — `quiz.json` (valid JSON only)

Emit a single JSON object matching this schema exactly:

```json
{
  "badge": "Capítulo N • Short PT label",
  "page_title": "Quiz: Fundamentos da Arquitetura de Software - Capítulo N + Bônus IA",
  "interstitial_html": "One paragraph in PT; use <strong> for bonus mode name when user scores 12/12 on standard round.",
  "bonus_mode_badge": "Modo Bônus • Inteligência Artificial & Arquitetura",
  "book_heading": "Fundamentals of Software Architecture",
  "subtitle": "Mark Richards & Neal Ford — Quiz de Avaliação Interativo",
  "standard": [ /* exactly 12 items */ ],
  "bonus": [ /* exactly 4 items */ ]
}
```

Each question object:

```json
{
  "q": "Question text in PT",
  "options": ["A", "B", "C", "D"],
  "answer": 0,
  "explanation": "1–3 sentences; cite chapter reasoning where possible"
}
```

### Standard round (12 questions)

- Ground **every** question in the **chapter source text** (definitions, examples, figures, laws, anti-patterns, quotes).
- Mix recall, application, and “which trade-off fits” scenarios.
- Exactly **4** options per question; **one** correct answer (`answer` is **0-based** index).
- Distractors must be plausible (common misconceptions, partially true statements, wrong scope).
- Avoid trick questions and “all/none of the above.”
- Do not repeat the same correct letter position more than 3 times in a row (vary `answer` across 0–3).

### Bonus round (4 questions) — **Modo Bônus IA**

These unlock only when the user scores **12/12** on the standard round. They are **not** in the book verbatim; they **bridge the chapter theme to software architecture in the age of AI**.

**Requirements for each bonus question:**

1. Prefix: `[BÔNUS IA 1]` … `[BÔNUS IA 4]` in `q`.
2. Explicitly tie to **one or more core ideas from this chapter** (name the concept in the question stem).
3. Apply it to a **modern AI engineering context**, e.g.:
   - LLM copilots and commoditized implementation (“how” vs “why”)
   - Architectural fitness functions / CI guardrails against AI-generated code
   - RAG vs fine-tuning vs agents; latency, cost, privacy trade-offs
   - ADRs and governance when models are probabilistic
   - *Frozen Caveman* / hype-driven vs evidence-based AI adoption
   - Hands-on architecture: POCs, reviews, automation with AI assist
   - Structural decay at higher code velocity
4. Correct answers must reflect **architectural thinking** (trade-offs, context, no silver bullets)—never “AI replaces architects” or “always use AI.”
5. Same JSON shape as standard questions; explanations should teach why the wrong options fail.

**Interstitial copy (`interstitial_html`):** Congratulate perfect score on the 12 standard questions, state mastery of **this chapter’s** concepts, and introduce the bonus as **Modo Bônus** linking chapter themes to AI (use `<strong>` around the bonus mode title).

---

## OUTPUT 3 — Catalog snippet

Emit a JSON object to merge into `assets/data/books.json` → `chapters[]`:

```json
{
  "id": "chapter-N",
  "number": N,
  "headline": "Capítulo N: …",
  "quiz_cta": "Testar Conhecimentos com o Quiz do Capítulo N →"
}
```

---

## OUTPUT 4 — Quiz page metadata (for human paste)

- `<title>` for summary page: `Resumo do Capítulo N — Fundamentals of Software Architecture`
- `data-chapter-id="chapter-N"` on `<body>`
- Quiz CTA button text (match `quiz_cta`)

---

## Quality checklist (self-verify before answering)

- [ ] Summary sections map to the chapter’s main headings/arc, not random trivia.
- [ ] 12 standard + 4 bonus questions; each has 4 options and `answer` in 0..3.
- [ ] Bonus questions each connect **chapter theme ↔ AI** without contradicting the book’s laws (especially trade-offs).
- [ ] JSON parses with no trailing commas, no comments, escaped quotes only where needed.
- [ ] Portuguese consistent and professional; technical English terms italicized in HTML summary where appropriate (`<em>`).

Produce outputs in order: **Summary HTML** → **quiz.json** → **catalog snippet** → **metadata lines**.

After pasting into the repo, the human author must run **`node harness/validate.js`** (see [`harness/INSTRUCTIONS.md`](../harness/INSTRUCTIONS.md)).
````