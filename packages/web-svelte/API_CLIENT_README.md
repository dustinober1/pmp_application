# SvelteKit API Client & Load Functions

This package provides a comprehensive API client and load function utilities for SvelteKit with built-in error handling, loading states, and server-side data fetching support.

## Features

- ✅ **Type-safe API client** with full TypeScript support
- ✅ **Server-side data fetching** with SvelteKit load functions
- ✅ **Automatic error handling** with custom `ApiError` class
- ✅ **CSRF protection** for state-changing requests
- ✅ **Token refresh** on 401 responses
- ✅ **GET request caching** with TTL
- ✅ **Error boundaries** with `+error.svelte`
- ✅ **Loading states** with `+loading.svelte`
- ✅ **Reusable components** for loading/error states
- ✅ **Pagination support** with `loadPaginated`

## API Client Usage

### Basic API Request

```typescript
import { apiRequest } from "$lib/api";

// In client components
const response = await apiRequest("/auth/me");

// In load functions (server-side)
export const load = async ({ fetch }) => {
  const response = await apiRequest("/auth/me", {}, fetch);
  return { user: response.data };
};
```

### Using API Modules

```typescript
import { authApi, dashboardApi } from "$lib/api";

// Client-side
const user = await authApi.me();
const dashboard = await dashboardApi.getDashboard();

// Server-side (in load functions)
export const load = async ({ fetch }) => {
  const user = await authApi.me(fetch);
  const dashboard = await dashboardApi.getDashboard(fetch);
  return { user, dashboard };
};
```

### Available API Modules

- `authApi` - Authentication endpoints
- `subscriptionApi` - Subscription management
- `contentApi` - Domains, tasks, study guides
- `flashcardApi` - Flashcard CRUD and sessions
- `practiceApi` - Practice sessions and questions
- `dashboardApi` - Dashboard data and stats
- `formulaApi` - Formula calculations
- `searchApi` - Search functionality

## Load Functions

### Basic Load Function with Error Handling

```typescript
import type { Load } from "@sveltejs/kit";
import { authApi } from "$lib/api";
import { loadApi } from "$lib/load";

export const load: Load = async ({ fetch }) => {
  const userResult = await loadApi(() => authApi.me(fetch));

  if (userResult.status === 401) {
    throw new Error("Authentication required");
  }

  return {
    user: userResult.data,
    error: userResult.error,
  };
};
```

### Parallel Data Loading

```typescript
import { loadParallel } from "$lib/load";

export const load = async ({ fetch }) => {
  const [user, dashboard, streak] = await loadParallel(
    () => authApi.me(fetch),
    () => dashboardApi.getDashboard(fetch),
    () => dashboardApi.getStreak(fetch),
  );

  return {
    user: user.data,
    dashboard: dashboard.data,
    streak: streak.data,
  };
};
```

### Required Authentication

```typescript
import { requireAuth } from "$lib/load";

export const load = async ({ fetch }) => {
  // Automatically redirects to /auth/login if not authenticated
  const user = await requireAuth(fetch);
  return { user };
};
```

### Paginated Data

```typescript
import { loadPaginated } from "$lib/load";

export const load = async ({ fetch, url }) => {
  const offset = Number(url.searchParams.get("offset")) || 0;
  const limit = Number(url.searchParams.get("limit")) || 20;

  const flashcards = await loadPaginated(
    (offset, limit) => flashcardApi.getFlashcards({ limit }, fetch)
      .then(resp => ({
        data: {
          items: resp.data?.flashcards || [],
          total: resp.data?.total || 0,
          offset,
          limit,
        },
      })),
    offset,
    limit,
  );

  return {
    flashcards: flashcards.data,
    hasMore: flashcards.data?.hasMore || false,
  };
};
```

## Error Boundaries

### Root Error Boundary

The `+error.svelte` file in `src/routes/` provides global error handling with:

- Different UI for different error codes (404, 401, 403, 500)
- Action buttons to go home or back
- Dev mode stack traces

### Per-Route Error Boundaries

Create `+error.svelte` in any route directory for custom error handling:

```svelte
<!-- src/routes/dashboard/+error.svelte -->
<script lang="ts">
  export let status;
  export let error;
</script>

<div class="p-8 text-center">
  <h1>Dashboard Error: {status}</h1>
  <p>{error.message}</p>
</div>
```

## Loading States

**Note:** SvelteKit doesn't support `+loading.svelte` files. Instead, use the `LoadingState` component directly in your pages.

### Per-Route Loading States

Check for loading state in your `+page.svelte`:

```svelte
<script lang="ts">
  import LoadingState from "$lib/components/LoadingState.svelte";

  export let data;
</script>

{#if !data}
  <LoadingState message="Loading dashboard..." />
{:else}
  <!-- Your page content -->
{/if}
```

### Universal Loading Wrapper

You can also create a layout with automatic loading state:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import LoadingState from "$lib/components/LoadingState.svelte";

  export let data;
</script>

{#if $navigating || !data}
  <LoadingState message="Loading..." />
{:else}
  <slot />
{/if}
```

### Reusable Components

```svelte
<script>
  import { LoadingState, ErrorState } from "$lib/components";
</script>

<!-- Loading state -->
<LoadingState message="Loading..." size="lg" />

<!-- Error state with retry -->
<ErrorState
  title="Failed to load"
  message="Please try again"
  showRetry={true}
  onRetry={() => window.location.reload()}
/>
```

## Error Handling

### ApiError Class

```typescript
import { ApiError } from "$lib/api";

try {
  await apiRequest("/some-endpoint");
} catch (error) {
  if (error instanceof ApiError) {
    console.log(`Error ${error.status}: ${error.message}`);
    // Handle specific status codes
    if (error.status === 401) {
      // Redirect to login
    }
  }
}
```

### LoadData Type

```typescript
import type { LoadData } from "$lib/load";

const result: LoadData<User> = await loadApi(() => authApi.me(fetch));

if (result.error) {
  // Handle error
  console.error(result.error);
}

if (result.data) {
  // Use data
  console.log(result.data.name);
}
```

## Environment Variables

Create a `.env` file in `packages/web-svelte/`:

```bash
VITE_API_URL=http://localhost:3001/api
```

For production:

```bash
VITE_API_URL=https://api.pmpstudypro.com/api
```

## Examples

See these files for complete examples:

- `src/routes/dashboard/+page.ts` - Basic data loading
- `src/routes/flashcards/+page.ts` - Pagination support
- `src/routes/+error.svelte` - Error boundary
- `src/routes/+layout.svelte` - Root layout (for global loading state)
- `src/lib/components/LoadingState.svelte` - Reusable loading
- `src/lib/components/ErrorState.svelte` - Reusable error

## Migration from Next.js

Key differences from Next.js `apiRequest`:

1. **Fetch parameter**: Pass SvelteKit's `fetch` to API functions in load functions
2. **Load functions**: Use `+page.ts` instead of `getServerSideProps`
3. **Error handling**: Use `loadApi` wrapper instead of try/catch in load functions
4. **Pagination**: Use `loadPaginated` helper for consistent pagination

### Next.js to SvelteKit Migration

**Next.js:**
```typescript
export async function getServerSideProps() {
  const response = await apiRequest("/auth/me");
  return { props: { user: response.data } };
}
```

**SvelteKit:**
```typescript
export const load: Load = async ({ fetch }) => {
  const response = await loadApi(() => apiRequest("/auth/me", {}, fetch));
  return { user: response.data };
};
```
