import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage for tests - use vi.fn() for proper spy capability
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(() => {}),
  removeItem: vi.fn(() => {}),
  clear: vi.fn(() => {}),
  length: 0,
  key: vi.fn(() => null),
};

// Always define localStorage, replacing if it exists
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Common browser APIs not implemented by JSDOM
// Only define these in browser-like environments (jsdom)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).ResizeObserver = ResizeObserverMock;
}

// Mock scrollIntoView for jsdom (not implemented by default)
if (typeof window !== 'undefined' && window.HTMLElement) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.HTMLElement.prototype.scrollIntoView = function () {
    return undefined;
  };
}
