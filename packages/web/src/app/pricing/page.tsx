"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
const Footer = dynamic(() => import("@/components/Footer").then((mod) => mod.Footer), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

export default function PricingPage() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly",
  );

  const tiers = [
    {
      id: "free",
      name: "Free Starter",
      price: 0,
      description:
        "Perfect for exploring our platform and starting your PMP journey.",
      features: [
        "500+ Flashcards",
        "1 Full-length Practice Exam",
        "Basic Progress Tracking",
        "Study Guide Access",
        "SM-2 Spaced Repetition",
      ],
      buttonText: user?.tier === "free" ? "Current Plan" : "Get Started Free",
      buttonHref: user ? "/dashboard" : "/auth/register",
      highlight: false,
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      description:
        "Everything you need to pass the PMP exam on your first try.",
      features: [
        "All Free Features",
        "1,800+ Flashcards",
        "Unlimited Practice Exams",
        "Detailed Answer Explanations",
        "Formula Calculator with Steps",
        "Personalized Study Plan",
        "Custom Flashcard Creation",
        "Priority Support",
      ],
      buttonText:
        user?.tier === "pro" ? "Current Plan" : "Start 7-Day Free Trial",
      buttonHref: "/checkout?tier=pro",
      highlight: true,
      popular: true,
      trial: true,
    },
    {
      id: "corporate",
      name: "Corporate Team",
      monthlyPrice: 14.99,
      annualPrice: 149.99,
      perSeat: true,
      description:
        "Empower your entire team with advanced analytics and management.",
      features: [
        "All Pro Features",
        "Team Management Dashboard",
        "Company-wide Analytics",
        "Bulk User Management",
        "Progress Reports & Exports",
        "Dedicated Account Manager",
        "Custom Onboarding",
        "SSO Integration (coming soon)",
      ],
      buttonText:
        user?.tier === "corporate" ? "Current Plan" : "Start Team Trial",
      buttonHref: "/checkout?tier=corporate",
      highlight: false,
      trial: true,
    },
  ];

  const faqs = [
    {
      question: "What happens after the 7-day free trial?",
      answer:
        "You'll be automatically charged at the end of your trial unless you cancel. You can cancel anytime from your account settings with no questions asked.",
    },
    {
      question: "Can I switch plans later?",
      answer:
        "Absolutely! You can upgrade or downgrade your plan at any time. If you upgrade, you'll get immediate access to new features. If you downgrade, the change takes effect at your next billing cycle.",
    },
    {
      question: "Is there a money-back guarantee?",
      answer:
        "Yes! We offer a 30-day money-back guarantee. If you're not satisfied with your purchase, contact us within 30 days for a full refund.",
    },
    {
      question: "How does the Corporate plan work?",
      answer:
        "The Corporate plan is priced per seat. You can add or remove team members at any time. Each member gets full Pro access plus team collaboration features.",
    },
  ];

  const getPrice = (tier: (typeof tiers)[0]) => {
    if (tier.price === 0) return "Free";
    const price =
      billingPeriod === "monthly" ? tier.monthlyPrice : tier.annualPrice;
    return `$${price?.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Organic Blur Shapes */}
        <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slideUp">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-md-on-background">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-md-on-surface-variant max-w-2xl mx-auto mb-8">
              Start your 7-day free trial today. No credit card required to get
              started.
            </p>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="relative flex bg-md-surface-container rounded-full p-1 border border-md-outline-variant">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`${
                    billingPeriod === "monthly"
                      ? "bg-md-primary text-md-on-primary"
                      : "text-md-on-surface-variant hover:text-md-on-surface"
                  } rounded-full px-6 py-2 text-sm font-medium transition-all duration-200`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("annual")}
                  className={`${
                    billingPeriod === "annual"
                      ? "bg-md-primary text-md-on-primary"
                      : "text-md-on-surface-variant hover:text-md-on-surface"
                  } rounded-full px-6 py-2 text-sm font-medium transition-all duration-200`}
                >
                  Annual{" "}
                  <span className="text-xs ml-1 px-2 py-0.5 bg-md-tertiary-container text-md-on-tertiary-container rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`card relative transition-all duration-300 hover:-translate-y-2 ${
                  tier.highlight
                    ? "ring-2 ring-md-primary md:-translate-y-4 shadow-xl bg-md-primary-container/10"
                    : ""
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-primary px-4">
                    Most Popular
                  </span>
                )}

                {tier.trial && tier.id !== "free" && (
                  <span className="absolute -top-3 right-4 bg-md-tertiary text-md-on-tertiary text-xs font-bold px-3 py-1 rounded-full">
                    7-Day Free Trial
                  </span>
                )}

                <h3 className="text-xl font-bold text-md-on-surface mt-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-md-on-surface-variant mt-2">
                  {tier.description}
                </p>

                <div className="mt-6 mb-6">
                  <span className="text-4xl font-bold text-md-on-surface">
                    {getPrice(tier)}
                  </span>
                  {tier.price !== 0 && (
                    <span className="text-md-on-surface-variant ml-1">
                      /{billingPeriod === "monthly" ? "mo" : "yr"}
                      {tier.perSeat && " per seat"}
                    </span>
                  )}
                </div>

                <Link
                  href={tier.buttonHref}
                  className={`btn w-full mb-6 ${tier.highlight ? "btn-primary" : "btn-secondary"}`}
                >
                  {tier.buttonText}
                </Link>

                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-md-on-surface-variant"
                    >
                      <svg
                        className="w-5 h-5 text-md-primary flex-shrink-0 mt-0.5"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-md-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-gradient">30-Day</p>
              <p className="text-md-on-surface-variant mt-2">
                Money-Back Guarantee
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gradient">100%</p>
              <p className="text-md-on-surface-variant mt-2">
                ECO 2026 Aligned
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gradient">24/7</p>
              <p className="text-md-on-surface-variant mt-2">Access Anywhere</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gradient">Cancel</p>
              <p className="text-md-on-surface-variant mt-2">
                Anytime, No Hassle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-md-on-surface">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h3 className="text-lg font-semibold text-md-on-surface mb-2">
                  {faq.question}
                </h3>
                <p className="text-md-on-surface-variant">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-md-surface-container-low">
        <div className="blur-shape bg-md-secondary w-full h-full opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-md-on-surface">
            Ready to Start Your PMP Journey?
          </h2>
          <p className="text-md-on-surface-variant mb-8 max-w-xl mx-auto">
            Join thousands of project managers who have passed their PMP exam.
            Start your 7-day free trial today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/register"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Start Your Free Trial
            </Link>
            <Link href="/study" className="btn btn-outline text-lg px-8 py-3">
              Explore Study Materials
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
