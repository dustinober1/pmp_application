<script lang="ts">
	import { base } from '$app/paths';
</script>

<div class="relative min-h-screen overflow-hidden bg-background">
	<!-- Organic Blob Backgrounds -->
	<div class="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-blob blur-3xl animate-float opacity-70"></div>
	<div class="absolute top-40 -right-20 w-80 h-80 bg-secondary/15 rounded-blob blur-3xl animate-float delay-1000 opacity-60"></div>
	<div class="absolute bottom-0 left-1/3 w-full h-96 bg-accent/30 rounded-t-[50%] blur-3xl opacity-40"></div>

	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
		<div class="max-w-md mx-auto text-center">
			<div class="mb-8 flex justify-center">
				<div class="bg-primary/10 p-4 rounded-full">
					<svg
						class="w-12 h-12 text-primary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
				</div>
			</div>

			<h1 class="text-3xl font-bold font-serif text-foreground sm:text-4xl mb-4">
				Exams Coming Soon
			</h1>

			<p class="text-lg text-muted-foreground mb-8">
				Full-length mock exams and timed practice modes are currently under development. Check back soon for updates!
			</p>

			<div class="space-y-4">
				<a
					href="{base}/practice"
					class="inline-flex items-center justify-center w-full px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
				>
					Go to Practice Questions
				</a>
				<a
					href="{base}/dashboard"
					class="inline-flex items-center justify-center w-full px-5 py-3 border border-border text-base font-medium rounded-md text-foreground bg-card hover:bg-muted transition-colors"
				>
					Return to Dashboard
				</a>
			</div>
		</div>
	</div>
</div>
