import type { Load } from "@sveltejs/kit";
import { authApi, flashcardApi } from "$lib/api";
import { loadApi, loadPaginated } from "$lib/load";

export const load: Load = async ({ fetch, url }) => {
  // Get pagination params from URL
  const offset = Number(url.searchParams.get("offset")) || 0;
  const limit = Number(url.searchParams.get("limit")) || 20;

  // Load user and flashcards in parallel
  const [userResult, flashcardsResult, statsResult] = await Promise.all([
    loadApi(() => authApi.me(fetch)),
    loadPaginated((o, l) =>
      flashcardApi.getFlashcards({ limit: l }, fetch).then((resp) => ({
        data: {
          items: resp.data?.flashcards || [],
          total: resp.data?.total || 0,
          offset: o,
          limit: l,
        },
      }))
    , offset, limit),
    loadApi(() => flashcardApi.getStats(fetch)),
  ]);

  return {
    user: userResult.data,
    flashcards: flashcardsResult.data,
    stats: statsResult.data,
    error: userResult.error || flashcardsResult.error || statsResult.error,
  };
};
