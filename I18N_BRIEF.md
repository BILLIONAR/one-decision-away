# i18n wrapping brief (Phase A)

Repo: /home/claude/oda (React 19 + Vite + TS). Do NOT run npm install. Verify with `npx tsc --noEmit` at the end (must pass).

The app is being localized to 7 languages using a gettext-style API in `src/i18n/index.ts`:

- `t(source: string, params?: Record<string, string|number>): string` — English source string IS the key. Returns translation or the source unchanged.
- In React components: `import { useT } from '../i18n';` then `const t = useT();` inside the component (a hook — must be called unconditionally at the top level of the component/custom hook, never inside loops/conditions/callbacks defined outside a component). Nested helper components in the same file need their own `const t = useT();`.
- In non-React code (services, utils, store callbacks outside render, module-level constants that are read at call time): `import { t } from '../i18n';`.
- In static data files: `import { N_ } from '../i18n';` and wrap user-visible strings as `N_('Text')`. N_ is identity; extraction picks it up. The DISPLAY site must call `t(value)`.

## What to wrap
Every user-visible English string: JSX text, `title=`, `placeholder=`, `aria-label=`, `alt=`, option labels, toast messages, `showToast('...')`, error messages shown to the user, button labels, empty states, section headings, notification titles/bodies, share-card text, CSV column headers, `document.title`, `confirm()`/`alert()` text, default names shown to user (e.g. 'Dream Builder'), speech text.

## What NOT to wrap
- Non-visible strings: ids, keys, class names, CSS, route paths ('/app/market'), localStorage keys, enum/union values ('light' | 'dark', 'sage', 'success', category ids like 'money'), event names, URLs, font names, emoji-only strings, number formats, date format tokens, console.log/console.warn, code comments, TypeScript types, `data-*` attrs, Unsplash URLs, storage keys, mission `kind`/`type` values used in logic, hex colors.
- Do NOT translate/alter any logic. Do NOT rename identifiers. Do not change enum values that are compared elsewhere.
- Strings that are compared against stored values (`if (x === 'Money')`) — leave the comparison alone; wrap only the display site.

## Interpolation and dynamic strings
- Template literals with variables → `t('Hello {name}, you have {n} dreams', { name, n })`. Curly-brace placeholder names must be simple identifiers. Never leave `${}` inside a t() key.
- Ternaries: `{x ? 'Active' : 'Paused'}` → `{x ? t('Active') : t('Paused')}`.
- Concatenation `'Day ' + n` → `t('Day {n}', { n })`.
- Plurals: use two keys if the wording differs: `n === 1 ? t('1 day') : t('{n} days', { n })`.
- String arrays/objects of labels defined at module level (e.g. `const LABELS = { money: 'Money', ... }`): wrap values with `N_()` and call `t(LABELS[k])` at the display site — OR move the constant inside the component using `t()`. Prefer the smallest safe change.
- Keys must be plain, complete English sentences/phrases exactly as they appear today (keep punctuation, capitalization, Unicode like — and ’). Don't split a sentence across multiple t() calls if it can be one key with params.
- Keep JSX structure; if a sentence contains inline `<strong>` etc., split at natural boundaries or use params with plain text — small compromise is OK.

## Per-file checklist
1. Add the import.
2. Add `const t = useT();` in each component/hook that needs it (top level, after other hooks is fine).
3. Wrap every visible string. Aim for 100% coverage of the files assigned; be thorough — grep the file afterwards for remaining quoted English text in JSX (`>[A-Z]`, `title="`, `placeholder="`, `'…'` in showToast) and fix.
4. If a `useMemo`/`useCallback` uses `t`, add `t` to its dependency array.
5. Run `npx tsc --noEmit` and fix any errors in your files.

Report: list of files done, approximate number of strings wrapped, anything you deliberately left untranslated and why.
