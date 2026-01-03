'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { Flashcard, FlashcardRating } from '@pmp/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/ToastProvider';
import { FullPageSkeleton } from '@/components/FullPageSkeleton';
// LOW-001: Add swipe gestures using react-swipeable
import { useSwipeable } from 'react-swipeable';

interface SessionData {
  sessionId: string;
  cards: Flashcard[];
  progress: {
    total: number;
    answered: number;
  };
}

/**
 * PMP/Project Management Acronyms dictionary
 * Maps acronyms to their full expansions
 */
const ACRONYMS: Record<string, string> = {
  // Project Management Core
  WBS: 'Work Breakdown Structure',
  PMBOK: 'Project Management Body of Knowledge',
  PMP: 'Project Management Professional',
  PMI: 'Project Management Institute',
  RACI: 'Responsible, Accountable, Consulted, Informed',
  SWOT: 'Strengths, Weaknesses, Opportunities, Threats',
  PERT: 'Program Evaluation and Review Technique',
  CPM: 'Critical Path Method',

  // Earned Value Management
  EVA: 'Earned Value Analysis',
  EVT: 'Earned Value Technique',
  CV: 'Cost Variance',
  SV: 'Schedule Variance',
  CPI: 'Cost Performance Index',
  SPI: 'Schedule Performance Index',
  BAC: 'Budget at Completion',
  EAC: 'Estimate at Completion',
  ETC: 'Estimate to Complete',
  AC: 'Actual Cost',
  PV: 'Planned Value',
  EV: 'Earned Value',
  EVM: 'Earned Value Management',
  TCPI: 'To Complete Performance Index',

  // Quality
  QA: 'Quality Assurance',
  QC: 'Quality Control',
  COQ: 'Cost of Quality',

  // Business/Strategy
  MVP: 'Minimum Viable Product',
  ROI: 'Return on Investment',
  NPV: 'Net Present Value',
  IRR: 'Internal Rate of Return',
  KPI: 'Key Performance Indicator',
  SMART: 'Specific, Measurable, Achievable, Relevant, Time-bound',
  OKR: 'Objectives and Key Results',
  CSF: 'Critical Success Factor',

  // Change & Contracts
  CR: 'Change Request',
  CCB: 'Change Control Board',
  SOW: 'Statement of Work',
  SLA: 'Service Level Agreement',
  OLA: 'Operational Level Agreement',
  UNC: 'Underpinning Contract',

  // Scheduling
  PDM: 'Precedence Diagramming Method',
  ADM: 'Arrow Diagramming Method',
  AOA: 'Activity on Arrow',
  AON: 'Activity on Node',
  FF: 'Finish-to-Finish',
  FS: 'Finish-to-Start',
  SF: 'Start-to-Finish',
  SS: 'Start-to-Start',
  LEAD: 'Lead Time',
  LAG: 'Lag Time',
  CF: 'Critical Float',
  LF: 'Late Finish',
  LS: 'Late Start',
  EF: 'Early Finish',
  ES: 'Early Start',

  // Organizational Structures
  RAM: 'Responsibility Assignment Matrix',
  RBS: 'Risk Breakdown Structure',
  OBS: 'Organizational Breakdown Structure',
  CBS: 'Cost Breakdown Structure',
  PBS: 'Product Breakdown Structure',
  BOM: 'Bill of Materials',

  // Process Improvement
  DMAIC: 'Define, Measure, Analyze, Improve, Control',
  PDCA: 'Plan-Do-Check-Act',
  MoSCoW: "Must have, Should have, Could have, Won't have",
  LSS: 'Lean Six Sigma',
  TOC: 'Theory of Constraints',
  FMEA: 'Failure Mode and Effects Analysis',
  RCCA: 'Root Cause and Corrective Action',
  RCA: 'Root Cause Analysis',

  // Agile/Software
  CI: 'Continuous Integration',
  CD: 'Continuous Deployment',
  API: 'Application Programming Interface',
  UI: 'User Interface',
  UX: 'User Experience',
  SRS: 'Software Requirements Specification',
  FSD: 'Functional Specification Document',
  HLD: 'High Level Design',
  LLD: 'Low Level Design',

  // Leadership
  MBTI: 'Myers-Briggs Type Indicator',
  MBO: 'Management by Objectives',
  OODA: 'Observe, Orient, Decide, Act',
  JTBD: 'Jobs to be Done',

  // Executive Titles
  CEO: 'Chief Executive Officer',
  CFO: 'Chief Financial Officer',
  COO: 'Chief Operating Officer',
  CIO: 'Chief Information Officer',
  CTO: 'Chief Technology Officer',
  CPO: 'Chief Product Officer',

  // Other
  WIP: 'Work in Progress',
  LOE: 'Level of Effort',
  PC: 'Percent Complete',
  HR: 'Human Resources',
  IT: 'Information Technology',
  OPEX: 'Operating Expenditure',
  CAPEX: 'Capital Expenditure',
  TBD: 'To Be Determined',
  TBC: 'To Be Confirmed',
  TTM: 'Time to Market',
  FTA: 'Fault Tree Analysis',
  ETA: 'Event Tree Analysis',
};

/**
 * Format flashcard text:
 * - Convert **bold** to rendered bold text
 * - Expand known acronyms to their full form
 */
function formatFlashcardText(text: string): React.ReactNode {
  // First, expand acronyms (case-insensitive)
  const formatted = text.replace(/\b([A-Z]{2,})\b/g, match => {
    const upperMatch = match.toUpperCase();
    if (ACRONYMS[upperMatch]) {
      return `${ACRONYMS[upperMatch]} (${upperMatch})`;
    }
    return match;
  });

  // Split by markdown bold syntax and render
  const parts = formatted.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Remove the ** and render as bold
          const content = part.slice(2, -2);
          return (
            <strong key={index} className="font-bold text-md-primary">
              {content}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default function FlashcardSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;
      try {
        setLoading(true);
        const response = await apiRequest<SessionData>(`/flashcards/sessions/${sessionId}`);
        if (response.data) {
          setSession(response.data);
          setCurrentIndex(response.data.progress.answered);
          if (
            response.data.progress.answered >= response.data.progress.total &&
            response.data.progress.total > 0
          ) {
            setSessionComplete(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch session', error);
        toast.error('Failed to load session. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (canAccess) {
      void fetchSession();
    }
  }, [canAccess, sessionId, toast]);

  const handleFlip = useCallback(() => {
    if (ratingSubmitting) return;
    setIsFlipped(prev => !prev);
  }, [ratingSubmitting]);

  const completeSession = useCallback(async () => {
    try {
      await apiRequest(`/flashcards/sessions/${sessionId}/complete`, { method: 'POST' });
      setSessionComplete(true);
    } catch (error) {
      console.error('Failed to complete session', error);
      toast.error('Failed to complete session. Please try again.');
    }
  }, [sessionId, toast]);

  const handleRate = useCallback(
    async (rating: FlashcardRating) => {
      if (ratingSubmitting) return;
      if (!session || !sessionId) return;

      const currentCard = session.cards[currentIndex];
      if (!currentCard) return;

      const timeSpentMs = Date.now() - startTime;

      try {
        setRatingSubmitting(true);
        await apiRequest(`/flashcards/sessions/${sessionId}/responses/${currentCard.id}`, {
          method: 'POST',
          body: {
            rating,
            timeSpentMs,
          },
        });

        // Move to next card
        if (currentIndex < session.cards.length - 1) {
          setIsFlipped(false);
          setCurrentIndex(prev => prev + 1);
          setStartTime(Date.now());
        } else {
          // Session complete
          await completeSession();
        }
      } catch (error) {
        console.error('Failed to record response', error);
        toast.error('Failed to record response. Please try again.');
      } finally {
        setRatingSubmitting(false);
      }
    },
    [completeSession, currentIndex, ratingSubmitting, session, sessionId, startTime, toast]
  );

  // Keyboard shortcuts (1/2/3 to rate, Space/Enter to flip)
  useEffect(() => {
    if (loading || sessionComplete) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/flashcards');
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
        return;
      }

      if (!isFlipped) return;
      if (e.key === '1') void handleRate('dont_know');
      if (e.key === '2') void handleRate('learning');
      if (e.key === '3') void handleRate('know_it');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleFlip, handleRate, isFlipped, loading, router, sessionComplete]);

  // LOW-001: Swipe gestures for flashcard interaction
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isFlipped) {
        void handleRate('dont_know'); // Swipe left when flipped = Again
      }
    },
    onSwipedRight: () => {
      if (isFlipped) {
        void handleRate('know_it'); // Swipe right when flipped = Easy
      }
    },
    onSwipedUp: () => {
      if (!isFlipped) {
        handleFlip(); // Swipe up to flip
      }
    },
    onSwipedDown: () => {
      if (!isFlipped) {
        handleFlip(); // Swipe down to flip
      }
    },
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: false, // Allow page scroll
  });

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-md-background relative overflow-hidden">
        <div className="blur-shape bg-md-error w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="card max-w-md w-full text-center relative z-10">
          <h1 className="text-2xl font-bold text-md-on-surface mb-4">Session Not Found</h1>
          <button onClick={() => router.push('/flashcards')} className="btn btn-primary w-full">
            Back to Flashcards
          </button>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-md-background relative overflow-hidden">
        <div className="blur-shape bg-md-success w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="card max-w-lg w-full text-center relative z-10 p-12">
          <div className="text-6xl mb-6 animate-bounce" aria-hidden="true">
            🎉
          </div>
          <h1 className="text-3xl font-bold text-md-on-surface mb-4">Session Complete!</h1>
          <p className="text-md-on-surface-variant mb-8 text-lg">
            Great job! You’ve reviewed {session.cards.length} cards.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => router.push('/flashcards')} className="btn btn-secondary">
              Back to Overview
            </button>
            <button onClick={() => router.push('/dashboard')} className="btn btn-primary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = session.cards[currentIndex];
  // FIXED: Calculate progress based on current card position (1-indexed), not completed count
  // When viewing card at index N, we're on card N+1, so progress should be (N+1)/total
  const progress =
    session.cards.length > 0 ? Math.round(((currentIndex + 1) / session.cards.length) * 100) : 0;

  if (!currentCard) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-md-background relative overflow-hidden flex flex-col">
      {/* Organic Blur Shapes */}
      <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="blur-shape bg-md-secondary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 flex flex-col relative z-10">
        {/* Header / Progress */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/flashcards')}
            className="text-md-on-surface-variant hover:text-md-primary transition flex items-center gap-2 font-medium"
          >
            &larr; Exit
          </button>
          <div className="flex-1 mx-8 max-w-md">
            <div className="flex justify-between text-xs text-md-on-surface-variant mb-2 font-medium">
              <span>
                Card {currentIndex + 1} of {session.cards.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-md-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-md-primary transition-all duration-300 ease-standard"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>

        {/* Card Area */}
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          <div {...swipeHandlers} className="w-full max-w-2xl">
            <button
              type="button"
              className="w-full aspect-[3/2] perspective-1000 cursor-pointer group focus:outline-none"
              onClick={handleFlip}
              aria-label="Flip card"
            >
              <div
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
              >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-md-surface-container border border-md-outline/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg group-hover:shadow-xl group-hover:scale-[1.01] transition-all duration-300">
                  <span className="text-md-primary text-sm font-bold uppercase tracking-wider mb-6 bg-md-primary/10 px-3 py-1 rounded-full">
                    Question
                  </span>
                  <h2 className="text-2xl md:text-4xl font-medium text-md-on-surface leading-tight">
                    {formatFlashcardText(currentCard.front)}
                  </h2>
                  <div className="absolute bottom-6 text-md-on-surface-variant/50 text-sm font-medium">
                    Click or Space to flip • Swipe up/down to flip
                  </div>
                </div>

                {/* Back */}
                <div className="absolute w-full h-full backface-hidden bg-md-surface-container-high border-2 border-md-primary rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl rotate-y-180">
                  <span className="text-md-tertiary text-sm font-bold uppercase tracking-wider mb-6 bg-md-tertiary/10 px-3 py-1 rounded-full">
                    Answer
                  </span>
                  <p className="text-xl md:text-2xl text-md-on-surface leading-relaxed font-medium">
                    {formatFlashcardText(currentCard.back)}
                  </p>
                  <div className="absolute bottom-6 text-md-on-surface-variant/50 text-sm font-medium">
                    Swipe left for Again • Swipe right for Easy
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="h-24">
          {isFlipped ? (
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto w-full">
              <button
                onClick={() => handleRate('dont_know')}
                disabled={ratingSubmitting}
                className="group py-4 bg-md-error-container/50 border border-md-error/20 text-md-on-error-container rounded-2xl hover:bg-md-error-container hover:scale-105 transition-all duration-200"
              >
                <div className="font-bold mb-1 text-lg">Again</div>
                <div className="text-xs opacity-70 font-medium group-hover:opacity-100">
                  {'< 1 min • 1'}
                </div>
              </button>
              <button
                onClick={() => handleRate('learning')}
                disabled={ratingSubmitting}
                className="group py-4 bg-md-secondary-container/50 border border-md-secondary/20 text-md-on-secondary-container rounded-2xl hover:bg-md-secondary-container hover:scale-105 transition-all duration-200"
              >
                <div className="font-bold mb-1 text-lg">Hard</div>
                <div className="text-xs opacity-70 font-medium group-hover:opacity-100">
                  2 days • 2
                </div>
              </button>
              <button
                onClick={() => handleRate('know_it')}
                disabled={ratingSubmitting}
                className="group py-4 bg-green-100 border border-green-200 text-green-800 rounded-2xl hover:bg-green-200 hover:scale-105 transition-all duration-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200 dark:hover:bg-green-900/50"
              >
                <div className="font-bold mb-1 text-lg">Easy</div>
                <div className="text-xs opacity-70 font-medium group-hover:opacity-100">
                  4 days • 3
                </div>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleFlip}
                className="btn btn-primary px-12 h-14 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Show Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
