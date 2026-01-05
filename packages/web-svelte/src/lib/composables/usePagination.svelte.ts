/**
 * Reusable pagination composable for Svelte 5
 *
 * Provides offset-based pagination with configurable page size
 * and automatic slice calculation for display items.
 *
 * @example
 * ```ts
 * const items = $state([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
 * const pagination = usePagination({ items, pageSize: 3 });
 *
 * // Access paginated data
 * console.log(pagination.displayItems); // [1, 2, 3]
 * console.log(pagination.hasMore); // true
 * console.log(pagination.currentPageInfo); // "Showing 1 to 3 of 10"
 *
 * // Navigate
 * pagination.next();
 * pagination.previous();
 * pagination.goToPage(2);
 * pagination.reset();
 * ```
 */

export interface PaginationOptions<T> {
  /** The array of items to paginate */
  items: T[];
  /** Number of items per page (default: 20) */
  pageSize?: number;
  /** Initial page offset (default: 0) */
  initialOffset?: number;
}

export interface PaginationState<T> {
  /** Current offset index */
  offset: number;
  /** Number of items per page */
  limit: number;
  /** Items for the current page */
  displayItems: T[];
  /** Whether there are more items to show */
  hasMore: boolean;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Formatted string showing current page range */
  currentPageInfo: string;
  /** Navigate to previous page */
  previous: () => void;
  /** Navigate to next page */
  next: () => void;
  /** Jump to specific page (1-indexed) */
  goToPage: (page: number) => void;
  /** Reset to first page */
  reset: () => void;
  /** Update page size */
  setPageSize: (size: number) => void;
}

export interface PaginationComputedInfo {
  /** Whether we're on the first page */
  isFirstPage: boolean;
  /** Whether we're on the last page */
  isLastPage: boolean;
  /** Start index of current page (1-indexed) */
  startIndex: number;
  /** End index of current page (1-indexed) */
  endIndex: number;
}

/**
 * Creates a pagination composable with reactive state management
 *
 * @param options - Pagination configuration options
 * @returns Pagination state and control methods
 */
export function usePagination<T>(
  options: PaginationOptions<T>
): PaginationState<T> {
  const { items, pageSize = 20, initialOffset = 0 } = options;

  // Reactive state
  let offset = $state(initialOffset);
  let limit = $state(pageSize);

  // Computed values
  const displayItems = $derived<T[]>(
    items.slice(offset, offset + limit)
  );

  const hasMore = $derived<boolean>(
    offset + limit < items.length
  );

  const currentPage = $derived<number>(
    Math.floor(offset / limit) + 1
  );

  const totalPages = $derived<number>(
    Math.max(1, Math.ceil(items.length / limit))
  );

  const currentPageInfo = $derived<string>(
    items.length > 0
      ? `Showing ${offset + 1} to ${Math.min(offset + limit, items.length)} of ${items.length}`
      : 'No items'
  );

  // Navigation methods
  function previous(): void {
    const newOffset = Math.max(0, offset - limit);
    offset = newOffset;
  }

  function next(): void {
    const newOffset = offset + limit;
    offset = Math.min(newOffset, items.length - 1);
  }

  function goToPage(page: number): void {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    offset = (targetPage - 1) * limit;
  }

  function reset(): void {
    offset = 0;
  }

  function setPageSize(size: number): void {
    const currentPageBeforeReset = currentPage;
    limit = Math.max(1, size);
    // Try to stay on the same logical page
    offset = Math.min((currentPageBeforeReset - 1) * limit, items.length - 1);
  }

  return {
    offset,
    limit,
    displayItems,
    hasMore,
    currentPage,
    totalPages,
    currentPageInfo,
    previous,
    next,
    goToPage,
    reset,
    setPageSize
  };
}

/**
 * Utility function to calculate pagination info without reactive state
 * Useful for non-reactive contexts or when you only need computed values
 *
 * @param items - The array of items
 * @param offset - Current offset
 * @param limit - Page size
 * @returns Computed pagination information
 */
export function getPaginationInfo<T>(
  items: T[],
  offset: number,
  limit: number
): PaginationComputedInfo {
  const isFirstPage = offset === 0;
  const isLastPage = offset + limit >= items.length;
  const startIndex = items.length > 0 ? offset + 1 : 0;
  const endIndex = Math.min(offset + limit, items.length);

  return {
    isFirstPage,
    isLastPage,
    startIndex,
    endIndex
  };
}
