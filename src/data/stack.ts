// "Stack at a glance" (arch/14, visual b): the chosen option per layer.
// d = decision number in file 14 (anchor #d<n> in the comparisons section).
export interface StackItem { layer: string; choice: string; d: number; open?: boolean }
export interface StackGroup { group: string; items: StackItem[] }

export const stack: StackGroup[] = [
  { group: 'Shape', items: [
    { layer: 'Architecture', choice: 'Modular monolith', d: 1 },
    { layer: 'Language', choice: 'TypeScript everywhere', d: 2 },
    { layer: 'Repository', choice: 'pnpm + Turborepo', d: 17 },
  ] },
  { group: 'Apps', items: [
    { layer: 'Frontend', choice: 'React + Vite, three apps', d: 3 },
    { layer: 'Styling', choice: 'Tailwind + shadcn/ui', d: 16 },
    { layer: 'Payments UI', choice: 'Stripe Embedded Checkout', d: 15 },
    { layer: 'Fonts', choice: 'Plus Jakarta Sans + Inter', d: 21 },
  ] },
  { group: 'Backend', items: [
    { layer: 'Framework', choice: 'Hono on Node.js 22', d: 5 },
    { layer: 'API style', choice: 'REST + OpenAPI 3.1', d: 6 },
    { layer: 'Auth', choice: 'Better Auth + stay tokens', d: 14 },
    { layer: 'Integrations', choice: 'Ports + adapters, inbox/outbox', d: 19 },
    { layer: 'Email', choice: 'Postmark', d: 18 },
  ] },
  { group: 'Data', items: [
    { layer: 'Database', choice: 'PostgreSQL 16', d: 7 },
    { layer: 'ORM', choice: 'Drizzle', d: 12 },
    { layer: 'Jobs', choice: 'pg-boss + outbox', d: 13 },
    { layer: 'Money records', choice: 'Double-entry ledger', d: 20 },
  ] },
  { group: 'Hosting', items: [
    { layer: 'Backend cloud', choice: 'Google Cloud Zurich', d: 9 },
    { layer: 'Postgres host', choice: 'Cloud SQL Zurich', d: 8, open: true },
    { layer: 'Files', choice: 'Cloud Storage Zurich', d: 11 },
    { layer: 'Frontends', choice: 'Cloudflare Pages', d: 10 },
  ] },
];
