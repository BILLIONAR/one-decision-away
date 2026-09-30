# ODA landing direction · 30 September 2026

The audience is someone with something they care about but a difficult time making a manageable start. The primary action is to choose their first daily decision. The page explains the actual session before introducing the broader library.

## Product and brand choices

- Keep the owner's original C4 asset, `ODA` without dots, `ONE DECISION AWAY`, and the exact `Designed by Yahya` signature. The doorway illustration extends the existing opportunity theme; it does not replace the logo.
- Use warm ivory, forest green and wine through the shared theme tokens. Editorial headings, clear rules and a restrained arch give the product a recognizable front door. Dark mode follows the shared theme.
- Show a complete, keyboard-operable example of choosing a direction, planning a small action and reflecting. Its state stays in React; it does not write an example into the visitor's personal record.
- Explain why to return: record what helped, review the result and adjust the next action. Describe useful observations and practice rather than promising clinical or life-changing outcomes.
- Show course outcomes, lesson counts and estimated time from the generated lightweight catalog. Avoid stale fixed counts and the old claim that all courses are only in Turkish. Set the content language on fallback editions.
- Let course previews open their actual course using the existing `oda_course_selection_v1` contract. No purchase, account or paid API is triggered.
- Explain local storage, backups and optional AI honestly. Keep the daily decision, notebook and backup offer consistent with `services/entitlements.ts`; clarify that current web and native access can differ.
- Use CSS depth without an animation loop, WebGL, downloaded stock art or added runtime dependencies. Respect reduced motion and retain visible keyboard focus and 44px primary interaction targets.

## Public inspiration reviewed

These references informed general principles. No layouts, illustrations, trademarks or marketing copy were copied.

- [Headspace's public product page](https://www.headspace.com/) organizes support around visitor needs and shows the library before FAQs. ODA uses that need-oriented clarity while keeping its own editorial composition and everyday-skill scope. Headspace's medical claims do not establish claims about ODA.
- [Tiny Habits, the creator's public site](https://tinyhabits.com/) reinforces the value of a manageable starting action. ODA's preview uses an original reading example and makes no guaranteed outcome claim.
- Domain-filtered Pinterest search returned [editorial wellness branding](https://www.pinterest.com/ideas/editorial-wellness-branding/920075971669/) and the public [Health & Wellness Editorial Design board](https://www.pinterest.com/lydiahuisken/health-wellness-editorial-design/). The public search metadata suggested editorial print and branding references; the warm-paper, typography-and-rules direction is our design interpretation. Direct search-page and board access was blocked (403), so no claim is made about inspecting individual pins. No pins or third-party assets were downloaded or embedded.

## Browser evidence

Run `node scripts/qa-landing.mjs` against a running dev server, or set `ODA_QA_URL` to a preview server. Output is under `artifacts/landing/`.

The 30 September run passed keyboard operation, unchanged personal storage after demo interaction, selected-course routing, responsive overflow and 44px primary targets across EN/TR/ES. Screenshots cover 390px and 1440px in each language and dark mobile. Axe WCAG 2/2.1 A/AA checks found zero violations in those seven scanned cases. These automated checks supplement visual inspection; they are not native device or App Store testing.
