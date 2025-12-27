import type { Question, Domain, PracticeTest } from '../types';

// Define domains
const domains: Domain[] = [
  { id: 'people', name: 'People', description: 'Leadership and team management', color: '#3B82F6' },
  { id: 'process', name: 'Process', description: 'Project lifecycle and methodologies', color: '#10B981' },
  { id: 'business', name: 'Business Environment', description: 'Business analysis and strategy', color: '#F59E0B' },
];

// Load data from public/data directory
let allQuestions: Question[] = [];
let dataLoaded = false;

const loadData = async () => {
  if (dataLoaded) return;

  try {
    const [businessResponse, peopleResponse, processResponse] = await Promise.all([
      fetch('/data/pmp_2026_business_bank.json'),
      fetch('/data/pmp_2026_people_bank.json'),
      fetch('/data/pmp_2026_process_bank.json'),
    ]);

    const businessBank = await businessResponse.json();
    const peopleBank = await peopleResponse.json();
    const processBank = await processResponse.json();

    allQuestions = [
      ...businessBank.questions.map((q: any) => ({ ...q, domainId: 'business' } as Question)),
      ...peopleBank.questions.map((q: any) => ({ ...q, domainId: 'people' } as Question)),
      ...processBank.questions.map((q: any) => ({ ...q, domainId: 'process' } as Question)),
    ];

    dataLoaded = true;
  } catch (error) {
    console.error('Failed to load question data:', error);
    allQuestions = [];
  }
};

// Static practice tests
const practiceTests: PracticeTest[] = [
  {
    id: 'full-length',
    name: 'Full Length PMP Practice Test',
    description: '180 questions covering all PMP domains',
    totalQuestions: 180,
    timeLimitMinutes: 230,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'people-domain',
    name: 'People Domain Practice Test',
    description: 'Focus on People domain knowledge',
    totalQuestions: 60,
    timeLimitMinutes: 90,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'process-domain',
    name: 'Process Domain Practice Test',
    description: 'Focus on Process domain knowledge',
    totalQuestions: 60,
    timeLimitMinutes: 90,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'business-domain',
    name: 'Business Environment Domain Practice Test',
    description: 'Focus on Business Environment domain knowledge',
    totalQuestions: 60,
    timeLimitMinutes: 90,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const staticQuestionService = {
  // Get all questions
  getQuestions: async (): Promise<Question[]> => {
    await loadData();
    return allQuestions;
  },

  // Get questions by domain
  getQuestionsByDomain: async (domainId: string): Promise<Question[]> => {
    await loadData();
    return allQuestions.filter(q => q.domainId === domainId);
  },

  // Get question by ID
  getQuestionById: async (id: string): Promise<Question | null> => {
    await loadData();
    return allQuestions.find(q => q.id === id) || null;
  },

  // Get all domains
  getDomains: (): Domain[] => {
    return domains;
  },

  // Get domain by ID
  getDomainById: (id: string): Domain | null => {
    return domains.find(d => d.id === id) || null;
  },

  // Get all practice tests
  getPracticeTests: (): PracticeTest[] => {
    return practiceTests;
  },

  // Get practice test by ID
  getPracticeTestById: (id: string): PracticeTest | null => {
    return practiceTests.find(t => t.id === id) || null;
  },

  // Get questions for a specific test
  getTestQuestions: async (testId: string): Promise<Question[]> => {
    await loadData();
    let questions: Question[] = [];

    switch (testId) {
      case 'full-length':
        // Select 180 questions proportionally from each domain
        const perDomain = Math.floor(180 / 3);
        domains.forEach(domain => {
          const domainQuestions = allQuestions.filter(q => q.domainId === domain.id);
          questions.push(...domainQuestions.slice(0, perDomain));
        });
        break;

      case 'people-domain':
        questions = allQuestions.filter(q => q.domainId === 'people').slice(0, 60);
        break;

      case 'process-domain':
        questions = allQuestions.filter(q => q.domainId === 'process').slice(0, 60);
        break;

      case 'business-domain':
        questions = allQuestions.filter(q => q.domainId === 'business').slice(0, 60);
        break;

      default:
        questions = allQuestions.slice(0, 60);
    }

    // Shuffle questions
    return questions.sort(() => Math.random() - 0.5);
  },
};