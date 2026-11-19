import { z } from 'zod';

export const employeeSchema = z.object({
  employeeNumber: z.string().trim().min(2).max(30),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  department: z.string().trim().min(1).max(80),
  country: z.string().trim().min(2).max(80),
  hireDate: z.coerce.date(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  salaryAmount: z.number().int().nonnegative().max(2_000_000_000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  effectiveAt: z.coerce.date().optional()
});
export const salarySchema = z.object({
  amountMinor: z.number().int().nonnegative().max(2_000_000_000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  effectiveAt: z.coerce.date()
});
