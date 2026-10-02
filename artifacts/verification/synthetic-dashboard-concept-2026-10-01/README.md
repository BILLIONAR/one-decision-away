# Synthetic Turkish dashboard concept — review only

These PNGs render the user's self-contained `ODA-dashboard-concept-source.zip` without changing its HTML, fonts or images. ZIP SHA-256: `29dab03e6ab51733d8d689daeacced73979d22f0a1d22ad22aa50ba3b370b9c5`.

- [Desktop — 1440×1000](ODA-synthetic-dashboard-concept-desktop-1440x1000.png)
- [Mobile — 390×844](ODA-synthetic-dashboard-concept-mobile-390x844.png)
- [Rendering and clipping receipt](render-report.json)

This is a static synthetic concept with sample data and Turkish review copy. English remains the app's primary language. The prior v5 logo/theme is not approved. This concept does not authorize implementation or publication.

The normal local preview used loopback HTTP and installed Chromium, with device scale 1. No certificate exceptions, security-warning bypass, permission changes or package installs were used. Local font/image requests returned200; no runtime errors, external requests or horizontal/hidden-text clipping were found at the two requested viewport sizes. Original source bytes were compared with the ZIP after rendering and remained identical.

Both pages extend below one viewport: the desktop document is1440×1105, and mobile is390×1915. The exact-size PNGs preserve that scrolling layout. The fixed mobile navigation overlaps the lesson footer in the initial view; normal scrolling reveals it. The footer is above navigation at maximum scroll. The course photo has the portrait `object-fit:cover` crop specified by the supplied HTML; the tree canopy and roots remain intact. Intermediate widths and physical-phone safe areas were not tested.

Library upload was unavailable because its supported connection failed before upload. These review artifacts are the user's authorized fallback. Only this artifact directory is added to an isolated review branch based on `b6d29b638132715af6d22b1ea433403fd03137ac`. The app source, b6d29 fixes and original review branch remain untouched. No deployment, main push or workflow dispatch occurred.
