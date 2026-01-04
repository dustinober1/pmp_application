<script lang="ts">
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
			title: 'Product',
			links: [
				{ href: '/#features', label: 'Features' },
				{ href: '/pricing', label: 'Pricing' },
				{ href: '/#testimonials', label: 'Testimonials' }
			]
		},
		{
			title: 'Resources',
			links: [
				{ href: '/blog', label: 'Blog' },
				{ href: '/study-guide', label: 'Study Guide' },
				{ href: '/faq', label: 'FAQ' }
			]
		},
		{
			title: 'Legal',
			links: [
				{ href: '/privacy', label: 'Privacy Policy' },
				{ href: '/terms', label: 'Terms of Service' },
				{ href: '/contact', label: 'Contact' }
			]
		}
	];
</script>

<footer class="bg-md-surface border-t border-md-outline-variant py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
			<!-- Company Info -->
			<div class="col-span-1">
				<a href="/" class="flex items-center gap-2" aria-label="PMP Study Pro - Home">
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

		<!-- Copyright -->
		<div class="mt-8 pt-8 border-t border-gray-800">
			<p class="text-sm text-gray-400 text-center">
				© {currentYear} PMP Study Pro. All rights reserved.
			</p>
		</div>
	</div>
</footer>
