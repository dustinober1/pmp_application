<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/stores/i18n';
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
	<div class="max-w-3xl w-full text-center space-y-8">
		<!-- Privacy & Progress Warning -->
		<div class="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 p-5 rounded-2xl border-2 border-amber-400 dark:border-amber-600 shadow-lg">
			<div class="flex items-center justify-center gap-2 mb-2">
				<span class="text-3xl">⚠️</span>
				<span class="font-bold text-amber-900 dark:text-amber-100 text-lg">IMPORTANT</span>
			</div>
			<p class="text-amber-900 dark:text-amber-100 font-medium text-sm leading-relaxed">
				This is a free, open-source static site. Your progress is stored locally in your browser's cache.
				If you clear your browser cache or site data, all your tracking and progress will be permanently lost.
			</p>
		</div>

		<div class="space-y-4">
			<h1 class="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
				PMP Study Pro
			</h1>
			<p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
				Free, open-source PMP certification preparation.
			</p>
		</div>

		<!-- July 2026 ECO Notice Banner -->
		<div class="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
			<div class="flex items-center justify-center gap-2">
				<span class="text-2xl">🎯</span>
				<span class="font-semibold text-blue-900 dark:text-blue-100">Updated for July 2026 ECO</span>
			</div>
			<p class="text-sm text-blue-700 dark:text-blue-300 mt-1">New domain percentages, AI & Sustainability themes, 60/40 methodology focus</p>
		</div>

		<div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
			<h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
				2026 PMP Exam Content Outline
			</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-6">
				Access practice questions, flashcards, and study guides without any subscription or login required.
			</p>

			<!-- Domain Percentages with Glassmorphism -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
				<div class="group text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 dark:from-indigo-400/10 dark:to-indigo-500/10 backdrop-blur-md border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 cursor-default">
					<div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform duration-300">33%</div>
					<div class="font-semibold text-gray-800 dark:text-gray-200 mb-2">People</div>
					<p class="text-xs text-gray-600 dark:text-gray-400 leading-snug">Focus on soft skills and leadership</p>
				</div>
				<div class="group text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-400/10 dark:to-purple-500/10 backdrop-blur-md border border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 cursor-default">
					<div class="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">41%</div>
					<div class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Process</div>
					<p class="text-xs text-gray-600 dark:text-gray-400 leading-snug">Technical management of projects</p>
				</div>
				<div class="group text-center p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-600/10 dark:from-pink-400/10 dark:to-pink-500/10 backdrop-blur-md border border-pink-200/50 dark:border-pink-700/50 shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 cursor-default">
					<div class="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2 group-hover:scale-110 transition-transform duration-300">26%</div>
					<div class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Business Environment</div>
					<p class="text-xs text-gray-600 dark:text-gray-400 leading-snug">Major Increase — strategic alignment, compliance, and organizational value</p>
				</div>
			</div>

			<!-- Key Updates -->
			<div class="mb-8 text-left space-y-3">
				<div class="flex items-start gap-3">
					<span class="text-lg">🤖</span>
					<div>
						<div class="font-medium text-gray-900 dark:text-white">AI in Project Management</div>
						<p class="text-sm text-gray-500 dark:text-gray-400">New core theme for 2026</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span class="text-lg">🌱</span>
					<div>
						<div class="font-medium text-gray-900 dark:text-white">Sustainability & ESG</div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Environmental, Social, Governance focus</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span class="text-lg">📊</span>
					<div>
						<div class="font-medium text-gray-900 dark:text-white">60% Adaptive / 40% Predictive</div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Updated methodology emphasis</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span class="text-lg">⏱️</span>
					<div>
						<div class="font-medium text-gray-900 dark:text-white">185 Questions, 240 Minutes</div>
						<p class="text-sm text-gray-500 dark:text-gray-400">New exam format</p>
					</div>
				</div>
			</div>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a 
					href="{base}/dashboard" 
					class="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30"
				>
					Start Studying
				</a>
				<a 
					href="{base}/study" 
					class="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
				>
					View Guide
				</a>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
			<div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
				<div class="text-2xl mb-2">📚</div>
				<h3 class="font-semibold text-gray-900 dark:text-white mb-1">Study Guide</h3>
				<p class="text-sm text-gray-500 dark:text-gray-400">Comprehensive summary of key concepts.</p>
			</div>
			<div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
				<div class="text-2xl mb-2">⚡️</div>
				<h3 class="font-semibold text-gray-900 dark:text-white mb-1">Flashcards</h3>
				<p class="text-sm text-gray-500 dark:text-gray-400">Memorize terms and definitions.</p>
			</div>
			<div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
				<div class="text-2xl mb-2">🎯</div>
				<h3 class="font-semibold text-gray-900 dark:text-white mb-1">Practice</h3>
				<p class="text-sm text-gray-500 dark:text-gray-400">Test your knowledge with quizzes.</p>
			</div>
		</div>
	</div>
</div>
