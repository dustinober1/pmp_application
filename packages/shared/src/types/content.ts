/**
 * Content types: Domains, Tasks, Study Guides
 */

export interface Domain {
  id: string;
  name: string;
  code: string; // e.g., "PEOPLE", "PROCESS", "BUSINESS"
  description: string;
  weightPercentage: number;
  orderIndex: number;
  tasks?: Task[];
}

export interface Task {
  id: string;
  domainId: string;
  code: string; // e.g., "1.1", "2.3"
  name: string;
  description: string;
  enablers: string[];
  orderIndex: number;
  domain?: Domain;
}

export interface StudyGuide {
  id: string;
  taskId: string;
  title: string;
  sections: StudySection[];
  relatedFormulas: string[]; // Formula IDs
  relatedFlashcardIds: string[];
  relatedQuestionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySection {
  id: string;
  studyGuideId: string;
  title: string;
  content: string; // Markdown content
  orderIndex: number;
}

export interface StudyProgress {
  id: string;
  userId: string;
  sectionId: string;
  completed: boolean;
  completedAt: Date | null;
}

export interface SearchResult {
  type: "study_guide" | "flashcard" | "question" | "formula";
  id: string;
  title: string;
  excerpt: string;
  domainId: string;
  taskId: string;
}

export interface UserStudyProgress {
  userId: string;
  totalSections: number;
  completedSections: number;
  overallProgress: number;
  domainProgress: DomainProgress[];
}

export interface DomainProgress {
  domainId: string;
  domainName: string;
  totalSections: number;
  completedSections: number;
  progress: number;
}
