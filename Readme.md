# Samadhaan — Server

Short guide to run and develop the server.

## Repo layout (relevant)
- [server/package.json](server/package.json) — server npm scripts and dependencies  
- [server/src/server.js](server/src/server.js) — server entry (imports [`app`](server/src/app.js))  
- [server/src/app.js](server/src/app.js) — express app setup  
- [server/prisma/schema.prisma](server/prisma/schema.prisma) — Prisma schema  
- [server/prisma/migrations](server/prisma/migrations) — DB migrations  
- [server/generated/prisma](server/generated/prisma) — generated Prisma client & binaries  
- [server/apis.rest](server/apis.rest) — example API requests

## Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (or the DB defined by `DATABASE_URL`)
- npm

## Quick start (server)
1. Install dependencies:
   cd server
   npm install

2. Create env file:
   cp .env.sample .env
   Edit [.env](server/.env.sample) with PORT, DATABASE_URL, SALT_ROUND, etc.

3. Run:
   npm run dev
   The server uses [server/src/server.js](server/src/server.js) which imports [`app`](server/src/app.js).

## Prisma
- Schema: [server/prisma/schema.prisma](server/prisma/schema.prisma)  
- Migrations are in [server/prisma/migrations](server/prisma/migrations)  
- The generated client lives at [server/generated/prisma](server/generated/prisma). If you want to re-generate:
  cd server
  npx prisma generate
  npx prisma migrate deploy  # or migrate dev for development

Note: the .gitignore excludes the Prisma native engine binary at:
`server/generated/prisma/libquery_engine-*.so.node` to avoid committing platform-specific binaries. If you intentionally committed the generated client, remove that pattern.

## Tests
- Unit tests located in [server/src/tests](server/src/tests) — run with your chosen test runner.

## API examples
See [server/apis.rest](server/apis.rest) for example register/login requests.

## Contribution
Follow usual git workflow. Keep secrets out of the repo by using `.env` and the included `.env.sample`.

If you want changes to the README or different .gitignore rules (e.g., include/exclude `server/generated/prisma/`), I can adjust them.