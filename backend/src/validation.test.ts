import { describe, it, expect } from 'vitest';
import { employeeSchema, salarySchema } from './validation';

const valid = {
  employeeNumber: 'ACME-1', firstName: 'Ava', lastName: 'Patel', email: 'ava@example.com',
  department: 'Engineering', country: 'India', hireDate: '2024-01-01',
  salaryAmount: 8500000, currency: 'INR'
};
describe('employee validation', () => {
  it('accepts a valid employee', () => { expect(employeeSchema.safeParse(valid).success).toBe(true); });
  it('rejects invalid email', () => { expect(employeeSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false); });
  it('rejects malformed currency code', () => { expect(employeeSchema.safeParse({ ...valid, currency: 'rupees' }).success).toBe(false); });
  it('rejects negative salary', () => { expect(employeeSchema.safeParse({ ...valid, salaryAmount: -1 }).success).toBe(false); });
});
describe('salary validation', () => {
  it('requires integer minor units and ISO currency', () => {
    expect(salarySchema.safeParse({ amountMinor: 10000, currency: 'USD', effectiveAt: '2025-01-01' }).success).toBe(true);
    expect(salarySchema.safeParse({ amountMinor: 10.5, currency: 'USD', effectiveAt: '2025-01-01' }).success).toBe(false);
  });
});
