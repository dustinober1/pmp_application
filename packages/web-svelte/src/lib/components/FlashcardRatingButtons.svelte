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

<svelte:window onkeydown={handleKeydown} />

{#if visible}
 <div class="rating-buttons" aria-label="Rate your recall">
 {#each buttons as button}
 <button
 onclick={() => onRate(button.rating)}
 disabled={disabled}
 class="rating-button"
 aria-label="{button.label}: {button.description} (press {button.shortcut})"
 >
 <span class="button-shortcut">{button.shortcut}</span>
 <div class="button-content">
 <span class="button-label">{button.label}</span>
 <span class="button-description">{button.description}</span>
 </div>
 </button>
 {/each}
 </div>
{:else}
 <div class="rating-buttons-placeholder">
 <p class="text-gray-500 dark:text-gray-400 text-sm">
 Flip the card to rate your recall
 </p>
 </div>
{/if}

<style>
 .rating-buttons {
 display: grid;
 grid-template-columns: repeat(4, 1fr);
 gap: 0.75rem;
 width: 100%;
 max-width: 700px;
 animation: slideUp 0.3s ease-out;
 }

 @keyframes slideUp {
 from {
 opacity: 0;
 transform: translateY(10px);
 }
 to {
 opacity: 1;
 transform: translateY(0);
 }
 }

 .rating-button {
 position: relative;
 display: flex;
 align-items: center;
 justify-content: center;
 padding: 1rem;
 border-radius: 0.75rem;
 border: none;
 cursor: pointer;
 transition: all 0.2s ease;
 min-height: 80px;
 }

 .rating-button:hover:not(:disabled) {
 transform: translateY(-2px);
 box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.2);
 }

 .rating-button:active:not(:disabled) {
 transform: translateY(0);
 }

 .rating-button:disabled {
 opacity: 0.6;
 cursor: not-allowed;
 }

 /* Button colors - using classes instead of inline styles */
 .rating-button:nth-child(1) {
 background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
 color: white;
 }

 .rating-button:nth-child(1):hover:not(:disabled) {
 background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
 }

 .rating-button:nth-child(2) {
 background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
 color: white;
 }

 .rating-button:nth-child(2):hover:not(:disabled) {
 background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
 }

 .rating-button:nth-child(3) {
 background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
 color: white;
 }

 .rating-button:nth-child(3):hover:not(:disabled) {
 background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
 }

 .rating-button:nth-child(4) {
 background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
 color: white;
 }

 .rating-button:nth-child(4):hover:not(:disabled) {
 background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
 }

 .button-shortcut {
 position: absolute;
 top: 0.25rem;
 left: 0.5rem;
 font-size: 0.65rem;
 font-weight: 700;
 opacity: 0.5;
 }

 .button-content {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 0.125rem;
 }

 .button-label {
 font-size: 1rem;
 font-weight: 600;
 }

 .button-description {
 font-size: 0.65rem;
 opacity: 0.9;
 text-align: center;
 line-height: 1.2;
 }

 .rating-buttons-placeholder {
 display: flex;
 align-items: center;
 justify-content: center;
 height: 80px;
 width: 100%;
 max-width: 700px;
 }

 /* Responsive adjustments */
 @media (max-width: 640px) {
 .rating-buttons {
 grid-template-columns: repeat(2, 1fr);
 }

 .rating-button {
 min-height: 70px;
 }

 .button-description {
 display: none;
 }
 }
</style>
