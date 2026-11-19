# BeeConnect

BeeConnect is a professional networking and career opportunities platform.

Designed by **Laith Khlaf**.

## Run locally

### Prerequisites

- Node.js and npm
- MySQL

### Configure MySQL and the backend

1. Create a MySQL database. The default name is `beeconnect`:

   ```sql
   CREATE DATABASE beeconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. In PowerShell, copy the backend environment template and edit the database credentials:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Set `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` for your local MySQL instance. Google sign-in and Pusher notifications need separate credentials; those integrations are optional for basic local development. Without Pusher credentials, the API logs that real-time events are disabled while messages and notifications continue to be saved.
   `CORS_ORIGINS` is a comma-separated allowlist for non-development environments and defaults to `http://localhost:3000`.

3. Open a terminal in `backend` and install dependencies and start the API:

   ```powershell
   npm ci
   npm run start:dev
   ```

   The development start command runs the repeatable demo-data seed before starting the API on port `8080`. To seed again without restarting the API, run `npm run seed:demo`.

   If you use VS Code and do not have MySQL credentials available, run **BeeConnect Backend (SQLite)** from **Terminal > Run Task**. This creates a local `backend/dev.sqlite` database and seeds it with the same demo data; the regular MySQL setup remains unchanged.

### Configure and start the frontend

4. In a second terminal, copy the frontend environment template and install dependencies:

   ```powershell
   Copy-Item beeconnect\.env.example beeconnect\.env.local
   Set-Location beeconnect
   npm ci
   npm run dev
   ```

   `BASE_URL` defaults to `http://localhost:8080`. Change it in `beeconnect\.env.local` if your backend uses another address.

5. Visit [http://localhost:3000](http://localhost:3000). Public pages include `/` and `/about`; sign in at `/login`.

## Local demo accounts

The development seed creates sample profiles, jobs, applications, posts, connections, messages, and notifications. It is repeatable and does not delete existing records.

All demo accounts use the password `BeeConnectDemo2026`:

| Role | Email |
| --- | --- |
| Candidate | `demo.candidate@beeconnect.local` |
| Recruiter | `demo.recruiter@beeconnect.local` |
| Colleague | `demo.colleague@beeconnect.local` |
| Pending connection | `demo.pending@beeconnect.local` |
| Local admin | `demo.admin@beeconnect.local` |

The candidate demo account has a phone number for Quick Apply. For other accounts, add a phone number under Profile before applying. Applications are limited to one per job.

Demo seeding is disabled when `NODE_ENV=production`. Demo credentials are for local development only. Uploaded chat files are stored in `backend/uploads`.

## Authentication security

Set `APP_SECRET` in `backend\.env` to a cryptographically random value of at least 32 bytes. For example, run `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` and copy the output into the backend environment file. Changing this secret invalidates existing login tokens.

The initial administrator setup page is `/admin/setup`. It only works when `ADMIN_SETUP_SECRET` is configured with a separate random value of at least 32 bytes and no administrator account exists. Keep that value out of frontend files and remove it from the backend environment after setup. The development seed already creates a local admin account, so use the demo admin credentials above instead of setup on a seeded database.

Login, registration, Google sign-in, and initial setup requests are rate-limited per backend process; multi-instance deployments need a shared rate-limit store. Access tokens expire after one hour. Admin sign-out clears the current browser token, but a copied token remains valid until expiry. Because this app currently uses bearer tokens in browser storage, migrate authentication to HttpOnly cookies and server-side revocation before deploying to an environment where cross-site scripting is a concern.

## Technology

- Frontend: Next.js, React, TypeScript, Chakra UI, Redux
- Backend: NestJS, TypeORM, MySQL

## Checks

Run commands from the corresponding project directory:

```powershell
# Backend
npm run build
npm run lint:ci
npx jest --runInBand

# Frontend
npm run lint:check
npm run build
```
