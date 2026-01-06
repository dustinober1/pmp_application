<script lang="ts">
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import {
		domainProgressStore,
		recentActivityStore,
		overallProgress,
		domains2026,
	} from "$lib/stores/dashboard";
	import LoadingState from "$lib/components/LoadingState.svelte";
	import CircularProgress from "$lib/components/CircularProgress.svelte";
	import StudyStatsGrid from "$lib/components/StudyStatsGrid.svelte";
	import Readiness2026Badge from "$lib/components/Readiness2026Badge.svelte";
	import CacheWarningBanner from "$lib/components/CacheWarningBanner.svelte";
	import DataManagement from "$lib/components/DataManagement.svelte";
	import Card from "$lib/components/ui/Card.svelte";
	import Button from "$lib/components/ui/Button.svelte";

	let loading = $state(true);

	// Get first name helper
	function getFirstName(name: string | null | undefined): string {
		if (!name || name.trim() === "") return "there";
		const parts = name.trim().split(" ");
		return parts[0] || "there";
	}

	// Get welcome subtitle
	function getWelcomeSubtitle(progress: number | undefined): string {
		if (progress === undefined || progress === 0) {
			return "Ready to begin your PMP journey? Your path strictly starts here.";
		}
		if (progress < 25) {
			return "Great start! Keep building your foundation across the domains.";
		}
		if (progress < 50) {
			return "You're making progress! Stay consistent and keep pushing forward.";
		}
		if (progress < 75) {
			return "Excellent work! You're more than halfway to your goal.";
		}
		return "Congratulations! You've mastered the material. Keep practicing!";
	}

	function formatDate(timestamp: Date | string): string {
		const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	}

	onMount(async () => {
		domainProgressStore.refreshFromActualData();
		loading = false;
	});

	let userName = $state<string>("");
	try {
		userName = localStorage.getItem("pmp_user_name") || "";
	} catch {}
</script>

{#if loading}
	<LoadingState message="Loading dashboard..." />
{:else}
	<div class="relative min-h-screen overflow-hidden bg-background">
		<!-- Organic Blob Backgrounds -->
		<div class="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-blob blur-3xl animate-float opacity-70"></div>
		<div class="absolute top-40 -right-20 w-80 h-80 bg-secondary/15 rounded-blob blur-3xl animate-float delay-1000 opacity-60"></div>
		<div class="absolute bottom-0 left-1/3 w-full h-96 bg-accent/30 rounded-t-[50%] blur-3xl opacity-40"></div>

		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
			<!-- Cache Warning Banner -->
			<CacheWarningBanner variant="full" />

			<!-- Header with Badge -->
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
				<div>
					<h1 class="text-4xl font-bold font-serif text-foreground">
						Welcome back, {getFirstName(userName)}! 
					</h1>
					<p class="text-lg text-muted-foreground mt-2 font-light">
						{getWelcomeSubtitle($overallProgress)}
					</p>
				</div>
				<div class="flex-shrink-0 w-full md:w-auto">
					<Readiness2026Badge variant="card" />
				</div>
			</div>

			<!-- Study Stats Grid -->
			<div class="mb-12">
				<StudyStatsGrid />
			</div>

			<!-- Overall Progress -->
			<Card class="p-8 mb-12 flex flex-col md:flex-row items-center gap-8">
				<div class="flex-1">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-2xl font-bold font-serif text-foreground">Overall Progress</h2>
						<span class="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">2026 ECO</span>
					</div>
					<p class="text-muted-foreground leading-relaxed">
						Your progress across all three domains of the 2026 PMP Exam Content Outline.
						This score reflects your Flashcard mastery and Question practice performance.
					</p>
				</div>
				<div class="flex-shrink-0">
					{#if $overallProgress !== undefined}
						<CircularProgress
							percentage={$overallProgress}
							label="Complete"
							size={160}
							strokeWidth={12}
							color="blue"
						/>
					{/if}
				</div>
			</Card>

			<div class="grid lg:grid-cols-3 gap-8">
				<!-- Domain Progress -->
				<div class="lg:col-span-2 space-y-8">
					<div class="bg-card rounded-[2rem] p-1">
						<div class="flex items-center justify-between mb-6 px-4">
							<h2 class="text-2xl font-bold font-serif text-foreground">2026 Domain Progress</h2>
							<p class="text-sm text-muted-foreground hidden sm:block">Track your mastery</p>
						</div>

						<div class="grid md:grid-cols-3 gap-6">
							{#each $domainProgressStore.domains as domain}
								{@const domainInfo = domains2026.find((d) => d.domainId === domain.domainId)}
								<!-- Map domains to color variants manually for now to match organic palette -->
								{@const color = domain.domainId === "people" ? "blue" : domain.domainId === "process" ? "purple" : "emerald"}

								<Card variant="default" class="p-6 transition-transform hover:scale-105 hover:shadow-hover cursor-default">
									<div class="flex justify-between items-center mb-4">
										<div>
											<h3 class="font-bold font-serif text-foreground">{domain.domainName}</h3>
											<p class="text-xs text-muted-foreground">{domainInfo?.description || ""}</p>
										</div>
										<span class="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
											{domainInfo?.weighting || 0}%
										</span>
									</div>

									<div class="flex justify-center mb-4">
										<CircularProgress
											percentage={Math.round(
												((domain.flashcardsMastered + (domain.questionsMastered || 0)) /
												 (domain.flashcardsTotal + (domain.questionsTotal || 0))) * 100
											) || 0}
											label={domain.domainName}
											size={100}
											strokeWidth={8}
											color={color}
											showLabel={true}
											description=""
										/>
									</div>

									<div class="space-y-2 text-sm">
										<div class="flex justify-between border-b border-border/50 pb-1">
											<span class="text-muted-foreground">Flashcards:</span>
											<span class="font-bold text-foreground"
												>{Math.round((domain.flashcardsTotal > 0 ? (domain.flashcardsMastered / domain.flashcardsTotal) * 100 : 0))}%</span
											>
										</div>
										<div class="flex justify-between border-b border-border/50 pb-1">
											<span class="text-muted-foreground">Questions:</span>
											<span class="font-bold text-foreground"
												>{Math.round((domain.questionsTotal && domain.questionsTotal > 0 ? ((domain.questionsMastered || 0) / domain.questionsTotal) * 100 : 0))}%</span
											>
										</div>
										<div class="flex justify-between pt-1">
											<span class="text-muted-foreground">Accuracy:</span>
											<span class="font-bold text-foreground">{domain.practiceAccuracy || 0}%</span>
										</div>
									</div>
								</Card>
							{/each}
						</div>
					</div>
				</div>

				<!-- Quick Actions & Activity -->
				<div class="space-y-8">
					<Card class="p-6">
						<h2 class="text-xl font-bold font-serif text-foreground mb-6">Study Hub</h2>

						<div class="space-y-4 mb-8">
							<a href="{base}/flashcards" class="group block" aria-label="Access flashcards for smart review">
								<Card variant="feature" class="p-4 flex items-center justify-between transition-all hover:bg-primary/5">
									<div>
										<p class="text-sm font-medium text-muted-foreground">Flashcards</p>
										<p class="text-lg font-bold text-primary">Smart Review</p>
									</div>
									<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
									</div>
								</Card>
							</a>

							<a href="{base}/study" class="group block" aria-label="Access study guide to continue reading">
								<Card variant="feature" class="p-4 flex items-center justify-between transition-all hover:bg-secondary/5">
									<div>
										<p class="text-sm font-medium text-muted-foreground">Study Guide</p>
										<p class="text-lg font-bold text-secondary">Continue Reading</p>
									</div>
									<div class="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
									</div>
								</Card>
							</a>
						</div>

						<!-- Recent Activity -->
						<div class="border-t border-border/50 pt-6">
							<h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Recent Activity</h3>
							<div class="space-y-4">
								{#if $recentActivityStore.activities && $recentActivityStore.activities.length > 0}
									{#each $recentActivityStore.activities.slice(0, 3) as activity}
										<div class="flex gap-3">
											<div class="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
												</svg>
											</div>
											<div class="min-w-0 flex-1">
												<p class="text-sm font-medium text-foreground truncate">{activity.targetName}</p>
												<p class="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
											</div>
										</div>
									{/each}
								{:else}
									<p class="text-sm text-muted-foreground italic text-center py-4">
										Your journey begins with your first study session!
									</p>
								{/if}
							</div>
						</div>
					</Card>

					<div class="opacity-80 hover:opacity-100 transition-opacity">
						<DataManagement />
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
