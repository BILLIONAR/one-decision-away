# SoundRoom fidelity rework — before code

Reviewed 2026-10-02 on existing design/reference-led-oda at 8fc4ef0572a4cfd20964be6e276325161b3a2acf. Actual inline pixels of IMG_8669 / IMG_8668 / IMG_8667 are visible in the inherited user message; filenames and captions are not the basis of this review. Current actual 390px discovery/player screenshots were also opened.

## Concrete mismatches

- Current discovery is four separate small bordered rectangles with icons left and 21px left-aligned titles. References 1/2 are one continuous, nearly full-width scenic canvas, with three large organic bands spanning its entire width. Large white category titles sit centered on the photographic scenes; labels are around 10% of phone width. Dark controls belong along the canvas bottom rather than icon badges at each title.
- Current imagery is repeated CSS hills and a tabletop leaf photo. Reference 1/2 visibly use photographic dune, palm/sky and ocean scenes. Decorative gradients cannot satisfy photographic fidelity and will not be described as matching them.
- Current detail is a white card containing other bordered cards. Reference 1 has a dark photographic upper cover spanning about half the detail screen, a broad sinusoidal lower edge, an overlapping portrait/nature thumbnail, small honest attribution, and a light lower session/lesson list with sparse fine separators. Playback dominates a curved bottom notch.
- Current player is a small opaque horizontal footer. Reference 3 has a tall dark teal/glass panel with a thin cyan edge, large atmospheric artwork, compact title/description above, and a clearly dominant circular cyan playback button below. The static screenshot does not supply a measured waveform, so none will be invented.

## Composition to implement

- Mobile discovery will become one continuous overflow-hidden rounded scenic canvas with large stacked photographic category bands and centered white titles. Four actual ODA modes remain; existing tab persistence, roles, selection, and keyboard handlers remain. Keep the existing honest intro available, but reduce its visual dominance above the reference canvas.
- Desktop will preserve that tall continuous composition as a discovery column beside the active session/detail column instead of converting the scene into generic tiled cards. Mobile retains the same order and proportions through scrolling.
- Active category detail gets one full-width dark photograph cover with its real heading/introduction, a curved transition into the inherited light/dark working surface, an overlapping thumbnail of that same artwork and an ODA Sound Room credit. No invented instructor, author, duration, session progress, health score, or fake lesson availability.
- Existing actual sounds become compact honest session rows; name/description/why/headphone metadata stay readable and actual locked/playing state stays exact. Rows continue their original toggle/gating handlers.
- Persistent mini-player stays available above real navigation with 8px clearance. Add a tall, cyan-edge teal now-playing presentation using the same player state and exact existing pause/resume/timer/volume handlers; no new audio engine or service state. Controls retain 44px targets, native timer width auto and min-width118px in every locale.
- Breath timing, frequency framing, science and safety copy remain real and unchanged; no waveform, metrics or provider calls.

## Artwork dependency

Root's artwork access agent is checking safe owned/free/source imagery. Need verified actual bytes for: dune/discovery-top, palm/sky discovery-middle, ocean discovery-bottom, atmospheric nature cover/player. Do not copy Pinterest chrome, surrounding ads, third-party brand/text, or claim CSS geometry matches photographs. Until bytes arrive, layout/data inventory and brief can proceed but no fake photographic claim.

## Palette/proportions

- Discovery: near-black/navy shadows over real scenes, readable white centered titles; active category control is a pale circular mark against the dark local footer.
- Detail: upper navy/teal photographic cover; lower inherited pearl/lavender surface (navy surface for dark preference), broad organic edge rather than detached rectangles.
- Player: dark teal #173B40 to #24343E atmosphere, thin cyan edge #43D5D6, pale teal-white copy; cyan play against a dark readable icon.
- At390: canvas width around350–390 according to current shell inset, tall three/four-band composition with roughly160–220px bands, overlapping sinuous edges around40px. Centered heading around32–38px. At320: natural reflow and no clipped labels/controls. No fixed109px timer regression.

## Verification boundary

No shared style, locale, data, services, account, provider or user-record edits. Own only SoundRoom.tsx/sound.css and root-agreed sound-only local images. Do not build before root freeze, commit, push, install or deploy. Capture actual390 PNGs and check desktop/mobile EN/TR/ES, keyboard, dark/reduced-motion, access state, player actions and clipping. Root owns aggregate and independent integrated review.

## Implemented artwork decision and exact limit

Root confirmed the fresh supported Library transfer returned a network failure before bytes, and its bounded source-photo HTTPS fetch returned proxy403. No route was retried or bypassed by this SoundRoom agent. The exact original dune/palm/ocean/fantasy photographs are unavailable as usable local bytes. Root explicitly authorized original sound-only SVG artwork under public/assets/oda/reference-fidelity.

The three new sound-dunes.svg / sound-palms.svg / sound-ocean.svg files are original static vector illustrations created for this task, with local gradient/texture/path geometry, no embedded source pixels, external resources, scripts, third-party text or branding. The app uses them decoratively, not as a health visualizer or measured sound waveform. This implements the continuous reference composition with an explicit illustrative-artwork difference; it is not pixel identity or photographic equivalence.

The before-code plan was corrected during root review: discovery now starts with an overlaid compact SoundRoom heading, the original sound/safety introduction lives in a readable About disclosure, and the idle footer/expanded player is absent. All player hooks execute before the empty-track return. A paused existing track still exposes the original controls. The expanded nature art is eagerly loaded and actual decoded pixels were checked; it no longer paints as an empty lazy-image block. Native timer select remains width:auto/min-width118px with44px target and no109px override.
