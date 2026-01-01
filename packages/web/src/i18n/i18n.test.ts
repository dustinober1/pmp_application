import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage before importing i18n
const mockGetItem = vi.fn(() => null);
const mockSetItem = vi.fn();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: mockGetItem,
    setItem: mockSetItem,
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
});

// Now import i18n after mocking localStorage
import i18n, { getInitialLocale, setLocale, SUPPORTED_LOCALES } from './i18n';
import type { SupportedLocale } from './i18n';

describe('i18n', () => {
  describe('SUPPORTED_LOCALES', () => {
    it('includes English', () => {
      expect(SUPPORTED_LOCALES).toContain('en');
    });

    it('includes Spanish', () => {
      expect(SUPPORTED_LOCALES).toContain('es');
    });

    it('has exactly 2 locales', () => {
      expect(SUPPORTED_LOCALES).toHaveLength(2);
    });
  });

  describe('i18n instance', () => {
    it('is initialized', () => {
      expect(i18n.isInitialized).toBe(true);
    });

    it('has English resources', () => {
      expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
    });

    it('has Spanish resources', () => {
      expect(i18n.hasResourceBundle('es', 'translation')).toBe(true);
    });

    it('has English as fallback language', () => {
      expect(i18n.options.fallbackLng).toContain('en');
    });

    it('has escapeValue set to false', () => {
      expect(i18n.options.interpolation?.escapeValue).toBe(false);
    });
  });
});

describe('getInitialLocale', () => {
  const originalDocument = globalThis.document;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetItem.mockReturnValue(null);
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: '' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      writable: true,
    });
  });

  it('returns locale from cookie if valid', () => {
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: 'pmp_locale=es' },
      writable: true,
    });

    expect(getInitialLocale()).toBe('es');
  });

  it('returns locale from localStorage if cookie not set', () => {
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: '' },
      writable: true,
    });
    mockGetItem.mockReturnValue('es');

    expect(getInitialLocale()).toBe('es');
  });

  it('returns en as default when no valid locale found', () => {
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: '' },
      writable: true,
    });
    mockGetItem.mockReturnValue(null);

    const result = getInitialLocale();
    expect(['en', 'es']).toContain(result);
  });

  it('ignores invalid cookie value', () => {
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: 'pmp_locale=invalid' },
      writable: true,
    });
    mockGetItem.mockReturnValue(null);

    const result = getInitialLocale();
    expect(['en', 'es']).toContain(result);
  });

  it('handles multiple cookies correctly', () => {
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: 'other=value; pmp_locale=es; another=test' },
      writable: true,
    });

    expect(getInitialLocale()).toBe('es');
  });

  it('handles encoded cookie values', () => {
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: 'pmp_locale=' + encodeURIComponent('es') },
      writable: true,
    });

    expect(getInitialLocale()).toBe('es');
  });
});

describe('setLocale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: '' },
      writable: true,
    });
  });

  it('sets locale cookie', () => {
    const mockDocument = { cookie: '' };
    Object.defineProperty(globalThis, 'document', {
      value: mockDocument,
      writable: true,
    });

    setLocale('es' as SupportedLocale);

    expect(mockDocument.cookie).toContain('pmp_locale=es');
    expect(mockDocument.cookie).toContain('path=/');
    expect(mockDocument.cookie).toContain('max-age=31536000');
    expect(mockDocument.cookie).toContain('samesite=lax');
  });

  it('sets locale in localStorage', () => {
    setLocale('es' as SupportedLocale);

    expect(mockSetItem).toHaveBeenCalledWith('pmp_locale', 'es');
  });

  it('changes i18n language', async () => {
    const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

    setLocale('es' as SupportedLocale);

    expect(changeLanguageSpy).toHaveBeenCalledWith('es');
    changeLanguageSpy.mockRestore();
  });

  it('sets English locale correctly', () => {
    const mockDocument = { cookie: '' };
    Object.defineProperty(globalThis, 'document', {
      value: mockDocument,
      writable: true,
    });

    setLocale('en' as SupportedLocale);

    expect(mockDocument.cookie).toContain('pmp_locale=en');
  });
});
