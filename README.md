# ACME Salary Management

A full-stack salary management application built for the Incubyte engineering assessment.

## Stack
- React + TypeScript + Vite + Material UI
- Node.js + Express + TypeScript
- SQLite + Prisma
- Vitest, Supertest and React Testing Library

## Prerequisites
Node.js 20+ and npm 10+.

## Run locally
```bash
npm install
cp backend/.env.example backend/.env
npm run db:push -w backend
npm run seed
npm run dev
```
Frontend: http://localhost:5173  
API: http://localhost:4000/api

## Test and build
```bash
npm test
npm run build
```

## Features
- Dashboard KPIs and department salary summary
- Employee listing with server-side search, filters and pagination
- Create and update employee records
- Salary history for each employee
- Analytics endpoint with department and country aggregates
- Input validation, centralized error handling and deterministic 10,000-row seed

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Dashboard summary |
| GET | `/api/employees` | Search/filter/paginate employees |
| GET | `/api/employees/:id` | Employee detail and salary history |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| POST | `/api/employees/:id/salaries` | Add salary change |
| GET | `/api/analytics` | Salary aggregates |

Query parameters for `GET /api/employees`: `q`, `department`, `country`, `page`, `pageSize`.

## Data and currency
Salary amounts are stored as integer minor units (for example, cents/paise) with an ISO currency code. Aggregates are grouped by currency; the UI labels currencies rather than incorrectly summing unlike currencies. Seed data is synthetic.

## Production notes / deliberate boundaries
This is an assessment-sized reference implementation, not a payroll execution or statutory compliance product. Authentication/SSO, role-based authorization, payroll calculations, tax, benefits, bank details, approval workflows, audit retention policy, CSV import/export and multi-tenant isolation are intentionally excluded. Before production, add authentication/authorization, audit logging, backups, migrations, observability, rate limiting, secrets management and security review.

## Deployment
Deploy the API with a persistent SQLite volume (or replace SQLite with managed PostgreSQL for multi-instance deployment). Deploy the frontend as a static Vite site and set `VITE_API_URL` to the deployed API origin. SQLite is appropriate for a single-instance assessment deployment; it is not the recommended database for horizontally scaled production workloads.

## Suggested incremental commits
1. `chore: scaffold full-stack TypeScript workspace`
2. `docs: add product requirements and architecture artifacts`
3. `feat(api): add employee and salary data model`
4. `feat(api): implement employee and dashboard endpoints`
5. `feat(data): seed 10000 synthetic employees`
6. `feat(ui): add salary dashboard and employee management`
7. `test: cover core employee and salary workflows`
8. `docs: add setup, trade-offs and AI workflow notes`

Do not create artificial historical commits. Make these commits as you complete each stage so the repository history accurately reflects your work.
