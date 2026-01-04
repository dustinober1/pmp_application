<script lang="ts">
	import { base } from '$app/paths';
	interface FooterLink {
		href: string;
		label: string;
	}

	interface FooterSection {
		title: string;
		links: FooterLink[];
	}

	const currentYear = new Date().getFullYear();

	const sections: FooterSection[] = [
		{
			title: 'Resources',
			links: [
				{ href: `${base}/blog`, label: 'Blog' },
				{ href: `${base}/study-guide`, label: 'Study Guide' },
				{ href: `${base}/faq`, label: 'FAQ' }
			]
		},
		{
			title: 'Legal',
			links: [
				{ href: `${base}/privacy`, label: 'Privacy Policy' },
				{ href: `${base}/terms`, label: 'Terms of Service' },
				{ href: `${base}/contact`, label: 'Contact' }
			]
		}
	];
</script>

<footer class="bg-md-surface border-t border-md-outline-variant py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
			<!-- Company Info -->
			<div class="col-span-1">
				<a href="{base}/" class="flex items-center gap-2" aria-label="PMP Study Pro - Home">
					<div class="w-8 h-8 rounded-full bg-md-primary flex items-center justify-center">
						<span class="text-white font-bold">P</span>
					</div>
					<span class="text-lg font-semibold">PMP Study Pro</span>
				</a>
				<p class="mt-4 text-sm text-gray-400">
					Comprehensive PMP exam preparation with adaptive learning and real-time analytics.
				</p>
			</div>

			<!-- Footer Sections -->
			{#each sections as section}
				<div>
					<h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider">
						{section.title}
					</h3>
					<ul class="mt-4 space-y-3">
						{#each section.links as link}
							<li>
								<a
									href={link.href}
									class="text-gray-400 hover:text-white transition-colors text-sm"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<!-- Data Privacy Notice -->
		<div class="mt-8 p-4 bg-md-primary-container rounded-lg border-l-4 border-md-primary">
			<div class="flex items-start gap-3">
				<svg
					class="w-5 h-5 text-md-primary flex-shrink-0 mt-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
				<div class="flex-1">
					<h4 class="text-sm font-semibold text-md-on-primary-container mb-1">
						Data Privacy Notice
					</h4>
					<p class="text-xs text-md-on-primary-container/80">
						All your data is stored locally in your browser. We do not collect, transmit, or store any
						personal information on our servers. Your study progress, flashcards, and preferences remain
						private on your device.
					</p>
				</div>
			</div>
		</div>

		<!-- Copyright -->
		<div class="mt-8 pt-8 border-t border-gray-800">
			<p class="text-sm text-gray-400 text-center">
				© {currentYear} PMP Study Pro. All rights reserved.
			</p>
		</div>
	</div>
</footer>
