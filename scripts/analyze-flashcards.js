const fs = require("fs");
const path = require("path");

const data = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../packages/web-svelte/static/data/flashcards.json"),
  ),
);

console.log("=== FLASHCARDS STRUCTURE ANALYSIS ===\n");
console.log("Total groups:", data.length);

const domains = {};
for (const group of data) {
  const domain = group.meta.domain;
  const task = group.meta.task;
  const count = group.flashcards.length;

  if (!domains[domain]) {
    domains[domain] = { totalCards: 0, tasks: [] };
  }
  domains[domain].totalCards += count;
  domains[domain].tasks.push({ task, ecoRef: group.meta.ecoReference, count });
}

for (const [domain, info] of Object.entries(domains)) {
  console.log(
    `\n ${domain} (${info.totalCards} cards, ${info.tasks.length} tasks)`,
  );
  for (const t of info.tasks) {
    const taskName =
      t.task.length > 50 ? t.task.substring(0, 47) + "..." : t.task;
    console.log(` ${t.ecoRef}: ${taskName} (${t.count} cards)`);
  }
}

console.log("\n\n=== FILE SIZE ESTIMATE ===");
const totalCards = Object.values(domains).reduce(
  (sum, d) => sum + d.totalCards,
  0,
);
console.log("Total flashcards:", totalCards);
