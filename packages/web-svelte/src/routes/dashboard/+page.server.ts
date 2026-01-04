import type { Load } from "@sveltejs/kit";
import { dashboardApi } from "$lib/utils/api";

export const load: Load = async ({ fetch }) => {
  try {
    const response = await dashboardApi.getDashboard();
    return {
      dashboard: response.data?.dashboard || null,
      error: null,
    };
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    return {
      dashboard: null,
      error:
        error instanceof Error ? error.message : "Failed to load dashboard",
    };
  }
};
