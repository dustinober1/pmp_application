import { writable, derived, get } from "svelte/store";

export const SUPPORTED_LOCALES = ["en", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_COOKIE = "pmp_locale";
const LOCALE_STORAGE_KEY = "pmp_locale";

interface LocaleData {
  [key: string]: string | LocaleData;
}

const localeLoaders: Record<
  SupportedLocale,
  () => Promise<{ default: LocaleData }>
> = {
  en: () => import("./locales/en.json"),
  es: () => import("./locales/es.json"),
};

// Create a writable store for current locale
function createLocaleStore() {
  const { subscribe, set, update } = writable<SupportedLocale>("en");

  // Load locale data
  const localeData = writable<Record<SupportedLocale, LocaleData>>({
    en: {},
    es: {},
  });

  const loadedLocales = new Set<SupportedLocale>();

  return {
    subscribe,
    set,
    update,
    async loadLocale(locale: SupportedLocale): Promise<void> {
      if (loadedLocales.has(locale)) return;

      try {
        const resources = await localeLoaders[locale]();
        localeData.update((data) => ({
          ...data,
          [locale]: resources.default,
        }));
        loadedLocales.add(locale);
      } catch (error) {
        console.error(`Failed to load locale "${locale}":`, error);
      }
    },
    getTranslations(locale: SupportedLocale): LocaleData {
      return get(localeData)[locale] || {};
    },
  };
}

export const localeStore = createLocaleStore();

function isSupportedLocale(
  value: string | null | undefined,
): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function getInitialLocale(): Promise<SupportedLocale> {
  const fromCookie = getCookie(LOCALE_COOKIE);
  if (isSupportedLocale(fromCookie)) return fromCookie;

  if (typeof localStorage !== "undefined") {
    const fromStorage = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isSupportedLocale(fromStorage)) return fromStorage;
  }

  if (typeof navigator !== "undefined") {
    const lang = navigator.language?.split("-")[0];
    if (isSupportedLocale(lang)) return lang;
  }

  return "en";
}

export async function setLocale(locale: SupportedLocale): Promise<void> {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }

  await localeStore.loadLocale(locale);
  localeStore.set(locale);
}

// Translation function store
export const t = derived(localeStore, ($locale) => {
  const translations = localeStore.getTranslations($locale);
  return (key: string, params?: Record<string, string>): string => {
    const keys = key.split(".");
    let value: string | LocaleData = translations;

    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value === "string") {
      // Replace parameters in the translation
      if (params) {
        return Object.entries(params).reduce(
          (str, [param, replacement]) =>
            str.replace(new RegExp(`{{${param}}}`, "g"), replacement),
          value,
        );
      }
      return value;
    }

    return key;
  };
});

// Initialize i18n
export async function initI18n(): Promise<void> {
  const initialLocale = await getInitialLocale();
  await localeStore.loadLocale(initialLocale);
  localeStore.set(initialLocale);
}
