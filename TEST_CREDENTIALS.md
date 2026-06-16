# Test credentials

Local login details are written to **`TEST_CREDENTIALS.local.md`** at the repo root when you run:

```bash
npm run seed:demo
```

That file is gitignored. It includes admin and client portal emails/passwords for the seeded demo data.

To reset demo clients and projects:

```bash
npm run seed:demo
```

First-time admin setup (if no admin exists yet):

```bash
npm run seed:admin -- your@email.com "Your Name" "your-password"
```
