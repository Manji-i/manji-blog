import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { HOME_ARTICLE_LIMIT } from './homeConfig.js';

const source = readFileSync(new URL('./Home.tsx', import.meta.url), 'utf8');

test('home page requests only the three latest articles', () => {
  assert.equal(HOME_ARTICLE_LIMIT, 3);
  assert.match(source, /articlesApi\.getAll\(\{ limit: HOME_ARTICLE_LIMIT \}\)/);
});

test('home page keeps the link to the complete article list', () => {
  assert.match(
    source,
    /to="\/articles"(?:(?!<\/Link>)[\s\S])*?<span>查看全部<\/span>/,
  );
});
