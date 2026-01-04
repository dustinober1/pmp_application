import type { Load } from "@sveltejs/kit";
import { loadDomains } from "$lib/utils/studyData";

export const load: Load = async () => {
  try {
    const domains = await loadDomains();
    return {
      domains,
      error: null,
    };
  } catch (error) {
    console.error("Failed to load study data:", error);
    return {
      domains: [],
      error:
        error instanceof Error ? error.message : "Failed to load study content",
    };
  }
};
