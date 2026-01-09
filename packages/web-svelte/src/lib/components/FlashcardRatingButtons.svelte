<script lang="ts">
 import type { SM2Rating } from '@pmp/shared';

 interface Props {
 visible: boolean;
 onRate: (rating: SM2Rating) => void;
 disabled?: boolean;
 }

 let { visible, onRate, disabled = false }: Props = $props();

 interface RatingButton {
 rating: SM2Rating;
 label: string;
 description: string;
 color: string;
 hoverColor: string;
 textColor: string;
 shortcut: string;
 }

 const buttons: RatingButton[] = [
 {
 rating: 'again',
 label: 'Again',
 description: "Didn't remember",
 color: 'bg-red-500',
 hoverColor: 'hover:bg-red-600',
 textColor: 'text-red-600 dark:text-red-400',
 shortcut: '1',
 },
 {
 rating: 'hard',
 label: 'Hard',
 description: 'Remembered with difficulty',
 color: 'bg-orange-500',
 hoverColor: 'hover:bg-orange-600',
 textColor: 'text-orange-600 dark:text-orange-400',
 shortcut: '2',
 },
 {
 rating: 'good',
 label: 'Good',
 description: 'Remembered correctly',
 color: 'bg-blue-500',
 hoverColor: 'hover:bg-blue-600',
 textColor: 'text-blue-600 dark:text-blue-400',
 shortcut: '3',
 },
 {
 rating: 'easy',
 label: 'Easy',
 description: 'Remembered easily',
 color: 'bg-green-500',
 hoverColor: 'hover:bg-green-600',
 textColor: 'text-green-600 dark:text-green-400',
 shortcut: '4',
 },
 ];

 // Keyboard shortcuts for ratings
 function handleKeydown(event: KeyboardEvent) {
 if (!visible || disabled) return;

 switch (event.key) {
 case '1':
 event.preventDefault();
 onRate('again');
 break;
 case '2':
 event.preventDefault();
 onRate('hard');
 break;
 case '3':
 event.preventDefault();
 onRate('good');
 break;
 case '4':
 event.preventDefault();
 onRate('easy');
 break;
 }
 }

 // Touch gesture support for mobile
 let touchStartX = $state(0);
 let touchEndX = $state(0);

 function handleTouchStart(e: TouchEvent) {
 touchStartX = e.changedTouches[0].screenX;
 }

 function handleTouchEnd(e: TouchEvent) {
 touchEndX = e.changedTouches[0].screenX;
 handleSwipe();
 }

 function handleSwipe() {
 if (!visible || disabled) return;

 const swipeThreshold = 50;
 const diff = touchStartX - touchEndX;

 // Swipe left (diff > 0) - rate "hard" or move to next card concept
 if (diff > swipeThreshold) {
 onRate('good');
 }
 // Swipe right (diff < 0) - rate "easy" or go to previous card concept
 else if (diff < -swipeThreshold) {
 onRate('easy');
 }
 }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
 <div 
 class="rating-buttons flex gap-2 sm:gap-3 flex-wrap justify-center" 
 aria-label="Rate your recall (1-4 or swipe)" 
 ontouchstart={handleTouchStart} 
 ontouchend={handleTouchEnd}
 >
 {#each buttons as button}
 <button
 type="button"
 onclick={() => onRate(button.rating)}
 disabled={disabled}
 class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all transform active:scale-95 {button.color} {button.hoverColor} text-white disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] min-w-[44px]"
 aria-label={`${button.label}: ${button.description} (Press ${button.shortcut} or swipe)`}
 title={`${button.label}: ${button.description}\nKeyboard: ${button.shortcut}\nMobile: Swipe`}
 >
 <span class="block">{button.label}</span>
 <span class="text-xs opacity-90">{button.shortcut}</span>
 </button>
 {/each}
 </div>
{/if}

<style>
 .rating-buttons {
 @apply transition-all duration-300;
 }

 /* Touch-friendly button sizing */
 button {
 /* Minimum 44x44px for touch targets */
 min-height: 44px;
 min-width: 44px;
 }

 /* Improved active states for mobile */
 button:active {
 @apply scale-95;
 }

 /* Prevent zoom on double-tap */
 button {
 touch-action: manipulation;
 }
</style>
