<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/stores/i18n';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
</script>

<div class="relative min-h-screen overflow-hidden bg-background">
	<!-- Organic Blob Backgrounds -->
	<div class="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-blob blur-3xl animate-float opacity-70"></div>
	<div class="absolute top-40 -right-20 w-80 h-80 bg-secondary/15 rounded-blob blur-3xl animate-float delay-1000 opacity-60"></div>
	<div class="absolute bottom-0 left-1/3 w-full h-96 bg-accent/30 rounded-t-[50%] blur-3xl opacity-40"></div>

	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
		<div class="text-center space-y-12 max-w-4xl mx-auto">
			
			<!-- Privacy Notice -->
			<div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/10 border border-secondary/20 text-secondary-foreground shadow-soft transition-transform hover:scale-105">
				<span class="text-lg"></span>
				<span class="text-sm font-medium">Progress stored locally in your browser</span>
			</div>

			<div class="space-y-6">
				<h1 class="text-5xl md:text-7xl font-bold font-serif text-foreground leading-tight">
					PMP Study <span class="text-primary italic">Pro</span>
				</h1>
				<p class="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
					Free, open-source preparation for the 2026 PMP® certification. <br class="hidden sm:block"/>
					Rooted in simplicity, grown for success.
				</p>
			</div>

 <!-- Action Buttons -->
			<div class="flex flex-col sm:flex-row gap-6 justify-center pt-4">
				<Button href="{base}/dashboard" size="lg" variant="primary">
					Start Studying
					<span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
				</Button>
				<Button href="{base}/study" size="lg" variant="outline">
					View Guide
				</Button>
			</div>

			<!-- ECO Update Notice -->
			<div class="mt-16 inline-flex flex-col gap-2 p-6 rounded-3xl bg-white/40 backdrop-blur-sm border border-border/50 shadow-soft max-w-2xl mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-500">
				<div class="flex items-center justify-center gap-2 text-primary">
					<span class="text-2xl"></span>
					<span class="font-bold font-serif text-lg">Cultivated for July 2026 ECO</span>
				</div>
				<p class="text-sm text-foreground/80">Updated domain percentages, AI integration, and sustainability focus.</p>
			</div>
		</div>

		<!-- ECO Domains Grid -->
		<div class="mt-24">
			<h2 class="text-3xl md:text-4xl font-bold font-serif text-center mb-12 text-foreground">
				Examination Content <span class="text-secondary">Outline</span>
			</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<Card variant="feature" class="p-8 text-center rounded-tl-[4rem] rounded-br-[4rem]">
					<div class="text-5xl font-bold font-serif text-primary mb-2">33%</div>
					<div class="text-xl font-bold text-foreground mb-2">People</div>
					<p class="text-muted-foreground leading-relaxed">Soft skills, leadership, and team development.</p>
				</Card>
				
				<Card variant="feature" class="p-8 text-center rounded-[2.5rem]">
					<div class="text-5xl font-bold font-serif text-secondary mb-2">41%</div>
					<div class="text-xl font-bold text-foreground mb-2">Process</div>
					<p class="text-muted-foreground leading-relaxed">Technical project management methodologies.</p>
				</Card>
				
				<Card variant="feature" class="p-8 text-center rounded-tr-[4rem] rounded-bl-[4rem]">
					<div class="text-5xl font-bold font-serif text-destructive mb-2">26%</div>
					<div class="text-xl font-bold text-foreground mb-2">Business Env.</div>
					<p class="text-muted-foreground leading-relaxed">Strategic alignment and compliance.</p>
				</Card>
			</div>
		</div>

		<!-- Key Themes -->
		<div class="mt-32">
			<h3 class="text-3xl font-bold font-serif text-center mb-12">Natural Progression</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<Card variant="default" class="p-6 flex items-start gap-4 hover:rotate-1 transition-transform">
					<div class="text-3xl bg-accent/20 w-12 h-12 rounded-full flex items-center justify-center"></div>
					<div>
						<h4 class="font-bold text-lg mb-1">AI Integration</h4>
						<p class="text-muted-foreground text-sm">Leveraging GenAI for risk and data analysis.</p>
					</div>
				</Card>

				<Card variant="default" class="p-6 flex items-start gap-4 hover:-rotate-1 transition-transform">
					<div class="text-3xl bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center"></div>
					<div>
						<h4 class="font-bold text-lg mb-1">Sustainability & ESG</h4>
						<p class="text-muted-foreground text-sm">Environmental and social governance impact.</p>
					</div>
				</Card>

				<Card variant="default" class="p-6 flex items-start gap-4 hover:rotate-1 transition-transform">
					<div class="text-3xl bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center"></div>
					<div>
						<h4 class="font-bold text-lg mb-1">Methodology Shift</h4>
						<p class="text-muted-foreground text-sm">60% Adaptive/Hybrid vs 40% Predictive.</p>
					</div>
				</Card>

				<Card variant="default" class="p-6 flex items-start gap-4 hover:-rotate-1 transition-transform">
					<div class="text-3xl bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center"></div>
					<div>
						<h4 class="font-bold text-lg mb-1">Exam Logistics</h4>
						<p class="text-muted-foreground text-sm">180 Questions over 230 Minutes.</p>
					</div>
				</Card>
			</div>
		</div>

		<!-- Feature Links -->
		<div class="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
 <!-- Using Card for these as well for consistency -->
			<a href="{base}/study" class="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-3xl" aria-label="View study guide for PMP exam preparation">
				<Card class="h-full p-8 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-hover">
					<div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500 origin-left"></div>
					<h3 class="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">Study Guide</h3>
					<p class="text-muted-foreground">Comprehensive summary of key concepts.</p>
				</Card>
			</a>
			
			<a href="{base}/flashcards" class="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-3xl" aria-label="Access flashcards for spaced repetition learning">
				<Card class="h-full p-8 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-hover">
					<div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500 origin-left"></div>
					<h3 class="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">Flashcards</h3>
					<p class="text-muted-foreground">Memorize terms and definitions naturally.</p>
				</Card>
			</a>
			
			<a href="{base}/practice" class="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-3xl" aria-label="Start practice quizzes to test your knowledge">
				<Card class="h-full p-8 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-hover">
					<div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500 origin-left"></div>
					<h3 class="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">Practice</h3>
					<p class="text-muted-foreground">Test your knowledge with quizzes.</p>
				</Card>
			</a>
		</div>
	</div>
</div>

<style>
 /* Custom animations for organic feel */
 @keyframes float {
 0% { transform: translate(0px, 0px); }
 50% { transform: translate(10px, -20px); }
 100% { transform: translate(0px, 0px); }
 }
 .animate-float {
 animation: float 8s ease-in-out infinite;
 }
</style>
