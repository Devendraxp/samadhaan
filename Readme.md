# Samadhaan

[![GitHub stars](https://img.shields.io/github/stars/Devendraxp/samadhaan?style=social)](https://github.com/Devendraxp/samadhaan/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Devendraxp/samadhaan)](https://github.com/Devendraxp/samadhaan/issues)
[![Commit activity](https://img.shields.io/github/commit-activity/m/Devendraxp/samadhaan)](https://github.com/Devendraxp/samadhaan/pulse)

> Modern hostel complaint management platform with a React + Vite frontend, Express/Prisma backend, and role-aware workflows for students, staff, and admins.

## 📚 Table of Contents

1. [Overview](#-overview)
2. [Hosted URLs](#-hosted-urls)
3. [Repository Stats](#-repository-stats)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Local Setup](#-local-setup)
7. [Running the Apps](#-running-the-apps)
8. [API Integration Guide](#-api-integration-guide)
9. [API Documentation](#-api-documentation)
10. [Contributing](#-contributing)
11. [Support & Contact](#-support--contact)

## 🔎 Overview

Samadhaan streamlines hostel complaint resolution by providing:

- Role-based dashboards for students, service staff, and admins.
- Anonymous complaint submission with media uploads.
- Real-time status tracking, notifications, and response history.
- A fully documented REST API with Swagger.

## 🌐 Hosted URLs

| Surface   | URL |
|-----------|-----|
| Frontend  | https://hostel-samadhaan.vercel.app/ |
| Backend   | https://hostel-samadhaan.onrender.com/ |
| API Docs  | https://hostel-samadhaan.onrender.com/api-docs |

## 📈 Repository Stats

- **GitHub repo**: https://github.com/Devendraxp/samadhaan.git
- **Stars**: ![stars](https://img.shields.io/github/stars/Devendraxp/samadhaan)
- **Open issues**: ![issues](https://img.shields.io/github/issues/Devendraxp/samadhaan)
- **Activity**: ![activity](https://img.shields.io/github/commit-activity/m/Devendraxp/samadhaan)

## 🗂 Project Structure (high-level)

```
samadhaan/
├─ client/            # React + Vite frontend (shadcn/ui, Tailwind)
├─ server/            # Express API with Prisma + PostgreSQL
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ routes/
│  │  ├─ middlewares/
│  │  └─ utils/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  └─ apis.rest       # Sample HTTP requests
└─ Contribut.md       # Contribution guidelines
```

## 🧰 Prerequisites

- Node.js **18+** and npm
- PostgreSQL (for `DATABASE_URL`)
- Git

## 💻 Local Setup

```bash
git clone https://github.com/Devendraxp/samadhaan.git
cd samadhaan

# Frontend
cd client
npm install
cp .env.sample .env   # if provided

# Backend
cd ../server
npm install
cp .env.sample .env
# Fill PORT, DATABASE_URL, SALT_ROUND, JWT secrets, etc.
```

## ▶️ Running the Apps

```bash
# Backend
cd server
npm run dev

# Frontend (new terminal)
cd client
npm run dev
```

The backend entry point is `server/src/server.js`, which imports the Express app from `server/src/app.js`.

### Prisma helpers

```bash
cd server
npx prisma generate
npx prisma migrate deploy   # or `migrate dev` during development
```

## 🔌 API Integration Guide

- **Base URL**: `https://hostel-samadhaan.onrender.com/api/v1`
- **Authentication**: JWT via `Authorization: Bearer <token>` header.
- **Browser / cookie flows**: append `?source=web` to every auth-protected request so the backend issues and reads HTTP-only cookies correctly.

### Example (fetch complaint list as staff)

```ts
fetch("https://hostel-samadhaan.onrender.com/api/v1/complaint?source=web", {
   method: "GET",
   headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
   },
   credentials: "include",
});
```

Additional sample requests live in [`server/apis.rest`](server/apis.rest).

## 📖 API Documentation

- Live Swagger UI: **https://hostel-samadhaan.onrender.com/api-docs**
- Describes every REST endpoint, payload, authentication requirement, and the `source` query parameter.

## 🤝 Contributing

We welcome pull requests! Read the full guide in [Contribut.md](Contribut.md) for workflow details, coding standards, and the pull-request checklist.

## 📬 Support & Contact

- Create an [issue](https://github.com/Devendraxp/samadhaan/issues/new) for bug reports or feature requests.
- For security concerns or sensitive topics, reach out privately via the contact info in the repo metadata.

Happy building! 🚀