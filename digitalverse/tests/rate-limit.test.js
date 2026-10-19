import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createThrottle } from '../rate-limit.js';

test('a limiter starts a fresh window after an entry expires', () => {
  let clock = 1_000;
  const throttle = createThrottle({
    windowMs: 1_000,
    max: 2,
    keyOf: key => key,
    now: () => clock,
  });

  throttle.bump('client-a');
  throttle.bump('client-a');
  assert.equal(throttle.isLimited('client-a'), true);
  assert.equal(throttle.retryAfterMs('client-a'), 1_000);

  clock += 1_001;
  assert.equal(throttle.isLimited('client-a'), false);
  assert.equal(throttle.retryAfterMs('client-a'), 0);
  throttle.bump('client-a');
  assert.equal(throttle.isLimited('client-a'), false);
  throttle.bump('client-a');
  assert.equal(throttle.isLimited('client-a'), true);
});

test('the limiter bounds its key map and can reset an entry', () => {
  let clock = 10;
  const throttle = createThrottle({
    windowMs: 1_000,
    max: 1,
    keyOf: key => key,
    now: () => clock,
    maxEntries: 2,
  });

  throttle.bump('client-a');
  throttle.bump('client-b');
  throttle.bump('client-c');
  assert.equal(throttle.size(), 2);
  assert.equal(throttle.isLimited('client-c'), true);

  throttle.reset('client-c');
  assert.equal(throttle.isLimited('client-c'), false);
  throttle.bump('client-a');
  assert.equal(throttle.size(), 2);
  clock += 2_000;
  throttle.bump('client-d');
  assert.equal(throttle.size(), 1, 'expired entries should be pruned when the map is full');
});
