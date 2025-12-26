/**
 * Adaptive Learning Engine Services
 *
 * This module exports all services related to the Adaptive Learning Engine.
 */

export * from "./PerformanceAnalyzer";
export * from "./MasteryCalculator";
export * from "./KnowledgeGapIdentifier";
export { QuestionSelector, questionSelector } from "./QuestionSelector";
export type {
  SelectionParams,
  SelectedQuestion,
  QuestionCandidate,
} from "./QuestionSelector";
export { InsightGenerator, insightGenerator } from "./InsightGenerator";
export type { Insight, InsightType, InsightPriority } from "./InsightGenerator";
