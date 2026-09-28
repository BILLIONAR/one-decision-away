# ODA course writing guide (September 2026)

For everyone who writes or deepens ODA's guided courses. The goal: lessons that can genuinely change how someone lives — warm, honest, practical and backed by evidence.

## Language

- **English is the primary content language.** Write in clear, warm, plain English (US spelling), addressing the reader as "you".
- Turkish editions follow later as translations of the English edition. The original twelve courses already exist in Turkish (`src/data/courses.ts` and `src/data/courseContent/*.ts`); their English editions live in `src/data/courseContent/en/<id>.ts`.

## Rule 1: Sources

- Every lesson ends with a visible "Sources and limits of this lesson" section, and the course page lists the research. So every claim needs a source in the file's `SOURCES` and in the lesson's `sources` list.
- You may name a study in the text, but keep it light — the reading should not turn into a bibliography. "A review that pooled dozens of studies found…" usually reads better.
- Name the owner of a technique ("Dr. Joe Dispenza suggests…"). `technique.origin` format: `"Person Name · Book or source (year)"`.
- A source: `{ id, title, url, type: 'research' | 'guidance' | 'religious' | 'technique', finding, limitation }`. `finding` states accurately what the source found (numbers where available); `limitation` states honestly what it does not show and what you actually read ("abstract only", etc.).

## Rule 2: Honesty and safety

- Do not overstate. If an effect is small, say "a small but real effect".
- Separate unsupported claims clearly and kindly: quantum reality-shifting, healing illness with thought, "the universe delivers", changing genes by thinking, frequency healing, and so on. Keep the working core of a technique (attention, rehearsal, habit, body, planning).
- No medical or psychological treatment promises; say "not a substitute for treatment" where relevant. For crisis, self-harm thoughts or emergencies: contact local emergency services (112 in Türkiye, 911 in the US) — write "your local emergency number".
- Don't present findings that failed to replicate (e.g. hormone effects of power posing) as facts.

## Rule 3: Copyright

- **No quotations from books**, not even short ones. Retell techniques step by step in your own words.
- Public-domain authors (Marcus Aurelius, Seneca, Epictetus) are often read in copyrighted translations: paraphrase.
- No song lyrics, poems or film lines.

## Rule 4: Research

- Verify every technique and finding with at least one reliable source you actually opened (WebFetch): peer-reviewed paper or meta-analysis, university or official health body page, the author's own site or the publisher's page.
- Numbers in `bars` charts must match the source exactly.
- YouTube can't be watched; use written summaries, transcripts and the authors' own sites.
- If you can't open a page, don't cite it; leave the claim out or use a source already in the repo.

## File format

TypeScript. Types live in `src/data/courses.ts`: `CourseSource`, `GuidedCourse`, `CourseLesson`, `LessonVisual`, `LessonTechnique`, `LessonSection`, `LessonExample`. Style reference (Turkish, but the structure is what matters): `src/data/courseContent/meditation.ts`.

Each English edition file `src/data/courseContent/en/<id>.ts` exports:

```ts
import type { CourseSource, GuidedCourse } from '../../courses';
export const SOURCES: CourseSource[] = [ ... ];
export const COURSE: GuidedCourse = { id, title, subtitle, description, scope, outcome, photo, lessons: [ ... ] };
```

The file is already registered in `src/data/courseContent/en/index.ts`; edit only your own file.

### English edition of an existing course

- Keep the course `id` and every lesson `id` exactly (`confidence-1` … `confidence-5`). Keep the number of lessons.
- Translate faithfully and improve: `title`, `goal`, `reading`, `practice` (still exactly 3 steps), `reflection`, `question`, `options` (same order, same `correct` index), `feedback`, `takeaway`, the `visual`, the `technique`.
- **Add depth:** `deeper` (2–3 sections) and `example` for every lesson (see below).
- Sources: for each source the lesson already uses, include an English version in your `SOURCES` with the **same id** (translate `title`/`finding`/`limitation`). New sources get new ids prefixed with the course id (`confidence-...`).
- Photos: reuse the lesson's existing photo id (see `src/data/courseContent/photosA/B/C.ts` or the course file) with an English `alt`.
- Religious content (faith course): keep scripture references accurate (quran.com, sunnah.com), respectful, and separate from psychology findings.

### New course

- 6–7 lessons, ids `<id>-1`, `<id>-2`, …
- `description`: 1–2 sentences, curious, not overpromising. `scope`: who it's for, what it is not, safety note. `outcome`: what the reader will concretely have at the end.
- New Unsplash photos (see below).

### Every lesson (`CourseLesson`)

| Field | Rule |
| --- | --- |
| `title` | Short and inviting. |
| `minutes` | Integer 6–12. |
| `goal` | One concrete sentence. |
| `reading` | Exactly 2 paragraphs, 70–130 words each. The core of the lesson. |
| `deeper` | 2–3 sections `{ heading, paragraphs: 1–3, visual? }` — "Why it works", "Common mistakes", "In daily life", "What the research says", "How [teacher] does it". At least one section carries its own visual. |
| `example` | `{ title, text }`: a realistic invented person (e.g. "Maya, 29, accountant"), 90–150 words, applying the idea in one ordinary day. A small, believable change — no miracles. |
| `practice` | Exactly 3 distinct steps, doable now. |
| `reflection` | One question to ask yourself. |
| `question` / `options` / `correct` / `feedback` | 3 distinct options; one clearly right. |
| `takeaway` | One memorable sentence. |
| `sources` | Every source id this lesson relies on (including technique and chart sources, and any used in `deeper` visuals). |
| `visual` | Required. |
| `technique` | When a named method exists: `{ name, origin, steps: 3–7, evidence, sourceId }`; `sourceId` must be a `'technique'` source also listed in `sources`. Every `'technique'` source in your file must be used by some lesson. |
| `photo` | `{ id, alt }` (Unsplash). |

### Visual kinds (`LessonVisual`)

- `table`: 2–4 columns, 2–6 rows, each row as wide as the columns.
- `compare`: `left` and `right`, 2–4 items each.
- `steps`: 3–5 `{ label, text }`.
- `cycle`: a loop of 3–6 `{ label, text }` nodes, optional `center` label — thought → feeling → action, habit loops.
- `bars`: 1–5 bars with real numbers, `note` required, `sourceId` must be in the lesson's `sources`.

Vary the kinds within a course.

## Photos

- Unsplash, free licence. Search page: `https://unsplash.com/s/photos/<query>?license=free` (open with WebFetch; take ids from `images.unsplash.com/photo-<ID>` URLs and the descriptions).
- Id format: `1522075782449-e45a34f1ddfb`. Skip `premium_photo` ids.
- Never reuse an id already in the app: `grep -rhoE "[0-9]{9,13}-[0-9a-f]{12}" src/data` (new courses only; English editions of existing courses reuse their own lesson's photo).
- Calm, natural photos with people or places; no stock grins. Photos will be checked by eye later.

## Voice

- Warm, clear, adult to adult. No preaching: "you can try" rather than "you must".
- Short sentences; explain a term the first time it appears.
- No emoji; few exclamation marks.
- Never blame: not "you failed" but "this time it didn't work — what did you learn?"

## Check

- `npx tsc --noEmit` passes.
- `node --import tsx --test tests/course-content.test.ts tests/course-content-en.test.ts` passes for your course (other writers' files may still be empty).
- Edit only your own file.
