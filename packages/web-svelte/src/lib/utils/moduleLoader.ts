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
    },
    {
        id: '02-strategic',
        title: 'Module 2: Strategic Business Management',
        description: 'Focus on the strategic aspects of project management, emphasizing how projects align with organizational goals and contribute to business value.',
        sections: [
            { id: 'index', title: 'Overview', description: 'Module Overview', path: 'index.md' },
            { id: 'strategy-alignment', title: 'Strategic Alignment', description: 'Aligning projects with organizational strategy', path: 'strategy-alignment.md' },
            { id: 'project-alignment', title: 'Project Alignment', description: 'Ensuring project goals match business needs', path: 'project-alignment.md' },
            { id: 'strategy-selection', title: 'Project Selection Strategy', description: 'Methods for selecting the right projects', path: 'strategy-selection.md' },
            { id: 'portfolio-concepts', title: 'Portfolio Concepts', description: 'Understanding portfolio management', path: 'portfolio-concepts.md' },
            { id: 'program-management', title: 'Program Management', description: 'Managing related projects as a program', path: 'program-management.md' },
            { id: 'pmo-role', title: 'The Role of the PMO', description: 'Functions and types of Project Management Offices', path: 'pmo-role.md' },
            { id: 'benefits-value', title: 'Benefits & Value', description: 'Delivering and measuring business value', path: 'benefits-value.md' },
            { id: 'benefits-realization', title: 'Benefits Realization', description: 'Ensuring benefits are sustained', path: 'benefits-realization.md' },
            { id: 'organizational-change', title: 'Organizational Change', description: 'Managing change within the organization', path: 'organizational-change.md' },
            { id: 'external-environment', title: 'External Environment', description: 'EEFs and their impact', path: 'external-environment.md' },
            { id: 'compliance-governance', title: 'Compliance & Governance', description: 'Adhering to legal and internal standards', path: 'compliance-governance.md' },
            { id: 'sustainability', title: 'Sustainability', description: 'Sustainable project management practices', path: 'sustainability.md' },
            { id: 'knowledge-check', title: 'Knowledge Check', description: 'Test your strategic knowledge', path: 'knowledge-check.md' }
        ]
    },
    {
        id: '03-team-leadership',
        title: 'Module 3: Team Leadership & Development',
        description: 'Master the art of leading diverse teams, resolving conflict, and fostering a high-performance culture.',
        sections: [
            { id: 'index', title: 'Overview', description: 'Module Overview', path: 'index.md' },
            { id: 'team-formation', title: 'Team Formation', description: 'Skills matrix, RACI, and assembling the team', path: 'team-formation.md' },
            { id: 'team-development', title: 'Team Development', description: 'Tuckman model and team growth', path: 'team-development.md' },
            { id: 'team-charter', title: 'Team Charter', description: 'Creating working agreements', path: 'team-charter.md' },
            { id: 'building-teams', title: 'Building Teams', description: 'Strategies for cohesive teams', path: 'building-teams.md' },
            { id: 'virtual-teams', title: 'Virtual Teams', description: 'Leading remote and hybrid teams', path: 'virtual-teams.md' },
            { id: 'coaching-mentoring', title: 'Coaching & Mentoring', description: 'Developing team members', path: 'coaching-mentoring.md' },
            { id: 'conflict-management', title: 'Conflict Management', description: 'Resolving disputes effectively', path: 'conflict-management.md' },
            { id: 'motivation-performance', title: 'Motivation & Performance', description: 'Driving high performance', path: 'motivation-performance.md' },
            { id: 'knowledge-check', title: 'Knowledge Check', description: 'Test your leadership knowledge', path: 'knowledge-check.md' }
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
