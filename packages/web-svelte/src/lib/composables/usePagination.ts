/**
 * Reusable pagination composable for Svelte 5
 *
 * Provides offset-based pagination with configurable page size
 * and automatic slice calculation for display items.
 *
 * @example
 * ```ts
 * const pagination = usePagination({ items: [], pageSize: 20 });
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
  /** Update items array */
  setItems: (items: T[]) => void;
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
 * Wrap the returned object in $state() in your Svelte component:
 * ```ts
 * let pagination = $state(usePagination({ items, pageSize: 20 }));
 * ```
 *
 * @param options - Pagination configuration options
 * @returns Pagination state and control methods
 */
export function usePagination<T>(
  options: PaginationOptions<T>
): PaginationState<T> {
  let { items, pageSize = 20, initialOffset = 0 } = options;

  // State
  let offset = initialOffset;
  let limit = pageSize;

  // Getters for computed values (called by Svelte's reactivity when accessed)
  const getState = () => ({
    offset,
    limit,
    displayItems: items.slice(offset, offset + limit),
    hasMore: offset + limit < items.length,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
    currentPageInfo:
      items.length > 0
        ? `Showing ${offset + 1} to ${Math.min(offset + limit, items.length)} of ${items.length}`
        : 'No items'
  });

  // Create a proxy that provides reactive access to the state
  const state = new Proxy({} as PaginationState<T>, {
    get(_target, prop: keyof PaginationState<T>) {
      const current = getState();
      if (prop in current) {
        return current[prop as keyof typeof current];
      }
      // Method handlers
      switch (prop) {
        case 'previous':
          return () => {
            offset = Math.max(0, offset - limit);
          };
        case 'next':
          return () => {
            const newOffset = offset + limit;
            offset = Math.min(newOffset, Math.max(0, items.length - 1));
          };
        case 'goToPage':
          return (page: number) => {
            const totalPages = Math.max(1, Math.ceil(items.length / limit));
            const targetPage = Math.max(1, Math.min(page, totalPages));
            offset = (targetPage - 1) * limit;
          };
        case 'reset':
          return () => {
            offset = 0;
          };
        case 'setPageSize':
          return (size: number) => {
            const currentPage = Math.floor(offset / limit) + 1;
            limit = Math.max(1, size);
            offset = Math.min((currentPage - 1) * limit, Math.max(0, items.length - 1));
          };
        case 'setItems':
          return (newItems: T[]) => {
            items = newItems;
            offset = 0;
          };
        default:
          return undefined;
      }
    }
  });

  return state;
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
