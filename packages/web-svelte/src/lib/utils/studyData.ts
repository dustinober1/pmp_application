/**
 * Study data utility for loading and processing study guide content
 * Domains and tasks are derived from flashcards.json and testbank.json
 */

import { base } from '$app/paths';
import type { Domain, Task, StudyGuide, StudySection } from '@pmp/shared';

// Domain name to ID and code mapping
const DOMAIN_CONFIG: Record<string, { id: string; code: string; weightPercentage: number; orderIndex: number }> = {
	'Business Environment': {
		id: 'business',
		code: 'BUSINESS_ENVIRONMENT',
		weightPercentage: 26,
		orderIndex: 3
	},
	'People': {
		id: 'people',
		code: 'PEOPLE',
		weightPercentage: 33,
		orderIndex: 1
	},
	'Process': {
		id: 'process',
		code: 'PROCESS',
		weightPercentage: 41,
		orderIndex: 2
	}
};

// Domain descriptions
const DOMAIN_DESCRIPTIONS: Record<string, string> = {
	business:
		'Business Environment domain covering organizational structures, compliance, governance, and external factors affecting projects.',
	people:
		'People domain covering team management, leadership, stakeholder engagement, and resource optimization.',
	process:
		'Process domain covering project lifecycle, delivery, governance, and technical project management activities.'
};

// Cache for loaded data
let cachedDomains: Domain[] | null = null;
let cachedDomainMap: Map<string, Domain> | null = null;
let cachedTasks: Task[] | null = null;

/**
 * Raw domain metadata from flashcards.json
 */
interface FlashcardMeta {
	title: string;
	domain: string;
	task: string;
	ecoReference: string;
	description: string;
	file: string;
}

/**
 * Raw task data from testbank.json
 */
interface TestbankFile {
	filename: string;
	domain: string;
	taskNumber: number;
	task: string;
	ecoTask: string;
	difficulty: string;
	questionCount: number;
}

/**
 * Flashcard group structure
 */
interface FlashcardGroup {
	meta: FlashcardMeta;
	flashcards: unknown[];
}

/**
 * Testbank data structure
 */
interface TestbankData {
	generatedAt: string;
	totalFiles: number;
	totalQuestions: number;
	domains: {
		people: { files: number; questions: number };
		process: { files: number; questions: number };
		business: { files: number; questions: number };
	};
	methodologyDistribution: {
		predictive: number;
		agile: number;
		hybrid: number;
	};
	files: TestbankFile[];
	questions: unknown[];
}

/**
 * Load flashcards.json to extract domain/task metadata
 */
async function loadFlashcardsMetadata(): Promise<FlashcardGroup[]> {
	try {
		const response = await fetch(`${base}/data/flashcards.json`);
		if (!response.ok) {
			throw new Error(`Failed to load flashcards.json: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Failed to load flashcards.json:', error);
		return [];
	}
}

/**
 * Load testbank.json to extract domain/task metadata
 */
async function loadTestbankMetadata(): Promise<TestbankData | null> {
	try {
		const response = await fetch(`${base}/data/testbank.json`);
		if (!response.ok) {
			throw new Error(`Failed to load testbank.json: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Failed to load testbank.json:', error);
		return null;
	}
}

/**
 * Get task ID from ecoReference
 */
function getTaskIdFromEcoReference(ecoReference: string): string {
	return ecoReference.toLowerCase().replace(/\s+/g, '-').replace(/[\/]/g, '-');
}

/**
 * Get task code (e.g., "1.1", "2.3") from task name or ecoReference
 */
function getTaskCode(ecoReference: string, domainOrder: number): string {
	// Try to extract a pattern like "Task 1.1" or "1.1" from the ecoReference
	const match = ecoReference.match(/(\d+)\.(\d+)/);
	if (match) {
		return `${match[1]}.${match[2]}`;
	}
	// Fallback: derive from domain order and task name
	return `${domainOrder}.X`;
}

/**
 * Build domains from flashcards and testbank data
 */
async function buildDomains(): Promise<Domain[]> {
	const [flashcardGroups, testbank] = await Promise.all([
		loadFlashcardsMetadata(),
		loadTestbankMetadata()
	]);

	// Use a Map to aggregate tasks by domain
	const domainMap = new Map<string, Domain>();

	// First, create domains from flashcards data
	for (const group of flashcardGroups) {
		const config = DOMAIN_CONFIG[group.meta.domain];
		if (!config) continue;

		const domainId = config.id;

		if (!domainMap.has(domainId)) {
			domainMap.set(domainId, {
				id: domainId,
				name: group.meta.domain,
				code: config.code,
				description: DOMAIN_DESCRIPTIONS[domainId] || '',
				weightPercentage: config.weightPercentage,
				orderIndex: config.orderIndex,
				tasks: []
			});
		}

		const domain = domainMap.get(domainId)!;
		const taskId = getTaskIdFromEcoReference(group.meta.ecoReference);

		// Check if task already exists
		const existingTask = domain.tasks?.find((t) => t.id === taskId);
		if (!existingTask && domain.tasks) {
			domain.tasks.push({
				id: taskId,
				domainId,
				code: getTaskCode(group.meta.ecoReference, config.orderIndex),
				name: group.meta.task,
				description: group.meta.description || '',
				enablers: [],
				orderIndex: domain.tasks.length + 1
			});
		}
	}

	// Enhance with testbank data if available
	if (testbank?.files) {
		for (const file of testbank.files) {
			const domainId = file.domain;
			const taskId = getTaskIdFromEcoReference(file.ecoTask);

			const domain = domainMap.get(domainId);
			if (domain) {
				const existingTask = domain.tasks?.find((t) => t.id === taskId);
				if (existingTask) {
					// Update task code with more accurate taskNumber
					existingTask.code = `${file.taskNumber}`;
				} else if (domain.tasks) {
					// Add new task from testbank
					domain.tasks.push({
						id: taskId,
						domainId,
						code: `${file.taskNumber}`,
						name: file.task,
						description: '',
						enablers: [],
						orderIndex: domain.tasks.length + 1
					});
				}
			}
		}
	}

	// Sort domains by orderIndex
	const domains = Array.from(domainMap.values()).sort(
		(a, b) => a.orderIndex - b.orderIndex
	);

	// Sort tasks within each domain by code (or orderIndex)
	for (const domain of domains) {
		if (domain.tasks) {
			domain.tasks.sort((a, b) => {
				// Try to sort by numeric code first
				const aCode = a.code.split('.').map(Number);
				const bCode = b.code.split('.').map(Number);
				if (aCode.length === 2 && bCode.length === 2) {
					if (aCode[0] !== bCode[0]) return aCode[0] - bCode[0];
					return (aCode[1] || 0) - (bCode[1] || 0);
				}
				return a.orderIndex - b.orderIndex;
			});
		}
	}

	return domains;
}

/**
 * Load all domains with their tasks
 */
export async function loadDomains(): Promise<Domain[]> {
	if (cachedDomains) {
		return cachedDomains;
	}

	try {
		cachedDomains = await buildDomains();
		return cachedDomains;
	} catch (error) {
		console.error('Failed to load domains:', error);
		// Return empty array on failure
		return [];
	}
}

/**
 * Get a domain by ID
 */
export async function getDomain(domainId: string): Promise<Domain | null> {
	if (!cachedDomainMap) {
		const domains = await loadDomains();
		cachedDomainMap = new Map(domains.map((d) => [d.id, d]));
	}
	return cachedDomainMap.get(domainId) || null;
}

/**
 * Get all tasks across all domains
 */
export async function loadTasks(): Promise<Task[]> {
	if (cachedTasks) {
		return cachedTasks;
	}

	const domains = await loadDomains();
	const tasks: Task[] = [];

	for (const domain of domains) {
		if (domain.tasks) {
			for (const task of domain.tasks) {
				tasks.push({ ...task, domain });
			}
		}
	}

	cachedTasks = tasks;
	return tasks;
}

/**
 * Get tasks for a specific domain
 */
export async function getTasksByDomain(domainId: string): Promise<Task[]> {
	const domains = await loadDomains();
	const domain = domains.find((d) => d.id === domainId);
	return domain?.tasks || [];
}

/**
 * Get a single task by ID
 */
export async function getTaskById(taskId: string): Promise<Task | null> {
	const tasks = await loadTasks();
	return tasks.find((t) => t.id === taskId) || null;
}

/**
 * Get study guide for a task
 * Note: Actual study guide content would be loaded from a separate JSON file
 * This is a placeholder structure for future enhancement
 */
export async function getStudyGuide(taskId: string): Promise<StudyGuide | null> {
	const task = await getTaskById(taskId);
	if (!task) return null;

	// Placeholder - in production, this would load from a study-guides.json file
	return {
		id: `sg-${taskId}`,
		taskId,
		title: `Study Guide: ${task.name}`,
		sections: [
			{
				id: `${taskId}-overview`,
				studyGuideId: `sg-${taskId}`,
				title: 'Overview',
				content: `# ${task.name}\n\n${task.description}\n\n## Domain\n${task.domain?.name || ''}\n\n## Enablers\n${
					task.enablers.length > 0 ? task.enablers.map((e) => `- ${e}`).join('\n') : 'See ECO reference'
				}`,
				orderIndex: 1
			}
		],
		relatedFlashcardIds: [],
		relatedQuestionIds: [],
		relatedFormulas: [],
		createdAt: new Date(),
		updatedAt: new Date()
	};
}

/**
 * Get study statistics
 */
export interface StudyStats {
	totalDomains: number;
	totalTasks: number;
	totalFlashcards: number;
	totalQuestions: number;
	domainBreakdown: DomainStudyStats[];
}

export interface DomainStudyStats {
	domainId: string;
	domainName: string;
	code: string;
	taskCount: number;
	weightPercentage: number;
}

export async function getStudyStats(): Promise<StudyStats> {
	const domains = await loadDomains();
	const [flashcardsData, testbank] = await Promise.all([
		loadFlashcardsMetadata(),
		loadTestbankMetadata()
	]);

	const totalFlashcards = flashcardsData.reduce(
		(sum, group) => sum + (group.flashcards?.length || 0),
		0
	);
	const totalQuestions = testbank?.totalQuestions || 0;

	const domainBreakdown: DomainStudyStats[] = domains.map((domain) => ({
		domainId: domain.id,
		domainName: domain.name,
		code: domain.code,
		taskCount: domain.tasks?.length || 0,
		weightPercentage: domain.weightPercentage
	}));

	return {
		totalDomains: domains.length,
		totalTasks: domains.reduce((sum, d) => sum + (d.tasks?.length || 0), 0),
		totalFlashcards,
		totalQuestions,
		domainBreakdown
	};
}

/**
 * Search tasks by keyword
 */
export async function searchTasks(query: string): Promise<Task[]> {
	const tasks = await loadTasks();
	const lowerQuery = query.toLowerCase();

	return tasks.filter(
		(task) =>
			task.name.toLowerCase().includes(lowerQuery) ||
			task.description.toLowerCase().includes(lowerQuery) ||
			task.code.toLowerCase().includes(lowerQuery)
	);
}

/**
 * Clear cached data
 */
export function clearCache(): void {
	cachedDomains = null;
	cachedDomainMap = null;
	cachedTasks = null;
}
