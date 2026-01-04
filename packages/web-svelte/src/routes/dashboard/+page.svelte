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

			<!-- 2026 Readiness Badge -->
			<div class="mb-6">
				<Readiness2026Badge variant="card" />
			</div>

			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
					Welcome back, {getFirstName(userName)}! 👋
				</h1>
				<p class="text-lg text-gray-700 dark:text-gray-300 mt-2">
					{getWelcomeSubtitle($overallProgress)}
				</p>
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
						<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
							Your progress across all three domains of the 2026 PMP Exam Content Outline.
						</p>
						<div class="grid grid-cols-3 gap-4">
							{#each domains2026 as domain}
								<div class="group text-center p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 dark:from-indigo-400/10 dark:to-indigo-500/10 backdrop-blur-md rounded-lg border border-indigo-200/50 dark:border-indigo-700/50 hover:scale-105 transition-all duration-300 cursor-default">
									<p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{domain.domainName}</p>
									<p class="text-lg font-bold text-indigo-600 dark:text-indigo-400">{domain.weighting}%</p>
									<p class="text-[10px] text-gray-600 dark:text-gray-400">{domain.description}</p>
								</div>
							{/each}
						</div>
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
											showLabel={false}
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
												>{domain.flashcardsMastered || 0} / {domain.flashcardsTotal || 0}</span
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
				<div class="space-y-6">
					<!-- Data Management -->
					<DataManagement />

					<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
						<h2 class="font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Quick Actions</h2>
						<div class="space-y-2">
							<a
								href="{base}/study"
								class="group block w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 text-left"
							>
								<div class="flex items-center gap-2">
									<svg
										class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
										/>
									</svg>
									Continue Studying
								</div>
							</a>

							<a
								href="{base}/flashcards"
								class="group block w-full px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-left"
							>
								<div class="flex items-center gap-2">
									<svg
										class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
										/>
									</svg>
									Review Flashcards
								</div>
							</a>

							<a
								href="{base}/practice"
								class="group block w-full px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 text-left"
							>
								<div class="flex items-center gap-2">
									<svg
										class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
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
									Practice Questions
								</div>
							</a>
						</div>
					</div>

					<!-- Recent Activity -->
					<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
						<h2 class="font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Recent Activity</h2>
						<div class="space-y-3">
							{#if $recentActivityStore.activities && $recentActivityStore.activities.length > 0}
								{#each $recentActivityStore.activities.slice(0, 5) as activity}
									<div class="group flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300 cursor-default">
										<div
											class="w-2 h-2 rounded-full bg-indigo-600 mt-2 group-hover:scale-125 transition-transform duration-300"
										></div>
										<div>
											<p title={activity.targetName} class="text-gray-900 dark:text-gray-100">
												{truncateAtWordBoundary(
													activity.targetName,
													80,
												)}
											</p>
											<p class="text-xs text-gray-600 dark:text-gray-400">
												{formatDate(activity.timestamp)}
											</p>
										</div>
									</div>
								{/each}
							{:else}
								<p class="text-sm text-gray-600 dark:text-gray-400">
									No recent activity yet. Start studying!
								</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
