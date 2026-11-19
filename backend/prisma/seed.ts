import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const firstNames = ['Ava','Liam','Noah','Mia','Ethan','Zoe','Arjun','Priya','Lucas','Emma','Isha','Oliver','Amir','Sofia','Daniel','Anika'];
const lastNames = ['Patel','Smith','Johnson','Brown','Garcia','Khan','Sharma','Wilson','Lee','Martin','Davis','Taylor'];
const departments = ['Engineering','Product','Design','Human Resources','Finance','Sales','Marketing','Operations','Legal','Customer Success'];
const countries = [{name:'India',currency:'INR'},{name:'United States',currency:'USD'},{name:'United Kingdom',currency:'GBP'},{name:'Germany',currency:'EUR'},{name:'Singapore',currency:'SGD'},{name:'Canada',currency:'CAD'}];
async function main() {
  await prisma.salary.deleteMany();
  await prisma.employee.deleteMany();
  const batchSize = 500;
  for (let start = 0; start < 10000; start += batchSize) {
    const employees = [];
    for (let i = start; i < Math.min(start + batchSize, 10000); i++) {
      const country = countries[i % countries.length];
      employees.push({
        employeeNumber: `ACME-${String(i + 1).padStart(5, '0')}`,
        firstName: firstNames[i % firstNames.length],
        lastName: lastNames[(i * 7) % lastNames.length],
        email: `employee${i + 1}@acme.example`,
        department: departments[(i * 3) % departments.length],
        country: country.name,
        hireDate: new Date(Date.UTC(2018 + (i % 8), i % 12, 1 + (i % 27))),
        status: i % 20 === 0 ? 'INACTIVE' : 'ACTIVE'
      });
    }
    await prisma.employee.createMany({ data: employees });
  }
  const all = await prisma.employee.findMany({ select: { id: true, country: true } });
  const currencyByCountry = new Map(countries.map(c => [c.name, c.currency]));
  for (let start = 0; start < all.length; start += 500) {
    await prisma.salary.createMany({ data: all.slice(start, start + 500).map(e => ({
      employeeId: e.id,
      amountMinor: 3500000 + ((e.id * 7919) % 9500000),
      currency: currencyByCountry.get(e.country) || 'USD',
      effectiveAt: new Date(Date.UTC(2025, e.id % 12, 1))
    })) });
  }
  console.log(`Seeded ${all.length} employees and ${all.length} salary records.`);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
