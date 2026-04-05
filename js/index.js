/* ============================================================
   QuizStack 2026 — Login Page Logic (index.js)
   ============================================================ */

'use strict';

/* ── Validation helper ── */
function validate(id, errId, testFn) {
  const el  = document.getElementById(id);
  const err = document.getElementById(errId);
  const ok  = testFn(el.value.trim());
  el.classList.toggle('error', !ok);
  err.classList.toggle('show', !ok);
  return ok;
}

/* ── Launch quiz (manual form) ── */
function startQuiz() {
  const nameOk  = validate('inp-name',  'err-name',  v => v.length >= 2);
  const emailOk = validate('inp-email', 'err-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
  const phoneOk = validate('inp-phone', 'err-phone', v => /^[+\d\s\-()]{7,}$/.test(v));
  if (!nameOk || !emailOk || !phoneOk) return;

  sessionStorage.setItem('qs_user', JSON.stringify({
    name:      document.getElementById('inp-name').value.trim(),
    email:     document.getElementById('inp-email').value.trim(),
    phone:     document.getElementById('inp-phone').value.trim(),
    startTime: Date.now()
  }));

  window.location.href = 'quiz.html';
}

/* ── Google Sign-In handler ──
   Replace YOUR_GOOGLE_CLIENT_ID with your actual OAuth 2.0 client ID.
   Full setup: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
── */
function handleGoogleCredential(response) {
  try {
    // Decode the JWT payload (header.payload.signature)
    const payload = JSON.parse(atob(response.credential.split('.')[1]));

    sessionStorage.setItem('qs_user', JSON.stringify({
      name:      payload.name  || 'Google User',
      email:     payload.email || '',
      phone:     'via Google',
      picture:   payload.picture || '',
      startTime: Date.now()
    }));

    window.location.href = 'quiz.html';
  } catch (e) {
    console.error('Google Sign-In decode error:', e);
    alert('Google Sign-In failed. Please try the manual form.');
  }
}

/* ── Fallback: manual "Sign in with Google" button click ──
   (Triggers Google One Tap prompt when GSI library is loaded)
── */
function triggerGoogleSignIn() {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.prompt();
  } else {
    // Library not loaded (no Client ID set) — show friendly notice
    alert(
      'Google Sign-In is not configured yet.\n\n' +
      'Steps to enable it:\n' +
      '1. Go to https://console.cloud.google.com\n' +
      '2. Create an OAuth 2.0 Client ID\n' +
      '3. Replace YOUR_GOOGLE_CLIENT_ID in index.html\n\n' +
      'For now, please use the manual form below.'
    );
  }
}

/* ── Live blur-validation ── */
document.addEventListener('DOMContentLoaded', () => {
  const rules = {
    'inp-name':  ['err-name',  v => v.length >= 2],
    'inp-email': ['err-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
    'inp-phone': ['err-phone', v => /^[+\d\s\-()]{7,}$/.test(v)],
  };
  Object.entries(rules).forEach(([id, [errId, fn]]) => {
    document.getElementById(id).addEventListener('blur', () => validate(id, errId, fn));
  });
});

/* ── Enter key → submit form ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') startQuiz();
});
