/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import type { TierName } from '@pmp/shared';
import { DEFAULT_TIER_FEATURES } from '@pmp/shared';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const subscriptionTiers = [
  {
    name: 'free' as TierName,
    displayName: 'Free',
    price: 0,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES.free,
  },
  {
    name: 'mid-level' as TierName,
    displayName: 'Mid-Level',
    price: 19.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES['mid-level'],
  },
  {
    name: 'high-end' as TierName,
    displayName: 'High-End',
    price: 39.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES['high-end'],
  },
  {
    name: 'corporate' as TierName,
    displayName: 'Corporate',
    price: 99.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES.corporate,
  },
];

const domains = [
  {
    code: 'PEOPLE',
    name: 'People',
    description: 'Managing, leading, and empowering team members and stakeholders.',
    weightPercentage: 42,
    orderIndex: 1,
  },
  {
    code: 'PROCESS',
    name: 'Process',
    description: 'Reinforcing the technical aspects of managing a project.',
    weightPercentage: 50,
    orderIndex: 2,
  },
  {
    code: 'BUSINESS',
    name: 'Business Environment',
    description: 'Connecting projects with organizational strategy.',
    weightPercentage: 8,
    orderIndex: 3,
  },
];

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

function determineDomain(front: string, back: string): string {
  const text = (front + ' ' + back).toLowerCase();

  if (
    text.includes('people') ||
    text.includes('team') ||
    text.includes('owner') ||
    text.includes('master') ||
    text.includes('stakeholder') ||
    text.includes('conflict') ||
    text.includes('negotiation') ||
    text.includes('leader') ||
    text.includes('resource') ||
    text.includes('ethics') ||
    text.includes('human') ||
    text.includes('bias')
  ) {
    return 'PEOPLE';
  }

  if (
    text.includes('business') ||
    text.includes('compliance') ||
    text.includes('strategy') ||
    text.includes('benefit') ||
    text.includes('value') ||
    text.includes('governance') ||
    text.includes('brooks')
  ) {
    return 'BUSINESS';
  }

  // Default to PROCESS for everything else (Scope, Schedule, Cost, Quality, Risk, Procurement, Integration, Agile events/artifacts)
  return 'PROCESS';
}

async function main() {
  console.log('🌱 Seeding database...');

  // Seed subscription tiers
  console.log('  📦 Creating subscription tiers...');
  for (const tier of subscriptionTiers) {
    await prisma.subscriptionTier.upsert({
      where: { name: tier.name },
      update: {
        displayName: tier.displayName,
        price: tier.price,
        billingPeriod: tier.billingPeriod,
        features: JSON.parse(JSON.stringify(tier.features)),
      },
      create: {
        name: tier.name,
        displayName: tier.displayName,
        price: tier.price,
        billingPeriod: tier.billingPeriod,
        features: JSON.parse(JSON.stringify(tier.features)),
      },
    });
    console.log(`    ✅ ${tier.displayName} tier`);
  }

  // Seed domains
  console.log('  🏛️ Creating domains...');
  const domainMap = new Map<string, string>(); // code -> id
  for (const domain of domains) {
    const d = await prisma.domain.upsert({
      where: { code: domain.code },
      update: {
        name: domain.name,
        description: domain.description,
        weightPercentage: domain.weightPercentage,
        orderIndex: domain.orderIndex,
      },
      create: domain,
    });
    domainMap.set(domain.code, d.id);
    console.log(`    ✅ ${domain.name} domain`);
  }

  // Seed Intro Tasks
  console.log('  📋 Creating intro tasks...');
  const taskMap = new Map<string, string>(); // domainCode -> taskId

  const introTasks = [
    {
      domainCode: 'PEOPLE',
      code: '1.0',
      name: 'People Fundamentals',
      description: 'Core concepts of People domain',
    },
    {
      domainCode: 'PROCESS',
      code: '2.0',
      name: 'Process Fundamentals',
      description: 'Core concepts of Process domain',
    },
    {
      domainCode: 'BUSINESS',
      code: '3.0',
      name: 'Business Fundamentals',
      description: 'Core concepts of Business Environment domain',
    },
  ];

  for (const t of introTasks) {
    const domainId = domainMap.get(t.domainCode);
    if (!domainId) continue;

    const task = await prisma.task.upsert({
      where: { code: t.code },
      update: {
        name: t.name,
        description: t.description,
        domainId: domainId,
      },
      create: {
        code: t.code,
        name: t.name,
        description: t.description,
        domainId: domainId,
        enablers: [],
        orderIndex: 0,
      },
    });
    taskMap.set(t.domainCode, task.id);
    console.log(`    ✅ ${t.name}`);
  }

  // Seed Flashcards from CSV
  console.log('  🃏 Seeding flashcards from CSV...');
  try {
    const csvPath = path.join(__dirname, '../../../flashcards/01_introduction.csv');
    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');

      let count = 0;
      for (const line of lines) {
        const [front, back] = parseCSVLine(line);
        if (!front || !back) continue;

        const domainCode = determineDomain(front, back);
        const domainId = domainMap.get(domainCode);
        const taskId = taskMap.get(domainCode);

        if (domainId && taskId) {
          // Check if card exists to avoid duplicates (simple check by front text)
          const existing = await prisma.flashcard.findFirst({
            where: { front: front, domainId: domainId },
          });

          if (!existing) {
            await prisma.flashcard.create({
              data: {
                front,
                back,
                domainId,
                taskId,
                isCustom: false,
              },
            });
            count++;
          }
        }
      }
      console.log(`    ✅ Imported ${count} flashcards`);
    } else {
      console.warn(`    ⚠️ CSV file not found at ${csvPath}`);
    }
  } catch (error) {
    console.error('    ❌ Error importing flashcards:', error);
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
