/**
 * Flashcards data utility with LAZY LOADING by domain AND task
 *
 * This module loads flashcard data on-demand for optimal performance:
 * - manifest.json (~2KB) - Loaded first, contains all stats
 * - Domain files (~20-250KB) - Loaded when domain is selected
 * - Task files (~20-40KB) - For granular loading when needed
 *
 * Also supports prefetching for smooth user experience.
 */

import { base } from '$app/paths';
import { browser } from '$app/environment';
import { z } from 'zod';

// ============================================
// RAW DATA TYPES (from JSON files)
// ============================================
// These types describe the structure of static JSON data files.
// They are NOT the same as application-internal types in @pmp/shared.
//
// Differences from @pmp/shared:
// - RawFlashcard: Has 'category' field, 'id' as number (processed uses string)
// - Flashcard (below): Enhanced with 'domain', 'task', 'ecoReference' metadata
// - @pmp/shared Flashcard: Simplified for session management (no metadata fields)
// ============================================

// Types for the manifest (v2 with task support)
export interface TaskInfo {
  taskId: string;
  name: string;
  ecoReference: string;
  cardCount: number;
  file: string;
}

export interface DomainManifest {
  id: string;
  name: string;
  file: string;
  taskCount: number;
  cardCount: number;
  tasks: TaskInfo[];
}

export interface TaskIndexEntry {
  domainId: string;
  file: string;
  cardCount: number;
}

export interface FlashcardManifest {
  version: number;
  generatedAt: string;
  domains: DomainManifest[];
  taskIndex: Record<string, TaskIndexEntry>;
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

// ============================================
// PROCESSED TYPES (application-internal)
// ============================================
// These are enhanced versions of flashcard data with metadata.
// Used for filtering, searching, and display purposes.
// NOT the same as @pmp/shared/flashcard.Flashcard which is for session management.
// ============================================

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

// ============================================
// RUNTIME VALIDATION SCHEMAS (Zod)
// ============================================

/**
 * Zod schemas for runtime validation of JSON data
 * Prevents crashes from malformed data files
 */

const TaskInfoSchema = z.object({
  taskId: z.string(),
  name: z.string(),
  ecoReference: z.string(),
  cardCount: z.number().int().nonnegative(),
  file: z.string(),
});

const DomainManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  file: z.string(),
  taskCount: z.number().int().nonnegative(),
  cardCount: z.number().int().nonnegative(),
  tasks: z.array(TaskInfoSchema),
});

const TaskIndexEntrySchema = z.object({
  domainId: z.string(),
  file: z.string(),
  cardCount: z.number().int().nonnegative(),
});

export const FlashcardManifestSchema = z.object({
  version: z.number().int().positive(),
  generatedAt: z.string(),
  domains: z.array(DomainManifestSchema),
  taskIndex: z.record(z.string(), TaskIndexEntrySchema),
});

const FlashcardMetaSchema = z.object({
  title: z.string(),
  domain: z.string(),
  task: z.string(),
  ecoReference: z.string(),
  description: z.string(),
  file: z.string(),
});

const RawFlashcardSchema = z.object({
  id: z.number().int().nonnegative(),
  category: z.string(),
  front: z.string(),
  back: z.string(),
});

export const FlashcardGroupSchema = z.object({
  meta: FlashcardMetaSchema,
  flashcards: z.array(RawFlashcardSchema),
});

// Domain name to ID mapping
const DOMAIN_MAP: Record<string, string> = {
  'Business Environment': 'business',
  'People': 'people',
  'People (33%)': 'people',
  'People (42%)': 'people',
  'Process': 'process',
};

// Sanitize ID (same as the split script)
function sanitizeId(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Cache for loaded data
let cachedManifest: FlashcardManifest | null = null;
const cachedDomainData: Map<string, FlashcardGroup[]> = new Map();
const cachedTaskData: Map<string, FlashcardGroup> = new Map();
const cachedProcessedFlashcards: Map<string, Flashcard[]> = new Map();

// Prefetch state
const prefetchedDomains: Set<string> = new Set();
let prefetchTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Load the manifest file (very small, ~2KB with task info)
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
    const rawData = await response.json();

    // Runtime validation using Zod schema
    const data = FlashcardManifestSchema.parse(rawData);
    cachedManifest = data;
    return data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Flashcards manifest validation failed:', error.issues);
      throw new Error('Invalid flashcards manifest data format');
    }
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
    const rawData = await response.json();

    // Runtime validation using Zod schema
    const data = z.array(FlashcardGroupSchema).parse(rawData);
    cachedDomainData.set(domainId, data);
    prefetchedDomains.add(domainId);
    return data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Flashcards data validation failed for domain ${domainId}:`, error.issues);
      throw new Error(`Invalid flashcards data format for domain ${domainId}`);
    }
    console.error(`Failed to load flashcards for domain ${domainId}:`, error);
    throw new Error(`Failed to load flashcards for ${domainId}`);
  }
}

/**
 * Load a single task's flashcards (most granular loading)
 */
export async function loadTaskData(domainId: string, taskId: string): Promise<FlashcardGroup> {
  const cacheKey = `${domainId}-${taskId}`;

  if (cachedTaskData.has(cacheKey)) {
    return cachedTaskData.get(cacheKey)!;
  }

  try {
    const sanitizedTaskId = sanitizeId(taskId);
    const response = await fetch(`${base}/data/flashcards/tasks/${domainId}-${sanitizedTaskId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load task ${taskId}: ${response.statusText}`);
    }
    const rawData = await response.json();

    // Runtime validation using Zod schema
    const data = FlashcardGroupSchema.parse(rawData);
    cachedTaskData.set(cacheKey, data);
    return data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Flashcards data validation failed for task ${taskId}:`, error.issues);
      throw new Error(`Invalid flashcards data format for task ${taskId}`);
    }
    console.error(`Failed to load flashcards for task ${taskId}:`, error);
    throw new Error(`Failed to load flashcards for task ${taskId}`);
  }
}

/**
 * Process raw domain data into Flashcard format
 */
function processDomainFlashcards(groups: FlashcardGroup[]): Flashcard[] {
  const processed: Flashcard[] = [];

  for (const group of groups) {
    const groupDomainId = DOMAIN_MAP[group.meta.domain] || group.meta.domain.toLowerCase().replace(/\s+/g, '-');
    const taskId = sanitizeId(group.meta.ecoReference);

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
  const flashcards = processDomainFlashcards(groups);
  cachedProcessedFlashcards.set(domainId, flashcards);
  return flashcards;
}

/**
 * Get flashcards for a specific task (most granular)
 */
export async function getFlashcardsByTask(domainId: string, taskId: string): Promise<Flashcard[]> {
  const group = await loadTaskData(domainId, taskId);
  return processDomainFlashcards([group]);
}

/**
 * Get all processed flashcards (loads all domains in parallel)
 */
export async function processFlashcards(): Promise<Flashcard[]> {
  const manifest = await loadManifest();

  // Load all domains in parallel
  const domainPromises = manifest.domains.map(d => getFlashcardsByDomain(d.id));
  const allFlashcards = await Promise.all(domainPromises);

  return allFlashcards.flat();
}

/**
 * Prefetch domains in the background for smoother UX
 * Call this after initial page load
 */
export function prefetchDomains(exceptDomainId?: string): void {
  if (!browser) return;

  // Cancel any pending prefetch
  if (prefetchTimeout) {
    clearTimeout(prefetchTimeout);
  }

  // Delay prefetch to not compete with main content
  prefetchTimeout = setTimeout(async () => {
    try {
      const manifest = await loadManifest();

      for (const domain of manifest.domains) {
        // Skip already loaded/prefetched domains and the current one
        if (prefetchedDomains.has(domain.id) || domain.id === exceptDomainId) {
          continue;
        }

        // Use low priority fetch with requestIdleCallback if available
        if ('requestIdleCallback' in window) {
          (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
            loadDomainData(domain.id).catch(() => {
              // Silently fail prefetch - not critical
            });
          });
        } else {
          // Fallback: stagger fetches
          await new Promise(resolve => setTimeout(resolve, 100));
          loadDomainData(domain.id).catch(() => { });
        }
      }
    } catch {
      // Silently fail prefetch
    }
  }, 1000); // Wait 1 second before starting prefetch
}

/**
 * Get flashcard statistics from manifest (fast, no full data load)
 */
export async function getFlashcardStats(): Promise<FlashcardStats> {
  const manifest = await loadManifest();

  // Basic stats from manifest (fast!)
  const totalFlashcards = manifest.domains.reduce((sum, d) => sum + d.cardCount, 0);
  const totalTasks = manifest.domains.reduce((sum, d) => sum + d.taskCount, 0);

  // Domain breakdown from manifest (no need to load full data!)
  const domainBreakdown: DomainBreakdown[] = manifest.domains.map(domain => ({
    domainId: domain.id,
    domain: domain.name,
    totalFlashcards: domain.cardCount,
    tasks: domain.tasks.map(task => ({
      taskId: sanitizeId(task.ecoReference),
      task: task.name,
      ecoReference: task.ecoReference,
      flashcardCount: task.cardCount,
      categories: [], // Not available in manifest, would need full load
    })),
  }));

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

  if (options.taskId && options.domainId) {
    // Load specific task only
    flashcards = await getFlashcardsByTask(options.domainId, options.taskId);
  } else if (options.domainId) {
    // Load the specific domain
    flashcards = await getFlashcardsByDomain(options.domainId);
  } else {
    // Load all (use sparingly)
    flashcards = await processFlashcards();
  }

  // Apply task filter if only taskId given (fallback path)
  if (options.taskId && !options.domainId) {
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
 * Get all unique tasks for a domain from manifest (fast, no data load)
 */
export async function getTasksByDomain(domainId: string): Promise<Array<{ id: string; name: string; ecoReference: string }>> {
  const manifest = await loadManifest();
  const domain = manifest.domains.find(d => d.id === domainId);

  if (!domain) {
    return [];
  }

  return domain.tasks.map(task => ({
    id: sanitizeId(task.ecoReference),
    name: task.name,
    ecoReference: task.ecoReference,
  }));
}

/**
 * Clear all cached flashcards data
 */
export function clearCache(): void {
  cachedManifest = null;
  cachedDomainData.clear();
  cachedTaskData.clear();
  cachedProcessedFlashcards.clear();
  prefetchedDomains.clear();
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

/**
 * @deprecated Use loadManifest() + loadDomainData() instead
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
