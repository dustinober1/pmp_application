import type { Load } from "@sveltejs/kit";
import { authApi } from "$lib/api";
import { loadApi } from "$lib/load";
import { getFlashcards, getFlashcardStats } from "$lib/utils/flashcardsData";

export const load: Load = async ({ fetch, url }) => {
  // Get pagination params from URL
  const offset = Number(url.searchParams.get("offset")) || 0;
  const limit = Number(url.searchParams.get("limit")) || 20;
  const domainId = url.searchParams.get("domain") || undefined;
  const taskId = url.searchParams.get("task") || undefined;

  // Load user from API, but flashcards from local JSON
  const userResult = await loadApi(() => authApi.me(fetch));

  // Load flashcards from local JSON data
  let flashcardsResult;
  let statsResult;

  try {
    flashcardsResult = await getFlashcards({ limit, domainId, taskId });

    // Map to expected format
    const items = flashcardsResult.items.map(card => ({
      id: card.id,
      domainId: card.domainId,
      taskId: card.taskId,
      front: card.front,
      back: card.back,
    }));

    flashcardsResult = {
      items,
      total: flashcardsResult.total,
      offset,
      limit,
      hasMore: offset + limit < flashcardsResult.total,
    };

    statsResult = await getFlashcardStats();
  } catch (error) {
    console.error('Failed to load flashcards:', error);
    flashcardsResult = {
      items: [],
      total: 0,
      offset,
      limit,
      hasMore: false,
    };
    statsResult = {
      totalCards: 0,
      dueToday: 0,
      mastered: 0,
    };
  }

  return {
    user: userResult.data,
    flashcards: flashcardsResult,
    stats: {
      totalCards: statsResult.totalFlashcards,
      dueToday: 0, // Calculate from spaced repetition data when available
      mastered: 0, // This would come from user progress data
    },
    error: userResult.error,
  };
};
