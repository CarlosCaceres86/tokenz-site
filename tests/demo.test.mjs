import test from 'node:test';
import assert from 'node:assert/strict';
import * as demo from '../demo-state.mjs';

const {
  initialState,
  earnedPoints,
  balance,
  toggleNorm,
  redeemReward,
  NORMS,
  REWARD_COST,
} = demo;

test('starts independent demonstrations with the app norm and reward values', () => {
  assert.deepEqual(NORMS, { chores: 2, teeth: 2, reading: 3 });
  assert.equal(REWARD_COST, 5);

  const first = initialState();
  const second = initialState();

  assert.deepEqual(first, { completed: [], redemptions: 0 });
  assert.deepEqual(second, { completed: [], redemptions: 0 });
  assert.notEqual(first, second);
  assert.notEqual(first.completed, second.completed);
});

test('earned points and available balance start equal to the completed norms', () => {
  const completed = Object.keys(NORMS).reduce(toggleNorm, initialState());

  assert.equal(earnedPoints(completed), 7);
  assert.equal(balance(completed), 7);
});

test('completing, undoing, and completing a norm again is immutable and never duplicates its key', () => {
  const original = initialState();
  const completed = toggleNorm(original, 'chores');
  const undone = toggleNorm(completed, 'chores');
  const completedAgain = toggleNorm(undone, 'chores');

  assert.deepEqual(original, { completed: [], redemptions: 0 });
  assert.deepEqual(completed.completed, ['chores']);
  assert.equal(earnedPoints(completed), 2);
  assert.deepEqual(undone.completed, []);
  assert.equal(earnedPoints(undone), 0);
  assert.deepEqual(completedAgain.completed, ['chores']);
  assert.equal(completedAgain.completed.filter(key => key === 'chores').length, 1);
  assert.equal(earnedPoints(completedAgain), 2);
});

test('an unknown norm leaves the demonstration unchanged', () => {
  const state = toggleNorm(initialState(), 'chores');

  assert.strictEqual(toggleNorm(state, 'untrusted-key'), state);
  assert.deepEqual(state.completed, ['chores']);
});

test('an underfunded reward attempt leaves the state unchanged', () => {
  const state = toggleNorm(initialState(), 'teeth');

  assert.equal(balance(state), 2);
  assert.strictEqual(redeemReward(state), state);
});

test('redeems once at the exact five-point boundary and preserves earned progress', () => {
  const ready = toggleNorm(toggleNorm(initialState(), 'chores'), 'reading');
  const redeemed = redeemReward(ready);

  assert.equal(earnedPoints(ready), 5);
  assert.equal(balance(ready), REWARD_COST);
  assert.deepEqual(redeemed, { completed: ['chores', 'reading'], redemptions: 1 });
  assert.equal(earnedPoints(redeemed), 5);
  assert.equal(balance(redeemed), 0);
  assert.strictEqual(redeemReward(redeemed), redeemed);
});

test('norms remain toggleable after redemption, even when undoing creates a negative balance', () => {
  const ready = toggleNorm(toggleNorm(initialState(), 'chores'), 'reading');
  const redeemed = redeemReward(ready);
  const withUnrelatedNorm = toggleNorm(redeemed, 'teeth');
  const withoutChores = toggleNorm(withUnrelatedNorm, 'chores');
  const underfunded = toggleNorm(withoutChores, 'reading');

  assert.deepEqual(withUnrelatedNorm.completed, ['chores', 'reading', 'teeth']);
  assert.equal(earnedPoints(redeemed), 5);
  assert.equal(balance(redeemed), 0);
  assert.equal(earnedPoints(withUnrelatedNorm), 7);
  assert.equal(balance(withUnrelatedNorm), 2);
  assert.equal(earnedPoints(underfunded), 2);
  assert.equal(balance(underfunded), -3);
  assert.equal(underfunded.redemptions, 1);
});

test('re-completing an undone norm restores earned points without duplicating it', () => {
  const ready = toggleNorm(toggleNorm(initialState(), 'chores'), 'reading');
  const redeemed = redeemReward(ready);
  const underfunded = toggleNorm(
    toggleNorm(toggleNorm(redeemed, 'teeth'), 'chores'),
    'reading',
  );
  const restored = toggleNorm(underfunded, 'reading');

  assert.equal(balance(underfunded), -3);
  assert.equal(earnedPoints(restored), 5);
  assert.equal(balance(restored), 0);
  assert.deepEqual(restored.completed, ['teeth', 'reading']);
  assert.equal(restored.completed.filter(key => key === 'reading').length, 1);
  assert.equal(restored.redemptions, 1);
});

test('a second redemption attempt is rejected when the one-day demo has fewer than five points left', () => {
  const allNorms = Object.keys(NORMS).reduce(toggleNorm, initialState());
  const redeemed = redeemReward(allNorms);

  assert.equal(earnedPoints(redeemed), 7);
  assert.equal(balance(redeemed), 2);
  assert.strictEqual(redeemReward(redeemed), redeemed);
  assert.equal(redeemed.redemptions, 1);
});
