import api from './api';

export interface MasteryDomain {
  domainId: string;
  domainName: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  accuracyRate: number;
  consistencyScore: number;
  difficultyScore: number;
  questionCount: number;
  lastActivityAt: string;
  domain?: {
    id: string;
    name: string;
    color?: string;
  } | null;
}

export interface KnowledgeGap {
  domainId: string;
  domainName: string;
  currentMastery: number;
  targetThreshold: number;
  severity: string;
  gapType: string;
  recommendation: string;
  priorityScore: number;
}

export interface Insight {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface LearningProfile {
  id: string;
  userId: string;
  lastCalculatedAt: string;
  domainMasteries: MasteryDomain[];
  knowledgeGaps: KnowledgeGap[];
  recentInsights: Insight[];
}

export const adaptiveService = {
  getLearningProfile: async (): Promise<LearningProfile> => {
    const res = await api.get<LearningProfile>('/adaptive/profile');
    return res.data;
  },
};

export default adaptiveService;
