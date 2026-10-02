# Working-surface fidelity rework before code

Base: 8fc4ef0572a4cfd20964be6e276325161b3a2acf on the existing design/reference-led-oda branch. Latest user rejected the previous generic lavender treatment and requests stronger likeness to the actual attached reference pixels. No release is authorized.

## Pixel observations and present mismatch

IMG_8664 has a compact pearl profile/nav rail, a tall central illustrated quote/priority panel, and a dense right column of small progress/schedule cards with clear internal dividers. IMG_8663 has pearl-white working panels, large portrait/quote hierarchy, small lavender milestone circles connected by thin lines, and compact journal/calendar/editor cards. Both rely on composition, image scale and nested modules, rather than a lavender page fill and repeated oversized pills.

The current Today quote is a short horizontal text card, the decision is a separate wide dark block, and the owned growth tree occupies another broad card. Notebook has a small text-only prompt above a large editor and wide archive; its large filled stat/tab pills dominate. Courses has a wide gradient title card, tall uniform photo cards and filled roadmap rows. These are material composition differences from the references.

## Concrete geometry

- Today desktop: after the root-owned nav rail, use a command area with a tall illustrated quote hero (about 36–40% of content width, 520–620px tall), decision/course planning stack (about 34–38%), and compact authentic tree/week evidence stack (remaining 22–28%), 14–16px gutters. Keep real quote attribution, decision actions and continuation text. On 390px, preserve a 360–400px illustrated hero, then real decision and compact evidence modules; no text or controls overlap the art.
- Today support modules: two compact pearl card columns on wide content, one on mobile, 16–20px padding, 16–20px radius and thin internal dividers. All existing actions and conditional states remain present.
- Notebook: separate a tall actual-prompt/owned-tree illustration panel from the editor/archive modules. Wide content uses an illustrated left module and clear writing/history modules; mobile keeps an illustrated prompt followed by compact editor and the complete accessible calendar. Real draft text is preserved. Date buttons stay at least 44px and the approved narrow scroll cue/focus region remain untouched.
- Focus: a pearl illustrated header/side module and the actual existing timer hub as the main control panel; style the timer's existing sections and controls without modifying its state, audio or timer handlers.
- Courses: compact learning introduction with an owned cover, white divided working cards, fine-line lesson roadmap with real numbered/completed/locked states, and smaller nested workbook/quiz modules. Preserve every overview/resume/search/filter/lesson minute/quiz/storage behavior and selector.

## Exact file ownership

src/pages/Today.tsx; src/pages/Focus.tsx; src/pages/Notebook.tsx; src/components/notebook/JournalWorkspace.tsx; src/pages/Courses.tsx; src/styles/notebook.css; src/styles/courses.css; new src/styles/workingSurfaces.css scoped to Today/Focus. No shared shell/reference.css/tokens/global CSS, Calendar, Coach/Sound, store/service/data/provider changes.

## Central artwork limitation

Actual owned bytes inspected: realistic transparent green tree stages and four neutral stone/light course still-life covers (blank card/pen, leaf branch/window, mug/linen, notebook/pencil). These can be shown truthfully using the existing responsive image components and actual kept-decision count. No owned sci-fi portrait, samurai, city scene, purple glass tree or 3D crystal exists. Decorative CSS chamber/rings can strengthen the reference's image hierarchy, but cannot establish exact central artwork likeness. Do not claim it.

## Validation boundary

Use normal local dev preview for actual 1440 desktop, 390 mobile and 320 reflow screenshots, synthetic isolated records and EN/TR/ES light/dark checks. Verify source action/handler preservation, calendar scroll discoverability, drafts/photo dialog, actual course controls and timer/reward flow. Root owns aggregate/build and independent QA after all source is complete. No installs/builds/commits/pushes/deployment by this worker.
