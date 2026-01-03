"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Note: For dynamic metadata in client components, use generateMetadata in layout.tsx
// or set document title directly via useEffect

interface DomainSection {
  id: string;
  title: string;
  percentage: number;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  ringColor: string;
  icon: React.ReactNode;
  tasks: string[];
}

const domains: DomainSection[] = [
  {
    id: "people",
    title: "People",
    percentage: 33,
    color: "blue",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
    borderColor: "border-blue-500",
    ringColor: "ring-blue-500/20",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    tasks: [
      "Develop a common vision with stakeholders",
      "Manage conflicts through agreed-on resolution strategies",
      "Lead the project team (empower, solve problems, establish roles)",
      "Engage stakeholders through tailored communication",
      "Align stakeholder expectations through facilitation",
      "Manage stakeholder expectations and satisfaction",
      "Help ensure knowledge transfer across the team",
      "Plan and manage communication (transparency, feedback)",
    ],
  },
  {
    id: "process",
    title: "Process",
    percentage: 41,
    color: "emerald",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500",
    ringColor: "ring-emerald-500/20",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    tasks: [
      "Develop integrated project management plan",
      "Develop and manage project scope",
      "Help ensure value-based delivery",
      "Plan and manage resources",
      "Plan and manage procurement",
      "Plan and manage project finance",
      "Plan and optimize quality of deliverables",
      "Plan and manage project schedule",
      "Evaluate project status and progress",
      "Manage project closure",
    ],
  },
  {
    id: "business",
    title: "Business Environment",
    percentage: 26,
    color: "violet",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-400",
    borderColor: "border-violet-500",
    ringColor: "ring-violet-500/20",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    tasks: [
      "Define and establish project governance",
      "Plan and manage project compliance",
      "Manage and control changes",
      "Remove impediments and manage issues",
      "Plan and manage risk",
      "Continuous improvement (lessons learned, OPAs)",
      "Support organizational change",
      "Evaluate external business environment changes",
    ],
  },
];

const eligibilityOptions = [
  {
    degree: "Secondary School",
    experience: "60 months (5 years)",
    education: "35 hours",
    detail: "High School Diploma, GED, or equivalent",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12.16-3 14l6.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
  },
  {
    degree: "Associate's Degree",
    experience: "48 months (4 years)",
    education: "35 hours",
    detail: "Post-secondary, short-cycle tertiary",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    degree: "Bachelor's Degree",
    experience: "36 months (3 years)",
    education: "35 hours",
    detail: "Four-year degree or higher",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12.16-3 14l6.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
  },
  {
    degree: "GAC Accredited Degree",
    experience: "24 months (2 years)",
    education: "35 hours",
    detail: "PMI Global Accreditation Center",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
  },
];

const studyTips = [
  {
    icon: "📅",
    text: "Study consistently daily, even if just 30 minutes",
    color: "green",
  },
  {
    icon: "🧠",
    text: "Use active recall instead of passive reading",
    color: "blue",
  },
  {
    icon: "📝",
    text: "Take practice exams under realistic conditions",
    color: "purple",
  },
  {
    icon: "❌",
    text: "Review incorrect answers to understand weaknesses",
    color: "red",
  },
  {
    icon: "👥",
    text: "Join study groups or online communities for support",
    color: "orange",
  },
  {
    icon: "🎯",
    text: "Focus on Process domain (41% of exam)",
    color: "emerald",
  },
];

const changesItems = [
  {
    title: "New Domain Structure",
    desc: "Three balanced domains: People (33%), Process (41%), Business Environment (26%).",
    color: "blue",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "AI Integration",
    desc: "AI and sustainability trends integrated throughout the exam content.",
    color: "violet",
    bgColor: "bg-violet-500/10",
  },
  {
    title: "Agile & Hybrid",
    desc: "60% of exam covers adaptive/agile and hybrid approaches, 40% predictive.",
    color: "emerald",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Enhanced GAC Path",
    desc: "GAC degree holders only need 24 months experience (down from 36).",
    color: "orange",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Value Focus",
    desc: "Emphasis on value-based delivery and measuring project benefits.",
    color: "pink",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "Knowledge Transfer",
    desc: "New focus on knowledge management and organizational learning.",
    color: "cyan",
    bgColor: "bg-cyan-500/10",
  },
];

export default function StudyGuidePage() {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  // Set page title for client-side rendering
  useEffect(() => {
    document.title = "2026 PMP Exam Study Guide - PMP Study Pro";
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Organic Blur Shapes */}
        <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slideUp">
            <div className="inline-flex items-center px-4 py-2 bg-md-primary-container rounded-full text-md-on-primary-container text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-md-tertiary rounded-full mr-2 animate-pulse"></span>
              Updated for July 2026 PMP Exam
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-md-on-background">
              PMP Exam Study Guide
              <span className="block text-gradient">2026 Edition</span>
            </h1>
            <p className="text-xl text-md-on-surface-variant max-w-3xl mx-auto mb-8">
              Your complete guide to passing the July 2026 PMP exam. Updated to
              reflect the new PMI Exam Content Outline with emphasis on People,
              Process, and Business Environment domains.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/study" className="btn btn-primary text-lg px-8 py-3">
                Start Studying
              </Link>
              <Link
                href="/practice"
                className="btn btn-outline text-lg px-8 py-3"
              >
                Practice Questions
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-16">
            {[
              { value: "180", label: "Questions", icon: "❓" },
              { value: "170", label: "Scored", icon: "✓" },
              { value: "240", label: "Minutes", icon: "⏱️" },
              { value: "2", label: "Breaks", icon: "☕" },
              { value: "$405", label: "Member Fee", icon: "💰" },
            ].map((stat, idx) => (
              <div key={idx} className="card text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-2xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-md-on-surface-variant">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="py-16 bg-md-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-md-on-background">
            <span className="text-md-primary">✓</span> Eligibility Requirements
          </h2>
          <p className="text-md-on-surface-variant text-center mb-8 max-w-2xl mx-auto">
            All experience must have been accrued within the last 10 years in a
            professional setting. All paths require 35 hours of commercial
            training in project management.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {eligibilityOptions.map((option, idx) => (
              <div key={idx} className="card card-interactive">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-md-primary-container rounded-lg flex items-center justify-center text-md-on-primary-container mr-3">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-md-on-surface">
                      {option.degree}
                    </h3>
                    <p className="text-xs text-md-on-surface-variant">
                      {option.detail}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-md-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span className="font-medium text-md-on-surface">
                      {option.experience}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Training:</span>
                    <span className="font-medium text-md-on-surface">
                      {option.education}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domain Breakdown */}
      <section className="py-16 bg-md-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-md-on-background">
            2026 Exam Domain Structure
          </h2>
          <p className="text-md-on-surface-variant text-center mb-12 max-w-2xl mx-auto">
            The July 2026 PMP exam focuses on three balanced domains covering
            all aspects of modern project management.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {domains.map((domain) => (
              <div
                key={domain.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  setActiveDomain(activeDomain === domain.id ? null : domain.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveDomain(
                      activeDomain === domain.id ? null : domain.id,
                    );
                  }
                }}
                className={`card card-interactive cursor-pointer ${
                  activeDomain === domain.id
                    ? `ring-2 ${domain.ringColor} border-2 ${domain.borderColor}`
                    : ""
                }`}
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${domain.bgColor} flex items-center justify-center ${domain.textColor} mr-3`}
                  >
                    {domain.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-md-on-surface">
                      {domain.title}
                    </h3>
                    <p className={`text-2xl font-bold ${domain.textColor}`}>
                      {domain.percentage}%
                    </p>
                  </div>
                </div>
                {activeDomain === domain.id && (
                  <ul className="space-y-2 mt-4 pt-4 border-t border-md-outline-variant animate-in fade-in slide-in-from-top-2">
                    {domain.tasks.map((task, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-sm text-md-on-surface-variant"
                      >
                        <span className={`${domain.textColor} mr-2`}>•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-sm text-md-on-surface-variant/70 mt-2">
                  {activeDomain === domain.id
                    ? "Click to collapse"
                    : "Click to expand tasks"}
                </p>
              </div>
            ))}
          </div>

          {/* Visual Progress Bar - Approach Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-md-on-surface">
              Approach Distribution
            </h3>
            <p className="text-md-on-surface-variant text-sm mb-4">
              The exam integrates predictive, adaptive/agile, and hybrid
              approaches across all three domains.
            </p>
            <div className="h-8 rounded-full overflow-hidden flex">
              <div
                className="bg-md-tertiary h-full flex items-center justify-center text-xs font-medium text-md-on-tertiary"
                style={{ width: "40%" }}
              >
                40% Predictive
              </div>
              <div
                className="bg-md-primary h-full flex items-center justify-center text-xs font-medium text-md-on-primary"
                style={{ width: "60%" }}
              >
                60% Agile & Hybrid
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Changes Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-md-on-background">
            <span className="text-md-tertiary">★</span> What is New in 2026
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {changesItems.map((item, idx) => (
              <div key={idx} className="card card-interactive">
                <div
                  className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center mb-4`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-md-on-surface">
                  {item.title}
                </h3>
                <p className="text-md-on-surface-variant text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Tips */}
      <section className="py-16 bg-md-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-md-on-background">
            Study Tips for Success
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyTips.map((tip, idx) => (
              <div key={idx} className="card card-interactive flex items-start">
                <span className="text-2xl mr-3">{tip.icon}</span>
                <p className="text-md-on-surface-variant text-sm">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-md-on-background">
            Your Study Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Study Guides",
                desc: "Comprehensive content covering all PMP domains and tasks",
                href: "/study",
                textColor: "text-blue-400",
              },
              {
                title: "Flashcards",
                desc: "Spaced repetition for memorizing key concepts and formulas",
                href: "/flashcards",
                textColor: "text-violet-400",
              },
              {
                title: "Practice Questions",
                desc: "Hundreds of exam-style questions with detailed explanations",
                href: "/practice",
                textColor: "text-emerald-400",
              },
            ].map((resource, idx) => (
              <Link
                key={idx}
                href={resource.href}
                className="card card-interactive group"
              >
                <h3 className="text-xl font-semibold mb-2 text-md-on-surface group-hover:text-md-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-md-on-surface-variant text-sm">
                  {resource.desc}
                </p>
                <div
                  className={`mt-4 ${resource.textColor} text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform`}
                >
                  Get Started →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="blur-shape bg-md-secondary w-full h-full opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-md-on-surface">
            Ready to Start Your PMP Journey?
          </h2>
          <p className="text-md-on-surface-variant mb-8 text-lg">
            Join thousands of successful PMPs who used PMP Study Pro to pass
            their exam on the first try.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Create Free Account
            </Link>
            <Link
              href="/pricing"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
