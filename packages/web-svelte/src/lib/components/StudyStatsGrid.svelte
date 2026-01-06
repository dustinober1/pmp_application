<script lang="ts">
	import { onMount } from 'svelte';
	import { STORAGE_KEYS } from '$lib/constants/storageKeys';
	import { getMasteredCount } from '$lib/utils/flashcardStorage';
	import Card from '$lib/components/ui/Card.svelte';

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
			flashcardsMastered = getMasteredCount();

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
				e.key === STORAGE_KEYS.FLASHCARDS_MASTERED_COUNT ||
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
	<Card variant="default" class="p-6 transition-transform hover:scale-105 hover:shadow-hover">
		<div class="flex items-center justify-between mb-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
				Lifetime
			</span>
		</div>
		<div class="space-y-1">
			<p class="text-sm font-medium text-muted-foreground">Total Study Time</p>
			<p class="text-3xl font-bold font-serif text-foreground">
				{totalStudyTime.hours}<span class="text-lg text-muted-foreground">h</span>
				{totalStudyTime.minutes.toString().padStart(2, '0')}<span class="text-lg text-muted-foreground">m</span>
			</p>
		</div>
	</Card>

	<!-- Flashcards Mastered -->
	<Card variant="default" class="p-6 transition-transform hover:scale-105 hover:shadow-hover">
		<div class="flex items-center justify-between mb-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<span class="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold text-secondary">
				Mastered
			</span>
		</div>
		<div class="space-y-1">
			<p class="text-sm font-medium text-muted-foreground">Flashcards Learned</p>
			<p class="text-3xl font-bold font-serif text-foreground">
				{flashcardsMastered}<span class="text-lg text-muted-foreground ml-1">cards</span>
			</p>
		</div>
	</Card>

	<!-- Mock Exam Average -->
	<Card variant="default" class="p-6 transition-transform hover:scale-105 hover:shadow-hover">
		<div class="flex items-center justify-between mb-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			</div>
			<span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
				Last 3
			</span>
		</div>
		<div class="space-y-1">
			<p class="text-sm font-medium text-muted-foreground">Mock Exam Avg</p>
			<p class="text-3xl font-bold font-serif text-foreground">
				{mockExamAverage}<span class="text-lg text-muted-foreground">%</span>
			</p>
		</div>
	</Card>

	<!-- Active Study Streak -->
	<Card variant="default" class="p-6 transition-transform hover:scale-105 hover:shadow-hover">
		<div class="flex items-center justify-between mb-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
				</svg>
			</div>
			<span class="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold text-secondary">
				Active
			</span>
		</div>
		<div class="space-y-1">
			<p class="text-sm font-medium text-muted-foreground">Study Streak</p>
			<p class="text-3xl font-bold font-serif text-foreground">
				{studyStreak}<span class="text-lg text-muted-foreground ml-1">days</span>
			</p>
		</div>
	</Card>
</div>
