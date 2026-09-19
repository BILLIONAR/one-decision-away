import React from 'react';
import { Globe } from 'lucide-react';
import { LOCALES, useLocale, useT, type Locale } from '../i18n';
import { useApp } from '../store/useApp';

interface LanguagePickerProps {
  /** compact = icon + native name in a select; grid = big buttons (Settings) */
  variant?: 'compact' | 'grid';
  className?: string;
}

/**
 * Language selector. Writes both the global i18n locale (immediate re-render)
 * and profile.locale (persisted with the user's data / cloud sync).
 */
export const LanguagePicker: React.FC<LanguagePickerProps> = ({ variant = 'compact', className = '' }) => {
  const [locale, setLocale] = useLocale();
  const t = useT();
  const { data, updateProfile } = useApp();

  const choose = (code: Locale) => {
    setLocale(code);
    if (data && data.profile.locale !== code) {
      void updateProfile({ locale: code });
    }
  };

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${className}`}>
        {LOCALES.map((l) => {
          const active = l.code === locale;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => choose(l.code)}
              aria-pressed={active}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all cursor-pointer ${
                active
                  ? 'border-[var(--color-sage)] bg-[var(--accent-soft)] text-[var(--fg)] font-semibold'
                  : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg-subtle)]'
              }`}
            >
              <span className="text-lg leading-none" aria-hidden>
                {l.flag}
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span>{l.nativeName}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">{t(l.name)}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <label className={`inline-flex items-center gap-1.5 text-xs text-[var(--fg-muted)] ${className}`} title={t('Language')}>
      <Globe className="w-3.5 h-3.5" aria-hidden />
      <span className="sr-only">{t('Language')}</span>
      <select
        value={locale}
        onChange={(e) => choose(e.target.value as Locale)}
        className="bg-transparent border-none outline-none cursor-pointer text-xs font-medium text-[var(--fg)] pr-1"
        aria-label={t('Language')}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
};
