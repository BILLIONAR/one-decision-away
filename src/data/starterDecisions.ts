import { N_ } from '../i18n';

/**
 * Why someone came to ODA, asked once at sign-up in aspirational words
 * ("who I'm becoming", never a problem list). The answer picks the first
 * suggested course, the easy starter decisions and the coach's focus.
 */
export type Intent = 'finish' | 'calm' | 'confidence' | 'focus' | 'energy' | 'start';

export const INTENTS: { key: Intent; label: string; courseId: string }[] = [
  { key: 'finish', label: N_('Someone who finishes what they start'), courseId: 'procrastination' },
  { key: 'calm', label: N_('Calmer and steadier'), courseId: 'calm' },
  { key: 'confidence', label: N_('Someone who trusts themselves'), courseId: 'confidence' },
  { key: 'focus', label: N_('Focused, able to do deep work'), courseId: 'focus' },
  { key: 'energy', label: N_('Rested and full of energy'), courseId: 'sleep' },
  { key: 'start', label: N_('Taking the first step toward a dream'), courseId: 'turning-day' },
];

export const isIntent = (value: unknown): value is Intent => INTENTS.some(item => item.key === value);

/**
 * Decisions small enough to be almost impossible to fail on a first day
 * (the pattern Fabulous and Finch open with). Stored as English source
 * strings so they translate wherever the title is shown.
 */
const EASY: Record<Intent | 'any', string[]> = {
  any: [
    N_('Drink a full glass of water'),
    N_('Walk for 2 minutes'),
    N_('Send one message I’ve been putting off'),
  ],
  finish: [
    N_('Open the task I’ve been avoiding for 2 minutes'),
    N_('Send one email I’ve been putting off'),
    N_('Write the first line of the thing I’m delaying'),
  ],
  calm: [
    N_('Take 5 slow breaths with a long exhale'),
    N_('Walk for 10 minutes without my phone'),
    N_('Drink a glass of water by the window'),
  ],
  confidence: [
    N_('Say one idea out loud in a conversation'),
    N_('Write down one thing I did well today'),
    N_('Ask one question I usually keep to myself'),
  ],
  focus: [
    N_('Work 10 minutes with my phone in another room'),
    N_('Turn off notifications for one work block'),
    N_('Clear my desk before I start'),
  ],
  energy: [
    N_('Go outside for 10 minutes of daylight'),
    N_('No coffee after 2 pm today'),
    N_('Put my phone away 30 minutes before bed'),
  ],
  start: [
    N_('Spend 5 minutes on my dream’s first step'),
    N_('Write my dream’s first real step on paper'),
    N_('Tell one person about the dream I’m starting'),
  ],
};

/** After a lapse: the smallest possible way back in (Duolingo's "happy path"). */
export const COMEBACK_DECISIONS = [
  N_('Drink a full glass of water'),
  N_('Stand up and stretch for 1 minute'),
  N_('Write one sentence about how I feel'),
];

export function easyDecisions(intent?: Intent | null): string[] {
  return intent ? EASY[intent] : EASY.any;
}

export function courseForIntent(intent?: Intent | null): string | null {
  return INTENTS.find(item => item.key === intent)?.courseId ?? null;
}
