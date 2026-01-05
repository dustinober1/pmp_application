# Composables

This directory contains reusable Svelte 5 composables using runes syntax.

## Available Composables

### `usePagination`

Reactive offset-based pagination composable for array data.

#### Features

- **Type-safe**: Fully typed with TypeScript generics
- **Svelte 5 Runes**: Uses `$state` and `$derived` for reactive state management
- **Flexible API**: Navigate by page or offset, reset to start, change page size dynamically
- **Computed values**: `displayItems`, `hasMore`, `currentPage`, `totalPages`, `currentPageInfo`
- **Zero dependencies**: Pure Svelte reactivity

#### Basic Usage

```svelte
<script lang="ts">
  import { usePagination } from '$lib/composables';

  let items = $state([
    /* your data array */
  ]);

  const pagination = usePagination({
    items,
    pageSize: 20
  });
</script>

<!-- Display paginated items -->
{#each pagination.displayItems as item}
  <div>{item}</div>
{/each}

<!-- Pagination controls -->
<button onclick={() => pagination.previous()} disabled={pagination.offset === 0}>
  Previous
</button>

<span>{pagination.currentPageInfo}</span>
<!-- "Showing 1 to 20 of 150" -->

<button onclick={() => pagination.next()} disabled={!pagination.hasMore}>
  Next
</button>
```

#### With Filtering

When items change (e.g., from filtering/searching), re-initialize the composable:

```svelte
<script lang="ts">
  let allItems = $state<Item[]>([]);
  let filteredItems = $state<Item[]>([]);
  let pagination = $state(usePagination({ items: [], pageSize: 20 }));

  function applyFilter() {
    filteredItems = allItems.filter(item => item.active);
    // Reset and update pagination with new items
    pagination = usePagination({ items: filteredItems, pageSize: 20 });
  }
</script>
```

#### API Reference

```typescript
interface PaginationOptions<T> {
  items: T[];          // The array of items to paginate
  pageSize?: number;   // Items per page (default: 20)
  initialOffset?: number; // Starting offset (default: 0)
}

interface PaginationState<T> {
  // State
  offset: number;
  limit: number;

  // Computed values
  displayItems: T[];          // Items for current page
  hasMore: boolean;           // Whether more pages exist
  currentPage: number;        // Current page (1-indexed)
  totalPages: number;         // Total pages
  currentPageInfo: string;    // Formatted page info string

  // Methods
  previous(): void;           // Go to previous page
  next(): void;               // Go to next page
  goToPage(page: number): void; // Jump to specific page (1-indexed)
  reset(): void;              // Reset to first page
  setPageSize(size: number): void; // Change page size
}
```

#### Utility Function

`getPaginationInfo()` - Non-reactive helper for computed pagination info:

```typescript
import { getPaginationInfo } from '$lib/composables';

const info = getPaginationInfo(items, offset, limit);
// { isFirstPage, isLastPage, startIndex, endIndex }
```

## Adding New Composables

1. Create a new file in this directory (e.g., `useSomething.ts`)
2. Export the composable function with full TypeScript types
3. Add to `index.ts` exports
4. Document usage in this README

Follow the pattern:
- Use Svelte 5 runes (`$state`, `$derived`)
- Provide full TypeScript types
- Include JSDoc comments
- Export from `index.ts`
