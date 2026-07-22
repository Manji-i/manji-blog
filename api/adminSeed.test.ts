import assert from 'node:assert/strict';
import test from 'node:test';

test('production does not seed an administrator without explicit credentials', async () => {
  let getAdminSeedConfig: ((env: Record<string, string | undefined>) => unknown) | undefined;

  try {
    ({ getAdminSeedConfig } = await import('./adminSeed.js'));
  } catch {
    assert.fail('getAdminSeedConfig is not implemented');
  }

  assert.equal(getAdminSeedConfig({ NODE_ENV: 'production' }), null);
});

test('administrator seeding requires both email and password hash', async () => {
  let getAdminSeedConfig: ((env: Record<string, string | undefined>) => unknown) | undefined;

  try {
    ({ getAdminSeedConfig } = await import('./adminSeed.js'));
  } catch {
    assert.fail('getAdminSeedConfig is not implemented');
  }

  assert.equal(
    getAdminSeedConfig({
      NODE_ENV: 'production',
      ADMIN_EMAIL: 'admin@example.com',
    }),
    null,
  );
  assert.deepEqual(
    getAdminSeedConfig({
      NODE_ENV: 'production',
      ADMIN_EMAIL: 'owner@example.com',
      ADMIN_NAME: 'Owner',
      ADMIN_PASSWORD_HASH: 'secure-hash',
    }),
    {
      email: 'owner@example.com',
      name: 'Owner',
      passwordHash: 'secure-hash',
    },
  );
});
