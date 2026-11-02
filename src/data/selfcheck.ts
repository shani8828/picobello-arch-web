// Security self-check. Generated from the same list as
// arch/17-security-self-check.txt; edit both together.
export interface Check { id: string; check: string; how: string; by: string }
export interface CheckGroup { id: string; name: string; items: Check[] }

export const plan: [string, string, string][] = [
  [
    "M1",
    "6-15 Nov",
    "Security tools switched on in CI (gitleaks, npm audit / OSV, Semgrep, Renovate); auth, 2FA and permission middleware built with their tests."
  ],
  [
    "M2-M4",
    "16 Nov-20 Dec",
    "Each feature ships with its own checks; the items for a milestone are ticked when that milestone is reached."
  ],
  [
    "M4",
    "14-20 Dec",
    "First OWASP ZAP scan of staging (full guest journey is there by then)."
  ],
  [
    "M5",
    "21 Dec-5 Jan",
    "Walk through every item for Phase 1a, fix findings, run ZAP and the header / TLS checks on production; sign-off with the dress rehearsal."
  ],
  [
    "M7",
    "11 Jan-15 Apr",
    "Phase 1b items (guest links, payments, badges, AI feed) ticked while the guest journey is built, then ZAP again; sign-off before the first guests."
  ],
  [
    "After",
    "from 11 Jan",
    "Monthly ZAP scan and dependency review; optional outside expert review before Phase 2, starting from this list."
  ]
];

export const groups: CheckGroup[] = [
  {
    "id": "A",
    "name": "Guest links and sessions",
    "items": [
      {
        "id": "A1",
        "check": "Link token is 32 random bytes; only its SHA-256 hash is stored",
        "how": "Unit test of the generator; look in stays: no raw token anywhere",
        "by": "M7"
      },
      {
        "id": "A2",
        "check": "Link stops working after departure + 1 day",
        "how": "Test with the clock set after departure: locked page, API answers 401",
        "by": "M7"
      },
      {
        "id": "A3",
        "check": "Token is swapped for a session cookie (HttpOnly, Secure, SameSite=Lax)",
        "how": "Playwright checks the cookie flags; the token is not sent again",
        "by": "M7"
      },
      {
        "id": "A4",
        "check": "Guessing tokens gets nowhere",
        "how": "Script tries 50 random tokens: rate limit hits, and unknown and expired tokens get the same answer",
        "by": "M7"
      },
      {
        "id": "A5",
        "check": "Guest A can never read or change guest B's stay",
        "how": "Automated test with two stays against every /guest endpoint",
        "by": "M7"
      },
      {
        "id": "A6",
        "check": "Back office can revoke a link and it stops at once",
        "how": "Revoke on staging, open the old link: locked",
        "by": "M7"
      },
      {
        "id": "A7",
        "check": "Token never appears in logs, Sentry or other sites",
        "how": "Search logs after an E2E run; Referrer-Policy checked on the Maps link",
        "by": "M7"
      }
    ]
  },
  {
    "id": "B",
    "name": "Owner and staff login",
    "items": [
      {
        "id": "B1",
        "check": "Owner magic link: valid 15 minutes, one use",
        "how": "Use it twice, and once after 16 minutes: both rejected",
        "by": "M2"
      },
      {
        "id": "B2",
        "check": "Login pages never reveal whether an email exists",
        "how": "Same answer for a known and an unknown email",
        "by": "M2"
      },
      {
        "id": "B3",
        "check": "Logout ends the session on the server",
        "how": "Log out, reuse the old cookie: 401",
        "by": "M2"
      },
      {
        "id": "B4",
        "check": "2FA (TOTP or passkey) is mandatory for every staff role",
        "how": "Staff user without 2FA cannot open the Back Office",
        "by": "M1"
      },
      {
        "id": "B5",
        "check": "Staff session 12 hours; refunds, settings and users ask to log in again",
        "how": "Try a refund with an old session: re-auth asked",
        "by": "M7"
      },
      {
        "id": "B6",
        "check": "Login and magic-link requests are rate limited",
        "how": "20 wrong attempts in a row: blocked for a while",
        "by": "M1"
      },
      {
        "id": "B7",
        "check": "Passwords only stored hashed (Better Auth), minimum 12 characters",
        "how": "Look in the users table; try a short password",
        "by": "M1"
      }
    ]
  },
  {
    "id": "C",
    "name": "Permissions",
    "items": [
      {
        "id": "C1",
        "check": "Every row of the permission matrix has an automated test for every role",
        "how": "Matrix test suite runs in CI; grows with each feature",
        "by": "M5"
      },
      {
        "id": "C2",
        "check": "Permissions are checked in the API, not only hidden in the UI",
        "how": "Call Back Office endpoints directly with an owner session: 403",
        "by": "M2"
      },
      {
        "id": "C3",
        "check": "Owners see only their own units; guest stays only as \"occupied\"",
        "how": "Owner A asks for owner B's calendar: 403; no guest names in owner responses",
        "by": "M2"
      },
      {
        "id": "C4",
        "check": "Staff only see the houses assigned to them",
        "how": "Staff of house 1 asks for a stay in house 2: 403",
        "by": "M2"
      },
      {
        "id": "C5",
        "check": "Changing an id in a URL never shows someone else's data",
        "how": "Swap ids in stays, payment requests, guest cards, documents",
        "by": "M4"
      },
      {
        "id": "C6",
        "check": "The API database user cannot change or delete ledger rows",
        "how": "UPDATE on ledger entries as the API user: database error",
        "by": "M2"
      },
      {
        "id": "C7",
        "check": "Every write is in the audit log (who, when, before, after)",
        "how": "Do 10 different actions, find all 10 in the audit log",
        "by": "M4"
      }
    ]
  },
  {
    "id": "D",
    "name": "Payments and money",
    "items": [
      {
        "id": "D1",
        "check": "Card data never touches our servers",
        "how": "Network tab: card fields load from Stripe only (Embedded Checkout)",
        "by": "M7"
      },
      {
        "id": "D2",
        "check": "Prices are calculated on the server; the browser cannot change an amount",
        "how": "Change the amount in the request body: ignored or rejected",
        "by": "M7"
      },
      {
        "id": "D3",
        "check": "Stripe webhooks are checked by signature",
        "how": "Send a fake or altered webhook: 400, nothing booked",
        "by": "M7"
      },
      {
        "id": "D4",
        "check": "A payment is booked once, even if Stripe sends it twice",
        "how": "Replay the same event: still one ledger transaction (idempotency)",
        "by": "M7"
      },
      {
        "id": "D5",
        "check": "Ledger is append-only and every transaction balances",
        "how": "Try UPDATE / DELETE in SQL: blocked by trigger; nightly balance check is zero",
        "by": "M2"
      },
      {
        "id": "D6",
        "check": "Two guests can never pay for the same night",
        "how": "Two parallel quotes for the same night: only one gets the hold",
        "by": "M7"
      },
      {
        "id": "D7",
        "check": "Refunds only for back office, bookkeeping and admin, with re-auth",
        "how": "Try a refund as owner and as guest: 403",
        "by": "M7"
      },
      {
        "id": "D8",
        "check": "Stripe key is a restricted key with only the rights we use",
        "how": "Check the key permissions in the Stripe dashboard",
        "by": "M7"
      },
      {
        "id": "D9",
        "check": "Nightly reconciliation finds payments that are not in the ledger",
        "how": "Create a payment in the Stripe dashboard only: it appears on the list",
        "by": "M7"
      }
    ]
  },
  {
    "id": "E",
    "name": "Webhooks and integrations",
    "items": [
      {
        "id": "E1",
        "check": "Lodgify webhook uses a long random secret path; the booking is always re-fetched by id",
        "how": "Post a fake payload: nothing changes except a re-fetch",
        "by": "M2"
      },
      {
        "id": "E2",
        "check": "Scheduler job endpoints only accept Google-signed calls (OIDC)",
        "how": "Call a job endpoint without a token: 401",
        "by": "M1"
      },
      {
        "id": "E3",
        "check": "Vendor keys (Lodgify, Stripe, Feratel, SALTO, Postmark) only in Secret Manager, per environment",
        "how": "gitleaks on repo and images; staging and production keys differ",
        "by": "M4"
      },
      {
        "id": "E4",
        "check": "Badge access exactly matches the stay and ends on cancellation",
        "how": "SALTO test site: badge works 16:00 to 10:00, moves at 10:00, refused after cancel",
        "by": "M7"
      },
      {
        "id": "E5",
        "check": "Feratel gets only the needed fields; ID number only if legally required",
        "how": "Compare the sent payload with the field list in Integrations",
        "by": "M4"
      },
      {
        "id": "E6",
        "check": "Text from outside (Lodgify, dataCycle, guests) is shown as text, never run",
        "how": "Put <script> in a listing text and a guest name: shown as plain text",
        "by": "M4"
      },
      {
        "id": "E7",
        "check": "Failed vendor calls are retried and never lost silently",
        "how": "Make the fake adapter fail: retries, then visible on the Integrations page",
        "by": "M2"
      }
    ]
  },
  {
    "id": "F",
    "name": "Personal data (revDSG)",
    "items": [
      {
        "id": "F1",
        "check": "All personal data stays in Zurich: database, files, logs, backups",
        "how": "Check every resource location in Terraform and in the GCP console",
        "by": "M4"
      },
      {
        "id": "F2",
        "check": "App code on the CDN contains no personal data",
        "how": "Search the built frontend files for test names and emails",
        "by": "M1"
      },
      {
        "id": "F3",
        "check": "No personal data in logs or Sentry",
        "how": "After an E2E run, search logs and Sentry for test names, emails, birth dates",
        "by": "M3"
      },
      {
        "id": "F4",
        "check": "ID numbers are deleted by the nightly job after the legal period",
        "how": "Job test with the clock moved past the period (period still open with Seva)",
        "by": "M4"
      },
      {
        "id": "F5",
        "check": "Marketing consent is separate, optional, with time stamp and revocation",
        "how": "Check-in without consent works; revoke sets the date",
        "by": "M7"
      },
      {
        "id": "F6",
        "check": "Export per person and deletion (anonymise, keep ledger amounts) work",
        "how": "Run both on a test person",
        "by": "M4"
      },
      {
        "id": "F7",
        "check": "Data processing agreements in place with every processor",
        "how": "List: Google Cloud, Cloudflare, Stripe, Postmark, Sentry, Lodgify, Feratel, SALTO / Immer AG",
        "by": "M5"
      }
    ]
  },
  {
    "id": "G",
    "name": "Input, output and uploads",
    "items": [
      {
        "id": "G1",
        "check": "Every endpoint validates its input (Zod); unknown fields rejected",
        "how": "Send wrong types and extra fields: 400",
        "by": "M1"
      },
      {
        "id": "G2",
        "check": "Database queries are parameterised only (Drizzle)",
        "how": "Semgrep rule in CI; try ' OR 1=1 in search fields",
        "by": "M1"
      },
      {
        "id": "G3",
        "check": "Output is escaped; no raw HTML without sanitising",
        "how": "Semgrep rule for dangerouslySetInnerHTML; script tags in names",
        "by": "M3"
      },
      {
        "id": "G4",
        "check": "Uploads: signed URLs, type and size checked, images re-encoded",
        "how": "Upload an .html renamed to .jpg and a 50 MB file: rejected",
        "by": "M4"
      },
      {
        "id": "G5",
        "check": "Error messages never show stack traces or SQL",
        "how": "Force an error on staging: only the standard error format",
        "by": "M1"
      },
      {
        "id": "G6",
        "check": "Quote endpoints are rate limited, so nobody can block nights with holds",
        "how": "Send 50 quotes in a row: rate limit hits",
        "by": "M7"
      }
    ]
  },
  {
    "id": "H",
    "name": "Browser and transport",
    "items": [
      {
        "id": "H1",
        "check": "HTTPS only with HSTS; TLS 1.2 or newer",
        "how": "SSL Labs: grade A for guest, owner, admin and api domains",
        "by": "M5"
      },
      {
        "id": "H2",
        "check": "Security headers: CSP (Stripe allowed), X-Frame-Options, Referrer-Policy, X-Content-Type-Options",
        "how": "securityheaders.com grade A on all four domains",
        "by": "M5"
      },
      {
        "id": "H3",
        "check": "CORS only allows our three app domains",
        "how": "Request from another origin: blocked",
        "by": "M1"
      },
      {
        "id": "H4",
        "check": "OWASP ZAP scan: no high or medium findings",
        "how": "ZAP baseline on staging (14-20 Dec), again on production before 5 Jan",
        "by": "M5"
      }
    ]
  },
  {
    "id": "I",
    "name": "Secrets, dependencies and cloud",
    "items": [
      {
        "id": "I1",
        "check": "No secrets in Git, ever",
        "how": "gitleaks in CI on every PR and on the full history",
        "by": "M1"
      },
      {
        "id": "I2",
        "check": "No known high-risk vulnerabilities in dependencies at go-live",
        "how": "npm audit / OSV scan in CI; Renovate keeps updates coming",
        "by": "M5"
      },
      {
        "id": "I3",
        "check": "Code scanned for risky patterns",
        "how": "Semgrep (free TypeScript / Node rules) in CI",
        "by": "M1"
      },
      {
        "id": "I4",
        "check": "GitHub deploys to Google Cloud without stored keys",
        "how": "Workload Identity Federation; no JSON key files exist",
        "by": "M1"
      },
      {
        "id": "I5",
        "check": "One service account per Cloud Run service, least privilege",
        "how": "Review IAM roles in Terraform",
        "by": "M4"
      },
      {
        "id": "I6",
        "check": "Separate database users for the API and for migrations",
        "how": "API user cannot create or drop tables",
        "by": "M1"
      },
      {
        "id": "I7",
        "check": "Database not reachable from the internet",
        "how": "Cloud SQL private IP only; a connection from outside fails",
        "by": "M4"
      },
      {
        "id": "I8",
        "check": "2FA on every admin account: Google Cloud, Cloudflare, GitHub, Stripe, Postmark",
        "how": "Check each account",
        "by": "M4"
      },
      {
        "id": "I9",
        "check": "Staging uses test keys and fake data only",
        "how": "Compare keys; no real guest data in staging",
        "by": "M1"
      }
    ]
  },
  {
    "id": "J",
    "name": "Monitoring and recovery",
    "items": [
      {
        "id": "J1",
        "check": "Alerts for failed jobs, webhook errors, unbalanced ledger and error spikes",
        "how": "Trigger each one on staging: the alert arrives",
        "by": "M5"
      },
      {
        "id": "J2",
        "check": "Backups work and a restore was tested (RPO 5 min, RTO 4 h)",
        "how": "Restore into a copy and time it",
        "by": "M5"
      },
      {
        "id": "J3",
        "check": "Runbooks for: integration down, restore, rotate a key",
        "how": "Rotate one key on staging by following the runbook",
        "by": "M5"
      },
      {
        "id": "J4",
        "check": "Audit log cannot be edited by the app",
        "how": "UPDATE on audit_log as the API user: database error",
        "by": "M2"
      }
    ]
  },
  {
    "id": "K",
    "name": "AI and agents",
    "items": [
      {
        "id": "K1",
        "check": "The AI gets pseudonymous signals only",
        "how": "Log one ranking request: no names, contact or ID data in it",
        "by": "M7"
      },
      {
        "id": "K2",
        "check": "AI provider: region, short retention, no training on our data",
        "how": "Written in the provider contract / settings",
        "by": "M7"
      },
      {
        "id": "K3",
        "check": "Text from dataCycle cannot steer the AI",
        "how": "Item text with \"ignore the rules\": ranking and tools unchanged",
        "by": "M7"
      },
      {
        "id": "K4",
        "check": "Insights are anonymous; counts below 5 hidden",
        "how": "Check the insights view with a small test group",
        "by": "M7"
      },
      {
        "id": "K5",
        "check": "Agents (MCP, later) have exactly the rights of their person, quote then confirm, rate limited, audited",
        "how": "Permission-matrix tests run again through the agent door",
        "by": "Later"
      }
    ]
  }
];
