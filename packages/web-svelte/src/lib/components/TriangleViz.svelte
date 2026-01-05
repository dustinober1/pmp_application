<script lang="ts">
    import { fade } from 'svelte/transition';

    let mode = $state<'predictive' | 'agile'>('predictive');
</script>

<div class="my-12 flex flex-col items-center">
    <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full mb-8">
        <button 
            onclick={() => mode = 'predictive'}
            class="px-6 py-2 rounded-full text-sm font-bold transition-all {mode === 'predictive' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
        >
            Predictive
        </button>
        <button 
            onclick={() => mode = 'agile'}
            class="px-6 py-2 rounded-full text-sm font-bold transition-all {mode === 'agile' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
        >
            Agile
        </button>
    </div>

    <div class="relative w-64 h-64 flex items-center justify-center">
        <!-- Connecting Lines -->
        <svg class="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
            <line x1="50" y1="15" x2="15" y2="75" stroke="currentColor" stroke-width="2" class="text-gray-300 dark:text-gray-700" />
            <line x1="50" y1="15" x2="85" y2="75" stroke="currentColor" stroke-width="2" class="text-gray-300 dark:text-gray-700" />
            <line x1="15" y1="75" x2="85" y2="75" stroke="currentColor" stroke-width="2" class="text-gray-300 dark:text-gray-700" />
        </svg>

        <!-- Scope (Top) -->
        <div 
            class="absolute top-0 transition-all duration-500 {mode === 'predictive' ? 'scale-110' : 'scale-90 opacity-60'}"
            style="transform: translateY(-50%);"
        >
            <div class="w-16 h-16 rounded-xl bg-blue-500 text-white shadow-lg flex flex-col items-center justify-center">
                <span class="text-[10px] font-bold uppercase">Scope</span>
                <span class="text-xs">{mode === 'predictive' ? 'Fixed' : 'Variable'}</span>
            </div>
        </div>

        <!-- Cost (Bottom Left) -->
        <div 
            class="absolute bottom-0 left-0 transition-all duration-500 {mode === 'agile' ? 'scale-110' : 'scale-90 opacity-60'}"
            style="transform: translate(-50%, 50%);"
        >
            <div class="w-16 h-16 rounded-xl bg-emerald-500 text-white shadow-lg flex flex-col items-center justify-center">
                <span class="text-[10px] font-bold uppercase">Cost</span>
                <span class="text-xs">{mode === 'agile' ? 'Fixed' : 'Variable'}</span>
            </div>
        </div>

        <!-- Time (Bottom Right) -->
        <div 
            class="absolute bottom-0 right-0 transition-all duration-500 {mode === 'agile' ? 'scale-110' : 'scale-90 opacity-60'}"
            style="transform: translate(50%, 50%);"
        >
            <div class="w-16 h-16 rounded-xl bg-orange-500 text-white shadow-lg flex flex-col items-center justify-center">
                <span class="text-[10px] font-bold uppercase">Time</span>
                <span class="text-xs">{mode === 'agile' ? 'Fixed' : 'Variable'}</span>
            </div>
        </div>

        <!-- Center Label -->
        <div class="bg-white dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm z-10">
            <span class="text-xs font-bold text-gray-500">Quality</span>
        </div>
    </div>

    <div class="mt-16 text-center max-w-sm">
        {#if mode === 'predictive'}
            <div in:fade>
                <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">The Iron Triangle</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">In Predictive projects, <strong>Scope is fixed</strong>. Cost and Time are estimated to deliver that scope.</p>
            </div>
        {:else}
            <div in:fade>
                <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">The Inverted Triangle</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">In Agile, <strong>Time and Cost are fixed</strong> (Timeboxes/Capacity). Scope is variable and prioritized.</p>
            </div>
        {/if}
    </div>
</div>
