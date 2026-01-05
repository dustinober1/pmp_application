import { base } from '$app/paths';

export interface ModuleSection {
    id: string;
    title: string;
    description: string;
    path: string;
}

export interface StudyModule {
    id: string;
    title: string;
    description: string;
    sections: ModuleSection[];
}

// Hardcoded for now, could be dynamic later
const MODULES: StudyModule[] = [
    {
        id: '01-introduction',
        title: 'Module 1: Fundamentals & Exam Overview',
        description: 'Understand the "Rules of the Game"—the structure of the 2026 exam, the core mental models of modern project leadership, and how to navigate your study journey.',
        sections: [
            { id: 'index', title: 'Overview', description: 'Module Overview', path: 'index.md' },
            { id: 'understanding-exam', title: 'Understanding the Exam', description: 'Decode the 2026 Examination Content Outline (ECO)', path: 'understanding-exam.md' },
            { id: 'using-guide', title: 'How To Use This Guide', description: 'Tailor your study path to your background', path: 'using-guide.md' },
            { id: 'ways-of-working', title: 'Ways of Working', description: 'Master Predictive, Agile, and Hybrid delivery approaches', path: 'ways-of-working.md' },
            { id: 'pmbok8-principles', title: 'PMBOK 8th Edition Principles', description: 'Master the 6 new consolidated principles', path: 'pmbok8-principles.md' },
            { id: 'core-concepts', title: 'Core Concepts', description: 'The "Big 6" mental models', path: 'core-concepts.md' },
            { id: 'core-stakeholders', title: 'Core Concept: Stakeholders', description: 'Managing the people who can make or break your vision', path: 'core-stakeholders.md' },
            { id: 'core-triple-constraint', title: 'Core Concept: Triple Constraint', description: 'Balancing Scope, Schedule, and Cost', path: 'core-triple-constraint.md' },
            { id: 'core-quality', title: 'Core Concept: Quality', description: 'Ensuring Fit for Purpose and ESG standards', path: 'core-quality.md' },
            { id: 'core-risk', title: 'Core Concept: Risk', description: 'Identifying threats and spotting opportunities', path: 'core-risk.md' },
            { id: 'core-data', title: 'Core Concept: Data & AI', description: 'Using metrics and AI insights', path: 'core-data.md' },
            { id: 'core-ethics', title: 'Core Concept: Ethics', description: 'The PMI Code of Ethics', path: 'core-ethics.md' },
            { id: 'knowledge-check', title: 'Knowledge Check', description: 'Test your foundational knowledge', path: 'knowledge-check.md' }
        ]
    }
];

export async function getModules(): Promise<StudyModule[]> {
    return MODULES;
}

export async function getModule(moduleId: string): Promise<StudyModule | null> {
    return MODULES.find(m => m.id === moduleId) || null;
}

export async function getModuleContent(moduleId: string, sectionId: string): Promise<string | null> {
    const module = MODULES.find(m => m.id === moduleId);
    if (!module) return null;

    // Default to index.md if sectionId is empty or 'index'
    const filename = sectionId === 'index' || !sectionId ? 'index.md' : `${sectionId}.md`;
    
    // Verify the section exists in our definition (security/validity check)
    // allowing 'index' implicitly
    const sectionExists = filename === 'index.md' || module.sections.some(s => s.path === filename);
    if (!sectionExists) return null;

    try {
        const response = await fetch(`${base}/data/modules/${moduleId}/${filename}`);
        if (!response.ok) return null;
        return await response.text();
    } catch (error) {
        console.error(`Failed to load module content: ${moduleId}/${filename}`, error);
        return null;
    }
}
