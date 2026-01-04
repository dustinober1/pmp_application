import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const Footer = dynamic(
  () => import("@/components/Footer").then((mod) => mod.Footer),
  {
    ssr: false,
    loading: () => <div className="h-20" />,
  },
);

export default function DonatePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="blur-shape bg-md-tertiary w-64 h-64 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-md-on-background">
              Support <span className="text-gradient">PMP Study Pro</span>
            </h1>
            <p className="text-xl text-md-on-surface-variant max-w-2xl mx-auto">
              Help us keep this platform free and open for everyone. Your
              support enables continuous improvement of study materials and
              features.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-md-surface-container-low">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-4 text-md-on-surface">
              Our Mission
            </h2>
            <p className="text-md-on-surface-variant mb-4">
              PMP Study Pro is committed to providing high-quality, accessible
              PMP exam preparation materials to everyone, regardless of their
              financial situation. We believe that education should be freely
              available to all.
            </p>
            <p className="text-md-on-surface-variant">
              All our content — 1,800+ flashcards, 1,200+ practice questions,
              study guides, and formula calculators — is completely free and
              open source. Your progress is stored locally on your device,
              ensuring privacy and enabling offline study.
            </p>
          </div>
        </div>
      </section>

      {/* Donation Options */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-md-on-surface">
            Ways to Support
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* GitHub Sponsors */}
            <a
              href="https://github.com/sponsors"
              target="_blank"
              rel="noopener noreferrer"
              className="card group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-md-on-surface mb-2">
                    GitHub Sponsors
                  </h3>
                  <p className="text-sm text-md-on-surface-variant">
                    Support ongoing development through GitHub Sponsors.
                    Choose from various tiers with different perks.
                  </p>
                </div>
              </div>
            </a>

            {/* Buy Me a Coffee */}
            <a
              href="https://www.buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="card group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.2 3H5.8C4.2 3 3 4.2 3 5.8v12.4C3 19.8 4.2 21 5.8 21h12.4c1.6 0 2.8-1.2 2.8-2.8V5.8C21 4.2 19.8 3 18.2 3zM16 11h-2v2h2v-2zm-4 0h-2v2h2v-2zm8-2H4V5.8c0-.9.8-1.8 1.8-1.8h12.4c.9 0 1.8.8 1.8 1.8V9z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-md-on-surface mb-2">
                    Buy Me a Coffee
                  </h3>
                  <p className="text-sm text-md-on-surface-variant">
                    A simple way to show your support with a one-time
                    donation. Every coffee helps!
                  </p>
                </div>
              </div>
            </a>

            {/* Patreon */}
            <a
              href="https://www.patreon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="card group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-md-on-surface mb-2">
                    Patreon
                  </h3>
                  <p className="text-sm text-md-on-surface-variant">
                    Become a patron for exclusive content, early access to
                    features, and behind-the-scenes updates.
                  </p>
                </div>
              </div>
            </a>

            {/* Open Source */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="card group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-md-on-surface mb-2">
                    Contribute Code
                  </h3>
                  <p className="text-sm text-md-on-surface-variant">
                    Star the repo, report bugs, submit pull requests, or help
                    improve documentation.
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-md-surface-container-low">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-md-on-surface">
            Your Support Helps Us...
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-md-on-surface mb-2">
                Add More Content
              </h3>
              <p className="text-sm text-md-on-surface-variant">
                Expand flashcard database and practice questions
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-md-tertiary-container text-md-on-tertiary-container flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-md-on-surface mb-2">
                Improve Features
              </h3>
              <p className="text-sm text-md-on-surface-variant">
                Better spaced repetition algorithm and analytics
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-md-on-surface mb-2">
                Keep It Free
              </h3>
              <p className="text-sm text-md-on-surface-variant">
                Ensure accessibility for PMP candidates worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-md-on-surface">
            Every Contribution Makes a Difference
          </h2>
          <p className="text-md-on-surface-variant mb-8">
            Whether you can donate $5 or $50, your support directly improves the
            platform for thousands of PMP candidates.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/"
              className="btn btn-outline text-lg px-8 py-3"
            >
              Back to Study
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
