import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ARTICLE_LIST_ORDER_BY } from './articleOrdering.js';

const routeSource = readFileSync(new URL('./routes/articles.ts', import.meta.url), 'utf8');

test('article list orders by publication date and falls back to creation date', async () => {
  const db = await open({ filename: ':memory:', driver: sqlite3.Database });

  try {
    await db.exec(`
      CREATE TABLE articles (
        title TEXT NOT NULL,
        published_at DATETIME,
        created_at DATETIME NOT NULL
      );
    `);
    await db.run(
      'INSERT INTO articles (title, published_at, created_at) VALUES (?, ?, ?)',
      ['published-earlier', '2026-06-01T00:00:00.000Z', '2026-07-20T00:00:00.000Z'],
    );
    await db.run(
      'INSERT INTO articles (title, published_at, created_at) VALUES (?, ?, ?)',
      ['published-latest', '2026-07-01T00:00:00.000Z', '2026-05-01T00:00:00.000Z'],
    );
    await db.run(
      'INSERT INTO articles (title, published_at, created_at) VALUES (?, ?, ?)',
      ['created-fallback', null, '2026-06-15T00:00:00.000Z'],
    );

    const rows = await db.all<{ title: string }[]>(
      `SELECT title FROM articles a ${ARTICLE_LIST_ORDER_BY}`,
    );

    assert.deepEqual(
      rows.map((row) => row.title),
      ['published-latest', 'created-fallback', 'published-earlier'],
    );
  } finally {
    await db.close();
  }
});

test('public and admin article lists use the shared publication ordering', () => {
  assert.equal(
    routeSource.match(/\$\{ARTICLE_LIST_ORDER_BY\} LIMIT \? OFFSET \?/g)?.length,
    2,
  );
});
