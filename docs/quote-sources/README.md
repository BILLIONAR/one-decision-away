# Quote sources (Project Gutenberg)

Plain-text copies of the public-domain books behind `THINKER_QUOTES`
(`src/data/quoteExpansionThinkers.ts`). The app presents these 150 passages as
**adaptations**, not verbatim quotations; these files let anyone check each
adaptation against the chapter named in its `reference`.

| File | Author — Book | Gutenberg eBook | Passages |
| --- | --- | --- | --- |
| `dewey.txt` | John Dewey — How We Think | #37423 | 20 |
| `james.txt` | William James — Talks to Teachers on Psychology | #16287 | 20 |
| `darwin.txt` | Charles Darwin — Autobiography | #2010 | 15 |
| `addams.txt` | Jane Addams — Democracy and Social Ethics | #15487 | 15 |
| `dubois.txt` | W. E. B. Du Bois — The Souls of Black Folk | #408 | 10 |
| `faraday.txt` | Michael Faraday — The Chemical History of a Candle | #14474 | 10 |
| `poincare.txt` | Henri Poincaré — The Foundations of Science | #39713 | 20 |
| `mill.txt` | John Stuart Mill — On Liberty | #34901 | 15 |
| `kropotkin.txt` | Peter Kropotkin — Mutual Aid | #4341 | 15 |
| `nightingale.txt` | Florence Nightingale — Notes on Nursing | #17366 | 10 |

The files are unmodified downloads, including the Project Gutenberg header and
license, and are not shipped with the website.

## Verification (24 Sep 2026)

Every passage was checked against its source for the correct chapter/section,
faithfulness of the English adaptation and agreement of the Turkish version.
All references were correct. Five passages were reworded to match the source
more closely (Addams I, Nightingale XII ×2, Mill III ×2), plus two optional
precision fixes (Dewey VI step 3 Turkish, Du Bois XIV).
`tests/quote-sources.test.ts` keeps each `sourceUrl` tied to a file here.
