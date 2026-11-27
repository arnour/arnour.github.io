# Adding a new chapter (static HTML)

This site uses plain **HTML**, shared **CSS/JS**, and **JSON** data—no build step.

**Harness:** run `node harness/validate.js` before opening a PR. See [`harness/INSTRUCTIONS.md`](harness/INSTRUCTIONS.md) for guardrails and the LLM workflow ([`prompts/generate-chapter-summary-and-quiz.md`](prompts/generate-chapter-summary-and-quiz.md)).

## Checklist for chapter N

1. **Catalog** — Add a chapter entry to [`assets/data/books.json`](assets/data/books.json) (keep `number` sorted). Update `spotlight_chapter` when it is the current club read.
2. **Summary** — Create `architecture/chapter-N/index.html`:
   - Copy [`architecture/chapter-2/index.html`](architecture/chapter-2/index.html).
   - Set `data-chapter-id="chapter-N"` on `<body>`.
   - Update title, headings, and summary content (keep the shared stylesheet link).
3. **Quiz data** — Create `architecture/chapter-N/quiz.json` (copy [`architecture/chapter-1/quiz.json`](architecture/chapter-1/quiz.json) as a schema reference).
4. **Quiz shell** — Copy `architecture/chapter-1/quiz.html` to `architecture/chapter-N/quiz.html` (no edits needed if paths stay `../../assets/...`).
5. **Preview** — Serve over HTTP (e.g. `python3 -m http.server`) so `fetch()` works for JSON. Open home, summary, and quiz.

## `quiz.json` schema

| Field | Purpose |
|-------|---------|
| `page_title` | Browser tab title |
| `badge` | Header badge (reset on quiz restart) |
| `book_heading`, `subtitle` | Quiz header |
| `interstitial_html` | HTML shown after a perfect standard round |
| `bonus_mode_badge` | Badge text in bonus mode |
| `standard` | Array of 12 questions (`q`, `options`, `answer` 0-based, `explanation`) |
| `bonus` | Array of 4 bonus questions (same shape) |

## Shared assets

- [`assets/css/btc.css`](assets/css/btc.css) — site + chapter styling
- [`assets/css/quiz.css`](assets/css/quiz.css) — quiz-only styles
- [`assets/js/quiz-engine.js`](assets/js/quiz-engine.js) — loads sibling `quiz.json`
- [`assets/js/home.js`](assets/js/home.js) — home chapter links from `books.json`
- [`assets/js/chapter-nav.js`](assets/js/chapter-nav.js) — prev/next on summary pages

Quiz debug mode: add `?debug=1` to the quiz URL, or open on `localhost`.