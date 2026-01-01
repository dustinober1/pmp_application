'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_TIER_FEATURES } from '@pmp/shared';

export default function PricingPage() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Pricing configuration with new pricing tiers
  const tiers = [
    {
      id: 'free',
      name: 'Free Starter',
      price: 0,
      priceDisplay: 'Free',
      description: 'Perfect for starting your PMP journey.',
      features: DEFAULT_TIER_FEATURES['free'],
      buttonText: user ? 'Current Plan' : 'Get Started',
      buttonHref: user ? '/dashboard' : '/auth/register',
      highlight: false,
      // Custom feature descriptions for display
      featureDisplay: {
        flashcards: '500+ Flashcards',
        practiceExams: '1 Full-length Practice Exam',
        feedback: 'Basic Feedback',
      },
    },
    {
      id: 'mid-level',
      name: 'Mid-Level',
      price: billingPeriod === 'monthly' ? 9.99 : 99.9,
      annualPrice: 99.9,
      description: 'Great for dedicated PMP candidates.',
      features: DEFAULT_TIER_FEATURES['mid-level'],
      buttonText: user?.tier === 'mid-level' ? 'Current Plan' : 'Upgrade to Mid-Level',
      buttonHref: '/checkout?tier=mid-level',
      highlight: false,
      featureDisplay: {
        flashcards: '1000+ Flashcards',
        practiceExams: '3 Full-length Practice Exams',
        feedback: 'More Detailed Feedback',
      },
    },
    {
      id: 'high-end',
      name: 'High-End',
      price: billingPeriod === 'monthly' ? 14.99 : 149.9,
      annualPrice: 149.9,
      description: 'Comprehensive preparation for exam success.',
      features: DEFAULT_TIER_FEATURES['high-end'],
      buttonText: user?.tier === 'high-end' ? 'Current Plan' : 'Upgrade to High-End',
      buttonHref: '/checkout?tier=high-end',
      highlight: true,
      popular: true,
      featureDisplay: {
        flashcards: '2000+ Flashcards',
        practiceExams: '6 Full-length Practice Exams',
        feedback: 'Detailed Feedback per Question',
      },
    },
    {
      id: 'corporate',
      name: 'Corporate Team',
      price: billingPeriod === 'monthly' ? 19.99 : 199.9,
      annualPrice: 199.9,
      perSeat: true,
      description: 'Manage your entire team with advanced analytics.',
      features: DEFAULT_TIER_FEATURES['corporate'],
      buttonText: user?.tier === 'corporate' ? 'Current Plan' : 'Start Team Plan',
      buttonHref: '/checkout?tier=corporate',
      highlight: false,
      featureDisplay: {
        flashcards: 'Unlimited Flashcards',
        practiceExams: '6 Full-length Practice Exams',
        feedback: 'Detailed Feedback + Company-wide Analytics',
      },
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

        {/* Billing Toggle */}
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
              Annual <span className="text-xs ml-1 opacity-75">(Save ~17%)</span>
            </button>
          </div>
        </div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4">
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
                {tier.priceDisplay ? (
                  <span className="text-4xl font-bold tracking-tight text-white">
                    {tier.priceDisplay}
                  </span>
                ) : (
                  <>
                    <span className="text-4xl font-bold tracking-tight text-white">
                      ${tier.price.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-300">
                      /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                    </span>
                    {tier.perSeat && <span className="text-xs text-gray-400 ml-1">per seat</span>}
                  </>
                )}
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
              <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10">
                <li className="flex gap-x-3">
                  <span className="text-primary-400 font-semibold">✓</span>
                  <span className="font-medium">{tier.featureDisplay.flashcards}</span>
                </li>
                <li className="flex gap-x-3">
                  <span className="text-primary-400 font-semibold">✓</span>
                  <span className="font-medium">{tier.featureDisplay.practiceExams}</span>
                </li>
                <li className="flex gap-x-3">
                  <span className="text-primary-400 font-semibold">✓</span>
                  <span className="font-medium">{tier.featureDisplay.feedback}</span>
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
                <li className="flex gap-x-3">
                  <span
                    className={
                      tier.features.personalizedStudyPlan ? 'text-primary-400' : 'text-gray-600'
                    }
                  >
                    {tier.features.personalizedStudyPlan ? '✓' : '✕'}
                  </span>
                  <span className={tier.features.personalizedStudyPlan ? '' : 'text-gray-500'}>
                    Personalized Study Plan
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Footer with copyright */}
        <div className="mt-20 text-center text-sm text-gray-500">
          <p>© 2026 PMP Study Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
