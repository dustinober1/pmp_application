<script lang="ts">
 import { fade } from 'svelte/transition';

 interface Props {
 manage?: import('svelte').Snippet;
 satisfy?: import('svelte').Snippet;
 inform?: import('svelte').Snippet;
 monitor?: import('svelte').Snippet;
 // Fallback for when we don't have snippets but raw HTML
 htmlContent?: {
 manage: string;
 satisfy: string;
 inform: string;
 monitor: string;
 };
 }

 let { manage, satisfy, inform, monitor, htmlContent }: Props = $props();

 let selectedQuadrant = $state<string | null>(null);

 const quadrants = [
 { id: 'manage', label: 'Manage Closely', color: 'bg-red-500', pos: 'top-right', title: 'High Power / High Interest' },
 { id: 'satisfy', label: 'Keep Satisfied', color: 'bg-orange-500', pos: 'top-left', title: 'High Power / Low Interest' },
 { id: 'inform', label: 'Keep Informed', color: 'bg-blue-500', pos: 'bottom-right', title: 'Low Power / High Interest' },
 { id: 'monitor', label: 'Monitor', color: 'bg-gray-500', pos: 'bottom-left', title: 'Low Power / Low Interest' }
 ];

 function select(id: string) {
 selectedQuadrant = selectedQuadrant === id ? null : id;
 }
</script>

<div class="my-8">
 <div class="max-w-2xl mx-auto">
 <div class="aspect-square relative border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
 <!-- Axes -->
 <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div class="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
 <div class="h-full w-px bg-gray-300 dark:bg-gray-600"></div>
 </div>

 <!-- Labels -->
 <div class="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Power</div>
 <div class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 rotate-180 uppercase tracking-widest">Power</div>
 <div class="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interest</div>
 <div class="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interest</div>

 <!-- Quadrants -->
 <div class="absolute inset-0 grid grid-cols-2 grid-rows-2">
 <!-- Keep Satisfied (High Power, Low Interest) - Top Left -->
 <button 
 onclick={() => select('satisfy')}
 class="p-4 flex flex-col items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group {selectedQuadrant === 'satisfy' ? 'bg-orange-50 dark:bg-orange-900/20' : ''}"
 >
 <div class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
 </div>
 <span class="text-xs font-bold dark:text-gray-300">Keep Satisfied</span>
 </button>

 <!-- Manage Closely (High Power, High Interest) - Top Right -->
 <button 
 onclick={() => select('manage')}
 class="p-4 flex flex-col items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group {selectedQuadrant === 'manage' ? 'bg-red-50 dark:bg-red-900/20' : ''}"
 >
 <div class="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
 </div>
 <span class="text-xs font-bold dark:text-gray-300">Manage Closely</span>
 </button>

 <!-- Monitor (Low Power, Low Interest) - Bottom Left -->
 <button 
 onclick={() => select('monitor')}
 class="p-4 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group {selectedQuadrant === 'monitor' ? 'bg-gray-50 dark:bg-gray-800/70' : ''}"
 >
 <div class="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
 </div>
 <span class="text-xs font-bold dark:text-gray-300">Monitor</span>
 </button>

 <!-- Keep Informed (Low Power, High Interest) - Bottom Right -->
 <button 
 onclick={() => select('inform')}
 class="p-4 flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group {selectedQuadrant === 'inform' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}"
 >
 <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
 </div>
 <span class="text-xs font-bold dark:text-gray-300">Keep Informed</span>
 </button>
 </div>
 </div>

 <!-- Detail Panel -->
 <div class="mt-4 min-h-[160px]">
 {#if selectedQuadrant}
 <div in:fade class="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 shadow-md {
 selectedQuadrant === 'manage' ? 'border-red-500' : 
 selectedQuadrant === 'satisfy' ? 'border-orange-500' : 
 selectedQuadrant === 'inform' ? 'border-blue-500' : 'border-gray-500'
 }">
 <h5 class="font-bold text-gray-900 dark:text-gray-100 mb-2">
 {quadrants.find(q => q.id === selectedQuadrant)?.title}: {quadrants.find(q => q.id === selectedQuadrant)?.label}
 </h5>
 <div class="text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none">
 {#if selectedQuadrant === 'manage'}
 {#if manage}{@render manage()}{:else if htmlContent}{@html htmlContent.manage}{/if}
 {:else if selectedQuadrant === 'satisfy'}
 {#if satisfy}{@render satisfy()}{:else if htmlContent}{@html htmlContent.satisfy}{/if}
 {:else if selectedQuadrant === 'inform'}
 {#if inform}{@render inform()}{:else if htmlContent}{@html htmlContent.inform}{/if}
 {:else if selectedQuadrant === 'monitor'}
 {#if monitor}{@render monitor()}{:else if htmlContent}{@html htmlContent.monitor}{/if}
 {/if}
 </div>
 </div>
 {:else}
 <div class="h-full flex items-center justify-center text-gray-400 italic text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8">
 Click a quadrant to see engagement details and examples
 </div>
 {/if}
 </div>
 </div>
</div>
