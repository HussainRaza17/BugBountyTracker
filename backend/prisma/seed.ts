import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bugbountytracker.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@bugbountytracker.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create sample researcher
  const researcherPassword = await bcrypt.hash('researcher123', 12);
  const researcher = await prisma.user.upsert({
    where: { email: 'researcher@bugbountytracker.com' },
    update: {},
    create: {
      name: 'John Researcher',
      email: 'researcher@bugbountytracker.com',
      passwordHash: researcherPassword,
      role: UserRole.RESEARCHER,
    },
  });

  // Create sample vulnerabilities
  const vulnerability1 = await prisma.vulnerabilities.create({
    data: {
      title: 'SQL Injection in Login Form',
      description: 'The login form is vulnerable to SQL injection attacks due to improper input sanitization.',
      asset: 'https://example.com/login',
      stepsToReproduce: '1. Navigate to login page\n2. Enter "admin\' OR \'1\'=\'1" in username field\n3. Enter any password\n4. Observe successful login',
      cvssScore: 8.5,
      status: 'REPORTED',
      reporterId: researcher.id,
    },
  });

  const vulnerability2 = await prisma.vulnerabilities.create({
    data: {
      title: 'Cross-Site Scripting (XSS) in Search',
      description: 'The search functionality is vulnerable to stored XSS attacks.',
      asset: 'https://example.com/search',
      stepsToReproduce: '1. Go to search page\n2. Enter <script>alert("XSS")</script> in search box\n3. Submit search\n4. XSS payload executes',
      cvssScore: 6.1,
      status: 'VERIFIED',
      reporterId: researcher.id,
    },
  });

  // Create sample comments
  await prisma.comments.create({
    data: {
      content: 'Thanks for reporting this. We\'re investigating the issue.',
      vulnerabilityId: vulnerability1.id,
      userId: admin.id,
    },
  });

  await prisma.comments.create({
    data: {
      content: 'I can confirm this vulnerability exists. Working on a fix.',
      vulnerabilityId: vulnerability2.id,
      userId: admin.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@bugbountytracker.com / admin123');
  console.log('👤 Researcher user: researcher@bugbountytracker.com / researcher123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
