<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	interface Props {
		key?: string;
	}

	let { key = 'general_progress_tracker' }: Props = $props();

	type Row = {
		id: string;
		date: string;
		activity: string;
		people: boolean;
		process: boolean;
		business: boolean;
		notes: string;
	};

	let rows = $state<Row[]>([]);
	const storageKey = $derived(`pmp_table_${key}`);

	function addRow() {
		rows = [
			...rows,
			{
				id: crypto.randomUUID(),
				date: new Date().toISOString().split('T')[0],
				activity: '',
				people: false,
				process: false,
				business: false,
				notes: ''
			}
		];
		save();
	}

	function deleteRow(id: string) {
		rows = rows.filter((r) => r.id !== id);
		save();
	}

	function save() {
		localStorage.setItem(storageKey, JSON.stringify(rows));
	}

    // Correct load logic for effect
    function loadData() {
        const data = localStorage.getItem(storageKey);
        if (data) {
            try {
                rows = JSON.parse(data);
            } catch (e) {
                rows = [];
                addRow();
            }
        } else {
            rows = [];
            addRow();
        }
    }

	$effect(() => {
        loadData();
	});

</script>

<div class="my-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
	<div class="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white m-0 border-none p-0">Study Tracker</h3>
			<button
				onclick={addRow}
				class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
			>
				+ Add Entry
			</button>
		</div>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
				<tr>
					<th class="px-6 py-3 font-medium">Date</th>
					<th class="px-6 py-3 font-medium">Activity</th>
					<th class="px-6 py-3 text-center font-medium">People</th>
					<th class="px-6 py-3 text-center font-medium">Process</th>
					<th class="px-6 py-3 text-center font-medium">Bus Env</th>
					<th class="px-6 py-3 font-medium">Notes</th>
					<th class="px-6 py-3 text-right font-medium">Action</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
				{#each rows as row (row.id)}
					<tr class="group hover:bg-gray-50 dark:hover:bg-gray-800/30" transition:slide|local>
						<td class="px-6 py-4">
							<input
								type="date"
								bind:value={row.date}
								onchange={save}
								class="block w-full rounded-md border-0 bg-transparent py-1.5 text-gray-900 focus:ring-2 focus:ring-indigo-600 dark:text-white sm:text-sm sm:leading-6"
							/>
						</td>
						<td class="px-6 py-4">
							<input
								type="text"
								bind:value={row.activity}
								oninput={save}
								placeholder="What did you study?"
								class="block w-full rounded-md border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:text-white sm:text-sm sm:leading-6"
							/>
						</td>
						<td class="px-6 py-4 text-center">
							<input
								type="checkbox"
								bind:checked={row.people}
								onchange={save}
								class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
							/>
						</td>
						<td class="px-6 py-4 text-center">
							<input
								type="checkbox"
								bind:checked={row.process}
								onchange={save}
								class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
							/>
						</td>
						<td class="px-6 py-4 text-center">
							<input
								type="checkbox"
								bind:checked={row.business}
								onchange={save}
								class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
							/>
						</td>
						<td class="px-6 py-4">
							<input
								type="text"
								bind:value={row.notes}
								oninput={save}
								placeholder="Key takeaways..."
								class="block w-full rounded-md border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:text-white sm:text-sm sm:leading-6"
							/>
						</td>
						<td class="px-6 py-4 text-right">
							<button
								onclick={() => deleteRow(row.id)}
								class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all font-bold text-lg"
								aria-label="Delete row"
							>
								×
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
