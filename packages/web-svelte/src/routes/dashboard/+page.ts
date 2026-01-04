import type { Load } from "@sveltejs/kit";
import { authApi, dashboardApi } from "$lib/api";
import { loadApi } from "$lib/load";

export const load: Load = async ({ fetch }) => {
  // Load user and dashboard data in parallel
  const [userResult, dashboardResult] = await Promise.all([
    loadApi(() => authApi.me(fetch)),
    loadApi(() => dashboardApi.getDashboard(fetch)),
  ]);

  // Handle authentication failure
  if (userResult.status === 401) {
    // Redirect to login will be handled by error boundary
    throw new Error("Authentication required");
  }

  return {
    user: userResult.data,
    dashboard: dashboardResult.data,
    error: userResult.error || dashboardResult.error,
  };
};
