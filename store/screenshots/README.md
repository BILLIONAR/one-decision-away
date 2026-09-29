# Screenshots

The images are not kept in the repo; they live in `app-store-screenshots.zip` on the owner's desktop and can be regenerated with `scripts/store-screenshots.mjs`.

Expected layout when uploading:

```
store/screenshots/
  en-US/01.png … 06.png
  tr/01.png    … 06.png
  es-ES/01.png … 06.png
  es-MX/01.png … 06.png   (copy of es-ES, optional)
```

- Size: **1290 × 2796** px, portrait, PNG or JPEG, no alpha, no rounded corners. This goes in the **6.9" iPhone** slot; Apple scales it down for smaller iPhones.
- Order: 1 One decision a day, 2 Courses, 3 Lesson, 4 Evidence tree, 5 Sound Room, 6 Dark theme.
- Every screenshot must show real app UI in the language of its locale, and nothing that the app does not do.
- Do not commit the PNGs: unzip them here only when uploading, then delete them.
