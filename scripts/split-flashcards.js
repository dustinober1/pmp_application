/**
 * Split flashcards.json into separate files by domain for lazy loading
 * This improves initial page load time
 */
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../packages/web-svelte/static/data/flashcards.json');
const outputDir = path.join(__dirname, '../packages/web-svelte/static/data/flashcards');

// Read the original data
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Create output directory
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Domain ID mapping (normalize domain names to IDs)
const DOMAIN_MAP = {
    'Business Environment': 'business',
    'People': 'people',
    'People (33%)': 'people',
    'People (42%)': 'people',
    'Process': 'process',
};

// Group flashcards by domain
const domainGroups = {};
const emptyGroups = [];

for (const group of data) {
    const domainName = group.meta.domain?.trim();

    // Skip empty groups
    if (!domainName || group.flashcards.length === 0) {
        emptyGroups.push(group);
        continue;
    }

    const domainId = DOMAIN_MAP[domainName] || domainName.toLowerCase().replace(/\s+/g, '-');

    if (!domainGroups[domainId]) {
        domainGroups[domainId] = {
            domainId,
            domainName: domainId === 'people' ? 'People' :
                domainId === 'process' ? 'Process' :
                    domainId === 'business' ? 'Business Environment' : domainName,
            tasks: [],
            totalCards: 0
        };
    }

    domainGroups[domainId].tasks.push(group);
    domainGroups[domainId].totalCards += group.flashcards.length;
}

// Generate manifest file (lightweight metadata)
const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    domains: []
};

console.log('=== SPLITTING FLASHCARDS BY DOMAIN ===\n');
console.log(`Skipping ${emptyGroups.length} empty groups\n`);

// Write individual domain files
for (const [domainId, domainData] of Object.entries(domainGroups)) {
    const filename = `${domainId}.json`;
    const filepath = path.join(outputDir, filename);

    // Write the domain file
    fs.writeFileSync(filepath, JSON.stringify(domainData.tasks, null, 2));

    const fileSizeKB = (fs.statSync(filepath).size / 1024).toFixed(1);

    console.log(`📁 ${filename}: ${domainData.totalCards} cards, ${domainData.tasks.length} tasks (${fileSizeKB} KB)`);

    // Add to manifest
    manifest.domains.push({
        id: domainId,
        name: domainData.domainName,
        file: `flashcards/${filename}`,
        taskCount: domainData.tasks.length,
        cardCount: domainData.totalCards
    });
}

// Write manifest
const manifestPath = path.join(outputDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`\n📋 manifest.json: Domain index for lazy loading`);
console.log(`\n✅ Done! Files written to: ${outputDir}`);

// Summary
const totalCards = Object.values(domainGroups).reduce((sum, d) => sum + d.totalCards, 0);
console.log(`\nTotal: ${totalCards} cards across ${Object.keys(domainGroups).length} domains`);
