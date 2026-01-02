import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Study Guide - PMP Study Pro',
  description: 'Comprehensive PMP exam study guide and preparation resources.',
};

export default function StudyGuidePage() {
  return (
    <div className="min-h-screen bg-md-surface">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          PMP Exam Study Guide
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Your comprehensive resource for PMP exam preparation. This guide covers everything from
          exam fundamentals to advanced study strategies.
        </p>

        <div className="space-y-8">
          {/* Getting Started */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Getting Started
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  1. Verify Eligibility
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Ensure you meet PMI&apos;s education requirements: a secondary degree (high school
                  diploma) with 7,500 hours of project management experience, or a four-year degree
                  with 4,500 hours.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  2. Create PMI Account
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Register at pmi.org to submit your application and schedule the exam. The
                  application process typically takes 5-10 business days for approval.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  3. Schedule Your Exam
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Once approved, schedule your exam at a Pearson VUE testing center or online
                  proctored. The exam fee is $405 for PMI members, $575 for non-members.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  4. Set a Timeline
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Most candidates need 2-4 months of consistent study. Set a target exam date and
                  create a study schedule that fits your availability.
                </p>
              </div>
            </div>
          </section>

          {/* Study Tips */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Study Tips for Success
            </h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Study consistently daily, even if it&apos;s just 30 minutes</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Use active recall techniques instead of passive reading</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Take practice exams under realistic conditions</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Review incorrect answers to understand your weaknesses</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Join study groups or online communities for support</span>
              </li>
            </ul>
          </section>

          {/* Exam Overview */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Exam Overview
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-md-primary-container dark:bg-md-primary-container rounded-lg">
                <p className="text-3xl font-bold text-md-primary">180</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Questions</p>
              </div>
              <div className="p-4 bg-md-primary-container dark:bg-md-primary-container rounded-lg">
                <p className="text-3xl font-bold text-md-primary">230</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Minutes</p>
              </div>
              <div className="p-4 bg-md-primary-container dark:bg-md-primary-container rounded-lg">
                <p className="text-3xl font-bold text-md-primary">$405</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Member Fee</p>
              </div>
            </div>
          </section>

          {/* Domain Breakdown */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Domain Breakdown
            </h2>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-700 rounded-r-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">People (42%)</h3>
                  <span className="text-sm text-gray-500">~42 questions</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Team leadership, stakeholder management, conflict resolution, and communication
                  skills.
                </p>
              </div>
              <div className="p-4 border-l-4 border-green-500 bg-gray-50 dark:bg-gray-700 rounded-r-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Process (50%)</h3>
                  <span className="text-sm text-gray-500">~50 questions</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Project management processes, methodology, and technical skills across all
                  knowledge areas.
                </p>
              </div>
              <div className="p-4 border-l-4 border-purple-500 bg-gray-50 dark:bg-gray-700 rounded-r-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Business Environment (8%)
                  </h3>
                  <span className="text-sm text-gray-500">~8 questions</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Compliance, organizational change, project benefits, and business analysis.
                </p>
              </div>
            </div>
          </section>

          {/* Recommended Resources */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Recommended Resources
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/study"
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Study Guides</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Comprehensive content covering all PMP domains and tasks
                </p>
              </Link>
              <Link
                href="/flashcards"
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Flashcards</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Spaced repetition for memorizing key concepts and formulas
                </p>
              </Link>
              <Link
                href="/practice"
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Practice Questions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Hundreds of exam-style questions with detailed explanations
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
