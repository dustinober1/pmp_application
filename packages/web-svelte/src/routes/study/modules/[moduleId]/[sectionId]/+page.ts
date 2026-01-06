import { getModules } from "$lib/utils/moduleLoader";
import type { EntryGenerator } from "./$types";

// Enable prerendering for static site generation
export const prerender = true;

// Disable SSR - content is loaded on client side where fetch to static files works
export const ssr = false;

// Generate entries for all module/section combinations to create static HTML pages
export const entries: EntryGenerator = async () => {
  const modules = await getModules();
  const entries: { moduleId: string; sectionId: string }[] = [];

  for (const module of modules) {
    for (const section of module.sections) {
      entries.push({
        moduleId: module.id,
        sectionId: section.id,
      });
    }
  }

  return entries;
};

// Empty load function - actual loading happens in the component
export const load = async ({ params }: { params: { moduleId: string; sectionId: string } }) => {
  return {
    moduleId: params.moduleId,
    sectionId: params.sectionId,
  };
};
