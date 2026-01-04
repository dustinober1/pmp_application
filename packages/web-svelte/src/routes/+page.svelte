<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/stores/i18n';
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
	<div class="max-w-3xl w-full text-center space-y-8">
		<div class="space-y-4">
			<h1 class="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
				PMP Study Pro
			</h1>
			<p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
				Free, open-source PMP certification preparation.
			</p>
		</div>

		<div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
			<h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
				Master the PMBOK Guide 7th Edition
			</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-8">
				Access practice questions, flashcards, and study guides without any subscription or login required.
			</p>
			
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
