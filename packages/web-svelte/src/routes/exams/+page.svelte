<script lang="ts">
	import { base } from '$app/paths';
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md mx-auto text-center">
		<div class="mb-8 flex justify-center">
			<div class="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
				<svg
					class="w-12 h-12 text-indigo-600 dark:text-indigo-400"
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

		<h1 class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-4">
			Exams Coming Soon
		</h1>

		<p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
			Full-length mock exams and timed practice modes are currently under development. Check back soon for updates!
		</p>

		<div class="space-y-4">
			<a
				href="{base}/practice"
				class="inline-flex items-center justify-center w-full px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
			>
				Go to Practice Questions
			</a>
			<a
				href="{base}/dashboard"
				class="inline-flex items-center justify-center w-full px-5 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
			>
				Return to Dashboard
			</a>
		</div>
	</div>
</div>
