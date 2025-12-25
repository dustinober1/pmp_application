# Implementation Plan: PMP Study Enhancement Suite

## Overview

This implementation plan breaks down the comprehensive PMP study enhancement suite into manageable tasks. The work is organized into phases, with the Adaptive Learning Engine built first as the foundation for other features.

**Technology Stack:**
- Backend: TypeScript, Express, Prisma, PostgreSQL, Redis
- Frontend: React, TypeScript, TanStack Query
- Testing: Jest, fast-check (property-based testing)

## Tasks

### Phase 1: Database Schema and Foundation

- [ ] 1. Create database migrations for new models
  - [ ] 1.1 Add LearningProfile and DomainMastery models to Prisma schema
    - Create learning_profiles table with userId foreign key
    - Create domain_masteries table with composite index on profileId, domainId
    - _Requirements: 2.1, 2.2_

  - [ ] 1.2 Add Insight model to Prisma schema
    - Create insights table with profileId foreign key
    - Add index on profileId and createdAt for efficient queries
    - _Requirements: 5.1_

  - [ ] 1.3 Add ExamSession and ExamAnswer models to Prisma schema
    - Create exam_sessions table with status tracking
    - Create exam_answers table with unique constraint on sessionId, questionId
    - _Requirements: 8.1, 9.1_

  - [ ] 1.4 Add StudyPlan and StudyTask models to Prisma schema
    - Create study_plans table with status and progress tracking
    - Create study_tasks table with date-based indexing
    - _Requirements: 12.1, 13.1_

  - [ ] 1.5 Add Annotation and Bookmark models to Prisma schema
    - Create annotations table with unique constraint on userId, questionId
    - Create bookmarks table with category support
    - _Requirements: 14.1, 15.1_

  - [ ] 1.6 Add Discussion models to Prisma schema
    - Create discussion_comments table with threading support (parentId)
    - Create comment_votes and comment_reports tables
    - Add indexes for sorting by upvotes and createdAt
    - _Requirements: 16.1, 17.1_

  - [ ] 1.7 Add QuestionExplanation model for deep-dive explanations
    - Create question_explanations table linked to questions
    - Store explanation per answer choice index
    - _Requirements: 10.1_

  - [ ] 1.8 Add UserCertification model for PMP verification
    - Create user_certifications table with verification status
    - _Requirements: 18.1_

  - [ ] 1.9 Run migrations and update Prisma client
    - Execute `npx prisma migrate dev`
    - Regenerate Prisma client
    - _Requirements: All_

- [ ] 2. Checkpoint - Database schema complete
  - Ensure all migrations run successfully
  - Verify all models are accessible via Prisma client
  - Ask the user if questions arise

---

### Phase 2: Adaptive Learning Engine Core

- [ ] 3. Implement Performance Analyzer service
  - [ ] 3.1 Create PerformanceAnalyzer class with recordAnswer method
    - Record question domain, difficulty, methodology, time spent, correctness
    - Update user's answer history (maintain rolling 500 limit)
    - _Requirements: 1.1, 1.3_

  - [ ] 3.2 Write property test for answer history rolling window
    - **Property 25: Answer History Rolling Window**
    - **Validates: Requirements 1.3**

  - [ ] 3.3 Implement getPerformanceStats method
    - Calculate accuracy rate, average time, domain breakdown
    - _Requirements: 1.2_

  - [ ] 3.4 Write property test for performance stats calculation
    - **Property 26: Performance Stats Calculation**
    - **Validates: Requirements 1.2**

- [ ] 4. Implement Mastery Calculator service
  - [ ] 4.1 Create MasteryCalculator class with calculateDomainMastery method
    - Implement weighted formula: (accuracy * 0.6) + (consistency * 0.2) + (difficulty * 0.2)
    - Ensure output is bounded 0-100
    - _Requirements: 2.1, 2.2_

  - [ ] 4.2 Write property test for mastery calculation bounds and formula
    - **Property 1: Mastery Level Bounds and Calculation**
    - **Validates: Requirements 2.1, 2.2**

  - [ ] 4.3 Implement applyDecay method for inactive domains
    - Apply 5% decay per week of inactivity
    - Enforce floor at 50% of peak mastery
    - _Requirements: 2.3_

  - [ ] 4.4 Write property test for mastery decay with floor
    - **Property 2: Mastery Decay with Floor**
    - **Validates: Requirements 2.3**

  - [ ] 4.5 Implement trend direction calculation
    - Compare recent vs older average scores
    - Return improving/stable/declining
    - _Requirements: 2.5_

  - [ ] 4.6 Write property test for trend direction calculation
    - **Property 3: Trend Direction Calculation**
    - **Validates: Requirements 2.5**

- [ ] 5. Implement Knowledge Gap Identifier service
  - [ ] 5.1 Create KnowledgeGapIdentifier class with identifyGaps method
    - Identify gaps when mastery < 70% threshold
    - _Requirements: 3.1_

  - [ ] 5.2 Write property test for knowledge gap threshold
    - **Property 4: Knowledge Gap Identification Threshold**
    - **Validates: Requirements 3.1**

  - [ ] 5.3 Implement getPrioritizedGaps with severity ranking
    - Calculate priority score: (threshold - mastery) * examWeight
    - Sort by priority score descending
    - _Requirements: 3.2_

  - [ ] 5.4 Write property test for gap severity ranking
    - **Property 5: Knowledge Gap Severity Ranking**
    - **Validates: Requirements 3.2**

  - [ ] 5.5 Implement gap type classification (never_learned vs forgotten)
    - Check question count and trend direction
    - _Requirements: 3.4_

  - [ ] 5.6 Write property test for gap type classification
    - **Property 6: Gap Type Classification**
    - **Validates: Requirements 3.4**

- [ ] 6. Checkpoint - Core adaptive services complete
  - Ensure all tests pass
  - Ask the user if questions arise

---

### Phase 3: Question Selection and Insights

- [ ] 7. Implement Question Selector service
  - [ ] 7.1 Create QuestionSelector class with selectQuestions method
    - Implement 60/25/15 distribution (gap/maintenance/stretch)
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 7.2 Write property test for question selection distribution
    - **Property 7: Question Selection Distribution**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ] 7.3 Implement recent question exclusion logic
    - Exclude questions answered correctly in last 7 days
    - _Requirements: 4.4_

  - [ ] 7.4 Write property test for recent question exclusion
    - **Property 8: Recent Question Exclusion**
    - **Validates: Requirements 4.4**

  - [ ] 7.5 Implement Difficulty Adjuster for consecutive incorrect
    - Reduce difficulty after 3 consecutive incorrect
    - _Requirements: 4.5_

  - [ ] 7.6 Write property test for difficulty adjustment on incorrect
    - **Property 9: Difficulty Adjustment on Consecutive Incorrect**
    - **Validates: Requirements 4.5**

  - [ ] 7.7 Implement Difficulty Adjuster for consecutive correct
    - Increase difficulty after 5 consecutive correct
    - _Requirements: 4.6_

  - [ ] 7.8 Write property test for difficulty adjustment on correct
    - **Property 10: Difficulty Adjustment on Consecutive Correct**
    - **Validates: Requirements 4.6**

- [ ] 8. Implement Insight Generator service
  - [ ] 8.1 Create InsightGenerator class with generateDailyInsights method
    - Generate performance trend summaries
    - _Requirements: 5.1_

  - [ ] 8.2 Implement accuracy drop alert detection
    - Detect >10% accuracy drop over 7 days
    - Generate alert insight
    - _Requirements: 5.2_

  - [ ] 8.3 Write property test for accuracy drop alert generation
    - **Property 11: Accuracy Drop Alert Generation**
    - **Validates: Requirements 5.2**

  - [ ] 8.4 Implement milestone recognition
    - Detect improvement milestones and generate celebration insights
    - _Requirements: 5.4_

- [ ] 9. Checkpoint - Question selection and insights complete
  - Ensure all tests pass
  - Ask the user if questions arise

---

### Phase 4: Adaptive Learning API

- [ ] 10. Create Adaptive Learning API routes
  - [ ] 10.1 Create GET /api/adaptive/profile endpoint
    - Return user's complete learning profile
    - Create default profile if not exists (mastery = 50%)
    - _Requirements: 6.1, 6.5_

  - [ ] 10.2 Write property test for default profile creation
    - **Property 12: Default Learning Profile Creation**
    - **Validates: Requirements 6.5**

  - [ ] 10.3 Create GET /api/adaptive/questions endpoint
    - Accept count, domain filter, difficulty range parameters
    - Return recommended questions from Question Selector
    - _Requirements: 6.2_

  - [ ] 10.4 Create GET /api/adaptive/gaps endpoint
    - Return prioritized knowledge gaps
    - _Requirements: 6.3_

  - [ ] 10.5 Create GET /api/adaptive/insights endpoint
    - Return recent insights for user
    - _Requirements: 6.4_

  - [ ] 10.6 Add Zod validation schemas for all endpoints
    - Validate request parameters
    - _Requirements: All_

- [ ] 11. Checkpoint - Adaptive API complete
  - Test all endpoints manually
  - Ensure all tests pass
  - Ask the user if questions arise

---

### Phase 5: Exam Simulator

- [ ] 12. Implement Exam Simulator service
  - [ ] 12.1 Create ExamSimulatorService class with startExam method
    - Generate 180 questions with PMI domain weights (42/50/8)
    - Set 230-minute time limit
    - _Requirements: 8.1, 8.2_

  - [ ] 12.2 Write property test for exam configuration invariants
    - **Property 13: Exam Configuration Invariants**
    - **Validates: Requirements 8.1, 8.2**

  - [ ] 12.3 Implement submitAnswer method
    - Record answer with time spent
    - Prevent pausing during exam
    - _Requirements: 8.3_

  - [ ] 12.4 Write property test for no-pause enforcement
    - **Property 14: Exam No-Pause Enforcement**
    - **Validates: Requirements 8.3**

  - [ ] 12.5 Implement completeExam method with timeout handling
    - Mark unanswered questions as incorrect on timeout
    - Calculate final score
    - _Requirements: 8.7_

  - [ ] 12.6 Write property test for timeout handling
    - **Property 15: Timeout Handling**
    - **Validates: Requirements 8.7**

  - [ ] 12.7 Implement pass/fail determination
    - Pass threshold: 60%
    - _Requirements: 9.1_

  - [ ] 12.8 Write property test for pass/fail determination
    - **Property 16: Pass/Fail Determination**
    - **Validates: Requirements 9.1**

  - [ ] 12.9 Implement getExamReview method
    - Return domain breakdown, time analytics, slow questions
    - _Requirements: 9.2, 9.3, 9.4_

- [ ] 13. Create Exam Simulator API routes
  - [ ] 13.1 Create POST /api/simulator/start endpoint
    - Start new exam session
    - _Requirements: 8.1_

  - [ ] 13.2 Create POST /api/simulator/:sessionId/answer endpoint
    - Submit answer during exam
    - _Requirements: 8.3_

  - [ ] 13.3 Create POST /api/simulator/:sessionId/break endpoint
    - Take optional break at midpoint
    - _Requirements: 8.4_

  - [ ] 13.4 Create PUT /api/simulator/:sessionId/complete endpoint
    - Complete exam and get results
    - _Requirements: 9.1_

  - [ ] 13.5 Create GET /api/simulator/:sessionId/review endpoint
    - Get detailed exam review
    - _Requirements: 9.2_

- [ ] 14. Checkpoint - Exam Simulator complete
  - Ensure all tests pass
  - Ask the user if questions arise

---

### Phase 6: Study Plans

- [ ] 15. Implement Study Plan service
  - [ ] 15.1 Create StudyPlanService class with createPlan method
    - Accept target date and hours per day
    - Generate task schedule prioritizing knowledge gaps
    - _Requirements: 12.1, 12.2_

  - [ ] 15.2 Implement task type distribution
    - Include flashcards, practice, exam_simulation, review tasks
    - _Requirements: 12.3_

  - [ ] 15.3 Write property test for task type distribution
    - **Property 17: Study Plan Task Distribution**
    - **Validates: Requirements 12.3**

  - [ ] 15.4 Implement practice exam milestone scheduling
    - Schedule exams at 75%, 90%, 100% of timeline
    - _Requirements: 12.4_

  - [ ] 15.5 Write property test for milestone scheduling
    - **Property 18: Practice Exam Milestone Scheduling**
    - **Validates: Requirements 12.4**

  - [ ] 15.6 Implement short timeline warning
    - Warn if target date < 14 days away
    - _Requirements: 12.5_

  - [ ] 15.7 Write property test for short timeline warning
    - **Property 19: Short Timeline Warning**
    - **Validates: Requirements 12.5**

  - [ ] 15.8 Implement completeTask and recalculatePlan methods
    - Update progress status (on_track/ahead/behind)
    - _Requirements: 13.1, 13.2, 13.3_

- [ ] 16. Create Study Plan API routes
  - [ ] 16.1 Create POST /api/study-plans endpoint
    - Create new study plan
    - _Requirements: 12.1_

  - [ ] 16.2 Create GET /api/study-plans/active endpoint
    - Get user's active study plan
    - _Requirements: 13.1_

  - [ ] 16.3 Create PUT /api/study-plans/:planId/tasks/:taskId/complete endpoint
    - Mark task as complete
    - _Requirements: 13.2_

  - [ ] 16.4 Create GET /api/study-plans/:planId/calendar endpoint
    - Get calendar view of plan
    - _Requirements: 13.6_

- [ ] 17. Checkpoint - Study Plans complete
  - Ensure all tests pass
  - Ask the user if questions arise

---

### Phase 7: Annotations and Bookmarks

- [ ] 18. Implement Annotation service
  - [ ] 18.1 Create AnnotationService class with upsertAnnotation method
    - Create or update annotation with rich text content
    - _Requirements: 14.1, 14.2_

  - [ ] 18.2 Write property test for annotation round-trip
    - **Property 20: Annotation Round-Trip**
    - **Validates: Requirements 14.1, 14.4**

  - [ ] 18.3 Implement getUserAnnotations with search
    - Return searchable list of annotated questions
    - _Requirements: 14.5_

  - [ ] 18.4 Implement toggleBookmark method
    - Support multiple bookmark categories
    - _Requirements: 15.1, 15.2_

  - [ ] 18.5 Write property test for bookmark round-trip
    - **Property 21: Bookmark Round-Trip**
    - **Validates: Requirements 15.1, 15.2**

  - [ ] 18.6 Implement getBookmarks with category filter
    - _Requirements: 15.4_

- [ ] 19. Create Annotation API routes
  - [ ] 19.1 Create PUT /api/annotations/:questionId endpoint
    - Create or update annotation
    - _Requirements: 14.1_

  - [ ] 19.2 Create GET /api/annotations endpoint
    - Get all user annotations with search
    - _Requirements: 14.5_

  - [ ] 19.3 Create POST /api/bookmarks/:questionId endpoint
    - Toggle bookmark with category
    - _Requirements: 15.1_

  - [ ] 19.4 Create GET /api/bookmarks endpoint
    - Get bookmarks by category
    - _Requirements: 15.4_

- [ ] 20. Checkpoint - Annotations complete
  - Ensure all tests pass
  - Ask the user if questions arise

---

### Phase 8: Discussion Forums

- [ ] 21. Implement Discussion service
  - [ ] 21.1 Create DiscussionService class with createComment method
    - Validate minimum 20 characters
    - Support threaded replies (parentId)
    - _Requirements: 16.1, 16.3, 16.6_

  - [ ] 21.2 Implement getComments with sorting
    - Sort by most_helpful (upvotes), newest, oldest
    - Expert verified answers appear first
    - _Requirements: 16.5, 18.4_

  - [ ] 21.3 Write property test for comment sorting
    - **Property 22: Comment Sorting - Most Helpful**
    - **Validates: Requirements 16.5, 18.4**

  - [ ] 21.4 Implement upvoteComment method
    - Track votes per user
    - _Requirements: 16.4_

  - [ ] 21.5 Implement reportComment method
    - Auto-hide at 3 reports
    - _Requirements: 17.1, 17.2_

  - [ ] 21.6 Write property test for auto-hide on reports
    - **Property 23: Comment Auto-Hide on Reports**
    - **Validates: Requirements 17.2**

  - [ ] 21.7 Implement rate limiting for comments
    - Max 10 comments per hour per user
    - _Requirements: 17.4_

  - [ ] 21.8 Write property test for rate limiting
    - **Property 24: Comment Rate Limiting**
    - **Validates: Requirements 17.4**

  - [ ] 21.9 Implement markExpertVerified (admin only)
    - _Requirements: 18.3_

- [ ] 22. Create Discussion API routes
  - [ ] 22.1 Create POST /api/discussions/:questionId/comments endpoint
    - Create new comment
    - _Requirements: 16.1_

  - [ ] 22.2 Create GET /api/discussions/:questionId/comments endpoint
    - Get comments with sorting
    - _Requirements: 16.2_

  - [ ] 22.3 Create POST /api/discussions/comments/:commentId/upvote endpoint
    - Upvote a comment
    - _Requirements: 16.4_

  - [ ] 22.4 Create POST /api/discussions/comments/:commentId/report endpoint
    - Report a comment
    - _Requirements: 17.1_

  - [ ] 22.5 Create PUT /api/discussions/comments/:commentId/verify endpoint (admin)
    - Mark as expert verified
    - _Requirements: 18.3_

- [ ] 23. Checkpoint - Discussion Forums complete
  - Ensure all tests pass
  - Ask the user if questions arise

---

### Phase 9: Explanation Deep-Dives

- [ ] 24. Implement Question Explanation service
  - [ ] 24.1 Create QuestionExplanationService class
    - Store/retrieve explanations for each answer choice
    - _Requirements: 10.1_

  - [ ] 24.2 Write property test for explanation existence
    - **Property: For any question with explanations, each incorrect choice has an explanation**
    - **Validates: Requirements 10.1**

  - [ ] 24.3 Implement getExplanationsForQuestion method
    - Return all choice explanations with PMBOK references
    - _Requirements: 10.2, 10.3_

- [ ] 25. Create Explanation API routes
  - [ ] 25.1 Create GET /api/questions/:questionId/explanations endpoint
    - Get deep-dive explanations
    - _Requirements: 10.2_

  - [ ] 25.2 Create POST /api/questions/:questionId/explanations (admin)
    - Add/update explanations
    - _Requirements: 10.1_

- [ ] 26. Checkpoint - Explanations complete
  - Ensure all tests pass
  - Ask the user if questions arise

---

### Phase 10: Frontend Integration

- [ ] 27. Update Dashboard with adaptive learning widgets
  - [ ] 27.1 Create DomainMasteryCard component
    - Display mastery levels with trend indicators
    - _Requirements: 7.1_

  - [ ] 27.2 Create KnowledgeGapsCard component
    - Show top 3 gaps with recommendations
    - Link to focused practice
    - _Requirements: 7.2, 7.4_

  - [ ] 27.3 Create RecommendedSessionCard component
    - Show adaptive session recommendation
    - _Requirements: 7.3_

  - [ ] 27.4 Create InsightsPanel component
    - Display recent insights with timestamps
    - _Requirements: 7.5_

- [ ] 28. Create Exam Simulator pages
  - [ ] 28.1 Create ExamSimulatorPage component
    - Full exam interface with timer
    - No pause functionality
    - _Requirements: 8.1, 8.3, 8.5_

  - [ ] 28.2 Create ExamResultsPage component
    - Score report with pass/fail
    - Domain breakdown and time analytics
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 29. Create Study Plan pages
  - [ ] 29.1 Create StudyPlanSetupPage component
    - Form for target date and hours per day
    - _Requirements: 12.1_

  - [ ] 29.2 Create StudyPlanDashboard component
    - Daily tasks with checkboxes
    - Progress status indicator
    - _Requirements: 13.1, 13.3_

  - [ ] 29.3 Create StudyPlanCalendar component
    - Calendar view of planned activities
    - _Requirements: 13.6_

- [ ] 30. Update Practice page with annotations
  - [ ] 30.1 Add AnnotationPanel component to question view
    - Rich text editor for notes
    - Auto-save functionality
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ] 30.2 Add BookmarkButton component
    - Category selection dropdown
    - _Requirements: 15.1, 15.2_

  - [ ] 30.3 Create AnnotatedQuestionsPage
    - Searchable list of annotated questions
    - _Requirements: 14.5_

- [ ] 31. Create Discussion components
  - [ ] 31.1 Create DiscussionThread component
    - Display comments with threading
    - Upvote and reply functionality
    - _Requirements: 16.1, 16.4, 16.6_

  - [ ] 31.2 Create CommentForm component
    - Minimum character validation
    - _Requirements: 16.3_

  - [ ] 31.3 Add discussion count badge to questions
    - _Requirements: 16.2_

- [ ] 32. Update question review with deep-dive explanations
  - [ ] 32.1 Create DeepDiveExplanation component
    - Show "Why this is wrong" for each incorrect choice
    - Display PMBOK references
    - _Requirements: 10.2, 10.3_

- [ ] 33. Final Checkpoint - All features complete
  - Run full test suite
  - Manual testing of all features
  - Ask the user if questions arise

## Notes

- All property-based tests are required for comprehensive correctness guarantees
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check (100+ iterations)
- Unit tests validate specific examples and edge cases
