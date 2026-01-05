<script lang="ts">
  import type { StudyCard } from '@pmp/shared';

  interface Props {
    card: StudyCard | null;
    isFlipped: boolean;
    onFlip: () => void;
    currentIndex: number;
    totalCards: number;
  }

  let { card, isFlipped, onFlip, currentIndex, totalCards }: Props = $props();

  // Keyboard shortcut to flip
  function handleKeydown(event: KeyboardEvent) {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      onFlip();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flashcard-container">
  {#if card}
    <div class="card-progress" aria-hidden="true">
      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
        Card {currentIndex + 1} of {totalCards}
      </span>
      <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-300"
          style="width: {((currentIndex + 1) / totalCards) * 100}%"
        ></div>
      </div>
    </div>

    <div
      class="flashcard"
      class:flipped={isFlipped}
      onclick={onFlip}
      role="button"
      tabindex="0"
      aria-label="Flashcard, press Space or Enter to flip"
    >
      <div class="flashcard-inner">
        <!-- Front side -->
        <div class="flashcard-side flashcard-front">
          <div class="flashcard-content">
            <span class="card-label">Question</span>
            <p class="card-text">{card.front}</p>
          </div>
          <div class="card-hint">
            <span class="text-sm text-gray-400">Click card or press Space to flip • Press ? for more shortcuts</span>
          </div>
        </div>

        <!-- Back side -->
        <div class="flashcard-side flashcard-back">
          <div class="flashcard-content">
            <span class="card-label">Answer</span>
            <p class="card-text">{card.back}</p>
          </div>
          <div class="card-hint">
            <span class="text-sm text-gray-400">Press 1-4 to rate your recall</span>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="no-card-placeholder">
      <p class="text-gray-500 dark:text-gray-400">No cards to study</p>
    </div>
  {/if}
</div>

<style>
  .flashcard-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    perspective: 1000px;
    width: 100%;
    padding: 0 1rem;
  }

  .card-progress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1000px;
    padding: 0.5rem 0;
  }

  .flashcard {
    width: 100%;
    max-width: 1000px;
    height: 400px;
    cursor: pointer;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  .flashcard.flipped {
    transform: rotateY(180deg);
  }

  .flashcard:focus-visible {
    outline: 3px solid rgb(99 102 241);
    outline-offset: 4px;
    border-radius: 1rem;
  }

  .flashcard-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  .flashcard-side {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 1rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15);
    border: 1px solid rgb(229 231 235);
  }

  .flashcard-front {
    background: linear-gradient(135deg, rgb(255 255 255) 0%, rgb(249 250 251) 100%);
  }

  .flashcard-back {
    background: linear-gradient(135deg, rgb(238 242 255) 0%, rgb(224 231 255) 100%);
    transform: rotateY(180deg);
  }

  :global(.dark) .flashcard-front {
    background: linear-gradient(135deg, rgb(31 41 55) 0%, rgb(17 24 39) 100%);
    border-color: rgb(55 65 81);
  }

  :global(.dark) .flashcard-back {
    background: linear-gradient(135deg, rgb(30 41 82) 0%, rgb(30 27 75) 100%);
    border-color: rgb(55 65 81);
  }

  .flashcard-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .card-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgb(99 102 241);
    margin-bottom: 1rem;
  }

  :global(.dark) .card-label {
    color: rgb(129 140 248);
  }

  .card-text {
    font-size: 1.25rem;
    line-height: 1.75;
    color: rgb(17 24 39);
    font-weight: 500;
  }

  :global(.dark) .card-text {
    color: rgb(243 244 246);
  }

  .card-hint {
    text-align: center;
    padding-top: 1rem;
  }

  .no-card-placeholder {
    width: 100%;
    max-width: 1000px;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(249 250 251);
    border-radius: 1rem;
    border: 2px dashed rgb(209 213 219);
  }

  :global(.dark) .no-card-placeholder {
    background: rgb(31 41 55);
    border-color: rgb(75 85 99);
  }

  /* Animation for card appearance */
  .flashcard {
    animation: cardAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes cardAppear {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
