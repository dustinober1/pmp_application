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
				{ href: `${base}/faq`, label: 'FAQ' }
			]
		},
		{
			title: 'Legal',
			links: [
				{ href: `${base}/privacy`, label: 'Privacy Policy' },
				{ href: `${base}/terms`, label: 'Terms of Service' }
			]
		}
	];
</script>

<footer class="bg-muted/30 border-t border-border mt-auto pt-16 pb-12" role="contentinfo">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
			<!-- Company Info -->
			<div class="col-span-1">
				<a href="{base}/" class="flex items-center gap-3 group" aria-label="PMP Study Pro - Home">
					<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-soft transition-transform group-hover:scale-105 duration-300">
						<span class="text-primary-foreground font-serif font-bold text-xl">P</span>
					</div>
					<span class="text-lg font-serif font-bold text-foreground">PMP Study Pro</span>
				</a>
				<p class="mt-4 text-sm text-muted-foreground leading-relaxed">
					Comprehensive PMP exam preparation with adaptive learning and real-time analytics.
				</p>
			</div>

			<!-- Footer Sections -->
			{#each sections as section}
				<div>
					<h3 class="text-sm font-bold text-foreground font-serif uppercase tracking-wider">
						{section.title}
					</h3>
					<ul class="mt-4 space-y-3">
						{#each section.links as link}
							<li>
								<a
									href={link.href}
									class="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
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
		<div class="mt-12 pt-8 border-t border-border/50">
			<p class="text-sm text-muted-foreground text-center">
				© {currentYear} PMP Study Pro. All rights reserved.
			</p>
		</div>
	</div>
</footer>
