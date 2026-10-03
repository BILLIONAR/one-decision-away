import React from 'react';
import { PenLine } from 'lucide-react';
import { useT } from '../../i18n';
import { promptForDate } from '../../data/journalPrompts';
import { NButton } from './shared';

/** A rotating writing prompt: same one all day, a new one tomorrow. */
export const TodaysPrompt: React.FC<{ today: string; onUse: (prompt: string) => void }> = ({ today, onUse }) => {
  const t = useT();
  const prompt = t(promptForDate(today));
  return (
    <section aria-labelledby="notebook-prompt-label" className="oda-card rounded-[var(--radius-lg)] p-5 space-y-3">
      <p id="notebook-prompt-label" className="oda-kicker text-[var(--brand-burgundy)]">{t('Today’s prompt')}</p>
      <p className="oda-display text-[21px] leading-snug text-[var(--fg)] max-w-[40ch]">{prompt}</p>
      <NButton type="button" variant="secondary" icon={PenLine} onClick={() => onUse(prompt)}>{t('Use this prompt')}</NButton>
    </section>
  );
};
