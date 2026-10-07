# ODA lesson artwork

These original lesson images were supplied from `~/oda-push/art/lessons/<courseId>/<lessonId>.png`, produced for ODA in the parallel artwork round.

The R24 chapter implementation generated 0 images. It only resizes and encodes complete supplied PNGs using the already-installed free Pillow encoder. No paid service, download, package installation or third-party stock image is used by this conversion.

`node --import tsx scripts/prepare-lesson-art.ts` validates course and lesson ids against the English course catalog, preserves each source image's aspect ratio, and writes these delivery files:

- `<courseId>/<lessonId>.webp`, up to 960 pixels wide.
- `<courseId>/<lessonId>-480.webp`, up to 480 pixels wide.

The converter preserves valid existing WebPs, writes new files atomically, and defers incomplete or changing source PNGs. Its JSON report lists each imported or preserved lesson, pending sources and byte totals at that run's snapshot.

All lesson assets are optional. Chapters and lesson heroes fall back to supplied course art, then the existing course image until their lesson artwork is available.
