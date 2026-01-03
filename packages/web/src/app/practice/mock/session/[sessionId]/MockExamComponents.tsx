"use client";

import type { PracticeQuestion } from "@pmp/shared";

export function MockExamHeader(props: {
  currentIndex: number;
  totalCount: number;
  progressPercent: number;
  timeLeftSeconds: number;
  onShowReview: () => void;
  formatTime: (seconds: number) => string;
}) {
  const {
    currentIndex,
    totalCount,
    progressPercent,
    timeLeftSeconds,
    onShowReview,
    formatTime,
  } = props;

  return (
    <div className="flex items-center justify-between mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
      <div className="flex items-center space-x-4">
        <span className="text-gray-300 font-medium">
          Question {currentIndex + 1}{" "}
          <span className="text-gray-500">/ {totalCount}</span>
        </span>
        <div className="h-4 w-32 bg-gray-800 rounded-full overflow-hidden hidden sm:block">
          <div
            className="h-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-2xl font-mono font-bold text-primary-400 tracking-wider bg-gray-900 px-4 py-1 rounded-lg border border-gray-800 shadow-inner">
          {formatTime(timeLeftSeconds)}
        </div>
        <button
          onClick={onShowReview}
          className="text-sm text-gray-300 hover:text-white underline"
        >
          Review All
        </button>
      </div>
    </div>
  );
}

export function MockExamReviewScreen(props: {
  questions: Array<{ id: string; userAnswerId?: string }>;
  timeLeftSeconds: number;
  onJumpToQuestion: (index: number) => void;
  onReturnToExam: () => void;
  onSubmitExam: () => void;
  isSubmitting: boolean;
  formatTime: (seconds: number) => string;
}) {
  const {
    questions,
    timeLeftSeconds,
    onJumpToQuestion,
    onReturnToExam,
    onSubmitExam,
    isSubmitting,
    formatTime,
  } = props;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Review Your Answers</h1>
        <div className="text-xl font-mono text-primary-400">
          {formatTime(timeLeftSeconds)}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => onJumpToQuestion(idx)}
              className={`p-2 rounded text-sm font-medium border transition-colors ${
                q.userAnswerId
                  ? "bg-primary-900/40 border-primary-600 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onReturnToExam}
          className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Return to Exam
        </button>
        <button
          onClick={onSubmitExam}
          disabled={isSubmitting}
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Exam"}
        </button>
      </div>
    </div>
  );
}

export function MockExamQuestionCard(props: {
  question: PracticeQuestion;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}) {
  const { question, selectedOptionId, onSelectOption } = props;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6 shadow-sm">
      <p className="text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed">
        {question.questionText}
      </p>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start group ${
                isSelected
                  ? "bg-primary-900/20 border-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  : "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-500"
              }`}
            >
              <div
                className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                  isSelected
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-600 group-hover:border-gray-500"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
              <span
                className={`text-lg ${isSelected ? "text-white" : "text-gray-200"}`}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MockExamSideNav(props: {
  questions: Array<{ id: string; userAnswerId?: string }>;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}) {
  const { questions, currentIndex, onSelectIndex } = props;

  return (
    <div className="w-20 hidden lg:flex flex-col gap-2 overflow-y-auto custom-scrollbar bg-gray-900/30 p-2 rounded-xl border border-gray-800/50">
      {questions.map((q, idx) => {
        const isActive = idx === currentIndex;
        const isAnswered = !!q.userAnswerId;

        return (
          <button
            key={q.id}
            onClick={() => onSelectIndex(idx)}
            className={`w-full aspect-square rounded flex items-center justify-center text-sm font-bold transition-all ${
              isActive
                ? "bg-primary-600 text-white shadow-lg scale-105"
                : isAnswered
                  ? "bg-primary-900/30 text-primary-400 border border-primary-900"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}

export function MockExamFooter(props: {
  canGoPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  const { canGoPrev, onPrev, onNext, nextLabel } = props;

  return (
    <div className="border-t border-gray-800 pt-6 mt-2 flex justify-between items-center bg-background py-4">
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={`px-6 py-2.5 rounded-lg border font-medium transition ${
          !canGoPrev
            ? "border-gray-800 text-gray-500 cursor-not-allowed"
            : "border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
        }`}
      >
        &larr; Previous
      </button>

      <div className="flex gap-4">
        <button
          onClick={() => {
            // Flag logic could go here
          }}
          className="px-4 py-2.5 text-gray-300 hover:text-yellow-400 transition"
        >
          Flag for Review
        </button>
      </div>

      <button
        onClick={onNext}
        className="px-8 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition shadow-lg hover:shadow-primary-900/20 flex items-center"
      >
        {nextLabel}
        <span className="ml-2">&rarr;</span>
      </button>
    </div>
  );
}
