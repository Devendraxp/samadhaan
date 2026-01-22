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
9. [Pagination](#-pagination)
10. [Caching](#-caching)
11. [API Documentation](#-api-documentation)
12. [Contributing](#-contributing)
13. [Support & Contact](#-support--contact)

## 🔎 Overview

Samadhaan streamlines hostel complaint resolution by providing:

- Role-based dashboards for students, service staff, and admins.
- Anonymous complaint submission with media uploads.
- Real-time status tracking, notifications, and response history.
- A fully documented REST API with Swagger.
- **In-memory Redis caching** for improved performance.
- **Pagination support** across all list endpoints.

## 🌐 Hosted URLs

| Surface   | URL |
|-----------|-----|
| Frontend  | https://samadhaan.devendrajat.com |
| Backend   | https://api-samadhaan.devendrajat.com |
| API Docs  | https://api-samadhaan.devendrajat.com/api-docs |

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
│  │  ├─ services/    # Business logic with caching
│  │  └─ utils/
│  │     └─ redis.js  # Redis cache utilities
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
# Fill PORT, DATABASE_URL, SALT_ROUND, JWT secrets, Redis TTLs, etc.
```

### Environment Variables

Add these Redis cache TTL settings to your `server/.env`:

```bash
# Redis Cache TTL (in seconds)
REDIS_USER_TTL=3600           # 1 hour
REDIS_COMPLAINT_TTL=1800      # 30 minutes
REDIS_RESPONSE_TTL=1800       # 30 minutes
REDIS_NOTIFICATION_TTL=900    # 15 minutes
```

## 🌱 Database Seeding & Sample Data

> ⚠️ The seeding script performs a destructive reset. Run it only against a development database.

```bash
cd server
npm run seed
```

The script wipes existing rows and repopulates:

- 26 curated users (20 unique student domains + 6 staff/admin roles).
- 120 complaints spanning every domain.
- 520 responses authored by non-student staff accounts.
- 60 bell + feed notifications e-mailed to assorted users.

Use this dataset to demo dashboards end-to-end with realistic threaded timelines.

### 🔐 Test Accounts

| Persona | Email | Role | Password | Notes |
|---------|-------|------|----------|-------|
| Platform Admin | `admin@samadhaan.in` | ADMIN | `Admin@123` | Full access to every dashboard. |
| Ops Admin | `ops@samadhaan.in` | ADMIN | `Admin@123` | Mirrors real-world dean/warden powers. |
| Warden | `warden@samadhaan.in` | ADMIN | `Admin@123` | Great for reviewing responses without editing. |
| Mess Lead | `mess@samadhaan.in` | MESS | `Mess@123` | Handles food-related complaints. |
| Internet Lead | `internet@samadhaan.in` | INTERNET | `Internet@123` | Manages connectivity issues. |
| Cleaning Lead | `cleaning@samadhaan.in` | CLEANING | `Cleaning@123` | Oversees sanitation tickets. |
| Water Lead | `water@samadhaan.in` | WATER | `Water@123` | Resolves water supply disruptions. |
| Transport Lead | `transport@samadhaan.in` | TRANSPORT | `Transport@123` | Assigned to shuttle/bus complaints. |
| Student Sampler 01 | `student01@aurora-hostel.in` | STUDENT | `Student@123` | Sample resident used in marketing demos. |
| Student Sampler 02 | `student02@zephyr-campus.in` | STUDENT | `Student@123` | Another resident profile for parallel sessions. |

Additional student accounts exist for each hostel/domain variation up to `student20@vista-residence.in`, all sharing `Student@123`. Staff passwords align with their role names as shown above, satisfying the "password according to role" requirement for quick recall.

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

- **Base URL**: `https://api-samadhaan.devendrajat.com/api/v1`
- **Authentication**: JWT via `Authorization: Bearer <token>` header.
- **Browser / cookie flows**: append `?source=web` to every auth-protected request so the backend issues and reads HTTP-only cookies correctly.

### Example (fetch complaint list as staff)

```ts
fetch("https://api-samadhaan.devendrajat.com/api/v1/complaint?source=web&page=1&size=10", {
   method: "GET",
   headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
   },
   credentials: "include",
});
```

Additional sample requests live in [`server/apis.rest`](server/apis.rest).

## 📄 Pagination

All list endpoints support cursor-based pagination using `page` and `size` query parameters.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number (1-indexed) |
| `size` | number | `10` | Number of items per page |

### Paginated Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/complaint` | List all complaints |
| `GET /api/v1/complaint/user` | List user's complaints |
| `GET /api/v1/response` | List all responses |
| `GET /api/v1/response/user` | List user's responses |
| `GET /api/v1/response/complaint/:complaintId` | List responses for a complaint |
| `GET /api/v1/notification` | List all notifications |
| `GET /api/v1/notification/domain/:domain` | List notifications by domain |
| `GET /api/v1/user` | List all users (admin only) |

### Response Format

```json
{
  "success": true,
  "data": {
    "complaints": [...],
    "total": 120,
    "page": 1,
    "size": 10,
    "totalPages": 12
  }
}
```

### Example Usage

```bash
# Get first page with 10 items
GET /api/v1/complaint?page=1&size=10

# Get third page with 20 items
GET /api/v1/complaint?page=3&size=20
```

## 🗄️ Caching

Samadhaan implements in-memory Redis caching using `ioredis-mock` for improved API response times and reduced database load.

### Cache Strategy

| Resource | Cache Key Pattern | Default TTL | Env Variable |
|----------|-------------------|-------------|--------------|
| User | `user:{id}`, `user:email:{email}` | 1 hour | `REDIS_USER_TTL` |
| User List | `users:list:{skip}:{size}` | 1 hour | `REDIS_USER_TTL` |
| Complaint | `complaint:{id}` | 30 mins | `REDIS_COMPLAINT_TTL` |
| Complaint List | `complaints:all:{skip}:{size}` | 30 mins | `REDIS_COMPLAINT_TTL` |
| User Complaints | `complaints:user:{userId}:{skip}:{size}` | 30 mins | `REDIS_COMPLAINT_TTL` |
| Response | `response:{id}` | 30 mins | `REDIS_RESPONSE_TTL` |
| Notification | `notification:{id}` | 15 mins | `REDIS_NOTIFICATION_TTL` |
| Notification List | `notifications:all:{skip}:{size}` | 15 mins | `REDIS_NOTIFICATION_TTL` |

### Cache Invalidation

The cache is automatically invalidated when:

- **Create**: New item cached, related list caches cleared
- **Update**: Item cache deleted, related list caches cleared
- **Delete**: Item cache deleted, related list caches cleared

### Configuration

Set TTL values in seconds via environment variables:

```bash
REDIS_USER_TTL=3600           # User cache: 1 hour
REDIS_COMPLAINT_TTL=1800      # Complaint cache: 30 minutes
REDIS_RESPONSE_TTL=1800       # Response cache: 30 minutes
REDIS_NOTIFICATION_TTL=900    # Notification cache: 15 minutes
```

### Cache Utilities

```javascript
import { 
  cacheGet, 
  cacheSet, 
  cacheDelete, 
  cacheDeletePattern,
  CACHE_TTL 
} from "./utils/redis.js";

// Get cached data
const user = await cacheGet(`user:${userId}`);

// Set with TTL
await cacheSet(`user:${userId}`, userData, CACHE_TTL.USER);

// Delete single key
await cacheDelete(`user:${userId}`);

// Delete by pattern (e.g., all user list caches)
await cacheDeletePattern("users:list:*");
```

## 📖 API Documentation

- Live Swagger UI: **https://api-samadhaan.devendrajat.com/api-docs**
- Describes every REST endpoint, payload, authentication requirement, and the `source` query parameter.

## 🔐 API Security Defaults

- **Per-IP throttling** – every request pipeline passes through [`express-rate-limit`](server/src/app.js) with a budget of **15 requests per second per IP**. Bursty clients will receive HTTP 429 responses with a friendly error payload.
- **Secure HTTP headers** – [`helmet`](https://helmetjs.github.io/) is enabled globally to enforce HSTS, hide fingerprinting headers, and add sane defaults. Content-Security-Policy remains disabled to keep Swagger UI functional, but you can enable and customize it if you front static assets yourself.
- **Trusted proxy awareness** – the Express app trusts the first upstream proxy so rate limiting works even when deployed behind Render/Vercel-style load balancers.
- **In-memory caching** – Redis mock reduces database hits and improves response times with automatic cache invalidation.

You can tweak these safety nets inside `server/src/app.js` if your deployment needs a stricter/slower profile.

## 🎨 Branding

The refreshed shield logo ships in both the frontend (`client/public/brand-logo.svg`) and backend (`server/public/assets/samadhaan-logo.svg`). It is based on the open-source [Tabler "shield-check" icon](https://tabler.io/icons) (MIT License) with custom gradients to align with the Samadhaan palette. The same asset now appears across the navbar and Swagger UI for a cohesive experience.

## 🤝 Contributing

We welcome pull requests! Read the full guide in [Contribut.md](Contribut.md) for workflow details, coding standards, and the pull-request checklist.

## 📬 Support & Contact

- Create an [issue](https://github.com/Devendraxp/samadhaan/issues/new) for bug reports or feature requests.
- For security concerns or sensitive topics, reach out privately via the contact info in the repo metadata.

Happy building! 🚀
