#!/usr/bin/env node
/**
 * Site harness: catalog ↔ filesystem ↔ quiz schema.
 * Run from repo root: node harness/validate.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_PATH = path.join(ROOT, 'assets/data/books.json');

const GUARDRAILS = {
  standardQuestionCount: 12,
  bonusQuestionCount: 4,
  optionsPerQuestion: 4,
  bonusPrefix: /^\[BÔNUS IA \d+\]/,
  bookHeading: 'Fundamentals of Software Architecture',
  quizSubtitle: 'Mark Richards & Neal Ford — Quiz de Avaliação Interativo',
  bonusModeBadge: 'Modo Bônus • Inteligência Artificial & Arquitetura',
};

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

function readJson(filePath, label) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    err(`${label}: ${e.message}`);
    return null;
  }
}

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function validateQuestion(q, ctx, index) {
  const label = `${ctx} question ${index + 1}`;
  if (!q || typeof q !== 'object') {
    err(`${label}: must be an object`);
    return;
  }
  if (!q.q || typeof q.q !== 'string' || !q.q.trim()) {
    err(`${label}: missing or empty "q"`);
  }
  if (!Array.isArray(q.options) || q.options.length !== GUARDRAILS.optionsPerQuestion) {
    err(`${label}: "options" must have exactly ${GUARDRAILS.optionsPerQuestion} items`);
  } else {
    q.options.forEach((opt, i) => {
      if (typeof opt !== 'string' || !opt.trim()) {
        err(`${label}: option ${i + 1} must be a non-empty string`);
      }
    });
    const unique = new Set(q.options);
    if (unique.size !== q.options.length) {
      warn(`${label}: duplicate option text`);
    }
  }
  if (typeof q.answer !== 'number' || !Number.isInteger(q.answer)) {
    err(`${label}: "answer" must be an integer`);
  } else if (q.answer < 0 || q.answer > GUARDRAILS.optionsPerQuestion - 1) {
    err(`${label}: "answer" must be between 0 and ${GUARDRAILS.optionsPerQuestion - 1}`);
  }
  if (!q.explanation || typeof q.explanation !== 'string' || !q.explanation.trim()) {
    err(`${label}: missing or empty "explanation"`);
  }
}

function validateQuizJson(quizPath, chapterId) {
  const quiz = readJson(quizPath, quizPath);
  if (!quiz) return;

  const required = [
    'badge',
    'page_title',
    'interstitial_html',
    'bonus_mode_badge',
    'book_heading',
    'subtitle',
    'standard',
    'bonus',
  ];
  required.forEach((key) => {
    if (quiz[key] === undefined || quiz[key] === null || quiz[key] === '') {
      err(`${chapterId} quiz.json: missing "${key}"`);
    }
  });

  if (quiz.book_heading && quiz.book_heading !== GUARDRAILS.bookHeading) {
    warn(`${chapterId}: book_heading differs from club default (expected consistency)`);
  }
  if (quiz.subtitle && quiz.subtitle !== GUARDRAILS.quizSubtitle) {
    warn(`${chapterId}: subtitle differs from club default`);
  }
  if (quiz.bonus_mode_badge && quiz.bonus_mode_badge !== GUARDRAILS.bonusModeBadge) {
    warn(`${chapterId}: bonus_mode_badge differs from club default`);
  }

  if (quiz.interstitial_html && !quiz.interstitial_html.includes('<strong>')) {
    warn(`${chapterId}: interstitial_html should wrap bonus mode title in <strong>`);
  }

  if (!Array.isArray(quiz.standard)) {
    err(`${chapterId}: "standard" must be an array`);
  } else if (quiz.standard.length !== GUARDRAILS.standardQuestionCount) {
    err(
      `${chapterId}: standard must have ${GUARDRAILS.standardQuestionCount} questions (got ${quiz.standard.length})`,
    );
  } else {
    quiz.standard.forEach((q, i) => {
      validateQuestion(q, `${chapterId} standard`, i);
      if (q.q && GUARDRAILS.bonusPrefix.test(q.q)) {
        err(`${chapterId} standard Q${i + 1}: must not use bonus prefix`);
      }
    });
  }

  if (!Array.isArray(quiz.bonus)) {
    err(`${chapterId}: "bonus" must be an array`);
  } else if (quiz.bonus.length !== GUARDRAILS.bonusQuestionCount) {
    err(
      `${chapterId}: bonus must have ${GUARDRAILS.bonusQuestionCount} questions (got ${quiz.bonus.length})`,
    );
  } else {
    quiz.bonus.forEach((q, i) => {
      validateQuestion(q, `${chapterId} bonus`, i);
      const expected = `[BÔNUS IA ${i + 1}]`;
      if (q.q && !q.q.startsWith(expected)) {
        err(`${chapterId} bonus Q${i + 1}: must start with "${expected}"`);
      }
      if (q.q && !/\b(IA|Inteligência Artificial|LLM|copilot|modelo)/i.test(q.q)) {
        warn(`${chapterId} bonus Q${i + 1}: should tie chapter theme to AI context`);
      }
    });
  }

  if (quiz.page_title && !quiz.page_title.includes('Bônus IA')) {
    warn(`${chapterId}: page_title usually includes "Bônus IA"`);
  }
}

function validateChapterHtml(indexPath, chapter, book) {
  const id = chapter.id;
  const html = fs.readFileSync(indexPath, 'utf8');

  if (!html.includes('../../assets/css/btc.css')) {
    err(`${id} index.html: missing link to btc.css`);
  }
  if (!html.includes('data-book-slug="fundamentals-software-architecture"')) {
    err(`${id} index.html: missing data-book-slug on body`);
  }
  if (!html.includes(`data-chapter-id="${id}"`)) {
    err(`${id} index.html: data-chapter-id must be "${id}"`);
  }
  if (!html.includes('chapter-nav.js')) {
    err(`${id} index.html: missing chapter-nav.js`);
  }
  if (!html.includes('href="quiz.html"')) {
    err(`${id} index.html: missing quiz CTA link`);
  }
  if (chapter.headline && !html.includes(chapter.headline.replace(/&/g, '&amp;'))) {
    const plain = chapter.headline;
    if (!html.includes(plain)) {
      warn(`${id}: <h1> may not match catalog headline "${chapter.headline}"`);
    }
  }
  if (!html.includes('<div class="card">')) {
    warn(`${id}: summary should use at least one .card section`);
  }

  const dir = path.dirname(indexPath);
  const folder = path.basename(dir);
  if (folder !== id) {
    err(`${id}: folder name "${folder}" must match chapter id`);
  }
}

function validateQuizShell(quizHtmlPath, id) {
  const html = fs.readFileSync(quizHtmlPath, 'utf8');
  const required = ['quiz-engine.js', 'quiz.css', 'btc.css', 'id="interstitial-body"'];
  required.forEach((needle) => {
    if (!html.includes(needle)) {
      err(`${id} quiz.html: missing "${needle}"`);
    }
  });
}

function validateCatalog(data) {
  if (!data.books || !Array.isArray(data.books) || data.books.length === 0) {
    err('books.json: "books" must be a non-empty array');
    return;
  }

  data.books.forEach((book) => {
    const prefix = `book "${book.slug || '?'}"`;
    if (!book.slug || !book.base_path || !book.chapters) {
      err(`${prefix}: missing slug, base_path, or chapters`);
      return;
    }

    const numbers = new Set();
    const ids = new Set();
    let prev = 0;

    book.chapters.forEach((ch, i) => {
      if (!ch.id || typeof ch.number !== 'number') {
        err(`${prefix} chapter[${i}]: need id and number`);
        return;
      }
      if (ids.has(ch.id)) err(`${prefix}: duplicate chapter id "${ch.id}"`);
      if (numbers.has(ch.number)) err(`${prefix}: duplicate chapter number ${ch.number}`);
      ids.add(ch.id);
      numbers.add(ch.number);
      if (ch.number < prev) {
        warn(`${prefix}: chapters should be sorted by number (found ${ch.number} after ${prev})`);
      }
      prev = ch.number;

      const chapterDir = path.join(ROOT, book.base_path, ch.id);
      const indexPath = path.join(chapterDir, 'index.html');
      const quizPath = path.join(chapterDir, 'quiz.html');
      const quizJsonPath = path.join(chapterDir, 'quiz.json');

      if (!fileExists(indexPath)) err(`Missing ${book.base_path}/${ch.id}/index.html (listed in catalog)`);
      else validateChapterHtml(indexPath, ch, book);

      if (!fileExists(quizPath)) err(`Missing ${book.base_path}/${ch.id}/quiz.html`);
      else validateQuizShell(quizPath, ch.id);

      if (!fileExists(quizJsonPath)) err(`Missing ${book.base_path}/${ch.id}/quiz.json`);
      else validateQuizJson(quizJsonPath, ch.id);
    });

    if (book.spotlight_chapter != null) {
      const spotlight = book.chapters.find((c) => c.number === book.spotlight_chapter);
      if (!spotlight) {
        err(`${prefix}: spotlight_chapter ${book.spotlight_chapter} not in chapters list`);
      }
    }

    const catalogIds = new Set(book.chapters.map((c) => c.id));
    const baseDir = path.join(ROOT, book.base_path);
    if (fs.existsSync(baseDir)) {
      fs.readdirSync(baseDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name.startsWith('chapter-'))
        .forEach((d) => {
          if (!catalogIds.has(d.name)) {
            warn(`Directory ${book.base_path}/${d.name} exists but is not in books.json`);
          }
        });
    }
  });
}

function main() {
  const data = readJson(BOOKS_PATH, BOOKS_PATH);
  if (data) validateCatalog(data);

  if (warnings.length) {
    console.warn('\nWarnings:');
    warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
  }

  if (errors.length) {
    console.error('\nErrors:');
    errors.forEach((e) => console.error(`  ✗ ${e}`));
    console.error(`\nHarness failed (${errors.length} error(s), ${warnings.length} warning(s)).`);
    process.exit(1);
  }

  console.log(`Harness passed (${warnings.length} warning(s)).`);
}

main();