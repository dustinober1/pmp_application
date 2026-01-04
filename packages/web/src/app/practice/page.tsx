"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { PMP_EXAM_CONTENT } from "@/data/pmpExamContent";
import { createEmptyPracticeHistory, type PracticeHistory } from "@/lib/stats";
import { getJson } from "@/lib/storage";
import { type QuestionStats } from "@/lib/questions";

const STORAGE_KEY_HISTORY = "practice_history";

export default function PracticePage() {
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(true);

  // Load stats from localStorage
  useEffect(() => {
    try {
      const history = getJson<PracticeHistory>(
        STORAGE_KEY_HISTORY,
        createEmptyPracticeHistory(),
      );

      setStats({
        totalQuestions: history.attempts.reduce(
          (sum, a) => sum + a.questionCount,
          0,
        ),
        domains: PMP_EXAM_CONTENT.length,
        tasks: PMP_EXAM_CONTENT.reduce((sum, d) => sum + d.tasks.length, 0),
        questionsByDomain: {},
      } as QuestionStats);
    } catch (error) {
      console.error("Failed to load practice stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get available domains and tasks
  const domains = useMemo(() => {
    return PMP_EXAM_CONTENT.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
    }));
  }, []);

  const selectedDomainObj = useMemo(() => {
    return PMP_EXAM_CONTENT.find((d) => d.code === selectedDomain);
  }, [selectedDomain]);

  const tasks = useMemo(() => {
    if (!selectedDomainObj) return [];
    return selectedDomainObj.tasks.map((t) => ({
      id: t.id,
      name: t.name,
    }));
  }, [selectedDomainObj]);

  // Build the URL for the practice session
  const buildPlayUrl = () => {
    const params = new URLSearchParams();
    params.set("count", questionCount.toString());
    if (selectedDomain) params.set("domain", selectedDomain);
    if (selectedTask) params.set("task", selectedTask);
    return `/practice/play?${params.toString()}`;
  };

  const startQuiz = () => {
    window.location.href = buildPlayUrl();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Practice Questions
            </h1>
            <p className="mt-2 text-gray-600">
              Test your knowledge with realistic PMP exam questions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Total Questions</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalQuestions || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Domains</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.domains || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Tasks</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.tasks || 0}
              </div>
            </div>
          </div>

          {/* Quiz Configuration */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Start a New Quiz
            </h2>

            <div className="space-y-6">
              {/* Domain Selection */}
              <div>
                <label
                  htmlFor="domain-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Domain (Optional)
                </label>
                <select
                  id="domain-select"
                  value={selectedDomain}
                  onChange={(e) => {
                    setSelectedDomain(e.target.value);
                    setSelectedTask("");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Domains</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.code}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Selection */}
              {selectedDomain && (
                <div>
                  <label
                    htmlFor="task-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Task (Optional)
                  </label>
                  <select
                    id="task-select"
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Tasks</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.name}>
                        {task.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Question Count */}
              <div>
                <label
                  htmlFor="question-count"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Number of Questions
                </label>
                <select
                  id="question-count"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={50}>50 Questions</option>
                </select>
              </div>

              {/* Start Button */}
              <div className="flex gap-4">
                <button
                  onClick={startQuiz}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Start Quiz
                </button>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Start Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Start Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/practice/play?count=10"
                className="px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
              >
                10 Random Questions
              </Link>
              <Link
                href="/practice/play?count=20"
                className="px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
              >
                20 Random Questions
              </Link>
              <Link
                href="/practice/play?mode=mock"
                className="px-4 py-3 bg-purple-50 border border-purple-200 text-purple-700 font-medium rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-center"
              >
                Mock Exam (50 Questions)
              </Link>
              <Link
                href="/practice/flagged"
                className="px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-700 font-medium rounded-lg hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-center"
              >
                Flagged Questions
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
