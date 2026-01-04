import dynamic from "next/dynamic";
import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

// Feature route mapping for clickable cards
const featureRoutes: Record<string, string> = {
  "Comprehensive Study Guides": "/study",
  "Adaptive Flashcards": "/flashcards",
  "Practice Questions": "/practice",
  "Formula Calculator": "/formulas",
  "Analytics Dashboard": "/dashboard",
  "Full Mock Exams": "/practice/mock",
};

const Footer = dynamic(
  () => import("@/components/Footer").then((mod) => mod.Footer),
  {
    ssr: false,
    loading: () => <div className="h-20" />,
  },
);

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* CRITICAL-001: Add Navbar to landing page */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Organic Blur Shapes */}
        <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10">
          <div className="text-center animate-slideUp">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-md-on-background">
              Pass the <span className="text-gradient">2026 PMP Exam</span>
              <br />
              with Confidence
            </h1>
            <p className="text-xl text-md-on-surface-variant max-w-2xl mx-auto mb-8">
              Comprehensive study materials, practice questions, and AI-powered
              insights designed to help you succeed on your first attempt.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="btn btn-primary text-lg px-8 py-3"
              >
                Get Started
              </Link>
              <Link href="/study" className="btn btn-outline text-lg px-8 py-3">
                Browse Study Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-md-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-md-on-surface">
            Everything You Need to Pass
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CRITICAL-002: Make feature cards clickable */}
            {features.map((feature, index) => {
              const route = featureRoutes[feature.title];
              return route ? (
                <Link key={index} href={route} className="group">
                  <div className="card card-interactive h-full cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-md-primary-container text-md-on-primary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-md-on-surface">
                      {feature.title}
                    </h3>
                    <p className="text-md-on-surface-variant">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              ) : (
                <div key={index} className="card card-interactive group">
                  <div className="w-12 h-12 rounded-xl bg-md-primary-container text-md-on-primary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-md-on-surface">
                    {feature.title}
                  </h3>
                  <p className="text-md-on-surface-variant">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-4xl font-bold text-gradient">{stat.value}</p>
                <p className="text-md-on-surface-variant mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section - replaces pricing */}
      <section className="py-20 bg-md-surface-container-low">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-md-on-surface">
            100% Free and Open Source
          </h2>
          <p className="text-md-on-surface-variant mb-8 max-w-2xl mx-auto">
            All study materials, practice questions, and flashcards are
            completely free. No subscriptions, no hidden fees. Track your
            progress locally with localStorage - your data stays on your device.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-md-primary-container text-md-on-primary-container flex items-center justify-center mb-4 mx-auto">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-md-on-surface">
                Comprehensive Content
              </h3>
              <p className="text-sm text-md-on-surface-variant">
                1,800+ flashcards and 1,200+ practice questions covering all PMP
                domains
              </p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-md-primary-container text-md-on-primary-container flex items-center justify-center mb-4 mx-auto">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-md-on-surface">
                Private & Secure
              </h3>
              <p className="text-sm text-md-on-surface-variant">
                Your progress is stored locally in your browser. No account
                required.
              </p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-md-primary-container text-md-on-primary-container flex items-center justify-center mb-4 mx-auto">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-md-on-surface">
                Works Offline
              </h3>
              <p className="text-sm text-md-on-surface-variant">
                Once loaded, all materials work offline. Study anywhere,
                anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="blur-shape bg-md-secondary w-full h-full opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-md-on-surface">
            Ready to Ace Your PMP Exam?
          </h2>
          <p className="text-md-on-surface-variant mb-8">
            Join thousands of successful PMP-certified professionals who studied
            with us.
          </p>
          <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-3">
            Start Studying Now
          </Link>
        </div>
      </section>

      {/* MEDIUM-002: Add comprehensive footer with links */}
      <Footer />
    </div>
  );
}

const features = [
  {
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
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: "Comprehensive Study Guides",
    description:
      "In-depth coverage of all PMP domains aligned with the 2026 ECO.",
  },
  {
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    title: "1,800+ Practice Questions",
    description:
      "Realistic exam questions with detailed explanations and rationales.",
  },
  {
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
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    title: "Spaced Repetition Flashcards",
    description:
      "Optimize your memory with our SM-2 algorithm-powered flashcards.",
  },
  {
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
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Formula Calculator",
    description:
      "Interactive EVM and PERT calculators with step-by-step solutions.",
  },
  {
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
    title: "Analytics Dashboard",
    description: "Track your progress and identify areas needing improvement.",
  },
  {
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Full Mock Exams",
    description:
      "Simulate the real exam experience with timed 180-question tests.",
  },
];

const stats = [
  { value: "Adaptive", label: "Learning Algorithm" },
  { value: "1,200+", label: "Practice Questions" },
  { value: "1,800+", label: "Flashcards" },
  { value: "SM-2", label: "Spaced Repetition" },
];
