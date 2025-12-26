#!/bin/sh
set -e

echo "🚀 Starting PMP Application..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Check if database needs seeding
echo "🔍 Checking if database needs seeding..."
QUESTION_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.question.count().then(c => {
  console.log(c);
  prisma.\$disconnect();
}).catch(() => {
  console.log(0);
  process.exit(0);
});
" 2>/dev/null || echo "0")

echo "   Current question count: $QUESTION_COUNT"

if [ "$QUESTION_COUNT" = "0" ] || [ "$QUESTION_COUNT" -lt "10" ]; then
  echo "📝 Database needs seeding..."
  
  # Run seed script (creates domains, admin user, sample data)
  echo "🌱 Running seed script..."
  node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('  Creating domains...');
  
  // Create domains
  const domains = await Promise.all([
    prisma.domain.upsert({
      where: { name: 'People' },
      update: {},
      create: {
        name: 'People',
        description: 'Focuses on the skills and activities associated with effectively leading a project team',
        weightPercentage: 33,
        color: '#3B82F6',
      },
    }),
    prisma.domain.upsert({
      where: { name: 'Process' },
      update: {},
      create: {
        name: 'Process',
        description: 'Covers the technical aspects of project management',
        weightPercentage: 41,
        color: '#10B981',
      },
    }),
    prisma.domain.upsert({
      where: { name: 'Business Environment' },
      update: {},
      create: {
        name: 'Business Environment',
        description: 'Focuses on the connection between projects and organizational strategy',
        weightPercentage: 26,
        color: '#8B5CF6',
      },
    }),
  ]);
  console.log('  ✅ Created domains');
  
  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@pmp.com' },
    update: {},
    create: {
      email: 'admin@pmp.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('  ✅ Created admin user');
  
  // Create practice test
  const existingTest = await prisma.practiceTest.findFirst({
    where: { name: 'PMP Practice Test 1' }
  });
  
  if (!existingTest) {
    await prisma.practiceTest.create({
      data: {
        name: 'PMP Practice Test 1',
        description: 'Full-length practice test covering all domains',
        totalQuestions: 185,
        timeLimitMinutes: 230,
        isActive: true,
      },
    });
    console.log('  ✅ Created practice test');
  }
  
  console.log('  ✅ Seed complete');
}

seed()
  .catch(e => console.error('Seed error:', e))
  .finally(() => prisma.\$disconnect());
"

  # Import questions from JSON files
  echo "📥 Importing questions from JSON files..."
  node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importQuestions() {
  const domains = await prisma.domain.findMany();
  const domainMap = {};
  domains.forEach(d => domainMap[d.name.toLowerCase()] = d.id);
  
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    console.log('  ❌ No admin user found');
    return;
  }
  
  const banks = [
    { file: 'pmp_2026_people_bank.json', domainKey: 'people' },
    { file: 'pmp_2026_process_bank.json', domainKey: 'process' },
    { file: 'pmp_2026_business_bank.json', domainKey: 'business environment' },
  ];
  
  let totalImported = 0;
  
  for (const bank of banks) {
    const filePath = path.join('/app/data', bank.file);
    
    if (!fs.existsSync(filePath)) {
      console.log('  ⚠️  File not found: ' + filePath);
      continue;
    }
    
    const domainId = domainMap[bank.domainKey];
    if (!domainId) {
      console.log('  ⚠️  Domain not found: ' + bank.domainKey);
      continue;
    }
    
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log('  Processing ' + bank.file + ' (' + questions.length + ' questions)...');
    
    for (const q of questions) {
      try {
        const existing = await prisma.question.findFirst({
          where: { questionText: q.questionText.substring(0, 500) }
        });
        
        if (!existing && q.questionText && q.choices) {
          await prisma.question.create({
            data: {
              domainId: domainId,
              questionText: q.questionText,
              scenario: q.scenario || null,
              choices: JSON.stringify(q.choices),
              correctAnswerIndex: q.correctAnswerIndex || 0,
              explanation: q.explanation || '',
              difficulty: (q.difficulty || 'MEDIUM').toUpperCase(),
              methodology: (q.methodology || 'HYBRID').toUpperCase(),
              createdBy: adminUser.id,
              isActive: true,
            },
          });
          totalImported++;
        }
      } catch (e) {
        // Skip errors silently for production
      }
    }
  }
  
  console.log('  ✅ Imported ' + totalImported + ' questions');
  
  // Import flashcards
  const flashcardsPath = path.join('/app/data', 'pmp_flashcards_master.json');
  if (fs.existsSync(flashcardsPath)) {
    const flashcards = JSON.parse(fs.readFileSync(flashcardsPath, 'utf-8'));
    console.log('  Processing flashcards (' + flashcards.length + ')...');
    
    let fcImported = 0;
    for (const fc of flashcards) {
      try {
        const existing = await prisma.flashCard.findFirst({
          where: { frontText: fc.frontText ? fc.frontText.substring(0, 200) : '' }
        });
        
        if (!existing && fc.frontText && fc.backText) {
          const domainId = domainMap[(fc.domain || 'process').toLowerCase()] || domains[0].id;
          await prisma.flashCard.create({
            data: {
              domainId: domainId,
              frontText: fc.frontText,
              backText: fc.backText,
              category: fc.category || 'General',
              difficulty: (fc.difficulty || 'MEDIUM').toUpperCase(),
              createdBy: adminUser.id,
            },
          });
          fcImported++;
        }
      } catch (e) {
        // Skip errors
      }
    }
    console.log('  ✅ Imported ' + fcImported + ' flashcards');
  }
  
  const totalQ = await prisma.question.count();
  const totalF = await prisma.flashCard.count();
  console.log('  📊 Total in database: ' + totalQ + ' questions, ' + totalF + ' flashcards');
}

importQuestions()
  .catch(e => console.error('Import error:', e))
  .finally(() => prisma.\$disconnect());
"
else
  echo "✅ Database already has data, skipping seed..."
fi

# Start the server
echo "🚀 Starting server..."
exec node dist/server.js
