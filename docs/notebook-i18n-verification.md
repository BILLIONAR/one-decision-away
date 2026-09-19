# Notebook and EN/TR/ES verification

Verified 2026-09-19.

- Supported languages: English, Turkish, Spanish. Each translated dictionary has 4,445 keys, covering all 4,255 original keys and added UI text. Missing keys and placeholder differences: zero.
- Settings language changes update the interface immediately and persist after reload. All 17 routes opened in each language (51 checks), with no console errors in the final browser session.
- Notebook: journal create/edit, mood, search, calendar, original Dream Journal display; scripting starters and saved pages; future-self prompts and letters; 3/6/9 matching repetitions, partial saves, daily completion and archived history; five gratitude notes; custom affirmations and device-only speech.
- Browser checks confirmed the first daily writing reward of D$25, unchanged balance after subsequent writing/edits, preserved user text across languages, and drafts preserved when visiting Settings to switch languages.
- Desktop and 390px mobile layouts inspected in light/dark themes; no page overflow. JSON export confirmation includes Notebook and Dream Journal.

Commands passed:

```sh
npx tsc --noEmit
npx vite build
node scripts/validate-i18n.mjs
node --import tsx scripts/test-i18n.ts
node --import tsx scripts/test-notebook-voice.ts
node --import tsx --test --test-reporter=spec scripts/test-notebook.ts
```

The 19 backend tests cover lossless legacy/JSON data, concurrency and stale snapshots, reward limits and permanent claims, local-date/DST streaks, the 33-day target, Turkish intention matching, storage failures, and cloud restore ownership/ordering including signed-out imports.

Limits: cloud behavior was verified with mocked Supabase responses; no live Supabase account was configured. The build succeeds with an existing large-chunk advisory. The app's Pro activation remains a demo; this work does not implement billing or server-enforced paid access.
