import { initialState, balance, toggleNorm, redeemReward, NORMS, REWARD_COST } from './demo-state.mjs';

let state = initialState();
const board = document.querySelector('.demo-board');
const tabs = [...board.querySelectorAll('[role="tab"]')];
const dialog = document.querySelector('#reward-dialog');
const confirm = document.querySelector('#reward-confirm');

function render() {
  const points = balance(state);
  board.querySelector('#demo-balance').textContent = points;
  board.querySelectorAll('[data-norm]').forEach(button => {
    const completed = state.completed.includes(button.dataset.norm);
    button.setAttribute('aria-pressed', String(completed));
    button.disabled = state.redeemed;
    button.querySelector('small').textContent = completed ? '¡Lo has conseguido!' : 'Pendiente';
    button.querySelector('.norm-value').textContent = completed ? '✓' : `+${NORMS[button.dataset.norm]} pts`;
  });
  board.querySelector('#reward-status').textContent = state.redeemed ? '¡Recompensa conseguida!' :
    points >= REWARD_COST ? '¡Ya puedes canjearla!' : `Te faltan ${REWARD_COST - points} puntos`;
  board.querySelector('#demo-message').textContent = state.redeemed ?
    '¡A disfrutar en familia! Puedes volver a empezar el ejemplo.' :
    points >= REWARD_COST ? '¡Ya hay puntos para una recompensa!' :
    points > 0 ? '¡Un logro más! Cada pequeño paso cuenta.' : '¡Todo empieza con un pequeño paso!';
}

function selectTab(tab, focus = false) {
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
      (tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    selectTab(tabs[index], true);
  });
});

board.querySelectorAll('[data-norm]').forEach(button => {
  button.addEventListener('click', () => {
    state = toggleNorm(state, button.dataset.norm);
    render();
  });
});

board.querySelector('#demo-reset').addEventListener('click', () => {
  state = initialState();
  selectTab(tabs[0]);
  render();
});

board.querySelector('#reward-open').addEventListener('click', () => {
  const available = !state.redeemed && balance(state) >= REWARD_COST;
  document.querySelector('#reward-dialog-title').textContent = state.redeemed ?
    '¡Esta recompensa ya es tuya!' : available ? '¿Canjeamos esta recompensa?' : 'Unos pasitos más';
  document.querySelector('#reward-dialog-description').textContent = state.redeemed ?
    'Vuelve a empezar el ejemplo para probarlo otra vez.' : available ?
    'Se descontarán 5 puntos del tablero de ejemplo.' : `Te faltan ${REWARD_COST - balance(state)} puntos. Completa otra norma para seguir sumando.`;
  confirm.hidden = !available;
  dialog.showModal();
});

confirm.addEventListener('click', () => {
  state = redeemReward(state);
  render();
  dialog.close();
});
document.querySelector('#reward-cancel').addEventListener('click', () => dialog.close());
render();
