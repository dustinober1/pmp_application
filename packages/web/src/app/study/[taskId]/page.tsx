"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { Task, StudyGuide } from "@pmp/shared";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FullPageSkeleton } from "@/components/FullPageSkeleton";
import { useToast } from "@/components/ToastProvider";
import { SanitizedMarkdown } from "@/components/SanitizedMarkdown";

export default function StudyGuidePage() {
  const { taskId } = useParams();
  const router = useRouter();
  const { canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      if (!taskId) return;
      try {
        setLoading(true);
        // Fetch task details
        const tasksResponse = await apiRequest<{ tasks: Task[] }>(
          "/domains/tasks",
        );
        const foundTask = tasksResponse.data?.tasks.find(
          (t) => t.id === taskId,
        );

        if (foundTask) {
          setTask(foundTask);
        }

        // Fetch study guide
        try {
          const guideResponse = await apiRequest<{ studyGuide: StudyGuide }>(
            `/domains/tasks/${taskId}/study-guide`,
          );
          if (guideResponse.data) {
            setGuide(guideResponse.data.studyGuide);
            if (guideResponse.data.studyGuide.sections.length > 0) {
              const firstSection = guideResponse.data.studyGuide.sections[0];
              if (firstSection) {
                setActiveSection(firstSection.id);
              }
            }
          }
        } catch (err) {
          console.warn("Study guide not found", err);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to load study guide. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (canAccess) {
      void fetchData();
    }
  }, [canAccess, taskId, toast]);

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center bg-gray-900 border border-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Task Not Found</h1>
        <p className="text-gray-400 mb-6">
          The requested task could not be found.
        </p>
        <button
          onClick={() => router.push("/study")}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
        >
          Back to Study Guide
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
          <button
            onClick={() => router.push("/study")}
            className="hover:text-white transition"
          >
            Study Guide
          </button>
          <span>/</span>
          <span className="text-white">Task {task.code}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{task.name}</h1>
        <p className="text-xl text-gray-400">{task.description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Contents
            </h3>
            <nav className="space-y-1">
              {!guide || guide.sections.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No content sections available.
                </p>
              ) : (
                guide.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      document
                        .getElementById(section.id)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      activeSection === section.id
                        ? "bg-primary-900/30 text-primary-400 border-l-2 border-primary-500"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {section.title}
                  </button>
                ))
              )}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Resources
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/flashcards")}
                  className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition flex items-center"
                >
                  <span className="mr-2" aria-hidden="true">
                    🗂️
                  </span>{" "}
                  Related Flashcards
                </button>
                <button
                  onClick={() => router.push("/formulas")}
                  className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition flex items-center"
                >
                  <span className="mr-2" aria-hidden="true">
                    ∑
                  </span>{" "}
                  Related Formulas
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {!guide ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-medium text-white mb-2">
                Content Coming Soon
              </h3>
              <p className="text-gray-400">
                Detailed study guide content for this task is currently being
                developed. Please check back later or start with flashcards.
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => router.push("/flashcards")}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Start Flashcards
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {guide.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24" // Offset for sticky header
                >
                  <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="border-b border-gray-800 px-6 py-4 bg-gray-800/50">
                      <h2 className="text-xl font-semibold text-white">
                        {section.title}
                      </h2>
                    </div>
                    <div className="px-6 py-6 prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-a:text-primary-400 prose-code:text-primary-300">
                      <SanitizedMarkdown content={section.content} />
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
