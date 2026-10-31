# Deploying the architecture site

Static Astro site on Vercel (Hobby plan), protected server-side by
`middleware.js` (Vercel Routing Middleware). The password lives only in the
`SITE_PASSWORD` environment variable.

## 1. GitHub repository (done once)

1. github.com → **New repository** → name `picobello-arch-web` → **Private** → Create.
2. In this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M master
   git remote add origin https://github.com/<you>/picobello-arch-web.git
   git push -u origin master
   ```
   `.env.local` and `.vercel/` are in `.gitignore`, so the password is never pushed.

## 2. Import into Vercel (done once)

1. vercel.com → **Add New… → Project** → import `picobello-arch-web`.
2. Framework preset: **Astro** (detected). Build command `astro build`, output `dist` (defaults).
3. Before **Deploy**, open **Environment Variables** and add
   `SITE_PASSWORD` = the password, for **Production** and **Preview**.
4. Deploy. Every push to `master` now redeploys production automatically.

## 3. Change the password later

1. Vercel → project → **Settings → Environment Variables** → `SITE_PASSWORD` → **Edit** → save.
2. **Deployments** → latest → **⋯ → Redeploy** (environment changes only apply to new deployments).
3. Everyone is logged out automatically: the cookie is a hash derived from the password.

## 4. Redeploy

- Normal: commit and `git push` → Vercel builds and deploys.
- Without code changes: Vercel → **Deployments** → **⋯ → Redeploy**.

## 5. Check after each deploy

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://picobello-arch.vercel.app/
```
`401` = login page shown (correct). Then sign in once in the browser.
If you see `500 MIDDLEWARE_INVOCATION_FAILED`, run
`vercel logs <deployment-url>` to see the error.

## Local testing

```bash
npm install
npm run dev          # site without password (Astro)
npm run test:auth    # 13 checks of the password middleware
```
`vercel dev` also runs the middleware, but on Windows it has two known
local quirks: it fails if the Vercel CLI is installed under a path with a
space, and it passes an empty POST body to middleware, so the successful
login step can only be tested on Vercel itself (or with `npm run test:auth`).
