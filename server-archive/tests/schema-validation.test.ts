/**
 * Schema Validation Test
 * 
 * This test verifies that all Prisma models for the Adaptive Learning Engine
 * are properly defined and accessible via the Prisma client.
 */

import { PrismaClient, Prisma } from '@prisma/client';

describe('Database Schema Validation', () => {
  describe('Adaptive Learning Engine Models', () => {
    it('should have LearningProfile model defined', () => {
      // Verify the model exists in Prisma's type system
      const modelFields: (keyof Prisma.LearningProfileCreateInput)[] = [
        'user',
        'lastCalculatedAt',
        'domainMasteries',
        'insights'
      ];
      expect(modelFields).toBeDefined();
    });

    it('should have DomainMastery model defined', () => {
      const modelFields: (keyof Prisma.DomainMasteryCreateInput)[] = [
        'profile',
        'domain',
        'score',
        'trend',
        'accuracyRate',
        'consistencyScore',
        'difficultyScore',
        'questionCount',
        'lastActivityAt',
        'peakScore'
      ];
      expect(modelFields).toBeDefined();
    });

    it('should have Insight model defined', () => {
      const modelFields: (keyof Prisma.InsightCreateInput)[] = [
        'profile',
        'type',
        'title',
        'message',
        'priority',
        'actionUrl',
        'isRead',
        'createdAt'
      ];
      expect(modelFields).toBeDefined();
    });
  });

  describe('Exam Simulator Models', () => {
    it('should have ExamSession model defined', () => {
      const modelFields: (keyof Prisma.ExamSessionCreateInput)[] = [
        'user',
        'startedAt',
        'completedAt',
        'breakTakenAt',
        'status',
        'score',
        'passed',
        'totalTimeSeconds',
        'answers'
      ];
      expect(modelFields).toBeDefined();
    });

    it('should have ExamAnswer model defined', () => {
      const modelFields: (keyof Prisma.ExamAnswerCreateInput)[] = [
        'session',
        'question',
        'selectedAnswerIndex',
        'isCorrect',
        'timeSpentSeconds',
        'answeredAt'
      ];
      expect(modelFields).toBeDefined();
    });
  });

  describe('Study Plan Models', () => {
    it('should have StudyPlan model defined', () => {
      const modelFields: (keyof Prisma.StudyPlanCreateInput)[] = [
        'user',
        'targetExamDate',
        'hoursPerDay',
        'status',
        'progressStatus',
        'createdAt',
        'updatedAt',
        'tasks'
      ];
      expect(modelFields).toBeDefined();
    });

    it('should have StudyTask model defined', () => {
      const modelFields: (keyof Prisma.StudyTaskCreateInput)[] = [
        'plan',
        'date',
        'type',
        'description',
        'estimatedMinutes',
        'domainFocus',
        'isCompleted',
        'completedAt'
      ];
      expect(modelFields).toBeDefined();
    });
  });

  describe('Annotation Models', () => {
    it('should have Annotation model defined', () => {
      const modelFields: (keyof Prisma.AnnotationCreateInput)[] = [
        'user',
        'question',
        'content',
        'createdAt',
        'updatedAt'
      ];
      expect(modelFields).toBeDefined();
    });

    it('should have Bookmark model defined', () => {
      const modelFields: (keyof Prisma.BookmarkCreateInput)[] = [
        'user',
        'question',
        'category',
        'createdAt'
      ];
      expect(modelFields).toBeDefined();
    });
  });

  describe('Discussion Models', () => {
    it('should have DiscussionComment model defined', () => {
      const modelFields: (keyof Prisma.DiscussionCommentCreateInput)[] = [
        'question',
        'user',
        'content',
        'parent',
        'upvotes',
        'isExpertVerified',
        'isHidden',
        'reportCount',
        'createdAt',
        'updatedAt'
      ];
      expect(modelFields).toBeDefined();
    });

    it('should have CommentVote model defined', () => {
      const modelFields: (keyof Prisma.CommentVoteCreateInput)[] = [
        'comment',
        'user',
        'createdAt'
      ];
      expect(modelFields).toBeDefined();
    });

    it('should have CommentReport model defined', () => {
      const modelFields: (keyof Prisma.CommentReportCreateInput)[] = [
        'comment',
        'user',
        'reason',
        'createdAt'
      ];
      expect(modelFields).toBeDefined();
    });
  });

  describe('Question Enhancement Models', () => {
    it('should have QuestionExplanation model defined', () => {
      const modelFields: (keyof Prisma.QuestionExplanationCreateInput)[] = [
        'question',
        'choiceIndex',
        'explanation',
        'misconception',
        'pmbokReference'
      ];
      expect(modelFields).toBeDefined();
    });
  });

  describe('User Enhancement Models', () => {
    it('should have UserCertification model defined', () => {
      const modelFields: (keyof Prisma.UserCertificationCreateInput)[] = [
        'user',
        'isPmpCertified',
        'verifiedAt',
        'certificateId'
      ];
      expect(modelFields).toBeDefined();
    });
  });

  describe('User Model Relations', () => {
    it('should have all adaptive learning relations on User model', () => {
      // Verify User model has all the new relations
      const userRelations: (keyof Prisma.UserInclude)[] = [
        'learningProfile',
        'examSessions',
        'studyPlans',
        'annotations',
        'bookmarks',
        'discussionComments',
        'commentVotes',
        'commentReports',
        'certification'
      ];
      expect(userRelations).toBeDefined();
    });
  });

  describe('Domain Model Relations', () => {
    it('should have domainMasteries relation on Domain model', () => {
      const domainRelations: (keyof Prisma.DomainInclude)[] = [
        'domainMasteries'
      ];
      expect(domainRelations).toBeDefined();
    });
  });

  describe('Question Model Relations', () => {
    it('should have all new relations on Question model', () => {
      const questionRelations: (keyof Prisma.QuestionInclude)[] = [
        'examAnswers',
        'annotations',
        'bookmarks',
        'discussionComments',
        'explanation_deep'
      ];
      expect(questionRelations).toBeDefined();
    });
  });
});
