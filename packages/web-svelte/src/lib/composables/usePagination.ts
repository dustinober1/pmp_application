/**
 * Reusable pagination composable for Svelte 5
 *
 * Provides offset-based pagination with configurable page size
 * and automatic slice calculation for display items.
 */

export interface PaginationOptions<T> {
  /** The array of items to paginate */
  items: T[];
  /** Number of items per page (default: 20) */
  pageSize?: number;
  /** Initial page offset (default: 0) */
  initialOffset?: number;
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
 * Pagination class with reactive-like state
 *
 * Usage in Svelte 5:
 * ```ts
 * let pagination = $state(new Pagination({ items, pageSize: 20 }));
 * ```
 */
export class Pagination<T> {
  #items: T[];
  #offset: number;
  #limit: number;

  constructor(options: PaginationOptions<T>) {
    this.#items = options.items;
    this.#limit = options.pageSize ?? 20;
    this.#offset = options.initialOffset ?? 0;
  }

  /** Current offset index */
  get offset(): number {
    return this.#offset;
  }

  /** Number of items per page */
  get limit(): number {
    return this.#limit;
  }

  /** Items for the current page */
  get displayItems(): T[] {
    return this.#items.slice(this.#offset, this.#offset + this.#limit);
  }

  /** Whether there are more items to show */
  get hasMore(): boolean {
    return this.#offset + this.#limit < this.#items.length;
  }

  /** Current page number (1-indexed) */
  get currentPage(): number {
    return Math.floor(this.#offset / this.#limit) + 1;
  }

  /** Total number of pages */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.#items.length / this.#limit));
  }

  /** Formatted string showing current page range */
  get currentPageInfo(): string {
    if (this.#items.length === 0) return 'No items';
    return `Showing ${this.#offset + 1} to ${Math.min(this.#offset + this.#limit, this.#items.length)} of ${this.#items.length}`;
  }

  /** Navigate to previous page */
  previous(): void {
    this.#offset = Math.max(0, this.#offset - this.#limit);
  }

  /** Navigate to next page */
  next(): void {
    const newOffset = this.#offset + this.#limit;
    this.#offset = Math.min(newOffset, Math.max(0, this.#items.length - 1));
  }

  /** Jump to specific page (1-indexed) */
  goToPage(page: number): void {
    const targetPage = Math.max(1, Math.min(page, this.totalPages));
    this.#offset = (targetPage - 1) * this.#limit;
  }

  /** Reset to first page */
  reset(): void {
    this.#offset = 0;
  }

  /** Update page size */
  setPageSize(size: number): void {
    const currentPage = this.currentPage;
    this.#limit = Math.max(1, size);
    this.#offset = Math.min((currentPage - 1) * this.#limit, Math.max(0, this.#items.length - 1));
  }

  /** Update items array */
  setItems(items: T[]): void {
    this.#items = items;
    this.#offset = 0;
  }
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
): Pagination<T> {
  return new Pagination(options);
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
