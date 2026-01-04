/**
 * Flashcards data loader and utilities.
 *
 * This module loads flashcards from static JSON data and provides
 * filtering and querying capabilities.
 */

import { fetchStaticData } from "./staticFetch";

/**
 * Raw flashcard section structure from flashcards.json
 */
export interface FlashcardsSection {
  meta: {
    domain: string;
    domainId: number;
    task: string;
    taskId: number;
    ecoReference: string;
    count: number;
  };
  flashcards: RawFlashcard[];
}

/**
 * Raw flashcard structure from flashcards.json
 */
export interface RawFlashcard {
  id: number;
  front: string;
  back: string;
}

/**
 * Flattened flashcard with full metadata
 */
export interface FlashcardCard {
  id: string;
  front: string;
  back: string;
  category: string;
  domain: string;
  domainId: number;
  task: string;
  taskId: number;
  ecoReference: string;
}

/**
 * Filter options for flashcards
 */
export interface FlashcardFilters {
  domain?: string;
  task?: string;
  ecoReference?: string;
}

/**
 * Flashcards file structure (array of sections)
 */
type FlashcardsFile = FlashcardsSection[];

/**
 * Loads and parses flashcards data from the static JSON file.
 * Returns a flattened array of flashcards with full metadata.
 */
export async function loadFlashcards(): Promise<FlashcardCard[]> {
  const sections = await fetchStaticData<FlashcardsFile>(
    "/data/flashcards.json",
  );

  const cards: FlashcardCard[] = [];

  for (const section of sections) {
    const { meta, flashcards } = section;

    for (const rawCard of flashcards) {
      // Generate a stable unique ID combining ecoReference and card id
      const id = `${meta.ecoReference}-${rawCard.id}`;

      // Clean up the text (remove trailing newlines)
      const front = rawCard.front.replace(/\n+$/, "");
      const back = rawCard.back.replace(/\n+$/, "");

      // Validate that we have content on both sides
      if (!front.trim() || !back.trim()) {
        console.warn(`Skipping empty flashcard ${id}`);
        continue;
      }

      cards.push({
        id,
        front,
        back,
        category: `${meta.domain} - ${meta.task}`,
        domain: meta.domain,
        domainId: meta.domainId,
        task: meta.task,
        taskId: meta.taskId,
        ecoReference: meta.ecoReference,
      });
    }
  }

  return cards;
}

/**
 * Filters flashcards based on the provided criteria.
 */
export function filterFlashcards(
  cards: FlashcardCard[],
  filters: FlashcardFilters,
): FlashcardCard[] {
  return cards.filter((card) => {
    if (filters.domain && card.domain !== filters.domain) {
      return false;
    }
    if (filters.task && card.task !== filters.task) {
      return false;
    }
    if (filters.ecoReference && card.ecoReference !== filters.ecoReference) {
      return false;
    }
    return true;
  });
}

/**
 * Gets all unique domains from the flashcards
 */
export function getFlashcardDomains(cards: FlashcardCard[]): string[] {
  const domains = new Set(cards.map((card) => card.domain));
  return Array.from(domains).sort();
}

/**
 * Gets all unique tasks for a given domain
 */
export function getFlashcardTasksByDomain(
  cards: FlashcardCard[],
  domain: string,
): string[] {
  const tasks = new Set(
    cards.filter((card) => card.domain === domain).map((card) => card.task),
  );
  return Array.from(tasks).sort();
}

/**
 * Gets flashcard statistics
 */
export interface FlashcardStats {
  totalCards: number;
  domains: number;
  tasks: number;
  cardsByDomain: Record<string, number>;
}

export function getFlashcardStats(cards: FlashcardCard[]): FlashcardStats {
  const cardsByDomain: Record<string, number> = {};

  for (const card of cards) {
    cardsByDomain[card.domain] = (cardsByDomain[card.domain] || 0) + 1;
  }

  return {
    totalCards: cards.length,
    domains: Object.keys(cardsByDomain).length,
    tasks: new Set(cards.map((card) => `${card.domain}-${card.task}`)).size,
    cardsByDomain,
  };
}
