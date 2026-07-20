const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const rows = await prisma.testEnrollment.groupBy({
    by: ['grade', 'termName'],
    _count: { grade: true },
    where: { termName: '2024-2025 School Year' }
  });

  console.log(JSON.stringify(rows, null, 2));
  await prisma.$disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
