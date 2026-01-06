import type { Flashcard, PracticeQuestion, QuestionOption } from "@pmp/shared";
import { base } from "$app/paths";

/**
 * Static Data Loader
 *
 * Handles loading and transforming static JSON files for the PMP Study application.
 * This module separates static data concerns from HTTP API calls.
 */

// Cache for static data to avoid repeated fetches
let cachedFlashcards: Flashcard[] | null = null;
let cachedQuestions: PracticeQuestion[] | null = null;

/**
 * Normalizes raw domain strings to consistent domain IDs
 */
export function normalizeDomainId(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower.includes("people")) return "domain-people";
  if (lower.includes("process")) return "domain-process";
  if (lower.includes("business")) return "domain-business";
  return lower.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Normalizes ECO reference and task name to consistent task IDs
 * Format: ROMAN_NUMERAL-TASK_NUMBER (e.g., "I-1", "II-15", "III-3")
 */
export function normalizeTaskId(rawEco: string, rawTaskName: string): string {
  if (!rawEco) return rawTaskName;

  const eco = rawEco.trim();
  const domainMatch = eco.match(/Domain\s+([IVX]+)/i);
  const taskMatch = eco.match(/Task\s+(\d+)/i);

  if (domainMatch && taskMatch) {
    return `${domainMatch[1].toUpperCase()}-${taskMatch[1]}`;
  }

  if (eco.toLowerCase().includes("business") && taskMatch) {
    return `III-${taskMatch[1]}`;
  }

  return eco;
}

/**
 * Shuffles an array in place using Durstenfeld shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Loads flashcards from static JSON file with transformation
 * Applies normalization to domain and task IDs
 */
export async function loadStaticFlashcards(
  fetchFn: typeof fetch = fetch,
): Promise<Flashcard[]> {
  if (cachedFlashcards) return cachedFlashcards;

  try {
    const res = await fetchFn(`${base}/data/flashcards.json`);
    if (res.ok) {
      const data = await res.json();
      cachedFlashcards = data.flatMap((group: any) => {
        const domainId = normalizeDomainId(group.meta.domain || "");
        const taskId = normalizeTaskId(
          group.meta.ecoReference || "",
          group.meta.task || "",
        );

        return group.flashcards.map((card: any) => ({
          ...card,
          id: String(card.id),
          domainId: domainId,
          taskId: taskId,
          createdAt: new Date().toISOString(),
          isCustom: false,
        }));
      }) as Flashcard[];

      return cachedFlashcards;
    }
  } catch (e) {
    console.error("Failed to load static flashcards", e);
  }

  return [];
}

/**
 * Loads practice questions from static JSON file with transformation
 * Applies normalization and maps to PracticeQuestion type
 */
export async function loadStaticQuestions(
  fetchFn: typeof fetch = fetch,
): Promise<PracticeQuestion[]> {
  if (cachedQuestions) return cachedQuestions;

  try {
    const res = await fetchFn(`${base}/data/testbank.json`);
    if (res.ok) {
      const data = await res.json();
      cachedQuestions = data.questions.map((q: any) => {
        const domainId = normalizeDomainId(q.domain || "");
        let taskId = q.task || "";

        // Normalize task ID based on domain
        if (domainId === "domain-people") taskId = `I-${q.taskNumber}`;
        else if (domainId === "domain-process") taskId = `II-${q.taskNumber}`;
        else if (domainId === "domain-business") taskId = `III-${q.taskNumber}`;

        const rawOptions = q.answers.map(
          (a: any, idx: number) =>
            ({
              id: `opt-${idx}`,
              questionId: q.id,
              text: a.text,
              isCorrect: a.isCorrect,
            }) as QuestionOption,
        );

        const shuffledOptions = shuffleArray<QuestionOption>(rawOptions);
        const correctOption = shuffledOptions.find(
          (o: QuestionOption) => o.isCorrect,
        );

        return {
          id: q.id,
          domainId: domainId,
          taskId: taskId,
          scenario: q.scenario,
          questionText: q.questionText,
          options: shuffledOptions,
          correctOptionId: correctOption?.id || `opt-${q.correctAnswerIndex}`,
          explanation: q.remediation.coreLogic,
          difficulty: "medium",
          relatedFormulaIds: [],
          createdAt: new Date().toISOString(),
        };
      }) as PracticeQuestion[];

      return cachedQuestions;
    }
  } catch (e) {
    console.error("Failed to load static questions", e);
  }

  return [];
}

/**
 * Clears the static data cache
 * Use when you need to force reload data (e.g., after updates)
 */
export function clearStaticDataCache(): void {
  cachedFlashcards = null;
  cachedQuestions = null;
}
