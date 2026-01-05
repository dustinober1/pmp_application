<script lang="ts">
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import {
		domainProgressStore,
		recentActivityStore,
		overallProgress,
		domains2026,
		getDomainWeighting
	} from "$lib/stores/dashboard";
	import LoadingState from "$lib/components/LoadingState.svelte";
	import ErrorState from "$lib/components/ErrorState.svelte";
	import CircularProgress from "$lib/components/CircularProgress.svelte";
	import StudyStatsGrid from "$lib/components/StudyStatsGrid.svelte";
	import Readiness2026Badge from "$lib/components/Readiness2026Badge.svelte";
	import CacheWarningBanner from "$lib/components/CacheWarningBanner.svelte";
	import DataManagement from "$lib/components/DataManagement.svelte";

	let loading = $state(true);

	// Get first name helper
	function getFirstName(name: string | null | undefined): string {
		if (!name || name.trim() === "") return "there";
		const parts = name.trim().split(" ");
		return parts[0] || "there";
	}

	// Get welcome subtitle based on overall progress
	function getWelcomeSubtitle(progress: number | undefined): string {
		if (progress === undefined || progress === 0) {
			return "Ready to begin your PMP journey? Your path to certification starts here.";
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
		if (progress < 100) {
			return "Almost there! Final push to PMP mastery.";
		}
		return "Congratulations! You've mastered the material. Keep practicing!";
	}

	// Format date helper
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

	// Truncate text helper
	function truncateAtWordBoundary(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		const truncated = text.substring(0, maxLength);
		const lastSpace = truncated.lastIndexOf(" ");
		return lastSpace > 0
			? truncated.substring(0, lastSpace) + "..."
			: truncated + "...";
	}

	onMount(async () => {
		domainProgressStore.refreshFromActualData();
		loading = false;
	});

	// Optional: Get user name from localStorage for personalization
	let userName = $state<string>("");
	try {
		userName = localStorage.getItem("pmp_user_name") || "";
	} catch {
		// localStorage not available
	}
</script>

{#if loading}
	<LoadingState message="Loading dashboard..." />
{:else}
	<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Cache Warning Banner -->
			<CacheWarningBanner variant="full" />

			<!-- Header with Badge -->
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
				<div>
					<h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
						Welcome back, {getFirstName(userName)}! 👋
					</h1>
					<p class="text-lg text-gray-700 dark:text-gray-300 mt-2">
						{getWelcomeSubtitle($overallProgress)}
					</p>
				</div>
				<div class="flex-shrink-0 w-full md:w-auto">
					<Readiness2026Badge variant="card" />
				</div>
			</div>

			<!-- Study Stats Grid -->
			<div class="mb-8">
				<StudyStatsGrid />
			</div>

			<!-- Overall Progress -->
			<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 mb-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Overall Progress</h2>
					<span class="text-sm text-gray-600 dark:text-gray-400">Based on 2026 ECO</span>
				</div>
				<div class="flex items-center gap-6">
					{#if $overallProgress !== undefined}
						<CircularProgress
							percentage={$overallProgress}
							label="Complete"
							size={140}
							strokeWidth={12}
							color="blue"
						/>
					{/if}
					<div class="flex-1">
						<p class="text-gray-600 dark:text-gray-400">
							Your progress across all three domains of the 2026 PMP Exam Content Outline.
							This score balances your Study Guide completion and Flashcard mastery.
						</p>
					</div>
				</div>
			</div>

			<div class="grid lg:grid-cols-3 gap-6">
				<!-- Domain Progress -->
				<div class="lg:col-span-2 space-y-6">
					<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
						<h2 class="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">2026 Domain Progress</h2>
						<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
							Track your mastery across the three domains of the updated PMP ECO.
						</p>
						<div class="grid md:grid-cols-3 gap-6">
							{#each $domainProgressStore.domains as domain}
								{@const domainInfo = domains2026.find((d) => d.domainId === domain.domainId)}
								{@const gradientClass = domain.domainId === "people"
									? "from-purple-500/10 to-purple-600/10 dark:from-purple-400/10 dark:to-purple-500/10 border-purple-200/50 dark:border-purple-700/50 hover:shadow-purple-500/25"
									: domain.domainId === "process"
										? "from-indigo-500/10 to-indigo-600/10 dark:from-indigo-400/10 dark:to-indigo-500/10 border-indigo-200/50 dark:border-indigo-700/50 hover:shadow-indigo-500/25"
										: "from-pink-500/10 to-pink-600/10 dark:from-pink-400/10 dark:to-pink-500/10 border-pink-200/50 dark:border-pink-700/50 hover:shadow-pink-500/25"}
								<div class="group bg-gradient-to-br {gradientClass} backdrop-blur-md border rounded-lg p-4 shadow-lg transition-all duration-300 hover:scale-105 cursor-default">
									<div class="flex justify-between items-center mb-3">
										<div>
											<h3 class="font-medium text-gray-900 dark:text-gray-100">{domain.domainName}</h3>
											<p class="text-xs text-gray-500 dark:text-gray-400">{domainInfo?.description || ""}</p>
										</div>
										<span class="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:text-indigo-300">
											{domainInfo?.weighting || 0}%
										</span>
									</div>

									<!-- Circular Progress for each domain -->
									<div class="flex justify-center mb-3">
										<CircularProgress
											percentage={Math.round(
												((domain.studyGuideProgress || 0) +
													(domain.flashcardsTotal > 0
														? (domain.flashcardsMastered / domain.flashcardsTotal) * 100
														: 0)) /
													2
											)}
											label={domain.domainName}
											size={100}
											strokeWidth={8}
											color={domain.domainId === "people"
												? "purple"
												: domain.domainId === "process"
													? "blue"
													: "emerald"}
											showLabel={true}
											description=""
										/>
									</div>

									<div class="space-y-2 text-sm">
										<div class="flex justify-between">
											<span class="text-gray-600 dark:text-gray-400">Study Guide:</span>
											<span class="font-medium text-gray-900 dark:text-gray-100">{domain.studyGuideProgress || 0}%</span>
										</div>
										<div class="flex justify-between">
											<span class="text-gray-600 dark:text-gray-400">Flashcards:</span>
											<span class="font-medium text-gray-900 dark:text-gray-100"
												>{Math.round((domain.flashcardsTotal > 0 ? (domain.flashcardsMastered / domain.flashcardsTotal) * 100 : 0))}%</span
											>
										</div>
										<div class="flex justify-between">
											<span class="text-gray-600 dark:text-gray-400">Accuracy:</span>
											<span class="font-medium text-gray-900 dark:text-gray-100">{domain.practiceAccuracy || 0}%</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Quick Actions & Activity -->
				<!-- Next Steps Hub -->
				<div class="space-y-6">
					<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
						<h2 class="text-lg font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Study Hub</h2>
						
						<!-- Major Actions -->
						<div class="space-y-3 mb-8">
							<a
								href="{base}/flashcards"
								class="group flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:scale-[1.02] transition-all shadow-md overflow-hidden relative"
							>
								<div class="relative z-10">
									<p class="text-sm font-medium opacity-80">Flashcards</p>
									<p class="text-xl font-bold">Smart Review</p>
								</div>
								<div class="relative z-10 bg-white/20 p-2 rounded-lg">
									<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
								</div>
								<div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
							</a>

							<a
								href="{base}/study"
								class="group flex items-center justify-between p-4 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-all shadow-sm"
							>
								<div>
									<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Study Guide</p>
									<p class="text-lg font-bold text-gray-900 dark:text-white">Continue Reading</p>
								</div>
								<div class="text-indigo-600 dark:text-indigo-400">
									<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
								</div>
							</a>
						</div>

						<!-- Recent Activity Integrated -->
						<div class="border-t border-gray-100 dark:border-gray-700 pt-6">
							<h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Recent Activity</h3>
							<div class="space-y-4">
								{#if $recentActivityStore.activities && $recentActivityStore.activities.length > 0}
									{#each $recentActivityStore.activities.slice(0, 3) as activity}
										<div class="flex gap-3">
											<div class="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
												</svg>
											</div>
											<div class="min-w-0 flex-1">
												<p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{activity.targetName}</p>
												<p class="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.timestamp)}</p>
											</div>
										</div>
									{/each}
								{:else}
									<p class="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
										Your journey begins with your first study session!
									</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- Settings / Management pushed down -->
					<div class="opacity-80 hover:opacity-100 transition-opacity">
						<DataManagement />
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
