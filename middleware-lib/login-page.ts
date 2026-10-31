// Branded login page, returned by the middleware itself. Everything is
// inline (styles, fonts, icons), so no file is served before login.
// Colours, fonts and sizes follow arch/13-design-system.txt.
import { INTER_WOFF2, JAKARTA_WOFF2 } from './fonts.ts';

export type LoginState = 'idle' | 'wrong' | 'limited' | 'missing-config';

const MESSAGES: Record<Exclude<LoginState, 'idle'>, string> = {
  wrong: 'That password is not correct. Check it and try again.',
  limited: 'Too many attempts. Wait one minute, then try again.',
  'missing-config': 'This site is not configured yet: SITE_PASSWORD is missing in Vercel.',
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function loginPage(opts: { state: LoginState; next: string; nonce: string }): string {
  const { state, next, nonce } = opts;
  const error = state === 'idle' ? '' : MESSAGES[state];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="theme-color" content="#F7F9FC">
<title>Sign in · Picobello Architecture</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" rx="7" fill="#FF6B3D"/><path d="M5 20.5 11.2 10.6l3.6 5.4 2.4-3.2 5.8 7.7Z" fill="#0E1A2B"/><path d="m11.2 10.6 1.9 2.9-1.9-.9-1.6 1Z" fill="#fff"/></svg>')}">
<style>
@font-face{font-family:"Inter";font-style:normal;font-display:swap;font-weight:100 900;src:url(data:font/woff2;base64,${INTER_WOFF2}) format("woff2")}
@font-face{font-family:"Plus Jakarta Sans";font-style:normal;font-display:swap;font-weight:200 800;src:url(data:font/woff2;base64,${JAKARTA_WOFF2}) format("woff2")}
:root{--primary-900:#0B2E6B;--primary-800:#0F48A8;--primary-700:#1457C7;--primary-600:#1A66E0;--primary-500:#2F80FF;--primary-100:#DCEBFF;--accent-500:#FF6B3D;--ink:#0E1A2B;--ink-muted:#475467;--ink-faint:#98A2B3;--line:#E4E9F0;--line-strong:#CBD3DE;--surface:#FFFFFF;--surface-2:#F3F6FA;--snow:#F7F9FC;--danger-text:#C0291E;--danger-soft:#FEECEA;--danger-vivid:#F0443A;--ease:cubic-bezier(.2,.8,.2,1)}
*,*::before,*::after{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:var(--snow);color:var(--ink);font:400 16px/1.5 "Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-feature-settings:"cv11";-webkit-font-smoothing:antialiased;display:grid;place-items:center;padding:24px 16px}
.wrap{width:100%;max-width:420px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 4px 12px rgba(14,26,43,.06),0 1px 3px rgba(14,26,43,.05);overflow:hidden}
.ridge{display:block;width:100%;height:auto;background:var(--surface-2);border-bottom:1px solid var(--line)}
.body{padding:28px 32px 32px}
.logo{display:flex;align-items:center;gap:10px;margin-bottom:24px}
.word{font-family:"Plus Jakarta Sans","Segoe UI",system-ui,sans-serif;font-weight:800;font-size:18px;letter-spacing:-.02em;color:var(--primary-900)}
h1{margin:0;font-family:"Plus Jakarta Sans","Segoe UI",system-ui,sans-serif;font-weight:700;font-size:28px;line-height:34px;letter-spacing:-.02em}
.sub{margin:8px 0 28px;color:var(--ink-muted)}
label{display:block;font-size:14px;line-height:20px;font-weight:500;margin-bottom:6px}
.field{position:relative}
input{width:100%;height:48px;padding:0 48px 0 14px;font:400 16px "Inter",system-ui,sans-serif;color:var(--ink);background:var(--surface);border:1px solid var(--line-strong);border-radius:10px;outline:none;transition:border-color 160ms var(--ease),box-shadow 160ms var(--ease)}
input::placeholder{color:var(--ink-faint)}
input:hover{border-color:var(--ink-faint)}
input:focus{border-color:var(--primary-600);box-shadow:0 0 0 3px var(--primary-100)}
input[aria-invalid=true]{border-color:var(--danger-text)}
input[aria-invalid=true]:focus{box-shadow:0 0 0 3px var(--danger-soft)}
.toggle{position:absolute;right:4px;top:4px;width:40px;height:40px;display:grid;place-items:center;border:0;border-radius:8px;background:none;color:var(--ink-muted);cursor:pointer}
.toggle:hover{background:var(--surface-2);color:var(--ink)}
.toggle:focus-visible,button.primary:focus-visible{outline:2px solid var(--primary-600);outline-offset:2px}
.toggle .off{display:none}.toggle[aria-pressed=true] .on{display:none}.toggle[aria-pressed=true] .off{display:block}
.error{display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:10px 12px;border-radius:10px;background:var(--danger-soft);color:var(--danger-text);font-size:14px;line-height:20px;font-weight:500}
.error svg{flex:none;margin-top:1px;color:var(--danger-vivid)}
button.primary{position:relative;margin-top:20px;width:100%;height:48px;border:0;border-radius:10px;background:var(--primary-600);color:#fff;font:600 16px "Inter",system-ui,sans-serif;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.12);transition:background 160ms var(--ease)}
button.primary:hover{background:var(--primary-700)}
button.primary:active{background:var(--primary-800)}
button.primary[aria-busy=true]{color:transparent}
button.primary[aria-busy=true]::after{content:"";position:absolute;inset:0;margin:auto;width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.foot{display:flex;gap:8px;align-items:center;margin:16px 4px 0;color:var(--ink-muted);font-size:13px;line-height:18px}
.foot svg{flex:none}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:1.5s!important}}
@media (max-width:420px){.body{padding:24px 20px 24px}}
</style>
</head>
<body>
<main class="wrap">
  <div class="card">
    <svg class="ridge" viewBox="0 0 420 96" aria-hidden="true">
      <circle cx="318" cy="38" r="9" fill="var(--accent-500)"/>
      <path d="M0 80 L52 58 L88 70 L142 30 L176 52 L214 22 L262 62 L296 50 L350 74 L388 60 L420 70" fill="none" stroke="var(--primary-500)" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M142 30 L156 39 L150 41 M214 22 L229 34 L222 35" fill="none" stroke="var(--primary-500)" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>
    <div class="body">
      <div class="logo">
        <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="7" fill="var(--accent-500)"/><path d="M5 20.5 11.2 10.6l3.6 5.4 2.4-3.2 5.8 7.7Z" fill="var(--ink)"/><path d="m11.2 10.6 1.9 2.9-1.9-.9-1.6 1Z" fill="#fff"/></svg>
        <span class="word">Picobello</span>
      </div>
      <h1>Platform architecture</h1>
      <p class="sub">Private document for the architecture review on 5&nbsp;Nov&nbsp;2026. Enter the password to continue.</p>
      <form method="post" action="/__auth" novalidate>
        <input type="hidden" name="next" value="${esc(next)}">
        <label for="password">Password</label>
        <div class="field">
          <input id="password" name="password" type="password" autocomplete="current-password" required autofocus
            ${error ? 'aria-invalid="true" aria-describedby="err"' : ''}>
          <button class="toggle" type="button" aria-label="Show password" aria-pressed="false" aria-controls="password">
            <svg class="on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
            <svg class="off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
          </button>
        </div>
        ${error ? `<div class="error" id="err" role="alert"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg><span>${esc(error)}</span></div>` : ''}
        <button class="primary" type="submit">Continue</button>
      </form>
    </div>
  </div>
  <p class="foot"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/></svg>Access is remembered on this device for 30 days.</p>
</main>
<script nonce="${nonce}">
(function(){
  var input=document.getElementById('password'),t=document.querySelector('.toggle'),f=document.querySelector('form'),b=document.querySelector('button.primary');
  t.addEventListener('click',function(){var show=input.type==='password';input.type=show?'text':'password';t.setAttribute('aria-pressed',String(show));t.setAttribute('aria-label',show?'Hide password':'Show password');input.focus();});
  input.addEventListener('input',function(){input.removeAttribute('aria-invalid');});
  f.addEventListener('submit',function(e){if(!input.value){e.preventDefault();input.focus();return;}b.setAttribute('aria-busy','true');});
})();
</script>
</body>
</html>`;
}
