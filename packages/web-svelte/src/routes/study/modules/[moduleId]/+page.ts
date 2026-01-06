import { getModules } from "$lib/utils/moduleLoader";
import type { EntryGenerator } from "./$types";

// Enable prerendering for static site generation
export const prerender = true;

// Disable SSR - content is loaded on client side where fetch to static files works
export const ssr = false;

// Generate entries for all modules to create static HTML pages
export const entries: EntryGenerator = async () => {
  const modules = await getModules();
  return modules.map((module) => ({ moduleId: module.id }));
};

// Empty load function - actual loading happens in the component
export const load = async ({ params }: { params: { moduleId: string } }) => {
  return {
    moduleId: params.moduleId,
  };
};
