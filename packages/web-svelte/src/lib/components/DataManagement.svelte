<script lang="ts">
	import { domainProgressStore, recentActivityStore } from "$lib/stores/dashboard";
	import { STORAGE_KEYS } from "$lib/constants/storageKeys";

	// Dashboard store keys
	const DASHBOARD_DOMAIN_PROGRESS = "pmp_domain_progress_2026";
	const DASHBOARD_RECENT_ACTIVITY = "pmp_recent_activity";

	// State for import feedback
	let importMessage = $state("");
	let importMessageType = $state<"success" | "error" | "">("");

	// Gather all localStorage data for export
	function gatherAllData(): Record<string, any> {
		const data: Record<string, any> = {};

		// Helper to safely get item
		const getItem = (key: string) => {
			try {
				const item = localStorage.getItem(key);
				return item ? JSON.parse(item) : null;
			} catch {
				return null;
			}
		};

		// Domain progress from dashboard store
		data[DASHBOARD_DOMAIN_PROGRESS] = getItem(DASHBOARD_DOMAIN_PROGRESS);

		// Recent activity from dashboard store
		data[DASHBOARD_RECENT_ACTIVITY] = getItem(DASHBOARD_RECENT_ACTIVITY);

		// Study tracking data
		data[STORAGE_KEYS.TOTAL_STUDY_TIME] = getItem(STORAGE_KEYS.TOTAL_STUDY_TIME);
		data[STORAGE_KEYS.STUDY_STREAK] = getItem(STORAGE_KEYS.STUDY_STREAK);
		data[STORAGE_KEYS.LAST_STUDY_DATE] = getItem(STORAGE_KEYS.LAST_STUDY_DATE);
		data[STORAGE_KEYS.STUDY_SESSIONS] = getItem(STORAGE_KEYS.STUDY_SESSIONS);

		// Flashcard progress
		data[STORAGE_KEYS.FLASHCARDS_MASTERED] = getItem(STORAGE_KEYS.FLASHCARDS_MASTERED);
		data[STORAGE_KEYS.FLASHCARDS_MASTERED_COUNT] = getItem(STORAGE_KEYS.FLASHCARDS_MASTERED_COUNT);
		data[STORAGE_KEYS.FLASHCARDS_RECENT_REVIEWS] = getItem(STORAGE_KEYS.FLASHCARDS_RECENT_REVIEWS);

		// Mock exam scores
		data[STORAGE_KEYS.MOCK_EXAM_SCORES] = getItem(STORAGE_KEYS.MOCK_EXAM_SCORES);

		// User name
		data["pmp_user_name"] = getItem("pmp_user_name");

		// Add timestamp
		data.exportTimestamp = new Date().toISOString();
		data.exportVersion = "1.0";

		return data;
	}

	// Export progress to JSON file
	function exportProgress() {
		try {
			const data = gatherAllData();
			const jsonString = JSON.stringify(data, null, 2);
			const blob = new Blob([jsonString], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `pmp_progress_backup_${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Export failed:", error);
		}
	}

	// Handle file selection for import
	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			importProgress(file);
			// Reset input
			input.value = "";
		}
	}

	// Import progress from JSON file
	function importProgress(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const data = JSON.parse(content);

				// Validate the data structure
				if (!data.exportVersion) {
					throw new Error("Invalid backup file format");
				}

				// Restore data to localStorage
				Object.keys(data).forEach((key) => {
					if (key !== "exportTimestamp" && key !== "exportVersion") {
						try {
							localStorage.setItem(key, JSON.stringify(data[key]));
						} catch (error) {
							console.error(`Failed to restore ${key}:`, error);
						}
					}
				});

				// Refresh stores to trigger UI updates
				const domainProgressData = localStorage.getItem(DASHBOARD_DOMAIN_PROGRESS);
				if (domainProgressData) {
					domainProgressStore.set(JSON.parse(domainProgressData));
				}

				const recentActivityData = localStorage.getItem(DASHBOARD_RECENT_ACTIVITY);
				if (recentActivityData) {
					recentActivityStore.set(JSON.parse(recentActivityData));
				}

				// Show success message
				importMessage = "Progress imported successfully!";
				importMessageType = "success";

				// Clear message after 3 seconds
				setTimeout(() => {
					importMessage = "";
					importMessageType = "";
				}, 3000);
			} catch (error) {
				console.error("Import failed:", error);
				importMessage = "Failed to import progress. Please check the file format.";
				importMessageType = "error";

				setTimeout(() => {
					importMessage = "";
					importMessageType = "";
				}, 5000);
			}
		};
		reader.readAsText(file);
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
			<label class="block w-full">
				<div class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer text-left flex items-center gap-2">
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
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
						/>
					</svg>
					<span>Import Progress</span>
				</div>
				<input
					type="file"
					accept=".json"
					onchange={handleFileSelect}
					class="hidden"
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
