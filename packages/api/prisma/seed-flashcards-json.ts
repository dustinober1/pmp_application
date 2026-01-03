/* eslint-disable no-console */
// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface FlashcardJson {
  meta: {
    title: string;
    domain: string;
    task: string;
    ecoReference: string;
    description: string;
    file: string;
  };
  flashcards: {
    id: number;
    category: string;
    front: string;
    back: string;
  }[];
}

async function main() {
  console.log("🌱 Seeding flashcards from JSON...");

  const jsonPath = path.join(__dirname, "seed-data/flashcards-combined.json");

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ File not found: ${jsonPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, "utf-8");
  let flashcardSets: FlashcardJson[];

  try {
    flashcardSets = JSON.parse(rawData);
  } catch (e) {
    console.error("❌ Failed to parse JSON:", e);
    process.exit(1);
  }

  console.log(`📊 Found ${flashcardSets.length} sets of flashcards.`);

  // Pre-fetch domains
  const domains = await prisma.domain.findMany();

  const normalizeValues = (str: string) =>
    str.split("(")[0].trim().toLowerCase();
  const smartDomainMap = new Map(
    domains.map((d) => [normalizeValues(d.name), d.id]),
  );

  let totalImported = 0;
  let totalSkipped = 0;

  for (const set of flashcardSets) {
    if (!set.flashcards || set.flashcards.length === 0) continue;

    const domainNameRaw = set.meta.domain;
    const taskNameRaw = set.meta.task;

    // 1. Resolve Domain
    let domainId = smartDomainMap.get(normalizeValues(domainNameRaw));

    if (!domainId) {
      const lowerName = domainNameRaw.toLowerCase();
      if (lowerName.includes("people")) domainId = smartDomainMap.get("people");
      else if (lowerName.includes("process"))
        domainId = smartDomainMap.get("process");
      else if (lowerName.includes("business"))
        domainId = smartDomainMap.get("business environment");
    }

    if (!domainId) {
      console.warn(`⚠️  Domain not found: "${domainNameRaw}" - Skipping set.`);
      continue;
    }

    // 2. Resolve Task
    const tasks = await prisma.task.findMany({
      where: { domainId },
    });

    // Try exact match first
    let task = tasks.find(
      (t) => t.name.toLowerCase() === taskNameRaw.toLowerCase(),
    );

    // Try fuzzy match
    if (!task) {
      task = tasks.find(
        (t) =>
          t.name.toLowerCase().includes(taskNameRaw.toLowerCase()) ||
          taskNameRaw.toLowerCase().includes(t.name.toLowerCase()),
      );
    }

    // Special case for mappings using ecoReference
    if (!task && set.meta.ecoReference) {
      let codeLookup = "";
      const ref: string = set.meta.ecoReference;

      if (ref.includes("Business Task")) {
        const match = ref.match(/\d+/);
        if (match && match.length > 0) codeLookup = `III.${match[0]}`;
      } else if (ref.includes("Domain I, Task")) {
        const match = ref.match(/Task (\d+)/);
        if (match && match.length > 1) codeLookup = `I.${match[1]}`;
      } else if (ref.includes("Domain II, Task")) {
        const match = ref.match(/Task (\d+)/);
        if (match && match.length > 1) codeLookup = `II.${match[1]}`;
      }

      if (codeLookup) {
        const foundTask = await prisma.task.findUnique({
          where: { code: codeLookup },
        });
        if (foundTask) task = foundTask;
      }
    }

    if (!task) {
      console.warn(
        `⚠️  Task not found: "${taskNameRaw}" in domain "${domainNameRaw}" - Skipping set.`,
      );
      continue;
    }

    console.log(
      `Processing set for: ${domainNameRaw} -> ${task.name} (${set.flashcards.length} cards)`,
    );

    for (const card of set.flashcards) {
      const existing = await prisma.flashcard.findFirst({
        where: {
          domainId: domainId!, // Use non-null assertion since we checked it above
          taskId: task.id,
          front: card.front,
        },
      });

      if (existing) {
        totalSkipped++;
        continue;
      }

      await prisma.flashcard.create({
        data: {
          domainId: domainId!,
          taskId: task.id,
          front: card.front,
          back: card.back,
          isCustom: false,
        },
      });
      totalImported++;
    }
  }

  console.log(`\n🎉 Import completed.`);
  console.log(`✅ Imported: ${totalImported}`);
  console.log(`⏭️  Skipped: ${totalSkipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
