import { initialState, earnedPoints, balance, toggleNorm, redeemReward, REWARD_COST } from './demo-state.mjs?v=20261004';

let state = initialState();
let feedback = false;
let celebrationTimer;
const board = document.querySelector('.demo-board');
const tabs = [...board.querySelectorAll('[role="tab"]')];
const dialog = document.querySelector('#reward-dialog');
const confirm = document.querySelector('#reward-confirm');
const cancel = document.querySelector('#reward-cancel');
const acknowledge = document.querySelector('#reward-acknowledge');
const pointsCopy = points => `${points} ${points === 1 ? 'punto' : 'puntos'}`;

function render(announcement = '') {
  const points = balance(state);
  board.querySelector('#demo-balance').textContent = points;
  board.querySelectorAll('[data-norm]').forEach(button => {
    const completed = state.completed.includes(button.dataset.norm);
    button.setAttribute('aria-checked', String(completed));
    button.querySelector('small').textContent = completed ? 'Completada' : 'Pendiente';
  });
  const available = points >= REWARD_COST;
  board.querySelector('#reward-status').textContent = available ? 'Disponible' : 'No hay puntos suficientes';
  board.querySelector('#reward-open').dataset.available = available;
  board.querySelector('#reward-lock').hidden = available;
  board.querySelectorAll('.progress-day').forEach((day, index) => {
    const earned = index === 6 ? earnedPoints(state) : 0;
    day.querySelector('.progress-value').textContent = earned;
    day.querySelector('.progress-track > span').style.height = earned > 0 ? '48px' : '0px';
    day.setAttribute('aria-label', `${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][index]}: ${pointsCopy(earned)}`);
  });
  board.querySelector('#demo-feedback').hidden = !feedback;
  board.querySelector('#demo-message').textContent = feedback ? `Recompensa canjeada. Te quedan ${pointsCopy(points)}.` : '';
  document.querySelector('#demo-announcement').textContent = announcement;
}

function stopCelebration() {
  clearTimeout(celebrationTimer);
  board.querySelectorAll('.celebrating').forEach(button => button.classList.remove('celebrating'));
}

function selectTab(tab, focus = false) {
  stopCelebration();
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
    stopCelebration();
    state = toggleNorm(state, button.dataset.norm);
    feedback = false;
    const completed = state.completed.includes(button.dataset.norm);
    render(`${button.querySelector('strong').textContent}. ${completed ? 'Completada' : 'Pendiente'}. Saldo: ${pointsCopy(balance(state))}.`);
    if (completed) {
      button.classList.add('celebrating');
      celebrationTimer = setTimeout(stopCelebration, 2200);
    }
  });
});

document.querySelector('#demo-reset').addEventListener('click', () => {
  state = initialState();
  feedback = false;
  selectTab(tabs[0]);
  render('Tablero de ejemplo reiniciado. Saldo: 0 puntos.');
});
board.querySelector('#feedback-dismiss').addEventListener('click', () => { feedback = false; render(); });

board.querySelector('#reward-open').addEventListener('click', () => {
  feedback = false;
  render();
  const points = balance(state);
  const available = points >= REWARD_COST;
  document.querySelector('#reward-dialog-title').textContent = available ? '¿Canjear recompensa?' : 'No hay puntos suficientes';
  document.querySelector('#reward-dialog-description').textContent = `Noche de pizza en familia\n${available ? 'Se descontarán 5 puntos del saldo.' : `Faltan ${pointsCopy(REWARD_COST - points)} para canjear esta recompensa.`}`;
  document.querySelector('#reward-dialog-balance').textContent = `Saldo: ${pointsCopy(points)}`;
  confirm.hidden = cancel.hidden = !available;
  acknowledge.hidden = available;
  dialog.showModal();
  (available ? confirm : acknowledge).focus();
});

confirm.addEventListener('click', () => {
  if (!dialog.open || balance(state) < REWARD_COST) return;
  state = redeemReward(state);
  feedback = true;
  render();
  dialog.close();
});
cancel.addEventListener('click', () => dialog.close());
acknowledge.addEventListener('click', () => dialog.close());
render();
