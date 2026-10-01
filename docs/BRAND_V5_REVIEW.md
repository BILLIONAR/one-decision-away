# ODA v5 identity review

This refinement was explicitly requested in the current design brief. It remains on the development branch pending the parent visual/QA checkpoint and separate publication approval.

The branch emblem and the ODA letterforms are original vector paths drawn for this application. They do not trace, embed or copy Pinterest artwork or stock symbols. Two asymmetric curves describe a branching decision; the selected tip is a wine leaf. The high-contrast serif O, D and A use integral vector counters and do not require an installed font. The descriptor uses the existing UI typeface in React.

`src/brand/v5.ts` is the single path source for the React components and generated assets. The default mark is forest/wine on ivory. The inverted mark has ivory branches and letterforms with an ivory outline around the wine tip, rather than a brightness filter. A monochrome form uses one ink colour. The primary horizontal lockup is 192 × 64; the mobile lockup is 84 × 32 with a 28px emblem and 50px wordmark.

Actual-size review: `artifacts/verification/premium-brand/brand-v5-size-review.png` includes 24px monochrome, 28px emblem, compact and primary forms on ivory and forest. The source was visually inspected at those sizes. The mark remains legible; the finished shell must still be checked in responsive screenshots.

Reproduce vectors, favicon, PWA, social and native source images using the existing installed Playwright/Chromium renderer:

```sh
node --import tsx scripts/brand-v5-assets.mjs
node scripts/brand.mjs v5
```

An optional `--sync-native-artwork` argument copies only icon/splash PNG artwork into the existing iOS asset catalogs. It preserves the formerly active PNGs first, never overwrites that archive and does not run Capacitor, alter native configuration, signing or credentials, build, or publish anything.

All C4/v2/v3/v4 vectors, React components, original artwork and install icons remain intact. The formerly active native icon was not identical to the v4 source icon: former active SHA-256 `7720d317a6b1080637f64eef24510ea9e84f80413be46c7f5bdbd4221c399956`, v4 source SHA-256 `707bde10baa1b2bbc164eb25c083a6b4bff6915dd80083f450f7192deb9f9702`. Exact former active native images are archived in `brand-assets/ios/pre-v5-active/`; all three former splash images share SHA-256 `5582e41575bde0b04c0229e99d56a0ee8e4cebd0e97a4a4ec26bce5b3392536e`.

The web brand switch changes React selection, manifest, favicon/apple icon, social metadata, offline-shell mark/icons and notification icon/badge paths. Native artwork selection is deliberately explicit. Web identities can be switched back with `node scripts/brand.mjs c4|v2|v3|v4`. To revert native artwork, copy the preserved source PNGs to their original asset-catalog paths.

Focused tests check real reference existence and PNG dimensions, retained brand assets, accessible SVG forms, round-trip brand switching in temporary fixtures, native artwork selection/archive preservation and notification behavior. No physical-device, App Store or publication outcome is claimed.
