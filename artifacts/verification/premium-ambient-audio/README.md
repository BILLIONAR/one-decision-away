# Ambient audio verification

Original procedural audio, generated locally. No recording, paid service, provider or new package is used by the product. The review Ogg files are optional audition artifacts; production generates its audio through Web Audio and does not fetch these files.

The Sound Room now gives `meditation_432hz` the same translated “Warm drone · 432 Hz” title in both categories. Intentional same-title Brown/Pink/Rain reuse remains.

Natural scenes no longer share the old two-second mono brown buffer. Rain uses a broad moving air texture with irregular noise droplets. Fireplace uses a low bed and irregular noise crackles rather than fixed-period triangle pops. Surf has amplitude-shaped swells and a breaking foam layer. All five noise textures use independently seeded stereo channels, 24-second buffers and a 250ms equal-power seam overlap. Peaks are bounded before user gain.

Track switching gives the old graph a 180ms release and the new graph a safe attack. New long buffers are prepared while the previous sound continues; recurring callbacks are stopped on switching and retired graphs are bounded. User volume/mute, initial attack and timer fade each have separate gain nodes. Zero/mute applies immediately during a timer fade; arming a timer keeps Sound Room’s three-second initial attack. Initial and recurring bowl callbacks, including active bowl tails, are cleaned up with their session.

`tests.log`: 22 passing tests (17 new texture/catalogue/engine/player tests plus five existing Sound Room helpers), zero failures/skips. Assertions cover stereo independence, scene spectral/dynamic differences, seam continuity, reproducible seeds, shared titles, three-second attack, mute at three fade phases, shortening/cancellation, the cancelAndHold fallback, repeated switches/stops, initial bowl cancellation, natural bowl-tail endings and pause/resume/expiry.

Final timer regression: an external controller restarting the same Rain track replaces the graph and its envelope. Sound Room now clears its countdown, selected timer and paused remainder for that external session. After the former ten-minute deadline, the UI retains no stale timer; the external controller owns playback. Sound Room's own starts remain protected by its existing `driving` guard.

`browser-audio-report.json`: three additional passing actual Chromium 151 OfflineAudioContext checks of the production gain graph at 24kHz stereo. A two-second end fade is scheduled independently of the three-second attack. Mute is applied at fade beginning/middle/end; rendered post-mute RMS is exactly zero in all three cases. Zero runtime errors. An OfflineAudioContext adapter exercises production graph code locally; no microphone or provider is accessed.

`ambient-render-report.json`: deterministic 48kHz stereo render statistics and hashes. Each production loop has 9,216,000 bytes of float channel samples before copying into its AudioBuffer. Measured render times on this Linux executor were 87–296ms for the recorded run, with variation between runs. Physical-phone performance is unverified. Stereo correlations in the recorded run were within ±0.01.

`rain-review.ogg`, `waves-review.ogg`, `fireplace-review.ogg`: 26-second auditions, including one complete loop and two seconds of its next iteration. Each uses the normal 0.2 initial user-gain level, three-second attack and 180ms final release. No listening assessment or recording-level realism claim has been made; these files are provided for actual audition.

Reproduce:

```sh
node --import tsx --test tests/ambient-textures.test.ts tests/sound-synthesizer.test.ts tests/sound-room.test.ts
node --import tsx scripts/qa-ambient-audio.mjs
node scripts/qa-ambient-browser.mjs
```

Full-app responsive/interaction QA and separate publication approval remain with the parent task. Spoken narration is a separate workstream and is not changed by this ambient implementation.
