import type { Load } from "@sveltejs/kit";

// Disable SSR - load data on client side where fetch to static files works
export const ssr = false;

export const load: Load = async () => {
  // Return empty data - actual loading happens in the component via onMount
  // This is necessary because fetch() to local static files doesn't work during build/prerender
  return {
    stats: null,
    domains: null,
    mockExams: [],
    error: null,
  };
};
