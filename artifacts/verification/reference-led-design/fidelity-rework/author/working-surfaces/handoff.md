# Working surface fidelity rework — frozen author handoff

Branch: `design/reference-led-oda`. Base: `8fc4ef0572a4cfd20964be6e276325161b3a2acf`.

Changed files: `src/pages/Today.tsx`, `src/pages/Focus.tsx`, `src/pages/Notebook.tsx`, `src/components/notebook/JournalWorkspace.tsx`, `src/pages/Courses.tsx`, `src/components/FocusTimerHub.tsx`, `src/styles/notebook.css`, `src/styles/courses.css`, new `src/styles/workingSurfaces.css`. No shared shell, global token, protected artwork, Calendar, service/store/provider or backend changes by this worker. No build, install, commit, push or deployment.

## Concrete composition

Today uses a tall illustrated real daily quote, the genuine saved decision and next lesson stack, and separate compact growth/week modules. At 1440 the working row is 1096 px with approximately 415/388/260 px columns. At 390 the hero is 350 px wide, then the real decision action; the actual saved stage supplies both tree copies. Decorative hero lighting is a CSS violet treatment over the original responsive image bytes. Actual evidence tree/count/ledger remain unchanged.

Notebook's genuine archive date/search controls now lead on mobile. The archive filter does not set a new entry's date. The calendar retains its full month, named keyboard-focusable horizontal scroll region and44 px date hits; the existing localized cue now appears above the dates when the region is narrower than 352 px. The editor follows, then a separate illustrated actual prompt and filtered history. At desktop the illustrated prompt is left; date module and editor are right. Draft, unsaved replacement confirmation, photos, native/fallback dialogs and notebook read-aloud locale are untouched.

Focus promotes the genuine selected duration and existing Start callback above optional settings. Duration presets, mission selection, sound choices and guided voice rows all remain available. At 390 the actual 25:00 setting and Start 25 min control appear in the first screen; selecting the actual 2 minute mission updates to 02:00 and opens the real 120 second timer. Owned course art remains a secondary module.

Course overview leads with actual title/lesson count/minutes, a small owned cover, Start lesson 1 and the complete real lesson roadmap. Existing description, outcomes and scope follow. Course resume/hydration/security checks, lesson minutes, search/filter, workbook, practice, quiz and save semantics retain their exact controllers and callbacks. The Focus course Start control is at y 303/h 48 in the 390 preview.

## Author evidence

`preview-report.json`:24 actual Chromium dev views — EN/light1440, EN/light390, TR/dark320, ES/light390 across Today, Notebook, Focus, catalogue, overview and lesson. Zero page errors, page overflow or scoped WCAG 2 A/AA and 2.1 A/AA axe violations. This does not claim complete accessibility, human listening QA or physical-device testing.

`interaction-report.json`:3 focused behavior checks passed: preserved draft through tab/date filters plus keyboard Sunday scrolling and31 date hits ≥44 px; real duration/preset/mission/start/pause/end; untouched-course entry with5 actual lessons and first-fold Start.

`source-proof.json`:97 JSX event callback attributes and all extracted component pre-render controller statements match the base. NotebookCalendar, notebook/course-progress services, course catalogue/full data, daily-loop service, recorded narration, voice guide and store match base bytes. The report records exact hashes for all 9 owned files. `owned.diff` includes the new stylesheet.

`final-author-report.json`:compact review geometry, checks and SHA256 of actual PNG files. All final PNGs are synthetic isolated review profiles. Relevant 390 screens: `en-light-390-today.png`, `en-light-390-notebook.png`, `en-light-390-focus.png`, `en-light-390-course-overview.png`. Desktop: `en-light-1440-today.png`, `en-light-1440-notebook.png`. The paused actual timer is `en-light-390-actual-focus-paused.png`.

Before composition screenshots are root-captured actual compiled UI under sibling `../before/` (`today.png`, `notebook.png`, `focus.png`, `course-overview.png`). Its report identifies compiled source 4a8b575/current HEAD 8fc4ef0. Fixture differences and app version are disclosed; it is not a pixel-identical same-fixture baseline. The initial bad dev hash-route capture was overwritten by corrected history-route final captures and is not review evidence.

## Remaining limits

The actual source references include sci-fi portrait/samurai/city artwork and a rendered 3D glass/crystal tree that are not in the owned asset inventory. Existing transparent ODA trees and neutral course still-life art were reused; CSS treatment cannot reproduce that exact source art. No exact artwork or pixel likeness claim.

Root still owns the final combined aggregate/typecheck/build and independent visual/flow QA of the committed built bytes. Author preview success is not that final gate. Source is frozen pending that checkpoint.
