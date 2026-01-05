/**
 * Split flashcards.json into separate files by domain AND task for lazy loading
 * This provides granular loading for better performance
 */
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../packages/web-svelte/static/data/flashcards.json');
const outputDir = path.join(__dirname, '../packages/web-svelte/static/data/flashcards');

// Read the original data
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Create output directory (and tasks subdirectory)
const tasksDir = path.join(outputDir, 'tasks');
if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
}

// Domain ID mapping (normalize domain names to IDs)
const DOMAIN_MAP = {
    'Business Environment': 'business',
    'People': 'people',
    'People (33%)': 'people',
    'People (42%)': 'people',
    'Process': 'process',
};

// Sanitize ID for safe filenames (remove special chars, keep only alphanumeric and dashes)
function sanitizeId(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dashes
        .replace(/-+/g, '-')          // Collapse multiple dashes
        .replace(/^-|-$/g, '');       // Remove leading/trailing dashes
}

// Group flashcards by domain and collect task info
const domainGroups = {};
const allTasks = [];
const emptyGroups = [];

for (const group of data) {
    const domainName = group.meta.domain?.trim();

    // Skip empty groups
    if (!domainName || group.flashcards.length === 0) {
        emptyGroups.push(group);
        continue;
    }

    const domainId = DOMAIN_MAP[domainName] || domainName.toLowerCase().replace(/\s+/g, '-');
    const taskId = sanitizeId(group.meta.ecoReference);

    // Track task info
    allTasks.push({
        taskId,
        domainId,
        ecoReference: group.meta.ecoReference,
        taskName: group.meta.task,
        cardCount: group.flashcards.length,
        group // Keep reference for writing task file
    });

    if (!domainGroups[domainId]) {
        domainGroups[domainId] = {
            domainId,
            domainName: domainId === 'people' ? 'People' :
                domainId === 'process' ? 'Process' :
                    domainId === 'business' ? 'Business Environment' : domainName,
            tasks: [],
            groups: [],
            totalCards: 0
        };
    }

    domainGroups[domainId].tasks.push({
        taskId,
        name: group.meta.task,
        ecoReference: group.meta.ecoReference,
        cardCount: group.flashcards.length,
        file: `flashcards/tasks/${domainId}-${taskId}.json`
    });
    domainGroups[domainId].groups.push(group);
    domainGroups[domainId].totalCards += group.flashcards.length;
}

// Generate manifest file (lightweight metadata)
const manifest = {
    version: 2, // Bumped version for task-level support
    generatedAt: new Date().toISOString(),
    domains: [],
    taskIndex: {} // Quick lookup: taskId -> { domainId, file }
};

console.log('=== SPLITTING FLASHCARDS BY DOMAIN AND TASK ===\n');
console.log(`Skipping ${emptyGroups.length} empty groups\n`);

// Write individual domain files (still useful for bulk loading)
for (const [domainId, domainData] of Object.entries(domainGroups)) {
    const filename = `${domainId}.json`;
    const filepath = path.join(outputDir, filename);

    // Write the domain file (array of groups)
    fs.writeFileSync(filepath, JSON.stringify(domainData.groups, null, 2));

    const fileSizeKB = (fs.statSync(filepath).size / 1024).toFixed(1);

    console.log(`📁 ${filename}: ${domainData.totalCards} cards, ${domainData.tasks.length} tasks (${fileSizeKB} KB)`);

    // Add to manifest
    manifest.domains.push({
        id: domainId,
        name: domainData.domainName,
        file: `flashcards/${filename}`,
        taskCount: domainData.tasks.length,
        cardCount: domainData.totalCards,
        tasks: domainData.tasks
    });
}

console.log('\n--- Task Files ---');

// Write individual task files
for (const task of allTasks) {
    const filename = `${task.domainId}-${task.taskId}.json`;
    const filepath = path.join(tasksDir, filename);

    // Write single task file (just the group object)
    fs.writeFileSync(filepath, JSON.stringify(task.group, null, 2));

    const fileSizeKB = (fs.statSync(filepath).size / 1024).toFixed(1);

    console.log(`   📄 ${filename}: ${task.cardCount} cards (${fileSizeKB} KB)`);

    // Add to task index for quick lookup
    manifest.taskIndex[task.taskId] = {
        domainId: task.domainId,
        file: `flashcards/tasks/${filename}`,
        cardCount: task.cardCount
    };
}

// Write manifest
const manifestPath = path.join(outputDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`\n📋 manifest.json: Domain and task index for lazy loading`);
console.log(`\n✅ Done! Files written to: ${outputDir}`);

// Summary
const totalCards = Object.values(domainGroups).reduce((sum, d) => sum + d.totalCards, 0);
console.log(`\nTotal: ${totalCards} cards across ${Object.keys(domainGroups).length} domains and ${allTasks.length} tasks`);
