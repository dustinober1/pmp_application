import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface QuestionFromJSON {
    questionText: string;
    scenario?: string;
    choices: string[];
    correctAnswerIndex: number;
    explanation: string;
    methodology?: string;
    difficulty?: string;
}

async function importQuestions() {
    console.log('🚀 Starting question import from JSON files...\n');

    // Get domains
    const domains = await prisma.domain.findMany();

    if (domains.length === 0) {
        console.error('❌ No domains found! Please run the seed script first.');
        process.exit(1);
    }

    const domainMap: Record<string, string> = {};
    for (const domain of domains) {
        domainMap[domain.name.toLowerCase()] = domain.id;
        console.log(`  Found domain: ${domain.name} (${domain.id})`);
    }

    // Get admin user for createdBy field
    let adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!adminUser) {
        console.log('  ⚠️  No admin user found, creating one...');
        const bcrypt = await import('bcryptjs');
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (!process.env.ADMIN_PASSWORD) {
            console.warn('  ⚠️  WARNING: Using default password "admin123". Set ADMIN_PASSWORD environment variable!');
        }
        
        adminUser = await prisma.user.create({
            data: {
                email: 'admin@pmp.com',
                passwordHash: await bcrypt.hash(adminPassword, 12),
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                emailVerified: true,
            }
        });
    }
    console.log(`  Using admin user: ${adminUser.email}\n`);

    // Question bank files configuration
    const questionBanks = [
        {
            file: 'pmp_2026_people_bank.json',
            domainKey: 'people',
        },
        {
            file: 'pmp_2026_process_bank.json',
            domainKey: 'process',
        },
        {
            file: 'pmp_2026_business_bank.json',
            domainKey: 'business environment',
        },
    ];

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const bank of questionBanks) {
        const filePath = path.join(process.cwd(), bank.file);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📁 Processing: ${bank.file}`);
        console.log(`${'='.repeat(60)}`);

        if (!fs.existsSync(filePath)) {
            console.log(`  ⚠️  File not found: ${filePath}`);
            continue;
        }

        const domainId = domainMap[bank.domainKey];
        if (!domainId) {
            console.log(`  ⚠️  Domain not found for: ${bank.domainKey}`);
            continue;
        }

        // Load questions from JSON
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const questions: QuestionFromJSON[] = JSON.parse(rawData);

        console.log(`  Found ${questions.length} questions`);
        console.log(`  Domain: ${bank.domainKey} (${domainId})`);

        let imported = 0;
        let skipped = 0;
        let errors = 0;

        // Process questions in batches to avoid overwhelming the database
        const batchSize = 50;

        for (let i = 0; i < questions.length; i += batchSize) {
            const batch = questions.slice(i, i + batchSize);

            const createPromises = batch.map(async (q, batchIndex) => {
                const index = i + batchIndex;

                try {
                    // Check if question already exists (by questionText)
                    const existing = await prisma.question.findFirst({
                        where: { questionText: q.questionText.substring(0, 500) }
                    });

                    if (existing) {
                        skipped++;
                        return null;
                    }

                    // Validate required fields
                    if (!q.questionText || !q.choices || q.correctAnswerIndex === undefined) {
                        console.log(`    ⚠️  Skipping question ${index}: missing required fields`);
                        errors++;
                        return null;
                    }

                    // Create the question
                    const createdQuestion = await prisma.question.create({
                        data: {
                            domainId: domainId,
                            questionText: q.questionText,
                            scenario: q.scenario || null,
                            choices: JSON.stringify(q.choices),
                            correctAnswerIndex: q.correctAnswerIndex,
                            explanation: q.explanation || '',
                            difficulty: mapDifficulty(q.difficulty),
                            methodology: mapMethodology(q.methodology),
                            createdBy: adminUser.id,
                            isActive: true,
                        },
                    });

                    imported++;
                    return createdQuestion;
                } catch (error) {
                    console.log(`    ❌ Error importing question ${index}: ${error}`);
                    errors++;
                    return null;
                }
            });

            await Promise.all(createPromises);

            // Progress update
            const processed = Math.min(i + batchSize, questions.length);
            process.stdout.write(`\r  Progress: ${processed}/${questions.length} (${Math.round(processed / questions.length * 100)}%)`);
        }

        console.log(`\n  ✅ Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);

        totalImported += imported;
        totalSkipped += skipped;
        totalErrors += errors;
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 IMPORT SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`  ✅ Total Imported: ${totalImported}`);
    console.log(`  ⏭️  Total Skipped (duplicates): ${totalSkipped}`);
    console.log(`  ❌ Total Errors: ${totalErrors}`);

    // Verify counts
    const counts = await prisma.question.groupBy({
        by: ['domainId'],
        _count: { id: true },
    });

    console.log('\n📈 Questions in Database by Domain:');
    for (const count of counts) {
        const domain = await prisma.domain.findUnique({ where: { id: count.domainId } });
        console.log(`  ${domain?.name || 'Unknown'}: ${count._count.id} questions`);
    }

    const totalInDb = await prisma.question.count();
    console.log(`\n  Total questions in database: ${totalInDb}`);
}

function mapDifficulty(difficulty?: string): string {
    if (!difficulty) return 'MEDIUM';
    const upper = difficulty.toUpperCase();
    if (['EASY', 'MEDIUM', 'HARD'].includes(upper)) {
        return upper;
    }
    return 'MEDIUM';
}

function mapMethodology(methodology?: string): string {
    if (!methodology) return 'HYBRID';
    const upper = methodology.toUpperCase();
    if (['PREDICTIVE', 'AGILE', 'HYBRID'].includes(upper)) {
        return upper;
    }
    return 'HYBRID';
}

// Run the import
importQuestions()
    .catch((e) => {
        console.error('❌ Import failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
