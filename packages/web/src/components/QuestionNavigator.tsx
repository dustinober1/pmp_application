'use client';

import { useMemo } from 'react';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<string>;
  flaggedQuestions: Set<string>;
  onJumpToQuestion: (index: number) => void;
  questionsPerPage?: number;
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  flaggedQuestions,
  onJumpToQuestion,
  questionsPerPage = 10,
}: QuestionNavigatorProps) {
  const pages = useMemo(() => {
    const pageCount = Math.ceil(totalQuestions / questionsPerPage);
    return Array.from({ length: pageCount }, (_, i) => ({
      start: i * questionsPerPage,
      end: Math.min((i + 1) * questionsPerPage, totalQuestions),
    }));
  }, [totalQuestions, questionsPerPage]);

  const currentPage = Math.floor(currentIndex / questionsPerPage);

  const getQuestionStatus = (index: number): 'answered' | 'flagged' | 'current' | 'unanswered' => {
    const questionId = `q-${index}`;
    if (flaggedQuestions.has(questionId)) return 'flagged';
    if (answeredQuestions.has(questionId)) return 'answered';
    if (index === currentIndex) return 'current';
    return 'unanswered';
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="font-semibold mb-3 text-sm text-[var(--foreground)]">Question Navigator</h3>
      
      {/* Page navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onJumpToQuestion(Math.max(0, (currentPage - 1) * questionsPerPage))}
          disabled={currentPage === 0}
          className="px-2 py-1 text-xs bg-[var(--secondary)] rounded hover:bg-[var(--secondary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          ← Prev
        </button>
        <span className="text-xs text-[var(--foreground-muted)]">
          Page {currentPage + 1} of {pages.length}
        </span>
        <button
          onClick={() => onJumpToQuestion(Math.min(totalQuestions - 1, (currentPage + 1) * questionsPerPage))}
          disabled={currentPage >= pages.length - 1}
          className="px-2 py-1 text-xs bg-[var(--secondary)] rounded hover:bg-[var(--secondary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          Next →
        </button>
      </div>

      {/* Question grid */}
      <div className="grid grid-cols-5 gap-2" role="grid" aria-label="Question numbers">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const status = getQuestionStatus(i);
          const isCurrent = i === currentIndex;
          
          let buttonClass = 'w-8 h-8 text-xs rounded font-medium transition-all ';
          
          if (status === 'answered') {
            buttonClass += 'bg-green-500/20 text-green-400 border border-green-500/50';
          } else if (status === 'flagged') {
            buttonClass += 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50';
          } else if (isCurrent) {
            buttonClass += 'bg-[var(--primary)] text-white border border-[var(--primary)]';
          } else {
            buttonClass += 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-transparent hover:border-[var(--border)]';
          }

          return (
            <button
              key={i}
              onClick={() => onJumpToQuestion(i)}
              className={buttonClass}
              aria-label={`Question ${i + 1}${status === 'answered' ? ' - answered' : ''}${status === 'flagged' ? ' - flagged' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {i + 1}
              {status === 'flagged' && <span className="ml-1">★</span>}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[var(--border)] text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50"></div>
          <span className="text-[var(--foreground-muted)]">Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50"></div>
          <span className="text-[var(--foreground-muted)]">Flagged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[var(--primary)]"></div>
          <span className="text-[var(--foreground-muted)]">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[var(--secondary)]"></div>
          <span className="text-[var(--foreground-muted)]">Unanswered</span>
        </div>
      </div>
    </div>
  );
}
