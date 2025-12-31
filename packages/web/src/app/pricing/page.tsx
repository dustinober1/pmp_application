'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_TIER_FEATURES } from '@pmp/shared';

export default function PricingPage() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Pricing configuration
  const tiers = [
    {
      id: 'free',
      name: 'Free Starter',
      price: 0,
      description: 'Perfect for exploring the platform and starting your PMP journey.',
      features: DEFAULT_TIER_FEATURES['free'],
      buttonText: user ? 'Current Plan' : 'Get Started',
      buttonHref: user ? '/dashboard' : '/register',
      highlight: false,
    },
    {
      id: 'high-end', // Mapping "Pro" to "high-end" for simplicity in UI, bypassing mid-level for now as per common SaaS patterns
      name: 'PMP Pro',
      price: billingPeriod === 'monthly' ? 29 : 290,
      description: 'Everything you need to pass the exam with confidence.',
      features: DEFAULT_TIER_FEATURES['high-end'],
      buttonText: user?.tier === 'high-end' ? 'Current Plan' : 'Upgrade to Pro',
      buttonHref: '/checkout?tier=high-end',
      highlight: true,
      popular: true,
    },
    {
      id: 'corporate',
      name: 'Corporate Team',
      price: billingPeriod === 'monthly' ? 99 : 990,
      description: 'Manage a team of PMP candidates with advanced reporting.',
      features: DEFAULT_TIER_FEATURES['corporate'],
      buttonText: user?.tier === 'corporate' ? 'Current Plan' : 'Start Team Plan',
      buttonHref: '/checkout?tier=corporate',
      highlight: false,
    },
  ];

  return (
    <div className="bg-gray-900 min-h-screen py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-400">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Invest in your PMP success
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            Choose the plan that fits your study needs. All plans include access to our core
            learning engine.
          </p>
        </div>

        {/* Billing Toggle (Visual only for now if pricing is fixed, but essential for SaaS) */}
        <div className="mt-16 flex justify-center">
          <div className="relative flex bg-gray-800 rounded-full p-1 border border-gray-700">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`${
                billingPeriod === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white'
              } rounded-full px-6 py-2 text-sm font-medium transition-all duration-200`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`${
                billingPeriod === 'annual'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white'
              } rounded-full px-6 py-2 text-sm font-medium transition-all duration-200`}
            >
              Annual <span className="text-xs ml-1 opacity-75">(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-white/10 ${
                tier.highlight
                  ? 'bg-white/5 ring-primary-500 scale-105 shadow-xl relative'
                  : 'bg-gray-800/20'
              } xl:p-10 transition-transform hover:-translate-y-1`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <h3 id={tier.id} className="text-lg font-semibold leading-8 text-white">
                  {tier.name}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-300">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-white">${tier.price}</span>
                <span className="text-sm font-semibold leading-6 text-gray-300">
                  /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                </span>
              </p>
              <Link
                href={tier.buttonHref}
                className={`mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.highlight
                    ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-500 focus-visible:outline-primary-500'
                    : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
                }`}
              >
                {tier.buttonText}
              </Link>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10">
                <li className="flex gap-x-3">
                  <span className="text-primary-400">✓</span>
                  {tier.features.studyGuidesAccess === 'full'
                    ? 'Full Study Guides'
                    : 'Limited Study Guides'}
                </li>
                <li className="flex gap-x-3">
                  <span className="text-primary-400">✓</span>
                  {tier.features.flashcardsLimit === 'unlimited'
                    ? 'Unlimited Flashcards'
                    : `${tier.features.flashcardsLimit} Flashcards`}
                </li>
                <li className="flex gap-x-3">
                  <span className="text-primary-400">✓</span>
                  {tier.features.practiceQuestionsPerDomain} Questions / Domain
                </li>
                <li className="flex gap-x-3">
                  <span className={tier.features.mockExams ? 'text-primary-400' : 'text-gray-600'}>
                    {tier.features.mockExams ? '✓' : '✕'}
                  </span>
                  <span className={tier.features.mockExams ? '' : 'text-gray-500'}>Mock Exams</span>
                </li>
                <li className="flex gap-x-3">
                  <span
                    className={
                      tier.features.advancedAnalytics ? 'text-primary-400' : 'text-gray-600'
                    }
                  >
                    {tier.features.advancedAnalytics ? '✓' : '✕'}
                  </span>
                  <span className={tier.features.advancedAnalytics ? '' : 'text-gray-500'}>
                    Advanced Analytics
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <span
                    className={tier.features.teamManagement ? 'text-primary-400' : 'text-gray-600'}
                  >
                    {tier.features.teamManagement ? '✓' : '✕'}
                  </span>
                  <span className={tier.features.teamManagement ? '' : 'text-gray-500'}>
                    Team Management
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
