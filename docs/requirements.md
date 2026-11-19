# ACME Salary Management — Product Requirements

**Product owner/persona:** HR Manager  
**Scale:** 10,000 employees across multiple countries  
**Status:** Assessment MVP

## Goal
Replace spreadsheet-based salary administration with a secure, searchable web application that gives HR a reliable view of employee salary information and answers common workforce compensation questions.

## Primary users and outcomes
The HR Manager can find an employee quickly, maintain employee and salary records, review salary history, and understand salary distribution by department and country.

## In scope (MVP)
1. Employee directory with server-side pagination, search by name/email/employee number, and department/country filters.
2. Employee creation and editing with validated identity, employment, department, country and salary fields.
3. Salary history recorded as dated entries; salary changes append history rather than silently overwriting the prior amount.
4. Dashboard KPIs: employee count and average salary grouped by currency; department-level average and headcount.
5. Analytics endpoint supporting country and department summaries.
6. Deterministic synthetic seed of 10,000 employees.
7. Automated tests for validation, employee workflows, salary history and API behavior.

## Out of scope and rationale
- Payroll runs, tax, benefits, payslips and statutory compliance: rules differ by jurisdiction and require specialist requirements.
- Bank account and other highly sensitive personal data: unnecessary for the stated discovery and salary-management use case.
- Authentication, SSO and fine-grained RBAC: essential before real deployment, but identity-provider and access-policy requirements were not supplied. The MVP must not be exposed publicly with real data.
- Approval workflows, bulk Excel import/export and notifications: useful follow-on capabilities, but not necessary to validate the core workflow.
- Multi-currency grand totals: currencies are never added together; summaries remain separated by currency.

## Success criteria
- HR can search and page through 10,000 seeded employees without loading the entire dataset into the browser.
- Employee and salary updates are validated and persisted.
- Salary history preserves prior entries.
- Dashboard/analytics values are computed by the database and currency.
- Core behavior is covered by fast, deterministic automated tests.

## Key assumptions
- Each employee has one current base salary and an ISO 4217 currency code.
- Salary values are represented as integer minor units to avoid floating-point money errors.
- Each employee has a unique employee number and email.
- All timestamps are stored as ISO date/time values; dates shown in UI use browser locale.
- Seed records are fictional and must never be mistaken for real employee data.

## Risks and mitigations
- **Currency comparison:** group all totals and averages by currency.
- **Sensitive compensation data:** use synthetic data only; add authentication, authorization, encryption and audit controls before production.
- **SQLite scaling:** suitable for a single-instance demo; migrate to PostgreSQL for concurrent multi-instance deployment.
