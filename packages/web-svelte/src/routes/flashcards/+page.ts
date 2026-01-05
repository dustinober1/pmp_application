import type { Load } from "@sveltejs/kit";

// Prerender for static export - data is loaded on client side
export const prerender = true;

// Disable SSR - load data on client side where fetch to static files works
export const ssr = false;

export const load: Load = async () => {
  // Return empty data - actual loading happens in the component via onMount
  // This is necessary because fetch() to local static files doesn't work during build/prerender
  return {
    flashcards: null,
    stats: null,
    error: null,
  };
};
