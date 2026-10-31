// arch/14-why-this-over-that.txt, transcribed. Ratings: +++ ++ + - --
// (a cell may add a note in brackets, or be plain text).
export interface Decision {
  n: number; title: string; options: string[]; winner: number;
  rows: [string, ...string[]][]; choice: string; why?: string; open?: boolean;
}

export const decisions: Decision[] = [
  { n: 1, title: 'Architecture style', options: ['Modular monolith', 'Microservices', 'Plain monolith'], winner: 0, rows: [
    ['Speed to build', '+++', '-', '+++'],
    ['Consistency of money data', '+++ (one DB tx)', '- (dist. tx)', '+++'],
    ['Ops effort (deploys, logs)', '+++', '--', '+++'],
    ['Easy to extend later', '+++ (modules + events)', '++', '- (grows into a tangle)'],
    ['Team size needed', 'small', 'large', 'small'],
    ['Can split later', '++', 'n/a', '-'],
  ], choice: 'Modular monolith', why: 'All the safety and speed of one codebase and one database, but with module boundaries and events, so April features plug in without rewrites. Microservices solve problems of big teams we don\'t have.' },
  { n: 2, title: 'Language', options: ['TypeScript (all)', 'Python (Django)', 'PHP (Laravel)', 'Java/Kotlin (Spring)'], winner: 0, rows: [
    ['One language FE + BE', '+++', '-', '-', '-'],
    ['Share rules with browser', '+++', '--', '--', '--'],
    ['Reuse prototype', '+++ (React + TS)', '-', '-', '-'],
    ['Type safety', '++', '+', '+', '+++'],
    ['Hiring / ecosystem', '+++', '+++', '++', '++'],
    ['Speed of development', '+++', '+++', '+++', '+'],
  ], choice: 'TypeScript everywhere', why: 'The owner rule engine runs identically in the browser (instant feedback) and on the server (final check); one set of validation schemas; the prototype is already React + TypeScript.' },
  { n: 3, title: 'Frontend framework', options: ['React + Vite (SPA/PWA)', 'Next.js (SSR)', 'Vue / Nuxt', 'SvelteKit'], winner: 0, rows: [
    ['Fits logged-in apps', '+++', '++', '+++', '+++'],
    ['SEO needed?', 'not needed (private apps)', 'strength, unused here', '-', '-'],
    ['Hosting simplicity', '+++ static', '+ needs server', '++', '++'],
    ['Reuse prototype', '+++', '++', '--', '--'],
    ['Ecosystem / hiring', '+++', '+++', '++', '+'],
    ['Offline PWA (guest)', '+++', '+', '++', '++'],
  ], choice: 'React + Vite single-page apps (Guest App as PWA)', why: 'All three apps are behind a login or a private link, so server rendering for SEO brings no value but adds a server to run. Static files on a CDN are fastest and cheapest. The public websites per house already exist separately.' },
  { n: 4, title: 'One website with roles vs three apps', options: ['One app, 3 roles', 'Three apps, shared code'], winner: 1, rows: [
    ['Guest app size / speed', '- (carries admin)', '+++ (only guest code)'],
    ['Security surface', '- (role bug = admin screens)', '+++ (admin code not shipped to guests)'],
    ['Design per user', '+ (compromise)', '+++ (phone vs desktop)'],
    ['Independent deploys', '-', '+++'],
    ['Duplicate work', 'none', '~none (shared ui, api-client, i18n)'],
  ], choice: 'Three apps in one monorepo' },
  { n: 5, title: 'Backend framework', options: ['Hono', 'NestJS', 'Express', 'Fastify'], winner: 0, rows: [
    ['Performance', '+++', '++', '+', '+++'],
    ['Built-in typed OpenAPI', '+++ (zod-openapi)', '++', '-', '++'],
    ['Simplicity / learning', '+++', '- (heavy DI, decorators)', '+++', '++'],
    ['Runs on Node + edge (no lock-in)', '+++', '-', '-', '-'],
    ['Maturity', '++', '+++', '+++', '+++'],
  ], choice: 'Hono on Node.js 22', why: 'Small, fast, typed end to end, OpenAPI generated from the same Zod schemas the frontend uses; also runs on Cloudflare Workers or Bun if we ever move.' },
  { n: 6, title: 'API style', options: ['REST + OpenAPI', 'GraphQL', 'tRPC'], winner: 0, rows: [
    ['Typed client for our apps', '+++ (generated)', '+++', '+++'],
    ['Usable by outside callers (webhooks, PicobelloAI, website, partners)', '+++', '++', '-- (TS only)'],
    ['Caching / debugging', '+++', '+', '++'],
    ['Complexity', 'low', 'high', 'low'],
  ], choice: 'REST + OpenAPI 3.1' },
  { n: 7, title: 'Database engine', options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite / D1'], winner: 0, rows: [
    ['ACID transactions', '+++', '+++', '++', '++'],
    ['Constraints (no double booking, balanced money)', '+++ (exclusion constraints)', '+ (no excl. constraints)', '-', '+'],
    ['JSON support', '+++ (JSONB)', '++', '+++', '+'],
    ['Job queue in same DB', '+++ (pg-boss)', '-', '-', '-'],
    ['Concurrency / scale', '+++', '+++', '+++', '- (single writer)'],
    ['Portability / open', '+++', '+++', '++', '++'],
  ], choice: 'PostgreSQL 16', why: 'Money and bookings need hard guarantees. Postgres can refuse an overlapping stay or an unbalanced ledger transaction at database level, and can hold the job queue in the same transaction as the data.' },
  { n: 8, title: 'Where Postgres runs', options: ['Cloud SQL (GCP Zurich)', 'Supabase (Pro)', 'Neon', 'AWS RDS Zurich'], winner: 0, open: true, rows: [
    ['Data in Switzerland', '+++', '++ (Zurich region [Verify])', '- (EU, not CH [Verify])', '+++'],
    ['Private network to API', '+++ (same cloud)', '- (internet + TLS)', '- (internet)', '+ (other cloud)'],
    ['High availability', '+++ one switch', '- [Verify plan]', '++', '+++'],
    ['Point-in-time restore', '+++ included', '+ paid add-on', '+++', '+++'],
    ['Setup speed', '+', '+++', '+++', '+'],
    ['Monthly cost (prod)', '~CHF 150-200', '~USD 50-110', '~USD 20-70', '~CHF 150+'],
    ['Lock-in', 'low', 'low if plain Postgres only', 'low', 'low'],
  ], choice: 'Cloud SQL Zurich · documented alternative: Supabase (Zurich), used only as plain Postgres (no Supabase Auth, RLS or Functions)', why: 'For a system holding owners\' money, private networking, one-switch failover and included point-in-time restore matter more than the lower price. Because we only use standard Postgres, switching is a dump and restore. Decision for Seva on 5 Nov: lower cost and faster setup (Supabase) vs one cloud with failover (Cloud SQL).' },
  { n: 9, title: 'Cloud for backend', options: ['GCP Zurich', 'AWS Zurich', 'Azure CH North', 'Swiss hosters (Infomaniak, Exoscale)', 'Cloudflare only'], winner: 0, rows: [
    ['Data in Switzerland', '+++', '+++', '+++', '+++', '- (no CH Postgres)'],
    ['Managed containers', '+++ Cloud Run', '++ (App Runner/ECS)', '++', '+ (more DIY)', '++ Workers'],
    ['Managed Postgres', '+++', '+++', '++', '++', '-'],
    ['Simplicity', '+++', '+ (complex)', '+', '+', '++'],
    ['Pay per use', '+++', '++', '++', '+', '+++'],
    ['Portability', '+++ (Docker)', '++', '++', '++', '-'],
  ], choice: 'Google Cloud, region europe-west6 (Zurich)' },
  { n: 10, title: 'Frontend hosting', options: ['Cloudflare Pages', 'Vercel', 'Netlify', 'GCS + CDN'], winner: 0, rows: [
    ['Global speed', '+++', '+++', '++', '++'],
    ['Cost', '+++ (free tier)', '+ (per seat)', '++', '++'],
    ['Already used at Bernis', '+++', '-', '-', '-'],
    ['Preview per PR', '+++', '+++', '+++', '-'],
    ['Personal data', 'none (static)', 'none', 'none', 'none'],
  ], choice: 'Cloudflare Pages' },
  { n: 11, title: 'File storage', options: ['Google Cloud Storage Zurich', 'Cloudflare R2', 'Supabase Storage', 'AWS S3 Zurich'], winner: 0, rows: [
    ['Data in Switzerland', '+++', '+ (EU option)', '++ [Verify]', '+++'],
    ['Same cloud as API', '+++', '-', '-', '-'],
    ['Download (egress) fee', '+ (tiny volume)', '+++ none', '++', '+'],
    ['Signed private URLs', '+++', '+++', '+++', '+++'],
  ], choice: 'Google Cloud Storage Zurich, behind a storage port so photos can move to R2 later if traffic grows' },
  { n: 12, title: 'ORM / database access', options: ['Drizzle', 'Prisma', 'Kysely', 'Raw SQL'], winner: 0, rows: [
    ['Type safety', '+++', '+++', '+++', '-'],
    ['Close to SQL / control', '+++', '+', '+++', '+++'],
    ['Migrations', '++ (SQL)', '+++', '- (manual)', '-'],
    ['Runtime weight', '+++ light', '+ (engine)', '+++', '+++'],
    ['Postgres features (exclusion, triggers)', '++', '+', '+++', '+++'],
  ], choice: 'Drizzle, with raw SQL in migrations for triggers and constraints' },
  { n: 13, title: 'Job queue / background work', options: ['pg-boss (Postgres)', 'Cloud Tasks / Pub/Sub', 'Redis + BullMQ'], winner: 0, rows: [
    ['Job saved atomically with data (no lost jobs)', '+++', '- (two systems)', '- (two systems)'],
    ['Extra infrastructure', 'none', 'managed', 'Redis server'],
    ['Retries / backoff / cron', '+++', '+++', '+++'],
    ['Throughput', '++ (plenty)', '+++', '+++'],
  ], choice: 'pg-boss + outbox pattern' },
  { n: 14, title: 'Authentication', options: ['Better Auth + stay tokens', 'Auth0 / Clerk', 'Firebase Auth', 'Supabase Auth'], winner: 0, rows: [
    ['User data in our Swiss DB', '+++', '- (US/EU SaaS)', '- (US)', '++'],
    ['Magic link / passkey / 2FA', '+++', '+++', '++', '++'],
    ['Guest "link only" access', '+++ (custom)', '+ (workaround)', '+', '+'],
    ['Cost per user', 'free', 'per MAU', 'free tier', 'included'],
    ['Lock-in', 'low', 'high', 'high', 'medium'],
  ], choice: 'Better Auth for owners and staff, signed stay tokens for guests' },
  { n: 15, title: 'Payments UI', options: ['Stripe Embedded Checkout', 'Stripe Payment Element (custom)', 'Stripe hosted Checkout page'], winner: 0, rows: [
    ['Stays inside our app', '+++', '+++', '- (redirect)'],
    ['TWINT, Apple/Google Pay', '+++', '+++', '+++'],
    ['Build effort', '+++ low', '+ higher', '+++ low'],
    ['PCI scope', '+++ minimal', '++', '+++ minimal'],
  ], choice: 'Stripe Embedded Checkout. Stripe itself is given (Picobello\'s existing account)' },
  { n: 16, title: 'Styling and components', options: ['Tailwind + shadcn/ui', 'MUI', 'Chakra UI', 'Own CSS'], winner: 0, rows: [
    ['Custom premium look', '+++ (we own the code)', '- (looks "Google")', '+', '+++'],
    ['Accessibility', '+++ (Radix)', '+++', '++', '- (DIY)'],
    ['Bundle size', '+++', '-', '+', '+++'],
    ['Speed to build', '+++', '++', '++', '-'],
  ], choice: 'Tailwind CSS + shadcn/ui, styled with our own tokens (section 13)' },
  { n: 17, title: 'Monorepo tooling', options: ['pnpm + Turborepo', 'Nx', 'Separate repos'], winner: 0, rows: [
    ['Shared code', '+++', '+++', '- (packages to publish)'],
    ['Build only changed', '+++', '+++', 'n/a'],
    ['Simplicity', '+++', '+ (heavy)', '++'],
  ], choice: 'pnpm workspaces + Turborepo' },
  { n: 18, title: 'Email', options: ['Postmark', 'Brevo (EU)', 'Amazon SES', 'SendGrid'], winner: 0, rows: [
    ['Deliverability', '+++', '++', '++', '++'],
    ['Transactional focus', '+++', '+', '++', '++'],
    ['EU data location', '- (US, DPA)', '+++', '++ (EU region)', '-'],
    ['Simplicity', '+++', '++', '+ (setup)', '++'],
  ], choice: 'Postmark, behind a messaging port; Brevo is the drop-in EU alternative if Picobello wants EU-only processing' },
  { n: 19, title: 'Integration approach', options: ['Inbox/outbox + adapters', 'Direct API calls in request', 'iPaaS (Zapier, Make)'], winner: 0, rows: [
    ['Survives vendor downtime', '+++ (retries)', '-- (user waits, errors)', '+'],
    ['No lost / duplicate events', '+++', '-', '+'],
    ['Testable without vendor', '+++ (fakes)', '-', '--'],
    ['Visible status + retry', '+++', '-', '+'],
    ['Cost', 'none', 'none', 'per task'],
  ], choice: 'Ports + adapters with inbox/outbox' },
  { n: 20, title: 'Money records', options: ['Double-entry append-only ledger', 'Amount columns on bookings', 'Only in Bexio later'], winner: 0, rows: [
    ['Nothing ever lost', '+++', '-', '-- (until April)'],
    ['Audit / corrections', '+++ (reversals)', '- (overwrites)', '++'],
    ['Owner balance in Phase 1', '+++', '+', '--'],
    ['April reports without migration', '+++', '-', '-'],
  ], choice: 'Double-entry append-only ledger from Phase 1' },
  { n: 21, title: 'Fonts', options: ['Plus Jakarta Sans + Inter', 'Inter only', 'Roboto', 'System fonts'], winner: 0, rows: [
    ['Premium, distinct', '+++', '++', '- (generic)', '-'],
    ['Readability at 12-16 px', '+++ (Inter)', '+++', '++', '++'],
    ['Tabular numbers (CHF)', '+++', '+++', '++', '+'],
    ['Self-hostable, free', '+++', '+++', '+++', 'n/a'],
  ], choice: 'Plus Jakarta Sans (headings) + Inter (UI)' },
];
