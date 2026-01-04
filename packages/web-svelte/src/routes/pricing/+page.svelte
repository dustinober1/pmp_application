<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import Navbar from '$lib/components/Navbar.svelte';

	let billingPeriod = 'monthly';
	let user = null;

	authStore.subscribe((auth) => {
		user = auth.user;
	});

	const tiers = [
		{
			id: 'free',
			name: 'Free Starter',
			price: 0,
			description: 'Perfect for exploring our platform and starting your PMP journey.',
			features: [
				'500+ Flashcards',
				'1 Full-length Practice Exam',
				'Basic Progress Tracking',
				'Study Guide Access',
				'SM-2 Spaced Repetition'
			],
			buttonText: user?.tier === 'free' ? 'Current Plan' : 'Get Started Free',
			buttonHref: user ? '/dashboard' : '/auth/register',
			highlight: false
		},
		{
			id: 'pro',
			name: 'Pro',
			monthlyPrice: 9.99,
			annualPrice: 99.99,
			description: 'Everything you need to pass the PMP exam on your first try.',
			features: [
				'All Free Features',
				'1,800+ Flashcards',
				'Unlimited Practice Exams',
				'Detailed Answer Explanations',
				'Formula Calculator with Steps',
				'Personalized Study Plan',
				'Custom Flashcard Creation',
				'Priority Support'
			],
			buttonText:
				user?.tier === 'pro' ? 'Current Plan' : 'Start 7-Day Free Trial',
			buttonHref: '/checkout?tier=pro',
			highlight: true,
			popular: true,
			trial: true
		},
		{
			id: 'corporate',
			name: 'Corporate Team',
			monthlyPrice: 14.99,
			annualPrice: 149.99,
			perSeat: true,
			description: 'Empower your entire team with advanced analytics and management.',
			features: [
				'All Pro Features',
				'Team Management Dashboard',
				'Company-wide Analytics',
				'Bulk User Management',
				'Progress Reports & Exports',
				'Dedicated Account Manager',
				'Custom Onboarding',
				'SSO Integration (coming soon)'
			],
			buttonText:
				user?.tier === 'corporate' ? 'Current Plan' : 'Start Team Trial',
			buttonHref: '/checkout?tier=corporate',
			highlight: false,
			trial: true
		}
	];

	const faqs = [
		{
			question: 'What happens after the 7-day free trial?',
			answer:
				"You'll be automatically charged at the end of your trial unless you cancel. You can cancel anytime from your account settings with no questions asked."
		},
		{
			question: 'Can I switch plans later?',
			answer:
				'Absolutely! You can upgrade or downgrade your plan at any time. If you upgrade, you will get immediate access to new features. If you downgrade, the change takes effect at your next billing cycle.'
		},
		{
			question: 'Is there a money-back guarantee?',
			answer:
				'Yes! We offer a 30-day money-back guarantee. If you are not satisfied with your purchase, contact us within 30 days for a full refund.'
		},
		{
			question: 'How does the Corporate plan work?',
			answer:
				'The Corporate plan is priced per seat. You can add or remove team members at any time. Each member gets full Pro access plus team collaboration features.'
		}
	];

	function getPrice(tier) {
		if (tier.price === 0) return 'Free';
		const price = billingPeriod === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
		return `$${price?.toFixed(2)}`;
	}
</script>

<div class="min-h-screen bg-gray-50">
	<Navbar />

	<!-- Hero Section -->
	<section class="relative overflow-hidden py-20 sm:py-28 bg-gradient-to-br from-indigo-50 to-purple-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
			<div class="text-center">
				<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
					Simple, <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
						>Transparent</span
					>
					Pricing
				</h1>
				<p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
					Start your 7-day free trial today. No credit card required to get started.
				</p>

				<!-- Billing Toggle -->
				<div class="flex justify-center mb-12">
					<div
						class="relative flex bg-white rounded-full p-1 border border-gray-200 shadow-sm"
					>
						<button
							on:click={() => (billingPeriod = 'monthly')}
							class="rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 {billingPeriod ===
							'monthly'
								? 'bg-indigo-600 text-white'
								: 'text-gray-600 hover:text-gray-900'}"
						>
							Monthly
						</button>
						<button
							on:click={() => (billingPeriod = 'annual')}
							class="rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 {billingPeriod ===
							'annual'
								? 'bg-indigo-600 text-white'
								: 'text-gray-600 hover:text-gray-900'}"
						>
							Annual
							<span
								class="text-xs ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full"
							>
								Save 17%
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Pricing Cards -->
	<section class="pb-20 -mt-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
				{#each tiers as tier}
					<div
						class="card relative transition-all duration-300 hover:-translate-y-2 bg-white rounded-lg shadow-lg p-8 {tier.highlight
							? 'ring-2 ring-indigo-600 -translate-y-4 shadow-xl'
							: ''}"
					>
						{#if tier.popular}
							<span
								class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-medium rounded-full bg-indigo-600 text-white"
							>
								Most Popular
							</span>
						{/if}

						{#if tier.trial && tier.id !== 'free'}
							<span
								class="absolute -top-3 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full"
							>
								7-Day Free Trial
							</span>
						{/if}

						<h3 class="text-xl font-bold text-gray-900 mt-2">{tier.name}</h3>
						<p class="text-sm text-gray-600 mt-2">{tier.description}</p>

						<div class="mt-6 mb-6">
							<span class="text-4xl font-bold text-gray-900">{getPrice(tier)}</span>
							{#if tier.price !== 0}
								<span class="text-gray-600 ml-1">
									/{billingPeriod === 'monthly' ? 'mo' : 'yr'}
									{tier.perSeat ? ' per seat' : ''}
								</span>
							{/if}
						</div>

						<a
							href={tier.buttonHref}
							class="block w-full text-center px-4 py-2 rounded-lg font-medium transition-colors mb-6 {tier.highlight
								? 'bg-indigo-600 text-white hover:bg-indigo-700'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						>
							{tier.buttonText}
						</a>

						<ul class="space-y-3">
							{#each tier.features as feature}
								<li class="flex items-start gap-3 text-sm text-gray-600">
									<svg
										class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									{feature}
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Trust Badges -->
	<section class="py-16 bg-gray-100">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
				<div>
					<p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
						30-Day
					</p>
					<p class="text-gray-600 mt-2">Money-Back Guarantee</p>
				</div>
				<div>
					<p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
						100%
					</p>
					<p class="text-gray-600 mt-2">ECO 2026 Aligned</p>
				</div>
				<div>
					<p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
						24/7
					</p>
					<p class="text-gray-600 mt-2">Access Anywhere</p>
				</div>
				<div>
					<p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
						Cancel
					</p>
					<p class="text-gray-600 mt-2">Anytime, No Hassle</p>
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="py-20">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 class="text-3xl font-bold text-center mb-12 text-gray-900">
				Frequently Asked Questions
			</h2>
			<div class="space-y-6">
				{#each faqs as faq}
					<div class="bg-white rounded-lg shadow p-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
						<p class="text-gray-600">{faq.answer}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20 relative overflow-hidden bg-gray-100">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
			<h2 class="text-3xl font-bold mb-4 text-gray-900">
				Ready to Start Your PMP Journey?
			</h2>
			<p class="text-gray-600 mb-8 max-w-xl mx-auto">
				Join thousands of project managers who have passed their PMP exam. Start
				your 7-day free trial today.
			</p>
			<div class="flex flex-wrap gap-4 justify-center">
				<a
					href="/auth/register"
					class="px-8 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg hover:bg-indigo-700 transition"
				>
					Start Your Free Trial
				</a>
				<a
					href="/study"
					class="px-8 py-3 border-2 border-gray-300 text-gray-700 text-lg font-medium rounded-lg hover:bg-gray-50 transition"
				>
					Explore Study Materials
				</a>
			</div>
		</div>
	</section>
</div>
