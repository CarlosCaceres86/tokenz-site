// One illustrative day. The app's economy permits undo after spending and keeps norms usable.
export const NORMS = Object.freeze({ chores: 2, teeth: 2, reading: 3 });
export const REWARD_COST = 5;
export const initialState = () => ({ completed: [], redemptions: 0 });

export function earnedPoints(state) {
  return state.completed.reduce((points, key) => points + NORMS[key], 0);
}

export function balance(state) {
  return earnedPoints(state) - state.redemptions * REWARD_COST;
}

export function toggleNorm(state, key) {
  if (!Object.hasOwn(NORMS, key)) return state;
  return { ...state, completed: state.completed.includes(key)
    ? state.completed.filter(value => value !== key) : [...state.completed, key] };
}

export function redeemReward(state) {
  if (balance(state) < REWARD_COST) return state;
  return { ...state, redemptions: state.redemptions + 1 };
}
