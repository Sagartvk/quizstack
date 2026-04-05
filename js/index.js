/* ============================================================
   QuizStack 2026 — Login Page Logic (index.js)
   ============================================================ */

'use strict';

const CLIENT_ID = '638185409427-8tfkve11ffcp5e35du4m6bjhjobv6ftt.apps.googleusercontent.com';

/* ─────────────────────────────────────────────
   GOOGLE SIGN-IN — Initialise on page load
   The GSI script loads async, so we wait for
   it using the window.onload + polling trick.
───────────────────────────────────────────── */
function initGoogleSignIn() {
  if (!window.google || !window.google.accounts) {
    // GSI script not ready yet — retry in 100ms
    setTimeout(initGoogleSignIn, 100);
    return;
  }

  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback:  handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
}

// Start polling as soon as DOM is ready
document.addEventListener('DOMContentLoaded', initGoogleSignIn);

/* ─────────────────────────────────────────────
   BUTTON CLICK — Sign in with Google
   Uses renderButton so the popup is tied to the
   real user gesture (required by browsers).
───────────────────────────────────────────── */
function triggerGoogleSignIn() {
  const btn = document.getElementById('google-btn-container');

  if (!window.google || !window.google.accounts) {
    showGoogleError('Google Sign-In is still loading. Please wait a moment and try again.');
    return;
  }

  // Render a real Google button inside a hidden container then click it
  // This satisfies browser popup-blocker rules (must be a real user gesture)
  window.google.accounts.id.renderButton(btn, {
    type:  'standard',
    theme: 'outline',
    size:  'large',
  });

  // Small delay to let the button render, then programmatically click it
  setTimeout(() => {
    const rendered = btn.querySelector('div[role="button"]');
    if (rendered) {
      rendered.click();
    } else {
      // Fallback — show One Tap prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          showGoogleError(
            'Google Sign-In popup was blocked.\n\n' +
            'Please allow popups for this site, or use the manual form below.'
          );
        }
      });
    }
  }, 300);
}

/* ─────────────────────────────────────────────
   CALLBACK — Runs after Google returns a token
───────────────────────────────────────────── */
function handleGoogleCredential(response) {
  try {
    // JWT is three base64 parts: header.payload.signature
    // Add padding so atob() works correctly
    const base64 = response.credential.split('.')[1]
                     .replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    sessionStorage.setItem('qs_user', JSON.stringify({
      name:      payload.name    || payload.given_name || 'Google User',
      email:     payload.email   || '',
      phone:     'via Google',
      picture:   payload.picture || '',
      startTime: Date.now()
    }));

    window.location.href = 'quiz.html';

  } catch (e) {
    console.error('Google credential decode error:', e);
    showGoogleError('Sign-In failed. Please try the manual form below.');
  }
}

/* ─────────────────────────────────────────────
   MANUAL FORM — Validate and launch quiz
───────────────────────────────────────────── */
function validate(id, errId, testFn) {
  const el  = document.getElementById(id);
  const err = document.getElementById(errId);
  const ok  = testFn(el.value.trim());
  el.classList.toggle('error', !ok);
  err.classList.toggle('show', !ok);
  return ok;
}

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

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function showGoogleError(msg) {
  const el = document.getElementById('google-error');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
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

/* ── Enter key → submit manual form ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') startQuiz();
});
