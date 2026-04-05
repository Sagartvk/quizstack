/* ============================================================
   QuizStack 2026 — Quiz Page Logic (quiz.js)
   ============================================================ */

'use strict';

/* ── Replace with your API Gateway endpoint ── */
const API_URL = 'YOUR_API_GATEWAY_URL_HERE';

/* ── State ── */
let currentQ      = 0;
let answers       = {};         // { questionIndex: chosenOptionIndex }
let skipped       = new Set();
let timerSecs     = 30 * 60;
let timerInterval = null;

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const user = sessionStorage.getItem('qs_user');
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  buildNavGrid();
  renderQuestion();
  startTimer();
  initSidebar();
});

/* ─────────────────────────────────────────────
   TIMER
───────────────────────────────────────────── */
function startTimer() {
  timerInterval = setInterval(() => {
    timerSecs--;
    updateTimerDisplay();
    if (timerSecs <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m       = Math.floor(timerSecs / 60);
  const s       = timerSecs % 60;
  const display = document.getElementById('timer-display');
  display.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  display.className   = 'timer-display';
  if (timerSecs <= 300) display.classList.add('warn');
  if (timerSecs <= 60)  display.classList.add('danger');
}

function getTimerString() {
  const m = Math.floor(timerSecs / 60);
  const s = timerSecs % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/* ─────────────────────────────────────────────
   RENDER QUESTION
───────────────────────────────────────────── */
function renderQuestion() {
  const q = QUESTIONS[currentQ];

  document.getElementById('cur-q-num').textContent  = currentQ + 1;
  document.getElementById('q-num-badge').textContent = `Q ${String(currentQ+1).padStart(2,'0')}`;
  document.getElementById('q-category').textContent  = q.cat;
  document.getElementById('q-text').textContent       = q.q;
  document.getElementById('btn-prev').disabled        = currentQ === 0;

  /* Options */
  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  const keys = ['A','B','C','D'];
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn' + (answers[currentQ] === i ? ' selected' : '');
    btn.onclick   = () => selectAnswer(i);
    btn.innerHTML = `<div class="opt-key">${keys[i]}</div><div class="opt-text">${opt}</div>`;
    grid.appendChild(btn);
  });

  /* Progress bar */
  const answered = Object.keys(answers).length;
  document.getElementById('progress-fill').style.width = `${(answered / QUESTIONS.length) * 100}%`;

  updateNav();
  updateStats();

  /* Restart slide-in animation */
  const card = document.getElementById('q-card');
  card.style.animation = 'none';
  void card.offsetHeight;  // reflow
  card.style.animation = 'slideIn 0.3s ease';
}

function selectAnswer(optIndex) {
  answers[currentQ] = optIndex;
  skipped.delete(currentQ);
  renderQuestion();
}

function navigate(dir) {
  const next = currentQ + dir;
  if (next >= 0 && next < QUESTIONS.length) {
    currentQ = next;
    renderQuestion();
    closeSidebar();
  }
}

function skipQuestion() {
  skipped.add(currentQ);
  if (currentQ < QUESTIONS.length - 1) {
    currentQ++;
    renderQuestion();
  }
}

/* ─────────────────────────────────────────────
   NAVIGATOR GRID
───────────────────────────────────────────── */
function buildNavGrid() {
  const grid = document.getElementById('nav-grid');
  grid.innerHTML = '';
  for (let i = 0; i < QUESTIONS.length; i++) {
    const btn     = document.createElement('button');
    btn.className = 'nav-btn';
    btn.id        = `nav-${i}`;
    btn.textContent = i + 1;
    btn.onclick   = () => { currentQ = i; renderQuestion(); closeSidebar(); };
    grid.appendChild(btn);
  }
}

function updateNav() {
  for (let i = 0; i < QUESTIONS.length; i++) {
    const btn = document.getElementById(`nav-${i}`);
    btn.className = 'nav-btn';
    if (i === currentQ)               btn.classList.add('current');
    else if (answers[i] !== undefined) btn.classList.add('answered');
    else if (skipped.has(i))           btn.classList.add('skipped');
  }
}

function updateStats() {
  const answered = Object.keys(answers).length;
  const sk       = skipped.size;
  document.getElementById('stat-answered').textContent  = answered;
  document.getElementById('stat-skipped').textContent   = sk;
  document.getElementById('stat-remaining').textContent = QUESTIONS.length - answered;
  document.getElementById('bar-answered').textContent   = answered;
}

/* ─────────────────────────────────────────────
   MOBILE SIDEBAR TOGGLE
───────────────────────────────────────────── */
function initSidebar() {
  const sidebar = document.getElementById('nav-sidebar');
  const menuBtn = document.getElementById('btn-menu');
  const closeBtn = document.getElementById('btn-sidebar-close');

  if (menuBtn)  menuBtn.addEventListener('click',  () => sidebar.classList.toggle('open'));
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

  /* Close sidebar on outside tap */
  document.addEventListener('click', e => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== menuBtn) {
      closeSidebar();
    }
  });
}

function closeSidebar() {
  const sidebar = document.getElementById('nav-sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

/* ─────────────────────────────────────────────
   SUBMIT MODAL
───────────────────────────────────────────── */
function openSubmitModal() {
  const answered = Object.keys(answers).length;
  document.getElementById('m-answered').textContent = answered;
  document.getElementById('m-skipped').textContent  = QUESTIONS.length - answered;
  document.getElementById('m-time').textContent     = getTimerString();
  document.getElementById('submit-modal').classList.add('show');
}

function closeModal() {
  document.getElementById('submit-modal').classList.remove('show');
}

/* ─────────────────────────────────────────────
   SUBMIT QUIZ → API Gateway → DynamoDB
───────────────────────────────────────────── */
async function submitQuiz() {
  clearInterval(timerInterval);
  closeModal();

  const user    = JSON.parse(sessionStorage.getItem('qs_user'));
  const score   = QUESTIONS.filter((q, i) => answers[i] === q.ans).length;
  const total   = Object.keys(answers).length;
  const timeTaken = (30 * 60) - timerSecs;

  const payload = {
    name:           user.name,
    email:          user.email,
    phone:          user.phone,
    score,
    totalAttempted: total,
    timeTaken,
    answers
  };

  /* Store locally for results page */
  sessionStorage.setItem('qs_result', JSON.stringify({
    ...payload,
    questions: QUESTIONS
  }));

  /* POST to API Gateway */
  try {
    const res  = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const data = await res.json();
    sessionStorage.setItem('qs_submission_id', data.id || 'local');
  } catch (err) {
    console.warn('API submission failed (offline fallback):', err);
    sessionStorage.setItem('qs_submission_id', 'offline-' + Date.now());
  }

  window.location.href = 'results.html';
}

/* ─────────────────────────────────────────────
   KEYBOARD SHORTCUTS
───────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.key) {
    case 'ArrowRight': navigate(1);         break;
    case 'ArrowLeft':  navigate(-1);        break;
    case '1': selectAnswer(0); break;
    case '2': selectAnswer(1); break;
    case '3': selectAnswer(2); break;
    case '4': selectAnswer(3); break;
  }
});
