/**
 * i18n Store for SvelteKit
 * Placeholder for migration - will be connected to translations later
 */

import { writable, derived } from "svelte/store";

export type SupportedLocale = "en" | "es";
export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "es"];

// Placeholder translations
const translations: Record<string, Record<string, string>> = {
  en: {
    Dashboard: "Dashboard",
    Study: "Study",
    Flashcards: "Flashcards",
    Practice: "Practice",
    Formulas: "Formulas",
    Login: "Login",
    Logout: "Logout",
    "Get Started": "Get Started",
    Search: "Search",
    "Switch to light mode": "Switch to light mode",
    "Switch to dark mode": "Switch to dark mode",
  },
  es: {
    Dashboard: "Tablero",
    Study: "Estudio",
    Flashcards: "Flashcards",
    Practice: "Práctica",
    Formulas: "Fórmulas",
    Login: "Iniciar Sesión",
    Logout: "Cerrar Sesión",
    "Get Started": "Comenzar",
    Search: "Buscar",
    "Switch to light mode": "Cambiar a modo claro",
    "Switch to dark mode": "Cambiar a modo oscuro",
  },
};

function createI18nStore() {
  const { subscribe, set, update } = writable<SupportedLocale>("en");

  return {
    subscribe,
    set,
    t: (key: string): string => {
      let locale: SupportedLocale = "en";
      let translated = key;
      subscribe((currentLocale) => {
        locale = currentLocale;
      })();

      translated =
        translations[locale]?.[key] || translations["en"][key] || key;
      return translated;
    },
    toggle: () => {
      update((locale) => (locale === "en" ? "es" : "en"));
    },
  };
}

export const locale = createI18nStore();

// Derived store for translation function
export const t = derived(locale, ($locale) => (key: string) => {
  return translations[$locale]?.[key] || translations["en"][key] || key;
});
