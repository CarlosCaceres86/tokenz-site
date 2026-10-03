export const NORMS = Object.freeze({ chores: 2, teeth: 2, reading: 3 });
export const REWARD_COST = 5;

export const initialState = () => ({ completed: [], redeemed: false });

export function balance(state) {
  return state.completed.reduce((points, key) => points + NORMS[key], 0)
    - (state.redeemed ? REWARD_COST : 0);
}

export function toggleNorm(state, key) {
  if (state.redeemed || !Object.hasOwn(NORMS, key)) return state;
  return {
    ...state,
    completed: state.completed.includes(key)
      ? state.completed.filter(value => value !== key)
      : [...state.completed, key],
  };
}

export function redeemReward(state) {
  if (state.redeemed || balance(state) < REWARD_COST) return state;
  return { ...state, redeemed: true };
}
