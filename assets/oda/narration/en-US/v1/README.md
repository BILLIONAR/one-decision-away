# ODA English guided narration v1

160 MP3 cue clips for 11 guided sessions, using the approved af_heart voice at unchanged speed 0.72.

## Contents

- clips/: mono 24 kHz, 128 kbit/s MP3 files; indices are zero-based and padded to two digits
- manifest.json: exact source text, source-text hash, asset checksum, measured decoded and container duration, cue start, next cue/session boundary, and timing margin
- source-cues.json: source inventory verified against candidate b6d29b638132715af6d22b1ea433403fd03137ac
- validation-summary.json: measured quality and timing results
- LICENSE-APACHE-2.0.txt and NOTICE.txt: model/runtime license and attribution documentation

The approved gm-sleep cue 1 MP3 is reused byte-for-byte. Other clips use bounded static volume adjustment to keep levels close to that sample. Voice, generation speed, text, and exercise semantics were preserved; no time stretching, speech cuts, or added session-length silence.

## Playback integration

Load each clip from its manifest file path and start it at scheduledStartSeconds on the elapsed session clock. Gaps belong to the player schedule. The 87 minutes describe total scheduled session time, while the clips contain 1226.530 seconds of decoded clip audio, including spoken narration and within-clip pauses.

Use a shared session clock and a cue index; do not make the next cue depend on a clip-ended event. On pause, stop the current clip and freeze elapsed time; on resume, restore the cue/time state without overlapping voices. A language change should stop pending/current English narration before replacing the schedule. At session end, stop playback and clear any pending cue callback. These are integration requirements, not claims about existing app behavior.

The minimum measured conservative margin is 3.688 seconds. Every cue, including the last cue of each session, fits its current schedule with at least 0.25 seconds of margin. Conservative timing uses the greater of decoded duration and MP3 container duration, accommodating encoder padding.

## Verification and limits

All 160 original and encoded files were decoded. Source input hashes match the current cue inventory. No non-finite or clipped decoded samples were detected. The full first and last 10 milliseconds peak below -60 dBFS. Token lengths were checked without truncation before synthesis. Raw-to-decoded waveform correlation is checked at zero lag, allowing only bounded sub-frame encoder padding. The maximum measured sample-count delta is 23 samples. Every MP3 checksum and decoded sample count is checked again after unpacking the ZIP.

Human listening and independent speech-to-text transcription were not performed. These measurements do not prove subjective pronunciation, prosody, or that every spoken word is perceptually correct. The voice direction was approved from the retained sample. Review listening should still be part of pre-release audio QA.

Original generated float WAV files and generation records are retained separately in the production workspace; this compact delivery contains playback assets and documentation only. No model weights, runtime, API key, paid-service dependency, app code change, push, deployment, or release is included.
