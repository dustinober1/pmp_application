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

	let loading = true;

	// Get first name helper
	function getFirstName(name: string | null | undefined): string {
		if (!name || name.trim() === "") return "there";
		const parts = name.trim().split(" ");
		return parts[0] || "there";
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
	<div class="min-h-screen bg-gray-50">
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Cache Warning Banner -->
			<CacheWarningBanner variant="full" />

			<!-- 2026 Readiness Badge -->
			<div class="mb-6">
				<Readiness2026Badge variant="card" />
			</div>

			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-2xl font-bold text-gray-900">
					Welcome back, {getFirstName(userName)}! 👋
				</h1>
				<p class="text-gray-600">
					Here's your study progress at a glance.
				</p>
			</div>

			<!-- Study Stats Grid -->
			<div class="mb-8">
				<StudyStatsGrid />
			</div>

			<!-- Overall Progress -->
			<div class="bg-white rounded-lg shadow p-6 mb-8">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-gray-900">Overall Progress</h2>
					<span class="text-sm text-gray-600">Based on 2026 ECO</span>
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
						<p class="text-sm text-gray-600 mb-3">
							Your progress across all three domains of the 2026 PMP Exam Content Outline.
						</p>
						<div class="grid grid-cols-3 gap-4">
							{#each domains2026 as domain}
								<div class="text-center p-3 bg-gray-50 rounded-lg">
									<p class="text-xs font-medium text-gray-600 mb-1">{domain.domainName}</p>
									<p class="text-lg font-bold text-indigo-600">{domain.weighting}%</p>
									<p class="text-[10px] text-gray-500">{domain.description}</p>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="grid lg:grid-cols-3 gap-6">
				<!-- Domain Progress -->
				<div class="lg:col-span-2 space-y-6">
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="text-lg font-semibold mb-2">2026 Domain Progress</h2>
						<p class="text-sm text-gray-600 mb-4">
							Track your mastery across the three domains of the updated PMP ECO.
						</p>
						<div class="grid md:grid-cols-3 gap-6">
							{#each $domainProgressStore.domains as domain}
								{@const domainInfo = domains2026.find((d) => d.domainId === domain.domainId)}
								<div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
									<div class="flex justify-between items-center mb-3">
										<div>
											<h3 class="font-medium text-gray-900">{domain.domainName}</h3>
											<p class="text-xs text-gray-500">{domainInfo?.description || ""}</p>
										</div>
										<span class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
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
											<span class="text-gray-600">Study Guide:</span>
											<span class="font-medium">{domain.studyGuideProgress || 0}%</span>
										</div>
										<div class="flex justify-between">
											<span class="text-gray-600">Flashcards:</span>
											<span class="font-medium"
												>{domain.flashcardsMastered || 0} / {domain.flashcardsTotal || 0}</span
											>
										</div>
										<div class="flex justify-between">
											<span class="text-gray-600">Accuracy:</span>
											<span class="font-medium">{domain.practiceAccuracy || 0}%</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Quick Actions & Activity -->
				<div class="space-y-6">
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="font-semibold mb-4">Quick Actions</h2>
						<div class="space-y-2">
							<a
								href="{base}/study"
								class="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-left"
							>
								<div class="flex items-center gap-2">
									<svg
										class="w-5 h-5"
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
								class="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-left"
							>
								<div class="flex items-center gap-2">
									<svg
										class="w-5 h-5"
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
								class="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-left"
							>
								<div class="flex items-center gap-2">
									<svg
										class="w-5 h-5"
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
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="font-semibold mb-4">Recent Activity</h2>
						<div class="space-y-3">
							{#if $recentActivityStore.activities && $recentActivityStore.activities.length > 0}
								{#each $recentActivityStore.activities.slice(0, 5) as activity}
									<div class="flex items-start gap-3 text-sm">
										<div
											class="w-2 h-2 rounded-full bg-indigo-600 mt-2"
										></div>
										<div>
											<p title={activity.targetName}>
												{truncateAtWordBoundary(
													activity.targetName,
													80,
												)}
											</p>
											<p class="text-xs text-gray-600">
												{formatDate(activity.timestamp)}
											</p>
										</div>
									</div>
								{/each}
							{:else}
								<p class="text-sm text-gray-600">
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
