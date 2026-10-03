import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, balance, toggleNorm, redeemReward, NORMS, REWARD_COST } from '../demo-state.mjs';

test('completing and undoing a norm changes its points exactly once', () => {
  const done = toggleNorm(initialState(), 'chores');
  assert.equal(balance(done), 2);
  assert.equal(balance(toggleNorm(done, 'chores')), 0);
});

test('all three completed norms produce their exact total', () => {
  const done = Object.keys(NORMS).reduce(toggleNorm, initialState());
  assert.equal(balance(done), 7);
});

test('an insufficient reward does not change the board', () => {
  const state = toggleNorm(initialState(), 'teeth');
  assert.deepEqual(redeemReward(state), state);
});

test('a reward can be redeemed once at the exact points boundary', () => {
  const ready = toggleNorm(toggleNorm(initialState(), 'chores'), 'reading');
  assert.equal(balance(ready), REWARD_COST);
  const redeemed = redeemReward(ready);
  assert.equal(balance(redeemed), 0);
  assert.equal(redeemed.redeemed, true);
  assert.deepEqual(redeemReward(redeemed), redeemed);
});

test('undo after a reward cannot create a negative balance', () => {
  const redeemed = redeemReward(toggleNorm(toggleNorm(initialState(), 'chores'), 'reading'));
  assert.deepEqual(toggleNorm(redeemed, 'chores'), redeemed);
});

test('unknown norms cannot change the demonstration', () => {
  const state = initialState();
  assert.deepEqual(toggleNorm(state, 'untrusted-key'), state);
});

test('a new demonstration has no previous state or mutation', () => {
  const original = initialState();
  toggleNorm(original, 'reading');
  assert.equal(balance(original), 0);
  assert.deepEqual(initialState(), original);
});
