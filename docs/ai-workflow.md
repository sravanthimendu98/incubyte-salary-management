# AI Workflow and Engineering Judgment

## Intended use
AI assistance may be used for scaffolding, reviewing edge cases, generating test ideas and explaining trade-offs. The engineer remains responsible for verifying every generated change.

## Example prompts to retain/adapt
1. "Review this employee API design for correctness at 10,000 records. Identify missing validation, indexing and pagination edge cases."
2. "Generate boundary-focused tests for salary amounts, currency codes, duplicate employee number/email and salary effective dates."
3. "Review the React data-fetching flow for loading, empty, error and pagination states. Suggest minimal accessible improvements."
4. "Review the schema for money precision and explain whether currency totals can be safely combined."

## Verification checklist
- Run unit/integration tests after each meaningful change.
- Inspect generated code and dependency changes.
- Verify seed count and uniqueness constraints.
- Manually test create/edit/search/pagination and salary-history workflows.
- Run production build and inspect browser/network errors.
- Do not claim deployment or test success until actually performed.

## Known limitations
This artifact documents a responsible AI-assisted workflow. Replace or supplement these examples with the actual prompts, tools, model names and review steps used during implementation.
