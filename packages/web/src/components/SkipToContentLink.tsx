'use client';

import { useTranslation } from 'react-i18next';

export function SkipToContentLink() {
  const { t } = useTranslation();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--primary)] focus:text-white"
    >
      {t('Skip to main content')}
    </a>
  );
}
