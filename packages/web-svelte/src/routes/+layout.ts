import type { Load } from "@sveltejs/kit";

// Root layout load function - can be used for global data loading
export const load: Load = async ({ fetch }) => {
  // Example: Load user data globally
  // const userResult = await loadApi(() => authApi.me(fetch));

  return {
    // user: userResult.data,
  };
};
