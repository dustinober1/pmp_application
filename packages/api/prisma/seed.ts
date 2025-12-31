import { PrismaClient } from '@prisma/client';
import { DEFAULT_TIER_FEATURES, TierName } from '@pmp/shared';

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
    for (const domain of domains) {
        await prisma.domain.upsert({
            where: { code: domain.code },
            update: {
                name: domain.name,
                description: domain.description,
                weightPercentage: domain.weightPercentage,
                orderIndex: domain.orderIndex,
            },
            create: domain,
        });
        console.log(`    ✅ ${domain.name} domain`);
    }

    console.log('✅ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
