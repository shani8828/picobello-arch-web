// Order of the document, as agreed. Questions are quoted from the
// "QUESTION THIS ANSWERS" line of each arch/*.txt file.
export interface SectionMeta {
  id: string;
  num: string;        // label shown in nav, e.g. "05"
  title: string;      // nav + heading
  file?: string;      // source file in ./arch
  leadLabel: string;  // "Question this answers" | "Goal" | ...
  lead: string;
  step: number;       // build step that fills this section
}

export const sections: SectionMeta[] = [
  { id: 'overview', num: '00', title: 'One-page summary', leadLabel: 'In short',
    lead: 'The Picobello Platform is the one system that connects everything Picobello controls itself: owners, units, rules, check-in, guest cards, door access, money records and listing content.',
    file: '01-scope-and-users.txt', step: 2 },
  { id: 'scope', num: '01', title: 'Scope and users', file: '01-scope-and-users.txt', leadLabel: 'Question this answers',
    lead: 'Who uses the system, what can each of them do, and what is built in Phase 1 (bookings live ~10 Jan 2027, guest stays ready by 15 Apr) vs Phase 2 (April 2027) vs later?', step: 2 },
  { id: 'context', num: '02', title: 'System context', file: '02-system-context.txt', leadLabel: 'Question this answers',
    lead: 'What is our system, which outside systems does it talk to, and who is the master of which data?', step: 2 },
  { id: 'containers', num: '03', title: 'Containers and modules', file: '03-containers-and-modules.txt', leadLabel: 'Question this answers',
    lead: 'What are the deployable pieces, how do they connect, and how is the backend split into modules so later features plug in cleanly?', step: 2 },
  { id: 'frontend', num: '04', title: 'Frontend', file: '04-frontend.txt', leadLabel: 'Question this answers',
    lead: 'Which apps and screens exist, how users move through them, and which frontend technology we use and why.', step: 3 },
  { id: 'api', num: '05', title: 'Backend and API', file: '05-backend-and-api.txt', leadLabel: 'Question this answers',
    lead: 'How do the frontends and outside systems talk to our server, and how is the backend built?', step: 3 },
  { id: 'database', num: '06', title: 'Database', file: '06-database.txt', leadLabel: 'Question this answers',
    lead: 'Which database, what data we store, how tables connect, and the rules that keep data correct for years.', step: 4 },
  { id: 'logic', num: '07', title: 'Business logic and states', file: '07-business-logic-and-states.txt', leadLabel: 'Question this answers',
    lead: 'Where do the business rules live, how are prices calculated, and how does each important object move from state to state?', step: 4 },
  { id: 'integrations', num: '08', title: 'Integrations', file: '08-integrations.txt', leadLabel: 'Question this answers',
    lead: 'Exactly how each outside system is connected: direction, trigger, data, security, failures.', step: 4 },
  { id: 'money', num: '09', title: 'Money and ledger', file: '09-money-and-ledger.txt', leadLabel: 'Question this answers',
    lead: "How is every franc recorded from day one so nothing is ever lost, and how will April's statements, VAT and Bexio export read that data?", step: 5 },
  { id: 'security', num: '10', title: 'Security, roles, privacy', file: '10-security-roles-privacy.txt', leadLabel: 'Question this answers',
    lead: 'Who can see and change what, how each user logs in, and how personal data and money are protected (Swiss revDSG).', step: 5 },
  { id: 'infrastructure', num: '11', title: 'Infrastructure and deployment', file: '11-infrastructure-and-deployment.txt', leadLabel: 'Question this answers',
    lead: "Where does everything run in production, how does code get from a developer's laptop to live safely, and how do we know it's healthy?", step: 5 },
  { id: 'regional', num: '12', title: 'Regional content, AI and agents', file: '16-regional-content-ai-agents.txt', leadLabel: 'Question this answers',
    lead: 'How does regional information from dataCycle reach the guest in the right moment, how does the AI choose what comes first, and how is the platform built so AI agents (MCP, voice) can use it safely later?', step: 6 },
  { id: 'decisions', num: '13', title: 'Decisions, extensibility, risks', file: '12-decisions-extensibility-plan.txt', leadLabel: 'Question this answers',
    lead: 'Why did we choose what we chose, how do later features plug in, what quality do we promise, how do we get to go-live, and what could go wrong?', step: 5 },
  { id: 'comparisons', num: '14', title: 'Why this over that', file: '14-why-this-over-that.txt', leadLabel: 'Question this answers',
    lead: 'For every important choice: what were the options, how do they compare on the criteria that matter for Picobello, and why did we pick the one we picked?', step: 6 },
  { id: 'timeline', num: '15', title: 'Phase 1 timeline', file: '15-phase1-timeline.txt', leadLabel: 'Goal',
    lead: 'Phase 1 goes live in two steps. Sunday 10 January 2027: everything for bookings works in production, and every booking and owner charge is recorded from day one. By 15 April 2027: everything for staying (Guest App, check-in, payments, badges), tested on real bookings before the first guests arrive around May.', step: 6 },
  { id: 'design', num: '16', title: 'Design system', file: '13-design-system.txt', leadLabel: 'Question this answers',
    lead: 'How does the platform look and feel, which exact colours, fonts, sizes and spacing do we use in each app (and in the presentation), and which craft rules make it look premium and hand-designed?', step: 6 },
  { id: 'selfcheck', num: '17', title: 'Security self-check', file: '17-security-self-check.txt', leadLabel: 'Question this answers',
    lead: 'How do we prove the platform is secure before each go-live, without paying for a full pen-test, and when is each check done?', step: 6 },
  { id: 'open', num: '—', title: 'Open questions', file: '12-decisions-extensibility-plan.txt', leadLabel: 'Still open',
    lead: 'The decisions needed in the review, plus every point that is still open or still to be checked with a vendor.', step: 6 },
];
