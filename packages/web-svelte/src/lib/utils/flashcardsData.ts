/**
 * Flashcards data utility with LAZY LOADING by domain
 * 
 * This module loads flashcard data on-demand per domain to improve initial page load.
 * Instead of loading 500KB+ upfront, we load only the manifest (~500 bytes) initially,
 * then load individual domain files (~20-250KB each) as needed.
 */

import { base } from '$app/paths';

// Types for the manifest
export interface DomainManifest {
  id: string;
  name: string;
  file: string;
  taskCount: number;
  cardCount: number;
}

export interface FlashcardManifest {
  version: number;
  generatedAt: string;
  domains: DomainManifest[];
}

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
  'People (33%)': 'people',
  'People (42%)': 'people',
  'Process': 'process',
};

// Cache for loaded data
let cachedManifest: FlashcardManifest | null = null;
const cachedDomainData: Map<string, FlashcardGroup[]> = new Map();
const cachedProcessedFlashcards: Map<string, Flashcard[]> = new Map();

/**
 * Load the manifest file (very small, ~500 bytes)
 */
export async function loadManifest(): Promise<FlashcardManifest> {
  if (cachedManifest) {
    return cachedManifest;
  }

  try {
    const response = await fetch(`${base}/data/flashcards/manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }
    const data = (await response.json()) as FlashcardManifest;
    cachedManifest = data;
    return data;
  } catch (error) {
    console.error('Failed to load flashcards manifest:', error);
    throw new Error('Failed to load flashcards');
  }
}

/**
 * Load flashcard groups for a specific domain (lazy loaded)
 */
export async function loadDomainData(domainId: string): Promise<FlashcardGroup[]> {
  // Return cached if available
  if (cachedDomainData.has(domainId)) {
    return cachedDomainData.get(domainId)!;
  }

  try {
    const response = await fetch(`${base}/data/flashcards/${domainId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load domain ${domainId}: ${response.statusText}`);
    }
    const data = (await response.json()) as FlashcardGroup[];
    cachedDomainData.set(domainId, data);
    return data;
  } catch (error) {
    console.error(`Failed to load flashcards for domain ${domainId}:`, error);
    throw new Error(`Failed to load flashcards for ${domainId}`);
  }
}

/**
 * Process raw domain data into Flashcard format
 */
function processDomainFlashcards(domainId: string, groups: FlashcardGroup[]): Flashcard[] {
  const processed: Flashcard[] = [];

  for (const group of groups) {
    const groupDomainId = DOMAIN_MAP[group.meta.domain] || group.meta.domain.toLowerCase().replace(/\s+/g, '-');
    const taskId = group.meta.ecoReference.toLowerCase().replace(/\s+/g, '-');

    for (const raw of group.flashcards) {
      processed.push({
        id: `${groupDomainId}-${taskId}-${raw.id}`,
        domainId: groupDomainId,
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

  return processed;
}

/**
 * Get flashcards for a specific domain (lazy loaded)
 */
export async function getFlashcardsByDomain(domainId: string): Promise<Flashcard[]> {
  // Return cached processed flashcards if available
  if (cachedProcessedFlashcards.has(domainId)) {
    return cachedProcessedFlashcards.get(domainId)!;
  }

  const groups = await loadDomainData(domainId);
  const flashcards = processDomainFlashcards(domainId, groups);
  cachedProcessedFlashcards.set(domainId, flashcards);
  return flashcards;
}

/**
 * Get all processed flashcards (loads all domains)
 * Use sparingly - prefer getFlashcardsByDomain for better performance
 */
export async function processFlashcards(): Promise<Flashcard[]> {
  const manifest = await loadManifest();

  // Load all domains in parallel
  const domainPromises = manifest.domains.map(d => getFlashcardsByDomain(d.id));
  const allFlashcards = await Promise.all(domainPromises);

  return allFlashcards.flat();
}

/**
 * Get flashcard statistics from manifest (fast, no full data load)
 */
export async function getFlashcardStats(): Promise<FlashcardStats> {
  const manifest = await loadManifest();

  // Basic stats from manifest (fast!)
  const totalFlashcards = manifest.domains.reduce((sum, d) => sum + d.cardCount, 0);
  const totalTasks = manifest.domains.reduce((sum, d) => sum + d.taskCount, 0);

  // Domain breakdown needs actual data for full task info
  const domainBreakdown: DomainBreakdown[] = [];

  for (const domain of manifest.domains) {
    const groups = await loadDomainData(domain.id);

    const tasks: TaskBreakdown[] = groups.map(group => {
      const categories = new Set(group.flashcards.map(f => f.category));
      return {
        taskId: group.meta.ecoReference.toLowerCase().replace(/\s+/g, '-'),
        task: group.meta.task,
        ecoReference: group.meta.ecoReference,
        flashcardCount: group.flashcards.length,
        categories: Array.from(categories),
      };
    });

    domainBreakdown.push({
      domainId: domain.id,
      domain: domain.name,
      totalFlashcards: domain.cardCount,
      tasks,
    });
  }

  return {
    totalFlashcards,
    totalDomains: manifest.domains.length,
    totalTasks,
    domainBreakdown,
  };
}

/**
 * Get quick stats from manifest only (very fast, no domain data load)
 */
export async function getQuickStats(): Promise<{
  totalFlashcards: number;
  totalDomains: number;
  totalTasks: number;
  domains: DomainManifest[];
}> {
  const manifest = await loadManifest();

  return {
    totalFlashcards: manifest.domains.reduce((sum, d) => sum + d.cardCount, 0),
    totalDomains: manifest.domains.length,
    totalTasks: manifest.domains.reduce((sum, d) => sum + d.taskCount, 0),
    domains: manifest.domains,
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
  let flashcards: Flashcard[];

  if (options.domainId) {
    // Only load the specific domain
    flashcards = await getFlashcardsByDomain(options.domainId);
  } else {
    // Load all (use sparingly)
    flashcards = await processFlashcards();
  }

  // Apply task filter
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
  // Extract domain from ID (format: domain-task-id)
  const parts = id.split('-');
  if (parts.length >= 3) {
    const domainId = parts[0];
    const flashcards = await getFlashcardsByDomain(domainId);
    return flashcards.find((f) => f.id === id) || null;
  }

  // Fallback to searching all
  const flashcards = await processFlashcards();
  return flashcards.find((f) => f.id === id) || null;
}

/**
 * Get all unique domains from manifest (fast)
 */
export async function getDomains(): Promise<Array<{ id: string; name: string }>> {
  const manifest = await loadManifest();
  return manifest.domains.map(d => ({ id: d.id, name: d.name }));
}

/**
 * Get all unique tasks for a domain
 */
export async function getTasksByDomain(domainId: string): Promise<Array<{ id: string; name: string; ecoReference: string }>> {
  const groups = await loadDomainData(domainId);

  return groups.map(group => ({
    id: group.meta.ecoReference.toLowerCase().replace(/\s+/g, '-'),
    name: group.meta.task,
    ecoReference: group.meta.ecoReference,
  }));
}

/**
 * Clear all cached flashcards data
 */
export function clearCache(): void {
  cachedManifest = null;
  cachedDomainData.clear();
  cachedProcessedFlashcards.clear();
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================
// These functions maintain backwards compatibility with the old API
// that loaded everything from flashcards.json

/**
 * @deprecated Use loadManifest() + loadDomainData() instead
 * Load and parse flashcards.json from static/data directory
 */
export async function loadFlashcardsData(): Promise<FlashcardsData> {
  const manifest = await loadManifest();
  const allGroups: FlashcardGroup[] = [];

  for (const domain of manifest.domains) {
    const groups = await loadDomainData(domain.id);
    allGroups.push(...groups);
  }

  return allGroups;
}
