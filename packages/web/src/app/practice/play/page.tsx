"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  loadQuestions,
  pickRandomQuestions,
  calculateQuizScore,
  type Question,
} from "@/lib/questions";
import { getJson, setJson, updateJson } from "@/lib/storage";
import {
  createEmptyPracticeHistory,
  createEmptyStreak,
  addPracticeAttempt,
  updateStreak,
  type PracticeHistory,
  type Streak,
} from "@/lib/stats";

const STORAGE_KEY_HISTORY = "practice_history";
const STORAGE_KEY_STREAK = "streak";

function PracticePlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainParam = searchParams.get("domain");
  const taskParam = searchParams.get("task");
  const countParam = searchParams.get("count");
  const questionCount = countParam ? parseInt(countParam, 10) : 10;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Array<{ questionId: string; selectedIndex: number | null }>
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<ReturnType<typeof calculateQuizScore> | null>(null);
  const [showRemediation, setShowRemediation] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load and filter questions
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const allQuestions = await loadQuestions();

        // Apply filters from URL params
        const filters: { domain?: string; task?: string } = {};
        if (domainParam) filters.domain = domainParam;
        if (taskParam) filters.task = taskParam;

        // Pick random questions
        const selectedQuestions = pickRandomQuestions(
          allQuestions,
          questionCount,
          Object.keys(filters).length > 0 ? filters : undefined
        );

        setQuestions(selectedQuestions);
        setSelectedAnswers(
          selectedQuestions.map((q) => ({ questionId: q.id, selectedIndex: null }))
        );
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [domainParam, taskParam, questionCount]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = selectedAnswers[currentIndex];

  const handleSelectAnswer = useCallback((answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = {
      questionId: currentQuestion.id,
      selectedIndex: answerIndex,
    };
    setSelectedAnswers(newAnswers);
  }, [currentIndex, selectedAnswers, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate results
      const result = calculateQuizScore(questions, selectedAnswers);
      setQuizResult(result);
      setShowResults(true);

      // Save to localStorage
      const history = getJson<PracticeHistory>(
        STORAGE_KEY_HISTORY,
        createEmptyPracticeHistory()
      );
      const updatedHistory = addPracticeAttempt(history, {
        timestampISO: new Date().toISOString(),
        domain: domainParam || undefined,
        task: taskParam || undefined,
        questionCount: result.totalQuestions,
        correctCount: result.correctCount,
        scorePercent: result.scorePercent,
      });
      setJson(STORAGE_KEY_HISTORY, updatedHistory);

      // Update streak
      const currentStreak = getJson<Streak>(STORAGE_KEY_STREAK, createEmptyStreak());
      const updatedStreak = updateStreak(currentStreak, new Date().toISOString());
      setJson(STORAGE_KEY_STREAK, updatedStreak);
    }
  }, [currentIndex, questions, selectedAnswers, domainParam, taskParam]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-md-primary mx-auto mb-4"></div>
          <p className="text-md-on-surface-variant">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="card text-center">
            <h1 className="text-2xl font-bold mb-4">No Questions Found</h1>
            <p className="text-md-on-surface-variant mb-6">
              Try adjusting your filters or check back later.
            </p>
            <Link href="/practice" className="btn btn-primary">
              Back to Practice
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (showResults && quizResult) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

        <Navbar />

        <main className="max-w-3xl mx-auto px-4 py-12 relative z-10">
          <div className="card text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-md-on-surface">
              Quiz Complete!
            </h1>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-3xl font-bold text-md-primary">
                  {quizResult.scorePercent}%
                </p>
                <p className="text-sm text-md-on-surface-variant">Score</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-md-success">
                  {quizResult.correctCount}
                </p>
                <p className="text-sm text-md-on-surface-variant">Correct</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-md-error">
                  {quizResult.incorrectCount}
                </p>
                <p className="text-sm text-md-on-surface-variant">Incorrect</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/practice" className="btn btn-primary">
                Back to Practice
              </Link>
              <button
                onClick={() => setShowRemediation(true)}
                className="btn btn-outline"
              >
                Review Answers
              </button>
            </div>
          </div>

          {showRemediation && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-md-on-surface">Answer Review</h2>
              {questions.map((question, index) => {
                const answer = quizResult.answers[index];
                const isCorrect = answer.isCorrect;

                return (
                  <div key={question.id} className="card">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`badge ${isCorrect ? "badge-success" : "badge-error"}`}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                      <span className="text-sm text-md-on-surface-variant">
                        Question {index + 1} of {questions.length}
                      </span>
                    </div>
                    <p className="font-medium mb-4">{question.questionText}</p>

                    {/* Answers */}
                    <div className="space-y-2 mb-4">
                      {question.answers.map((ans, ansIndex) => {
                        const isSelected = answer.selectedIndex === ansIndex;
                        const isCorrectAnswer = ans.isCorrect;

                        let className = "p-3 rounded-lg border ";
                        if (isCorrectAnswer) {
                          className += "border-md-success bg-md-success-container text-md-on-success-container";
                        } else if (isSelected && !isCorrectAnswer) {
                          className += "border-md-error bg-md-error-container text-md-on-error-container";
                        } else {
                          className += "border-md-outline bg-md-surface-container-low";
                        }

                        return (
                          <div key={ansIndex} className={className}>
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + ansIndex)}.
                            </span>
                            {ans.text}
                            {isCorrectAnswer && (
                              <span className="ml-2 text-md-success">✓</span>
                            )}
                            {isSelected && !isCorrectAnswer && (
                              <span className="ml-2 text-md-error">✗</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Remediation */}
                    <div className="border-t border-md-outline pt-4">
                      <h3 className="font-medium text-sm text-md-primary mb-2">Remediation</h3>
                      <p className="text-sm text-md-on-surface-variant mb-2">
                        <strong>Core Logic:</strong> {question.remediation.coreLogic}
                      </p>
                      <p className="text-sm text-md-on-surface-variant mb-2">
                        <strong>PMI Mindset:</strong> {question.remediation.pmiMindset}
                      </p>
                      <p className="text-sm text-md-on-surface-variant mb-2">
                        <strong>The Trap:</strong> {question.remediation.theTrap}
                      </p>
                      {question.remediation.sourceLink && (
                        <a
                          href={question.remediation.sourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-md-primary hover:underline"
                        >
                          Learn more →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-md-on-surface-variant mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round((currentIndex / questions.length) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-md-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-md-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Domain/Task badges */}
        {(currentQuestion.domain || currentQuestion.task) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {currentQuestion.domain && (
              <span className="badge badge-primary">{currentQuestion.domain}</span>
            )}
            {currentQuestion.task && (
              <span className="badge badge-secondary">{currentQuestion.task}</span>
            )}
          </div>
        )}

        {/* Question */}
        <div className="card mb-6">
          <p className="text-lg text-md-on-surface mb-6">{currentQuestion.questionText}</p>

          {/* Answer options */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer, index) => {
              const isSelected = currentAnswer?.selectedIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-md-primary bg-md-primary-container text-md-on-primary-container"
                      : "border-md-outline bg-md-surface-container-low hover:border-md-primary/50"
                  }`}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {answer.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn btn-outline"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentAnswer?.selectedIndex === null}
            className="btn btn-primary"
          >
            {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PracticePlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-md-primary mx-auto mb-4"></div>
          <p className="text-md-on-surface-variant">Loading...</p>
        </div>
      </div>
    }>
      <PracticePlayContent />
    </Suspense>
  );
}
