import type { Load } from "@sveltejs/kit";
import { getFlashcards, getFlashcardStats } from "$lib/utils/flashcardsData";

export const load: Load = async ({ url }) => {
  // Get pagination params from URL
  const offset = Number(url.searchParams.get("offset")) || 0;
  const limit = Number(url.searchParams.get("limit")) || 20;
  const domainId = url.searchParams.get("domain") || undefined;
  const taskId = url.searchParams.get("task") || undefined;

  // Load flashcards from local JSON data
  let flashcardsResult;
  let statsResult;

  try {
    const rawFlashcardsResult = await getFlashcards({ limit, domainId, taskId });

    // Map to expected format
    const items = rawFlashcardsResult.items.map(card => ({
      id: card.id,
      domainId: card.domainId,
      taskId: card.taskId,
      front: card.front,
      back: card.back,
    }));

    flashcardsResult = {
      items,
      total: rawFlashcardsResult.total,
      offset,
      limit,
      hasMore: offset + limit < rawFlashcardsResult.total,
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
      totalFlashcards: 0,
      totalDomains: 0,
      totalTasks: 0,
      domainBreakdown: [],
    };
  }

  return {
    flashcards: flashcardsResult,
    stats: {
      totalCards: statsResult.totalFlashcards,
      dueToday: 0, // Calculate from spaced repetition data when available
      mastered: 0, // This would come from user progress data
    },
  };
};
