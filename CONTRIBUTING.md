# Contributing chapter summaries and quizzes

This site is built with [Jekyll](https://jekyllrb.com/) on GitHub Pages. To add a new chapter, update the catalog, author the summary in Markdown, and add quiz data in YAML.

## Checklist for chapter N

1. **Catalog** — Add an entry to [`_data/books.yml`](_data/books.yml) under the book's `chapters` array (keep sorted by `number`).
2. **Summary** — Create `architecture/chapter-N/index.md` using the chapter layout (copy [`architecture/chapter-2/index.md`](architecture/chapter-2/index.md) as a template).
3. **Quiz data** — Create [`_data/quizzes/chapter-N.yml`](_data/quizzes/chapter-1.yml) with `standard` (12 questions) and `bonus` (4 questions) sections.
4. **Quiz page** — Create `architecture/chapter-N/quiz.md` with `layout: quiz`, `quiz_data: chapter-N`, and `permalink: /architecture/chapter-N/quiz.html`.
5. **Local preview** — Run `bundle install` then `bundle exec jekyll serve` and open the summary and quiz.
6. **Spotlight (optional)** — Update `spotlight_chapter` in `_data/books.yml` when this chapter is the club's current read.

## Quiz YAML schema

```yaml
badge: "Capítulo N • Title"
page_title: "Quiz: …"
book_heading: Fundamentals of Software Architecture
subtitle: Mark Richards & Neal Ford — Quiz de Avaliação Interativo
interstitial:
  body: "Markdown text shown when the user scores 12/12, e.g. with **bold**."
  bonus_mode_badge: Modo Bônus • Inteligência Artificial & Arquitetura
standard:
  - q: "Question text"
    options:
      - "A"
      - "B"
      - "C"
      - "D"
    answer: 1          # 0-based index
    explanation: "Why this answer is correct"
bonus:
  - q: "[BÔNUS IA 1] …"
    options: [...]
    answer: 0
    explanation: "…"
```

## Chapter summary front matter

```yaml
---
layout: chapter
title: Resumo do Capítulo N — Fundamentals of Software Architecture
book_slug: fundamentals-software-architecture
chapter_id: chapter-N
lang: pt-PT
---
```

Use `<div class="card">` blocks in the Markdown body for section cards (Kramdown allows inline HTML). Use `<div class="laws-box">` for callouts when needed.

## URLs

Chapter summaries are served at `/architecture/chapter-N/`. Quizzes keep the legacy path `/architecture/chapter-N/quiz.html` via `permalink` in `quiz.md`.