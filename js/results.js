/* ============================================================
   QuizStack 2026 — Results Page Logic (results.js)
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const raw   = sessionStorage.getItem('qs_result');
  const subId = sessionStorage.getItem('qs_submission_id') || 'N/A';
  if (!raw) { window.location.href = 'index.html'; return; }
  renderResults(JSON.parse(raw), subId);
});

/* ─────────────────────────────────────────────
   RENDER ALL RESULTS
───────────────────────────────────────────── */
function renderResults(data, subId) {
  const { name, email, phone, score, totalAttempted, timeTaken, answers, questions } = data;
  const pct     = Math.round((score / 50) * 100);
  const timeStr = formatTime(timeTaken || 0);

  /* ── Grade ── */
  let grade, gradeClass, gradeEmoji, ringColor, scoreColor, subtext;
  if (pct >= 90) {
    grade='DISTINCTION'; gradeClass='excellent'; gradeEmoji='🏆';
    ringColor='#f5a623'; scoreColor='var(--gold)';
    subtext='Outstanding performance! You are AWS-ready.';
  } else if (pct >= 70) {
    grade='PASS — GOOD'; gradeClass='pass'; gradeEmoji='✅';
    ringColor='#00e676'; scoreColor='var(--green)';
    subtext='Great work! You have a solid AWS foundation.';
  } else if (pct >= 50) {
    grade='PASS — AVERAGE'; gradeClass='pass'; gradeEmoji='👍';
    ringColor='#00d4ff'; scoreColor='var(--cyan)';
    subtext='You passed! Review the topics you missed.';
  } else {
    grade='NEEDS IMPROVEMENT'; gradeClass='fail'; gradeEmoji='📚';
    ringColor='#ff4757'; scoreColor='var(--red)';
    subtext="Keep studying — you'll get there!";
  }

  /* ── Animated score number ── */
  const scoreEl = document.getElementById('score-display');
  scoreEl.style.color = scoreColor;
  let cnt = 0;
  const anim = setInterval(() => {
    cnt = Math.min(cnt + 1, score);
    scoreEl.textContent = cnt;
    if (cnt >= score) clearInterval(anim);
  }, 60);

  /* ── Animated ring ── */
  setTimeout(() => {
    const ring          = document.getElementById('score-ring');
    const circumference = 502;
    ring.style.stroke            = ringColor;
    ring.style.strokeDashoffset  = circumference - (pct / 100) * circumference;
  }, 200);

  /* ── Grade badge ── */
  const badge = document.getElementById('grade-badge');
  badge.className   = `grade-badge ${gradeClass}`;
  badge.innerHTML   = `${gradeEmoji} ${grade}`;
  document.getElementById('score-subtext').textContent = subtext;

  /* ── Confetti if passed ── */
  if (pct >= 50) launchConfetti(ringColor);

  /* ── Stats row ── */
  const wrong = totalAttempted - score;
  const statsData = [
    { icon:'✅', val:score,              label:'Correct',    color:'var(--green)'  },
    { icon:'❌', val:wrong,              label:'Wrong',      color:'var(--red)'    },
    { icon:'⏩', val:50-totalAttempted,  label:'Skipped',    color:'var(--orange)' },
    { icon:'⏱', val:timeStr,            label:'Time Taken', color:'var(--cyan)'   },
  ];
  document.getElementById('stats-row').innerHTML = statsData.map(s =>
    `<div class="stat-card">
       <div class="stat-icon">${s.icon}</div>
       <div class="stat-value" style="color:${s.color}">${s.val}</div>
       <div class="stat-label">${s.label}</div>
     </div>`
  ).join('');

  /* ── User card ── */
  const shortId = String(subId).substring(0,12);
  document.getElementById('user-card').innerHTML =
    `<div class="user-avatar">👤</div>
     <div class="user-info">
       <div class="user-name">${escHtml(name)}</div>
       <div class="user-meta">${escHtml(email)} · ${escHtml(phone)}</div>
     </div>
     <div class="submission-id">ID: ${escHtml(shortId)}...</div>`;

  /* ── Overview tab ── */
  document.getElementById('tab-overview').innerHTML =
    `<div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:16px;">
       <div style="font-family:'Orbitron',monospace;font-size:12px;color:var(--muted);letter-spacing:3px;margin-bottom:16px;">CATEGORY BREAKDOWN</div>
       ${buildCategoryBreakdown(questions, answers)}
     </div>`;

  /* ── Review tab ── */
  buildReview(questions, answers);
}

/* ─────────────────────────────────────────────
   CATEGORY BREAKDOWN
───────────────────────────────────────────── */
function buildCategoryBreakdown(questions, answers) {
  const cats = {};
  questions.forEach((q, i) => {
    if (!cats[q.cat]) cats[q.cat] = { total:0, correct:0 };
    cats[q.cat].total++;
    if (answers[i] === q.ans) cats[q.cat].correct++;
  });

  return Object.entries(cats).map(([cat, d]) => {
    const pct      = Math.round((d.correct / d.total) * 100);
    const barColor = pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)';
    return `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;color:var(--text);">${escHtml(cat)}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${barColor};">${d.correct}/${d.total} (${pct}%)</span>
        </div>
        <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${barColor};border-radius:3px;
                      transition:width 1.5s ease;box-shadow:0 0 8px ${barColor}40;"></div>
        </div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   REVIEW ANSWERS
───────────────────────────────────────────── */
function buildReview(questions, answers) {
  const keys = ['A','B','C','D'];
  const html = questions.map((q, i) => {
    const userAns   = answers[i];
    const isCorrect = userAns === q.ans;
    const isSkipped = userAns === undefined;
    let status, statusClass;
    if (isSkipped)      { status='SKIPPED';   statusClass='skipped'; }
    else if (isCorrect) { status='CORRECT ✓'; statusClass='correct'; }
    else                { status='WRONG ✕';   statusClass='wrong';   }

    const optsHtml = q.opts.map((opt, j) => {
      let cls = 'neutral';
      if (j === q.ans)                   cls = 'correct-ans';
      else if (j === userAns && !isCorrect) cls = 'wrong-ans';
      const ind = j === q.ans ? '✓' : (j === userAns && !isCorrect ? '✕' : keys[j]);
      return `<div class="review-opt ${cls}">
                <div class="opt-indicator">${ind}</div>
                <span>${escHtml(opt)}</span>
              </div>`;
    }).join('');

    return `<div class="review-item ${statusClass}">
              <div class="review-meta">
                <span class="review-qnum">Q${String(i+1).padStart(2,'0')}</span>
                <span class="review-cat">${escHtml(q.cat)}</span>
                <span class="review-status ${statusClass}">${status}</span>
              </div>
              <div class="review-q">${escHtml(q.q)}</div>
              <div class="review-opts">${optsHtml}</div>
            </div>`;
  }).join('');

  document.getElementById('tab-review').innerHTML = `<div class="review-wrap">${html}</div>`;
}

/* ─────────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────────── */
function showTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById('tab-overview').style.display = tab === 'overview' ? 'block' : 'none';
  document.getElementById('tab-review').style.display   = tab === 'review'   ? 'block' : 'none';
}

/* ─────────────────────────────────────────────
   RETRY
───────────────────────────────────────────── */
function retryQuiz() {
  sessionStorage.removeItem('qs_result');
  sessionStorage.removeItem('qs_submission_id');
  window.location.href = 'index.html';
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/* ─────────────────────────────────────────────
   CONFETTI
───────────────────────────────────────────── */
function launchConfetti(color) {
  const canvas = document.getElementById('confetti-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = [color, '#f5a623', '#00d4ff', '#ffffff', '#ffd166'];
  const particles = Array.from({ length: 120 }, () => ({
    x:   Math.random() * canvas.width,
    y:   Math.random() * -canvas.height,
    w:   Math.random() * 8 + 3,
    h:   Math.random() * 4 + 2,
    r:   Math.random() * 360,
    vx:  Math.random() * 2 - 1,
    vy:  Math.random() * 4 + 2,
    vr:  Math.random() * 4 - 2,
    col: colors[Math.floor(Math.random() * colors.length)]
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      if (p.y > canvas.height) p.y = -20;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r * Math.PI / 180);
      ctx.fillStyle    = p.col;
      ctx.globalAlpha  = 0.8;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    frame = requestAnimationFrame(draw);
  }
  draw();
  setTimeout(() => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 4000);
}
