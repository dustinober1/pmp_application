"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

export const SUPPORTED_LOCALES = ["en", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_COOKIE = "pmp_locale";
const LOCALE_STORAGE_KEY = "pmp_locale";

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

export function setLocale(locale: SupportedLocale): void {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
  void i18n.changeLanguage(locale);
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: typeof window === "undefined" ? "en" : getInitialLocale(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
