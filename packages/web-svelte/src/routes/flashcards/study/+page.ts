import type { Load } from "@sveltejs/kit";

// Prerender for static export - data is loaded on client side
export const prerender = true;

// Disable SSR - load data on client side where fetch to static files works
export const ssr = false;

export const load: Load = async () => {
    // Return empty data - actual loading happens in the component via onMount
    return {};
};
