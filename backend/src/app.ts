import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { prisma } from './prisma';
import { employeeSchema, salarySchema } from './validation';

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/employees', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 25));
    const q = String(req.query.q || '').trim();
    const department = String(req.query.department || '').trim();
    const country = String(req.query.country || '').trim();
    const where: any = {
      ...(department ? { department } : {}),
      ...(country ? { country } : {}),
      ...(q ? { OR: [
        { firstName: { contains: q } }, { lastName: { contains: q } },
        { email: { contains: q } }, { employeeNumber: { contains: q } }
      ] } : {})
    };
    const [total, employees] = await prisma.$transaction([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: { salaries: { orderBy: { effectiveAt: 'desc' }, take: 1 } }
      })
    ]);
    res.json({ data: employees.map(e => ({ ...e, currentSalary: e.salaries[0] || null, salaries: undefined })), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (e) { next(e); }
});

app.get('/api/employees/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid employee id' });
    const employee = await prisma.employee.findUnique({ where: { id }, include: { salaries: { orderBy: { effectiveAt: 'desc' } } } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (e) { next(e); }
});

app.post('/api/employees', async (req, res, next) => {
  try {
    const parsed = employeeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid employee data', details: parsed.error.flatten() });
    const d = parsed.data;
    const employee = await prisma.employee.create({
      data: {
        employeeNumber: d.employeeNumber, firstName: d.firstName, lastName: d.lastName,
        email: d.email, department: d.department, country: d.country, hireDate: d.hireDate, status: d.status,
        salaries: { create: { amountMinor: d.salaryAmount, currency: d.currency, effectiveAt: d.effectiveAt || new Date() } }
      }, include: { salaries: true }
    });
    res.status(201).json(employee);
  } catch (e: any) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Employee number or email already exists' });
    next(e);
  }
});

app.put('/api/employees/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid employee id' });
    const schema = employeeSchema.omit({ salaryAmount: true, currency: true, effectiveAt: true });
    const parsed = schema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid employee data', details: parsed.error.flatten() });
    const employee = await prisma.employee.update({ where: { id }, data: parsed.data });
    res.json(employee);
  } catch (e: any) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Employee not found' });
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Employee number or email already exists' });
    next(e);
  }
});

app.post('/api/employees/:id/salaries', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid employee id' });
    const parsed = salarySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid salary data', details: parsed.error.flatten() });
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    const salary = await prisma.salary.create({ data: { employeeId: id, ...parsed.data } });
    res.status(201).json(salary);
  } catch (e) { next(e); }
});

app.get('/api/dashboard', async (_req, res, next) => {
  try {
    const [employeeCount, activeCount, departmentGroups] = await Promise.all([
      prisma.employee.count(), prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.groupBy({ by: ['department'], _count: { _all: true } })
    ]);
    const latest = await prisma.salary.findMany({ orderBy: { effectiveAt: 'desc' }, distinct: ['employeeId'], include: { employee: { select: { department: true } } } });
    const departmentSalary = new Map<string, { total: number; count: number }>();
    const currencySalary = new Map<string, { total: number; count: number }>();
    for (const s of latest) {
      const dept = departmentSalary.get(s.employee.department) || { total: 0, count: 0 };
      dept.total += s.amountMinor; dept.count++; departmentSalary.set(s.employee.department, dept);
      const curr = currencySalary.get(s.currency) || { total: 0, count: 0 };
      curr.total += s.amountMinor; curr.count++; currencySalary.set(s.currency, curr);
    }
    res.json({
      employeeCount, activeCount,
      salaryByCurrency: [...currencySalary.entries()].map(([currency, v]) => ({ currency, totalMinor: v.total, averageMinor: Math.round(v.total / v.count), records: v.count })),
      departments: departmentGroups.map(g => ({ department: g.department, headcount: g._count._all, averageSalaryMinor: departmentSalary.get(g.department)?.count ? Math.round(departmentSalary.get(g.department)!.total / departmentSalary.get(g.department)!.count) : 0 }))
    });
  } catch (e) { next(e); }
});

app.get('/api/analytics', async (_req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({ select: { country: true, department: true, salaries: { orderBy: { effectiveAt: 'desc' }, take: 1 } } });
    const aggregate = new Map<string, { count: number; total: number; currency: string }>();
    for (const e of employees) {
      const s = e.salaries[0]; if (!s) continue;
      const key = `${e.country}|${e.department}|${s.currency}`;
      const v = aggregate.get(key) || { count: 0, total: 0, currency: s.currency };
      v.count++; v.total += s.amountMinor; aggregate.set(key, v);
    }
    res.json([...aggregate.entries()].map(([key, v]) => { const [country, department] = key.split('|'); return { country, department, currency: v.currency, headcount: v.count, averageSalaryMinor: Math.round(v.total / v.count) }; }));
  } catch (e) { next(e); }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
