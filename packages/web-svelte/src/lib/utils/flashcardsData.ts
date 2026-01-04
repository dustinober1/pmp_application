/**
 * Flashcards data utility for loading and processing flashcards.json
 */

import { base } from '$app/paths';

// Types for the raw flashcards.json structure
export interface FlashcardMeta {
  title: string;
  domain: string;
  task: string;
  ecoReference: string;
  description: string;
  file: string;
}

export interface RawFlashcard {
  id: number;
  category: string;
  front: string;
  back: string;
}

export interface FlashcardGroup {
  meta: FlashcardMeta;
  flashcards: RawFlashcard[];
}

export type FlashcardsData = FlashcardGroup[];

// Processed types for the application
export interface Flashcard {
  id: string;
  domainId: string;
  taskId: string;
  domain: string;
  task: string;
  category: string;
  front: string;
  back: string;
  ecoReference: string;
}

export interface FlashcardStats {
  totalFlashcards: number;
  totalDomains: number;
  totalTasks: number;
  domainBreakdown: DomainBreakdown[];
}

export interface DomainBreakdown {
  domainId: string;
  domain: string;
  totalFlashcards: number;
  tasks: TaskBreakdown[];
}

export interface TaskBreakdown {
  taskId: string;
  task: string;
  ecoReference: string;
  flashcardCount: number;
  categories: string[];
}

export interface PaginatedFlashcards {
  items: Flashcard[];
  total: number;
  offset: number;
  limit: number;
}

// Domain name to ID mapping
const DOMAIN_MAP: Record<string, string> = {
  'Business Environment': 'business',
  'People': 'people',
  'Process': 'process',
};

// Cache for the loaded flashcards data
let cachedFlashcards: Flashcard[] | null = null;
let cachedFlashcardsData: FlashcardsData | null = null;

/**
 * Load and parse flashcards.json from static/data directory
 */
export async function loadFlashcardsData(): Promise<FlashcardsData> {
  if (cachedFlashcardsData) {
    return cachedFlashcardsData;
  }

  try {
    const response = await fetch(`${base}/data/flashcards.json`);
    if (!response.ok) {
      throw new Error(`Failed to load flashcards.json: ${response.statusText}`);
    }
    const data = (await response.json()) as FlashcardsData;
    cachedFlashcardsData = data;
    return data;
  } catch (error) {
    console.error('Failed to load flashcards.json:', error);
    throw new Error('Failed to load flashcards');
  }
}

/**
 * Process raw flashcards data into application format
 */
export async function processFlashcards(): Promise<Flashcard[]> {
  if (cachedFlashcards) {
    return cachedFlashcards;
  }

  const data = await loadFlashcardsData();

  const processed: Flashcard[] = [];

  for (const group of data) {
    const domainId = DOMAIN_MAP[group.meta.domain] || group.meta.domain.toLowerCase().replace(/\s+/g, '-');

    // Create a task ID from the task name or ecoReference
    const taskId = group.meta.ecoReference.toLowerCase().replace(/\s+/g, '-');

    for (const raw of group.flashcards) {
      processed.push({
        id: `${domainId}-${taskId}-${raw.id}`,
        domainId,
        taskId,
        domain: group.meta.domain,
        task: group.meta.task,
        category: raw.category,
        front: raw.front,
        back: raw.back,
        ecoReference: group.meta.ecoReference,
      });
    }
  }

  cachedFlashcards = processed;
  return processed;
}

/**
 * Get flashcard statistics
 */
export async function getFlashcardStats(): Promise<FlashcardStats> {
  const data = await loadFlashcardsData();

  const domainMap = new Map<string, DomainBreakdown>();

  for (const group of data) {
    const domainId = DOMAIN_MAP[group.meta.domain] || group.meta.domain.toLowerCase().replace(/\s+/g, '-');

    if (!domainMap.has(domainId)) {
      domainMap.set(domainId, {
        domainId,
        domain: group.meta.domain,
        totalFlashcards: 0,
        tasks: [],
      });
    }

    const domain = domainMap.get(domainId)!;
    domain.totalFlashcards += group.flashcards.length;

    const categories = new Set(group.flashcards.map((f) => f.category));

    domain.tasks.push({
      taskId: group.meta.ecoReference.toLowerCase().replace(/\s+/g, '-'),
      task: group.meta.task,
      ecoReference: group.meta.ecoReference,
      flashcardCount: group.flashcards.length,
      categories: Array.from(categories),
    });
  }

  return {
    totalFlashcards: data.reduce((sum, group) => sum + group.flashcards.length, 0),
    totalDomains: domainMap.size,
    totalTasks: data.length,
    domainBreakdown: Array.from(domainMap.values()),
  };
}

/**
 * Get paginated flashcards with optional domain and task filtering
 */
export async function getFlashcards(options: {
  limit: number;
  domainId?: string;
  taskId?: string;
}): Promise<PaginatedFlashcards> {
  let flashcards = await processFlashcards();

  // Apply filters
  if (options.domainId) {
    flashcards = flashcards.filter((f) => f.domainId === options.domainId);
  }

  if (options.taskId) {
    flashcards = flashcards.filter((f) => f.taskId === options.taskId);
  }

  return {
    items: flashcards.slice(0, options.limit),
    total: flashcards.length,
    offset: 0,
    limit: options.limit,
  };
}

/**
 * Get flashcards by domain
 */
export async function getFlashcardsByDomain(domainId: string): Promise<Flashcard[]> {
  const flashcards = await processFlashcards();
  return flashcards.filter((f) => f.domainId === domainId);
}

/**
 * Get flashcards by task
 */
export async function getFlashcardsByTask(taskId: string): Promise<Flashcard[]> {
  const flashcards = await processFlashcards();
  return flashcards.filter((f) => f.taskId === taskId);
}

/**
 * Get flashcard by ID
 */
export async function getFlashcardById(id: string): Promise<Flashcard | null> {
  const flashcards = await processFlashcards();
  return flashcards.find((f) => f.id === id) || null;
}

/**
 * Get all unique domains
 */
export async function getDomains(): Promise<Array<{ id: string; name: string }>> {
  const data = await loadFlashcardsData();
  const domains = new Map<string, string>();

  for (const group of data) {
    const domainId = DOMAIN_MAP[group.meta.domain] || group.meta.domain.toLowerCase().replace(/\s+/g, '-');
    domains.set(domainId, group.meta.domain);
  }

  return Array.from(domains.entries()).map(([id, name]) => ({ id, name }));
}

/**
 * Get all unique tasks for a domain
 */
export async function getTasksByDomain(domainId: string): Promise<Array<{ id: string; name: string; ecoReference: string }>> {
  const data = await loadFlashcardsData();
  const tasks: Array<{ id: string; name: string; ecoReference: string }> = [];

  for (const group of data) {
    const groupDomainId = DOMAIN_MAP[group.meta.domain] || group.meta.domain.toLowerCase().replace(/\s+/g, '-');

    if (groupDomainId === domainId) {
      tasks.push({
        id: group.meta.ecoReference.toLowerCase().replace(/\s+/g, '-'),
        name: group.meta.task,
        ecoReference: group.meta.ecoReference,
      });
    }
  }

  return tasks;
}

/**
 * Clear cached flashcards data
 */
export function clearCache(): void {
  cachedFlashcards = null;
  cachedFlashcardsData = null;
}
