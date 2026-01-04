<script lang="ts">
	import { onMount } from 'svelte';

	// Local storage keys
	const STORAGE_KEYS = {
		TOTAL_STUDY_TIME: 'pmp_total_study_time_ms',
		FLASHCARDS_MASTERED: 'pmp_flashcards_mastered',
		MOCK_EXAMS: 'pmp_mock_exams',
		STUDY_STREAK: 'pmp_study_streak',
		LAST_STUDY_DATE: 'pmp_last_study_date'
	};

	// Reactive state for stats
	let totalStudyTime = $state({
		hours: 0,
		minutes: 0
	});

	let flashcardsMastered = $state(0);
	let mockExamAverage = $state(0);
	let studyStreak = $state(0);

	// Load stats from localStorage
	function loadStats() {
		if (typeof window === 'undefined') return;

		try {
			// Total Study Time
			const storedTime = localStorage.getItem(STORAGE_KEYS.TOTAL_STUDY_TIME);
			if (storedTime) {
				const totalMs = parseInt(storedTime, 10) || 0;
				totalStudyTime.hours = Math.floor(totalMs / (1000 * 60 * 60));
				totalStudyTime.minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
			}

			// Flashcards Mastered
			const storedCards = localStorage.getItem(STORAGE_KEYS.FLASHCARDS_MASTERED);
			if (storedCards) {
				flashcardsMastered = parseInt(storedCards, 10) || 0;
			}

			// Mock Exam Average (last 3 tests)
			const storedExams = localStorage.getItem(STORAGE_KEYS.MOCK_EXAMS);
			if (storedExams) {
				const exams = JSON.parse(storedExams);
				if (Array.isArray(exams) && exams.length > 0) {
					// Get last 3 completed exams
					const lastThree = exams
						.filter((e) => e.completedAt && e.scorePercentage !== undefined)
						.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
						.slice(0, 3);

					if (lastThree.length > 0) {
						const sum = lastThree.reduce((acc, e) => acc + (e.scorePercentage || 0), 0);
						mockExamAverage = Math.round(sum / lastThree.length);
					}
				}
			}

			// Study Streak
			const storedStreak = localStorage.getItem(STORAGE_KEYS.STUDY_STREAK);
			if (storedStreak) {
				studyStreak = parseInt(storedStreak, 10) || 0;
			}

			// Update streak if needed (check if last study was yesterday)
			updateStreak();
		} catch (error) {
			console.error('Error loading study stats:', error);
		}
	}

	// Update streak based on last study date
	function updateStreak() {
		if (typeof window === 'undefined') return;

		try {
			const lastStudyDate = localStorage.getItem(STORAGE_KEYS.LAST_STUDY_DATE);
			if (lastStudyDate) {
				const last = new Date(lastStudyDate);
				const today = new Date();
				const yesterday = new Date(today);
				yesterday.setDate(yesterday.getDate() - 1);

				// Reset streak if last study was more than a day ago
				if (last < yesterday) {
					studyStreak = 0;
					localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, '0');
				}
			}
		} catch (error) {
			console.error('Error updating streak:', error);
		}
	}

	onMount(() => {
		loadStats();

		// Listen for storage events to update stats when localStorage changes
		const handleStorageChange = (e: StorageEvent) => {
			if (
				e.key === STORAGE_KEYS.TOTAL_STUDY_TIME ||
				e.key === STORAGE_KEYS.FLASHCARDS_MASTERED ||
				e.key === STORAGE_KEYS.MOCK_EXAMS ||
				e.key === STORAGE_KEYS.STUDY_STREAK
			) {
				loadStats();
			}
		};

		window.addEventListener('storage', handleStorageChange);

		// Also set up a periodic refresh for same-tab updates
		const interval = setInterval(loadStats, 5000);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
			clearInterval(interval);
		};
	});
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	<!-- Total Study Time -->
	<div
		class="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
	>
		<div class="flex items-center justify-between mb-4">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
			>
				<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<span
				class="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/50 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200"
			>
				Lifetime
			</span>
		</div>
		<div class="space-y-1">
			<p class="text-sm font-medium text-blue-600 dark:text-blue-400">Total Study Time</p>
			<p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
				{totalStudyTime.hours}<span class="text-lg text-gray-500">h</span>
				{totalStudyTime.minutes.toString().padStart(2, '0')}<span class="text-lg text-gray-500"
					>m</span
				>
			</p>
		</div>
		<div
			class="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-blue-500/10 dark:bg-blue-400/10"
		></div>
	</div>

	<!-- Flashcards Mastered -->
	<div
		class="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
	>
		<div class="flex items-center justify-between mb-4">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg"
			>
				<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<span
				class="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/50 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200"
			>
				Mastered
			</span>
		</div>
		<div class="space-y-1">
			<p class="text-sm font-medium text-green-600 dark:text-green-400">Flashcards Learned</p>
			<p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
				{flashcardsMastered}<span class="text-lg text-gray-500 ml-1">cards</span>
			</p>
		</div>
		<div
			class="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-green-500/10 dark:bg-green-400/10"
		></div>
	</div>

	<!-- Mock Exam Average -->
	<div
		class="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
	>
		<div class="flex items-center justify-between mb-4">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg"
			>
				<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
			</div>
			<span
				class="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/50 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200"
			>
				Last 3
			</span>
		</div>
		<div class="space-y-1">
			<p class="text-sm font-medium text-purple-600 dark:text-purple-400">Mock Exam Avg</p>
			<p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
				{mockExamAverage}<span class="text-lg text-gray-500">%</span>
			</p>
		</div>
		<div
			class="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-purple-500/10 dark:bg-purple-400/10"
		></div>
	</div>

	<!-- Active Study Streak -->
	<div
		class="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
	>
		<div class="flex items-center justify-between mb-4">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg"
			>
				<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
					/>
				</svg>
			</div>
			<span
				class="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/50 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:text-orange-200"
			>
				Active
			</span>
		</div>
		<div class="space-y-1">
			<p class="text-sm font-medium text-orange-600 dark:text-orange-400">Study Streak</p>
			<p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
				{studyStreak}<span class="text-lg text-gray-500 ml-1">days</span>
			</p>
		</div>
		<div
			class="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-orange-500/10 dark:bg-orange-400/10"
		></div>
	</div>
</div>
