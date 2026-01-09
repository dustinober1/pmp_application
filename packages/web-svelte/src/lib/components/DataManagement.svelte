<script lang="ts">
	import { downloadProgressBackup, importProgressFromFile } from "$lib/utils/dataPortability";
	import { domainProgressStore, recentActivityStore } from "$lib/stores/dashboard";

	// Dashboard store keys
	const DASHBOARD_DOMAIN_PROGRESS = "pmp_domain_progress_2026";
	const DASHBOARD_RECENT_ACTIVITY = "pmp_recent_activity";

	// State for import feedback
	let importMessage = $state("");
	let importMessageType = $state<"success" | "error" | "">("");

	// Export progress to JSON file
	function exportProgress() {
		downloadProgressBackup();
	}

	// Handle file selection for import
	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			const result = await importProgressFromFile(file);

			// Show feedback message
			importMessage = result.message;
			importMessageType = result.success ? "success" : "error";

			// If successful, refresh stores to trigger UI updates
			if (result.success) {
				const domainProgressData = localStorage.getItem(DASHBOARD_DOMAIN_PROGRESS);
				if (domainProgressData) {
					domainProgressStore.set(JSON.parse(domainProgressData));
				}

				const recentActivityData = localStorage.getItem(DASHBOARD_RECENT_ACTIVITY);
				if (recentActivityData) {
					recentActivityStore.set(JSON.parse(recentActivityData));
				}
			}

			// Clear message after 3 seconds (5 seconds for errors)
			setTimeout(() => {
				importMessage = "";
				importMessageType = "";
			}, result.success ? 3000 : 5000);

			// Reset input
			input.value = "";
		}
	}
</script>

<div class="bg-white rounded-lg shadow p-6">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-lg font-semibold text-gray-900">Data Portability</h2>
		<div class="group relative">
			<button
				class="text-gray-400 hover:text-gray-600 transition"
				aria-label="More information"
			>
				<svg
					class="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</button>
			<div
				class="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10"
			>
				<p class="leading-relaxed">
					Since this site is static and serverless, use these buttons to move your progress
					between devices or back up your data before clearing your browser cache.
				</p>
			</div>
		</div>
	</div>

	<p class="text-sm text-gray-600 mb-4">
		Export your progress to a file or import from a previous backup.
	</p>

	<div class="space-y-3">
		<!-- Export Button -->
		<button
			onclick={exportProgress}
			class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-left flex items-center gap-2"
		>
			<svg
				class="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
			<span>Download Progress</span>
		</button>

		<!-- Import Button (File Input) -->
		<div>
			<label for="import-progress-file" class="block w-full">
				<div class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer text-left flex items-center gap-2">
					<svg
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
						/>
					</svg>
					<span>Import Progress</span>
				</div>
				<input
					id="import-progress-file"
					type="file"
					accept=".json"
					onchange={handleFileSelect}
					class="sr-only"
					aria-label="Import progress backup file"
				/>
			</label>
		</div>

		<!-- Import Feedback Message -->
		{#if importMessage}
			<div
				class="text-sm p-3 rounded-lg {importMessageType === 'success'
					? 'bg-green-100 text-green-800 border border-green-200'
					: 'bg-red-100 text-red-800 border border-red-200'}"
			>
				{importMessage}
			</div>
		{/if}
	</div>
</div>
