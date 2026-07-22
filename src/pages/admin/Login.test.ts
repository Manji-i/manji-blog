import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./Login.tsx', import.meta.url), 'utf8');

test('login page does not expose default administrator credentials', () => {
  assert.doesNotMatch(source, /默认账号|默认密码/);
  assert.doesNotMatch(source, /admin123|sj2kv1t5/);
});
