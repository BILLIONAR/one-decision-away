# Translation brief

You are translating UI strings and content for "One Decision Away", a personal-transformation / "future life OS" web app (gamified: users earn virtual "Dream Dollars" (D$) for completing missions and micro-habits, buy symbolic "dreams" in a Dream Market, compare "Two Futures" — the life they're building vs the life they're allowing —, do guided meditations, daily check-ins, etc.). Tone: warm, calm, editorial, motivating, second person, never cheesy. Use natural, idiomatic phrasing a native speaker would write for a polished app — not literal word-for-word.

Input: a JSON array of English source strings (file path given in your task).
Output: a JSON object { "<english source>": "<translation>", ... } with EVERY input key present, written to the output path given in your task. Valid JSON, UTF-8, no comments, no trailing commas.

Rules:
1. Keep placeholders exactly: `{n}`, `{name}`, `{amount}`, `{pct}` etc. — same spelling, same braces. Reorder them in the sentence as grammar requires.
2. Keep as-is: `D$` (currency symbol), `One Decision Away`, `AurelyStudio`, `Dream Dollars` may be translated if there's a natural equivalent but keep it consistent within your file (Turkish: "Hayal Doları"; German: "Dream Dollars"; French: "Dream Dollars"; Spanish: "Dream Dollars"; Italian: "Dream Dollars"; Russian: "Dream Dollars"). Keep `Two Futures` as a product-feature name translated consistently (TR: "İki Gelecek", DE: "Zwei Zukünfte", FR: "Deux Futurs", ES: "Dos Futuros", IT: "Due Futuri", RU: "Два будущих").
3. Preserve leading/trailing spaces and punctuation (e.g. " / month" keeps the leading space; "Note:" keeps the colon; "…" stays). Preserve Markdown-ish symbols, arrows (→), bullets (•), emoji.
4. Keys that are proper nouns, place names, code-like tokens, URLs, or already language-neutral (e.g. "OK", "PWA", "CSV", "JSON", "Supabase") → copy unchanged.
5. Short UI labels must stay short (buttons, tabs). Don't add explanations.
6. Singular/plural pairs ("1 day" / "{n} days") — translate each naturally.
7. Meditation cue lines are spoken by TTS: write them as smooth spoken sentences.
8. Quotes attributed to authors: translate the quote; leave author names unchanged.
9. Do not skip any key, do not add keys, do not change key spelling (the key must match the input string byte-for-byte).
10. Use the formal/informal register natural for a consumer wellness app in that language: TR "sen" (informal), DE "du", FR "tu", ES "tú", IT "tu", RU "ты".

Work through the whole file. Write the output with the Write tool as a single JSON file. Do not run any other commands besides reading the input and writing the output. When finished, reply with just the count of keys written.
