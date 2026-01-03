'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqSections = [
  {
    title: 'General Questions',
    items: [
      {
        question: 'What is PMP Study Pro?',
        answer:
          'PMP Study Pro is a comprehensive PMP (Project Management Professional) exam preparation platform. We offer adaptive learning, spaced repetition flashcards, practice questions, mock exams, and detailed study guides aligned with the latest PMI exam content outline.',
      },
      {
        question: 'Is PMP Study Pro officially affiliated with PMI?',
        answer:
          'No, PMP Study Pro is an independent study platform and is not officially affiliated with, endorsed by, or a registered education provider of PMI (Project Management Institute).',
      },
      {
        question: 'What versions of the PMP exam do you cover?',
        answer:
          "Our platform covers the current PMP exam content outline including the Agile, Hybrid, and Predictive methodologies. We update our content regularly to reflect PMI's latest exam changes.",
      },
    ],
  },
  {
    title: 'Pricing & Subscriptions',
    items: [
      {
        question: 'What subscription tiers do you offer?',
        answer:
          'We offer four tiers: Free (limited features), Mid-Level (full study guides), High-End (includes mock exams and custom flashcards), and Corporate (team management and analytics). Visit our pricing page for detailed feature comparisons.',
      },
      {
        question: 'Can I switch subscription tiers?',
        answer:
          "Yes, you can upgrade or downgrade your subscription at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the start of your next billing cycle.",
      },
      {
        question: 'Do you offer a refund?',
        answer:
          "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our platform, contact support within 30 days of your purchase for a full refund.",
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual corporate subscriptions.',
      },
    ],
  },
  {
    title: 'Study Features',
    items: [
      {
        question: 'How does the spaced repetition system work?',
        answer:
          'Our algorithm uses the SM-2 algorithm to schedule flashcards based on your performance. Cards you find difficult appear more frequently, while easier cards are shown less often, optimizing your study time.',
      },
      {
        question: 'How many practice questions are included?',
        answer:
          'The number of practice questions varies by subscription tier. Pro and Corporate subscribers get unlimited access to our question bank of 1,000+ PMP exam-style questions.',
      },
      {
        question: 'Are the mock exams similar to the real PMP exam?',
        answer:
          'Yes, our mock exams simulate the actual PMP exam format with 180 questions, 230 minutes time limit, and questions covering all three exam domains (People, Process, Business Environment).',
      },
      {
        question: 'Can I create custom flashcards?',
        answer:
          'Pro and Corporate subscribers can create unlimited custom flashcards. Free subscribers can use our pre-made flashcard decks.',
      },
    ],
  },
  {
    title: 'Technical Support',
    items: [
      {
        question: 'How do I get technical support?',
        answer:
          'You can reach our support team via email at support@pmpstudypro.com or through the contact form on our website. Premium subscribers receive priority support with 24-hour response time.',
      },
      {
        question: 'Is there a mobile app?',
        answer:
          'PMP Study Pro is fully responsive and works on all devices including smartphones and tablets. A dedicated mobile app is planned for future release.',
      },
      {
        question: 'Does the platform work offline?',
        answer:
          'Yes, our Progressive Web App (PWA) supports offline access to previously loaded content. Your progress syncs automatically when you reconnect to the internet.',
      },
    ],
  },
  {
    title: 'Account & Billing',
    items: [
      {
        question: 'How do I cancel my subscription?',
        answer:
          "You can cancel your subscription from your account settings. Cancellations take effect at the end of your current billing period. You'll continue to have access until then.",
      },
      {
        question: 'Can I transfer my account to someone else?',
        answer:
          'Accounts are non-transferable. However, you can export your study data and share it with another user if desired.',
      },
      {
        question: 'How do I download my data?',
        answer:
          'You can export all your study data (flashcards, practice history, progress reports) from your account settings in JSON or CSV format.',
      },
    ],
  },
];

function FAQAccordion({
  item,
  isOpen,
  onClick,
}: {
  item: FAQItem;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onClick}
        className="w-full py-4 px-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && <div className="px-4 pb-4 text-gray-700 dark:text-gray-200">{item.answer}</div>}
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-md-surface">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-700 dark:text-gray-200 text-center mb-12">
          Find answers to common questions about PMP Study Pro
        </p>

        {faqSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 px-4">
              {section.title}
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {section.items.map((item, itemIndex) => {
                const key = `${sectionIndex}-${itemIndex}`;
                return (
                  <FAQAccordion
                    key={itemIndex}
                    item={item}
                    isOpen={!!openItems[key]}
                    onClick={() => toggleItem(sectionIndex, itemIndex)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-12 p-6 bg-md-primary-container dark:bg-md-primary-container rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-700 dark:text-gray-200 mb-4">
            Can&apos;t find the answer you&apos;re looking for? Please reach out to our support
            team.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-2 bg-md-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
