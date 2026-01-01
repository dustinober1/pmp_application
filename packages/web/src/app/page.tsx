import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
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
              Comprehensive study materials, practice questions, and AI-powered insights designed to
              help you succeed on your first attempt.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth/register" className="btn btn-primary text-lg px-8 py-3">
                Start Free Trial
              </Link>
              <Link href="/auth/login" className="btn btn-outline text-lg px-8 py-3">
                Sign In
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
            {features.map((feature, index) => (
              <div key={index} className="card card-interactive group">
                <div className="w-12 h-12 rounded-xl bg-md-primary-container text-md-on-primary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-md-on-surface">{feature.title}</h3>
                <p className="text-md-on-surface-variant">{feature.description}</p>
              </div>
            ))}
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

      {/* Pricing Section */}
      <section className="py-20 bg-md-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-md-on-surface">
            Simple, Transparent Pricing
          </h2>
          <p className="text-md-on-surface-variant text-center mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your study needs. Upgrade or downgrade anytime.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricing.map((tier, index) => (
              <div
                key={index}
                className={`card relative ${tier.popular ? 'ring-2 ring-md-primary md:-translate-y-4 shadow-lg' : ''}`}
              >
                {tier.popular && <span className="badge badge-primary mb-4">Most Popular</span>}
                <h3 className="text-xl font-bold text-md-on-surface">{tier.name}</h3>
                <p className="text-3xl font-bold mt-4 text-md-on-surface">
                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                  {tier.price !== 0 && (
                    <span className="text-sm font-normal text-md-on-surface-variant">/mo</span>
                  )}
                </p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-md-on-surface-variant"
                    >
                      <svg
                        className="w-5 h-5 text-md-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`btn w-full mt-6 ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
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
            Join thousands of successful PMP-certified professionals who studied with us.
          </p>
          <Link href="/auth/register" className="btn btn-primary text-lg px-8 py-3">
            Start Your Free Trial Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-md-outline/20 py-12 bg-md-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-md-primary flex items-center justify-center">
                <span className="text-md-on-primary font-bold text-sm">PM</span>
              </div>
              <span className="font-semibold text-md-on-surface">PMP Study Pro</span>
            </div>
            <p className="text-md-on-surface-variant text-sm">
              © 2026 PMP Study Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: 'Comprehensive Study Guides',
    description: 'In-depth coverage of all PMP domains aligned with the 2026 ECO.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    title: '1,800+ Practice Questions',
    description: 'Realistic exam questions with detailed explanations and rationales.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    title: 'Spaced Repetition Flashcards',
    description: 'Optimize your memory with our SM-2 algorithm-powered flashcards.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'Formula Calculator',
    description: 'Interactive EVM and PERT calculators with step-by-step solutions.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: 'Analytics Dashboard',
    description: 'Track your progress and identify areas needing improvement.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: 'Full Mock Exams',
    description: 'Simulate the real exam experience with timed 180-question tests.',
  },
];

const stats = [
  { value: '95%', label: 'Pass Rate' },
  { value: '1,800+', label: 'Practice Questions' },
  { value: '500+', label: 'Flashcards' },
  { value: '50K+', label: 'Students' },
];

const pricing = [
  {
    name: 'Free Starter',
    price: 0,
    features: [
      '500+ flashcards',
      '1 full-length practice exam',
      'Basic feedback',
      'Progress tracking',
    ],
  },
  {
    name: 'Mid-Level',
    price: '9.99',
    features: [
      'All Free features',
      '1,000+ flashcards',
      '3 full-length practice exams',
      'More detailed feedback',
      'Formula calculator',
      'Advanced analytics',
    ],
  },
  {
    name: 'High-End',
    price: '14.99',
    popular: true,
    features: [
      'All Mid-Level features',
      '2,000+ flashcards',
      '6 full-length practice exams',
      'Detailed feedback per question',
      'Personalized study plan',
    ],
  },
  {
    name: 'Corporate',
    price: '19.99',
    features: [
      'All High-End features',
      'Unlimited flashcards',
      'Team management',
      'Company-wide analytics',
      'Dedicated support',
    ],
  },
];
