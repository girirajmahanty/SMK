import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimit } from './rateLimit.js';
import { connectStore } from './store.js';

test('rate limit allows up to max hits per key, then blocks until the window resets', async () => {
  const limit = createRateLimit({ windowMs: 50, max: 2 });
  assert.equal(limit.allow('a'), true);
  assert.equal(limit.allow('a'), true);
  assert.equal(limit.allow('a'), false);
  assert.equal(limit.allow('b'), true, 'other visitors are counted separately');
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(limit.allow('a'), true, 'a new window starts after the old one ends');
});

test('rate limit sweeps expired entries so memory does not grow', async () => {
  const limit = createRateLimit({ windowMs: 30, max: 5 });
  for (let i = 0; i < 50; i += 1) limit.allow(`ip-${i}`);
  assert.equal(limit.size(), 50);
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(limit.size(), 0);
});

test('rate limit middleware answers 429 once over the limit', () => {
  const limit = createRateLimit({ windowMs: 1000, max: 1 });
  const res = { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };
  let passed = 0;
  limit({ ip: 'x' }, res, () => { passed += 1; });
  limit({ ip: 'x' }, res, () => { passed += 1; });
  assert.equal(passed, 1);
  assert.equal(res.statusCode, 429);
  assert.equal(res.body.code, 'TOO_MANY');
});

test('production refuses to start without MongoDB instead of using the temporary JSON file', async () => {
  await assert.rejects(connectStore(undefined, { production: true }), /MONGO_URI is required/);
});
