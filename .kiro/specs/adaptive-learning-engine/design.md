# Design Document: PMP Study Enhancement Suite

## Overview

This design document describes the architecture and implementation approach for a comprehensive PMP study enhancement suite. The system introduces six major feature areas that work together to create an intelligent, personalized learning platform.

The design follows a layered architecture where the Adaptive Learning Engine serves as the foundational intelligence layer, with other features building upon its capabilities.

### Key Design Principles

1. **Intelligence-First**: The Adaptive Engine powers personalization across all features
2. **Incremental Enhancement**: New features integrate with existing codebase without breaking changes
3. **Performance-Conscious**: Heavy computations are cached and updated asynchronously
4. **API-Driven**: All features expose clean APIs for future extensibility

## Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        Dashboard[Dashboard Page]
        Practice[Practice Page]
        Simulator[Exam Simulator]
        StudyPlan[Study Plan Page]
        Discussions[Discussion Forums]
    end

    subgraph "API Layer"
        AdaptiveAPI[/api/adaptive]
        SimulatorAPI[/api/simulator]
        PlanAPI[/api/study-plans]
        AnnotationAPI[/api/annotations]
        DiscussionAPI[/api/discussions]
    end

    subgraph "Service Layer"
        AdaptiveEngine[Adaptive Engine Service]
        PerformanceAnalyzer[Performance Analyzer]
        QuestionSelector[Question Selector]
        InsightGenerator[Insight Generator]
        SimulatorService[Simulator Service]
        PlanService[Study Plan Service]
        DiscussionService[Discussion Service]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    Dashboard --> AdaptiveAPI
    Practice --> AdaptiveAPI
    Simulator --> SimulatorAPI
    StudyPlan --> PlanAPI
    Discussions --> DiscussionAPI

    AdaptiveAPI --> AdaptiveEngine
    AdaptiveEngine --> PerformanceAnalyzer
    AdaptiveEngine --> QuestionSelector
    AdaptiveEngine --> InsightGenerator
    
    SimulatorAPI --> SimulatorService
    SimulatorService --> AdaptiveEngine
    
    PlanAPI --> PlanService
    PlanService --> AdaptiveEngine

    DiscussionAPI --> DiscussionService

    AdaptiveEngine --> PostgreSQL
    AdaptiveEngine --> Redis
    SimulatorService --> PostgreSQL
    PlanService --> PostgreSQL
    DiscussionService --> PostgreSQL
```

## Components and Interfaces

### 1. Adaptive Learning Engine

The core intelligence service that analyzes user performance and generates personalized recommendations.

#### Performance Analyzer

```typescript
interface PerformanceAnalyzer {
  recordAnswer(userId: string, answer: AnswerRecord): Promise<void>;
  getPerformanceStats(userId: string): Promise<PerformanceStats>;
  getPerformanceTrend(userId: string, days: number): Promise<TrendData[]>;
}

interface AnswerRecord {
  questionId: string;
  domainId: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  methodology: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  answeredAt: Date;
}

interface PerformanceStats {
  totalAnswered: number;
  correctAnswers: number;
  accuracyRate: number;
  averageTimePerQuestion: number;
  domainBreakdown: DomainStats[];
  difficultyBreakdown: DifficultyStats[];
}
```

#### Mastery Calculator

```typescript
interface MasteryCalculator {
  calculateDomainMastery(userId: string, domainId: string): Promise<MasteryLevel>;
  getAllMasteryLevels(userId: string): Promise<MasteryLevel[]>;
  applyDecay(userId: string): Promise<void>;
}

interface MasteryLevel {
  domainId: string;
  domainName: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  lastActivityAt: Date;
  questionCount: number;
  accuracyRate: number;
  consistencyScore: number;
  difficultyScore: number;
}

// Mastery calculation formula:
// score = (accuracyRate * 0.6) + (consistencyScore * 0.2) + (difficultyScore * 0.2)
```

#### Knowledge Gap Identifier

```typescript
interface KnowledgeGapIdentifier {
  identifyGaps(userId: string): Promise<KnowledgeGap[]>;
  getPrioritizedGaps(userId: string, limit: number): Promise<KnowledgeGap[]>;
}

interface KnowledgeGap {
  domainId: string;
  domainName: string;
  currentMastery: number;
  targetThreshold: number;
  severity: 'critical' | 'moderate' | 'minor';
  gapType: 'never_learned' | 'forgotten';
  examWeight: number;
  recommendation: string;
  priorityScore: number;
}
```

#### Question Selector

```typescript
interface QuestionSelector {
  selectQuestions(params: SelectionParams): Promise<SelectedQuestion[]>;
}

interface SelectionParams {
  userId: string;
  count: number;
  domainFilter?: string;
  difficultyRange?: { min: string; max: string };
  excludeRecentDays?: number;
}

// Selection distribution:
// - 60% from knowledge gap areas
// - 25% maintenance (mastered areas)
// - 15% stretch (slightly above current ability)
```

#### Insight Generator

```typescript
interface InsightGenerator {
  generateDailyInsights(userId: string): Promise<Insight[]>;
  getRecentInsights(userId: string, limit: number): Promise<Insight[]>;
}

interface Insight {
  id: string;
  type: 'improvement' | 'alert' | 'milestone' | 'recommendation' | 'pattern';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  createdAt: Date;
  isRead: boolean;
}
```

### 2. Exam Simulator Service

```typescript
interface ExamSimulatorService {
  startExam(userId: string): Promise<ExamSession>;
  submitAnswer(sessionId: string, answer: ExamAnswer): Promise<void>;
  takeBreak(sessionId: string): Promise<void>;
  completeExam(sessionId: string): Promise<ExamResult>;
  getExamReview(sessionId: string): Promise<ExamReview>;
}

interface ExamSession {
  id: string;
  userId: string;
  questions: ExamQuestion[];
  timeLimitMinutes: number;
  startedAt: Date;
  breakTakenAt?: Date;
  status: 'in_progress' | 'on_break' | 'completed' | 'timed_out';
}

interface ExamResult {
  sessionId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  domainScores: DomainScore[];
  timeAnalytics: TimeAnalytics;
  predictedRealScore: number;
}
```

### 3. Study Plan Service

```typescript
interface StudyPlanService {
  createPlan(params: CreatePlanParams): Promise<StudyPlan>;
  getActivePlan(userId: string): Promise<StudyPlan | null>;
  completeTask(planId: string, taskId: string): Promise<void>;
  recalculatePlan(planId: string): Promise<StudyPlan>;
}

interface CreatePlanParams {
  userId: string;
  targetExamDate: Date;
  hoursPerDay: number;
  preferredStudyTimes?: string[];
}

interface StudyPlan {
  id: string;
  userId: string;
  targetExamDate: Date;
  createdAt: Date;
  status: 'active' | 'completed' | 'abandoned';
  progressStatus: 'on_track' | 'ahead' | 'behind';
  tasks: StudyTask[];
  milestones: Milestone[];
}
```

### 4. Annotation Service

```typescript
interface AnnotationService {
  upsertAnnotation(params: UpsertAnnotationParams): Promise<Annotation>;
  getAnnotation(userId: string, questionId: string): Promise<Annotation | null>;
  getUserAnnotations(userId: string, filters?: AnnotationFilters): Promise<Annotation[]>;
  toggleBookmark(userId: string, questionId: string, category?: string): Promise<void>;
  getBookmarks(userId: string, category?: string): Promise<Bookmark[]>;
}

interface Annotation {
  id: string;
  userId: string;
  questionId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Bookmark {
  id: string;
  userId: string;
  questionId: string;
  category: string;
  createdAt: Date;
}
```

### 5. Discussion Service

```typescript
interface DiscussionService {
  createComment(params: CreateCommentParams): Promise<Comment>;
  getComments(questionId: string, sortBy: SortOption): Promise<Comment[]>;
  upvoteComment(userId: string, commentId: string): Promise<void>;
  reportComment(userId: string, commentId: string, reason: string): Promise<void>;
  markExpertVerified(commentId: string): Promise<void>;
}

interface Comment {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  content: string;
  parentId?: string;
  upvotes: number;
  isExpertVerified: boolean;
  isPmpCertified: boolean;
  createdAt: Date;
  replies?: Comment[];
}

type SortOption = 'most_helpful' | 'newest' | 'oldest';
```

## Data Models

### New Database Tables

```prisma
// Adaptive Learning Models
model LearningProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  lastCalculatedAt  DateTime @default(now())
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  domainMasteries   DomainMastery[]
  insights          Insight[]
  
  @@map("learning_profiles")
}

model DomainMastery {
  id                String   @id @default(uuid())
  profileId         String
  domainId          String
  score             Float    @default(50)
  trend             String   @default("stable")
  accuracyRate      Float    @default(0)
  consistencyScore  Float    @default(0)
  difficultyScore   Float    @default(0)
  questionCount     Int      @default(0)
  lastActivityAt    DateTime @default(now())
  peakScore         Float    @default(50)
  profile           LearningProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  domain            Domain   @relation(fields: [domainId], references: [id])
  
  @@unique([profileId, domainId])
  @@map("domain_masteries")
}

model Insight {
  id          String   @id @default(uuid())
  profileId   String
  type        String
  title       String
  message     String
  priority    String   @default("medium")
  actionUrl   String?
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  profile     LearningProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  @@index([profileId, createdAt])
  @@map("insights")
}

// Exam Simulator Models
model ExamSession {
  id               String    @id @default(uuid())
  userId           String
  startedAt        DateTime  @default(now())
  completedAt      DateTime?
  breakTakenAt     DateTime?
  status           String    @default("in_progress")
  score            Int?
  passed           Boolean?
  totalTimeSeconds Int?
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers          ExamAnswer[]
  
  @@index([userId, status])
  @@map("exam_sessions")
}

model ExamAnswer {
  id                  String      @id @default(uuid())
  sessionId           String
  questionId          String
  selectedAnswerIndex Int
  isCorrect           Boolean
  timeSpentSeconds    Int
  answeredAt          DateTime    @default(now())
  session             ExamSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question            Question    @relation(fields: [questionId], references: [id])
  
  @@unique([sessionId, questionId])
  @@map("exam_answers")
}

// Study Plan Models
model StudyPlan {
  id              String   @id @default(uuid())
  userId          String
  targetExamDate  DateTime
  hoursPerDay     Float
  status          String   @default("active")
  progressStatus  String   @default("on_track")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks           StudyTask[]
  
  @@index([userId, status])
  @@map("study_plans")
}

model StudyTask {
  id               String    @id @default(uuid())
  planId           String
  date             DateTime
  type             String
  description      String
  estimatedMinutes Int
  domainFocus      String?
  isCompleted      Boolean   @default(false)
  completedAt      DateTime?
  plan             StudyPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  
  @@index([planId, date])
  @@map("study_tasks")
}

// Annotation Models
model Annotation {
  id          String   @id @default(uuid())
  userId      String
  questionId  String
  content     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, questionId])
  @@map("annotations")
}

model Bookmark {
  id          String   @id @default(uuid())
  userId      String
  questionId  String
  category    String   @default("review_later")
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, questionId])
  @@index([userId, category])
  @@map("bookmarks")
}

// Discussion Models
model DiscussionComment {
  id               String    @id @default(uuid())
  questionId       String
  userId           String
  content          String
  parentId         String?
  upvotes          Int       @default(0)
  isExpertVerified Boolean   @default(false)
  isHidden         Boolean   @default(false)
  reportCount      Int       @default(0)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  question         Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent           DiscussionComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies          DiscussionComment[] @relation("CommentReplies")
  votes            CommentVote[]
  reports          CommentReport[]
  
  @@index([questionId, createdAt])
  @@index([questionId, upvotes])
  @@map("discussion_comments")
}

model CommentVote {
  id        String   @id @default(uuid())
  commentId String
  userId    String
  createdAt DateTime @default(now())
  comment   DiscussionComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([commentId, userId])
  @@map("comment_votes")
}

model CommentReport {
  id        String   @id @default(uuid())
  commentId String
  userId    String
  reason    String
  createdAt DateTime @default(now())
  comment   DiscussionComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([commentId, userId])
  @@map("comment_reports")
}

// Question Enhancement
model QuestionExplanation {
  id              String   @id @default(uuid())
  questionId      String   @unique
  choiceIndex     Int
  explanation     String
  misconception   String?
  pmbokReference  String?
  question        Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@map("question_explanations")
}

// User Enhancement
model UserCertification {
  id           String    @id @default(uuid())
  userId       String    @unique
  isPmpCertified Boolean @default(false)
  verifiedAt   DateTime?
  certificateId String?
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_certifications")
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The following 26 properties will be validated using property-based testing with the fast-check library, running a minimum of 100 iterations per property.

### Adaptive Learning Engine Properties

**Property 1: Mastery Level Bounds and Calculation**
*For any* user performance data, the calculated mastery level SHALL always be between 0 and 100, and SHALL equal `(accuracyRate * 0.6) + (consistencyScore * 0.2) + (difficultyScore * 0.2)`.
**Validates: Requirements 2.1, 2.2**

**Property 2: Mastery Decay with Floor**
*For any* mastery level and inactivity period greater than 7 days, the decayed mastery SHALL be reduced by 5% per week of inactivity, but SHALL never fall below 50% of the peak mastery score.
**Validates: Requirements 2.3**

**Property 3: Trend Direction Calculation**
*For any* sequence of mastery scores over time, the trend direction SHALL be correctly determined (improving/stable/declining).
**Validates: Requirements 2.5**

**Property 4: Knowledge Gap Identification Threshold**
*For any* domain mastery level, a knowledge gap SHALL be identified if and only if the mastery level is below 70%.
**Validates: Requirements 3.1**

**Property 5: Knowledge Gap Severity Ranking**
*For any* set of knowledge gaps, they SHALL be sorted by priority score in descending order.
**Validates: Requirements 3.2**

**Property 6: Gap Type Classification**
*For any* domain with a knowledge gap, the gap type SHALL be correctly classified as "never_learned" or "forgotten".
**Validates: Requirements 3.4**

**Property 7: Question Selection Distribution**
*For any* adaptive question selection, approximately 60% SHALL be from gaps, 25% maintenance, 15% stretch (±5%).
**Validates: Requirements 4.1, 4.2, 4.3**

**Property 8: Recent Question Exclusion**
*For any* question selection, questions answered correctly within 7 days SHALL NOT be included unless exhausted.
**Validates: Requirements 4.4**

**Property 9: Difficulty Adjustment on Consecutive Incorrect**
*For any* sequence of 3+ consecutive incorrect answers, the next question SHALL have lower difficulty.
**Validates: Requirements 4.5**

**Property 10: Difficulty Adjustment on Consecutive Correct**
*For any* sequence of 5+ consecutive correct answers, the next question SHALL have higher difficulty.
**Validates: Requirements 4.6**

**Property 11: Accuracy Drop Alert Generation**
*For any* user whose domain accuracy drops >10% over 7 days, an alert insight SHALL be generated.
**Validates: Requirements 5.2**

**Property 12: Default Learning Profile Creation**
*For any* user without a profile, requesting their profile SHALL create one with 50% mastery.
**Validates: Requirements 6.5**

### Exam Simulator Properties

**Property 13: Exam Configuration Invariants**
*For any* exam session, it SHALL contain exactly 180 questions with 230-minute limit and correct domain distribution.
**Validates: Requirements 8.1, 8.2**

**Property 14: Exam No-Pause Enforcement**
*For any* exam in progress, attempting to pause SHALL be rejected.
**Validates: Requirements 8.3**

**Property 15: Timeout Handling**
*For any* exam that times out, unanswered questions SHALL be marked incorrect.
**Validates: Requirements 8.7**

**Property 16: Pass/Fail Determination**
*For any* completed exam, pass/fail SHALL be determined correctly (≥60% = pass).
**Validates: Requirements 9.1**

### Study Plan Properties

**Property 17: Study Plan Task Distribution**
*For any* study plan, generated tasks SHALL include all types: flashcards, practice, exam_simulation, review.
**Validates: Requirements 12.3**

**Property 18: Practice Exam Milestone Scheduling**
*For any* study plan, exams SHALL be scheduled at 75%, 90%, and 100% of timeline.
**Validates: Requirements 12.4**

**Property 19: Short Timeline Warning**
*For any* plan with target date <14 days away, a warning SHALL be returned.
**Validates: Requirements 12.5**

### Annotation and Bookmark Properties

**Property 20: Annotation Round-Trip**
*For any* annotation, creating and retrieving it SHALL return the same content.
**Validates: Requirements 14.1, 14.4**

**Property 21: Bookmark Round-Trip**
*For any* bookmark, creating it SHALL make it appear in the user's bookmark list.
**Validates: Requirements 15.1, 15.2**

### Discussion Forum Properties

**Property 22: Comment Sorting - Most Helpful**
*For any* comments sorted by "most_helpful", they SHALL be ordered by upvotes descending with expert answers first.
**Validates: Requirements 16.5, 18.4**

**Property 23: Comment Auto-Hide on Reports**
*For any* comment with 3+ reports, isHidden SHALL be true.
**Validates: Requirements 17.2**

**Property 24: Comment Rate Limiting**
*For any* user posting >10 comments in 1 hour, subsequent attempts SHALL be rejected.
**Validates: Requirements 17.4**

**Property 25: Answer History Rolling Window**
*For any* user with >500 answers, only the most recent 500 SHALL be retained.
**Validates: Requirements 1.3**

**Property 26: Performance Stats Calculation**
*For any* set of answers, accuracy and average time SHALL be calculated correctly.
**Validates: Requirements 1.2**

## Testing Strategy

### Unit Testing
Unit tests will verify individual components in isolation using Jest.

### Property-Based Testing
Property-based tests will verify universal properties across all inputs using fast-check library with minimum 100 iterations per property.

### Integration Testing
Integration tests will verify API endpoint behavior, database operations, and cross-service interactions.
