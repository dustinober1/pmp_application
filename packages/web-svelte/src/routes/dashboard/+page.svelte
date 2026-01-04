<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { dashboardApi } from '$lib/utils/api';
	import Navbar from '$lib/components/Navbar.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';

	export let data;

	let loading = true;
	let dashboardData = null;
	let error = null;

	// Get first name helper
	function getFirstName(name: string | null | undefined): string {
		if (!name || name.trim() === '') return 'there';
		const parts = name.trim().split(' ');
		return parts[0] || 'there';
	}

	// Format date helper
	function formatDate(timestamp: string): string {
		const date = new Date(timestamp);
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
		const lastSpace = truncated.lastIndexOf(' ');
		return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
	}

	onMount(async () => {
		// Use data from load function if available
		if (data.dashboard) {
			dashboardData = data.dashboard;
		} else if (data.error) {
			error = data.error;
		} else {
			// Fallback to client-side fetch
			try {
				const response = await dashboardApi.getDashboard();
				dashboardData = response.data?.dashboard || null;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Failed to load dashboard';
			}
		}
		loading = false;
	});

	async function handleManageSubscription() {
		try {
			const response = await fetch('/api/subscriptions/stripe/portal', {
				method: 'POST'
			});
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (err) {
			console.error('Failed to open billing portal:', err);
		}
	}

	// Subscribe to auth store
	let user = null;
	let canAccess = false;

	authStore.subscribe((auth) => {
		user = auth.user;
		canAccess = auth.isAuthenticated;
	});
</script>

{#if loading}
	<LoadingState message="Loading dashboard..." />
{:else if error}
	<ErrorState title="Dashboard Error" message={error} />
{:else if !canAccess}
	<ErrorState
		title="Authentication Required"
		message="Please log in to view your dashboard."
	/>
{:else}
	<div class="min-h-screen bg-gray-50">
		<Navbar />

		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-2xl font-bold text-gray-900">
					Welcome back, {getFirstName(user?.name)}! 👋
				</h1>
				<p class="text-gray-600">Here's your study progress at a glance.</p>
			</div>

			<!-- Stats Grid -->
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<div class="bg-white rounded-lg shadow p-6">
					<p class="text-sm text-gray-600">Current Streak</p>
					<p class="text-3xl font-bold mt-1">
						{dashboardData?.streak?.currentStreak || 0} 🔥
					</p>
					<p class="text-xs text-gray-600 mt-1">Best: {dashboardData?.streak?.longestStreak || 0} days</p>
				</div>

				<div class="bg-white rounded-lg shadow p-6">
					<p class="text-sm text-gray-600">Overall Progress</p>
					<p class="text-3xl font-bold mt-1">{dashboardData?.overallProgress || 0}%</p>
					<div class="w-full bg-gray-200 rounded-full h-2 mt-2">
						<div
							class="bg-indigo-600 h-2 rounded-full"
							style="width: {dashboardData?.overallProgress || 0}%"
						></div>
					</div>
				</div>

				<div class="bg-white rounded-lg shadow p-6">
					<p class="text-sm text-gray-600">Cards to Review</p>
					<p class="text-3xl font-bold mt-1">{dashboardData?.upcomingReviews?.length || 0}</p>
					<a
						href="/flashcards/review"
						class="text-xs text-indigo-600 mt-1 hover:underline inline-block"
					>
						Start review →
					</a>
				</div>

				<div class="bg-white rounded-lg shadow p-6">
					<p class="text-sm text-gray-600">Weak Areas</p>
					<p class="text-3xl font-bold mt-1">{dashboardData?.weakAreas?.length || 0}</p>
					<p class="text-xs text-gray-600 mt-1">Topics needing focus</p>
				</div>
			</div>

			<div class="grid lg:grid-cols-3 gap-6">
				<!-- Domain Progress -->
				<div class="lg:col-span-2 space-y-6">
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="font-semibold mb-4">Domain Progress</h2>
						<div class="space-y-4">
							{#each (dashboardData?.domainProgress || []) as domain}
								<div>
									<div class="flex justify-between items-center mb-1">
										<span class="text-sm font-medium">{domain.domainName}</span>
										<span class="text-sm text-gray-600">{domain.progress}%</span>
									</div>
									<div class="w-full bg-gray-200 rounded-full h-2">
										<div
											class="bg-indigo-600 h-2 rounded-full"
											style="width: {domain.progress}%"
										></div>
									</div>
									<p class="text-xs text-gray-600 mt-1">
										{domain.questionsAnswered} questions • {domain.accuracy}% accuracy
									</p>
								</div>
							{/each}
						</div>
					</div>

					<!-- Weak Areas -->
					{#if dashboardData?.weakAreas && dashboardData.weakAreas.length > 0}
						<div class="bg-white rounded-lg shadow p-6">
							<h2 class="font-semibold mb-4">Areas to Improve</h2>
							<div class="space-y-3">
								{#each dashboardData.weakAreas as area}
									<div
										class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
									>
										<div>
											<p class="font-medium text-sm" title={area.taskName}>
												{truncateAtWordBoundary(area.taskName, 50)}
											</p>
											<p class="text-xs text-gray-600">{area.domainName}</p>
										</div>
										<div class="text-right">
											<span class="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
												>{area.accuracy}%</span
											>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Quick Actions & Activity -->
				<div class="space-y-6">
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="font-semibold mb-4">Quick Actions</h2>
						<div class="space-y-2">
							<a
								href="/study"
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
								href="/flashcards"
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
								href="/practice"
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

							<button
								on:click={handleManageSubscription}
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
											d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
										/>
									</svg>
									Manage Subscription
								</div>
							</button>
						</div>
					</div>

					<!-- Recent Activity -->
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="font-semibold mb-4">Recent Activity</h2>
						<div class="space-y-3">
							{#each (dashboardData?.recentActivity || []).slice(0, 5) as activity}
								<div class="flex items-start gap-3 text-sm">
									<div class="w-2 h-2 rounded-full bg-indigo-600 mt-2"></div>
									<div>
										<p title={activity.description}>
											{truncateAtWordBoundary(activity.description, 80)}
										</p>
										<p class="text-xs text-gray-600">{formatDate(activity.timestamp)}</p>
									</div>
								</div>
							{/each}

							{#if !dashboardData?.recentActivity || dashboardData.recentActivity.length === 0}
								<p class="text-sm text-gray-600">No recent activity yet. Start studying!</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
