'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { getInitialLocale } from '@/i18n/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const locale = getInitialLocale();
    if (locale !== i18n.language) void i18n.changeLanguage(locale);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
