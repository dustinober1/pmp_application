"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const SUPPORTED_LOCALES = ["en", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_COOKIE = "pmp_locale";
const LOCALE_STORAGE_KEY = "pmp_locale";

const localeLoaders: Record<SupportedLocale, () => Promise<{ default: object }>> =
  {
    en: () => import("./locales/en.json"),
    es: () => import("./locales/es.json"),
  };

const loadedLocales = new Set<SupportedLocale>();

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

export function getInitialLocale(): SupportedLocale {
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
  await ensureLocale(locale);
  await i18n.changeLanguage(locale);
}

async function ensureLocale(locale: SupportedLocale) {
  if (loadedLocales.has(locale)) return;
  const resources = await localeLoaders[locale]();
  i18n.addResourceBundle(locale, "translation", resources.default, true, true);
  loadedLocales.add(locale);
}

if (!i18n.isInitialized) {
  const initialLocale =
    typeof window === "undefined" ? "en" : getInitialLocale();

  void i18n
    .use(initReactI18next)
    .init({
      resources: {},
      lng: initialLocale,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    })
    .then(() => ensureLocale(initialLocale));
}

export default i18n;
