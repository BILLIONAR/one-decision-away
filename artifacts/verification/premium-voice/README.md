# Guided voice verification

Guided cue, replay, preview and prefetch text now use the original English source independently of EN/TR/ES display locale. Display captions still use the existing translations. Device selection accepts English language tags only. An empty or non-English device inventory reports guided speech unavailable. Notebook playback remains verbatim, follows the display language's device voice, and preserves saved meditation preferences.

EN/TR/ES voice settings copy now explains that some installed device voices need internet, without guaranteeing offline operation. Gemini choice, key storage and provider configuration are preserved.

The configured Gemini path has English prompts/cache identity and generation guards for delayed synthesis/context resume, Stop, Pause, new cues and previews. Verification substitutes synthesis and the audio device; it does not call Gemini or use real credentials.

An optional recorded narration adapter contract is present but no adapter is registered and no recorded mode is enabled. It carries session ID, zero-based cue index, en-US, version, source-text hash, checksum and decoded duration. Playback checks metadata and the remaining cue slot; the future adapter must verify actual text/asset hashes and decoded bytes, preload identified current/upcoming cues, and cancel pending audio on Stop/Pause. Missing, malformed, expired, overlong or failed assets use an English device fallback, never a provider substitution. The session timer continues to own practice silence.

Checks completed successfully:

- `node --import tsx --test tests/voice-guide.test.ts tests/gemini-voice-lifecycle.test.ts`: 52/52 passing, comprising 37 VoiceGuide behavior tests and 15 Gemini lifecycle tests.
- `node --import tsx scripts/test-notebook-voice.ts`: passing.
- `npm run lint`: passing.
- `node scripts/validate-i18n.mjs`: passing; EN/TR/ES source keys covered with no missing translations or placeholder differences.
- `node --import tsx scripts/test-i18n.ts`: passing.
- Scoped `git diff --check`: passing.

The tests use synthetic device voices, PCM and manifest metadata. They verify lifecycle and language behavior, not audible voice quality, device offline availability or actual recorded asset integrity. No packages, provider calls, real credentials, ambient audio changes, commits or publication were performed by this voice subtask. The full approved recorded set and the user's sample feedback remain outstanding.
