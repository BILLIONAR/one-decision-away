import React, { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Headphones, Info, LockKeyhole, Pause, Play, Timer, Volume1, Volume2, Wind } from 'lucide-react';
import { useApp } from '../store/useApp';
import { usePro } from '../services/purchases';
import { isSoundLocked } from '../services/entitlements';
import { useT } from '../i18n';
import {
  SOUND_ROOM_HERO, SOUND_ROOM_SECTIONS, soundForTrack, unsplashUrl,
  type SoundPhoto, type SoundRoomSectionId, type SoundRoomSound,
} from '../data/soundRoom';
import { soundRoomPlayer } from '../services/soundRoomPlayer';
import { BREATH_CYCLE_MS, breathPhase, formatRemaining, TIMER_CHOICES } from '../services/soundRoom';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import '../styles/sound.css';

const TAB_KEY = 'oda_sound_tab_v1';
/** Four listening modes as tabs; Frequencies gets its own section below, with its honest note. */
const TAB_SECTIONS = SOUND_ROOM_SECTIONS.filter((section) => section.id !== 'frequencies');
const FREQUENCIES = SOUND_ROOM_SECTIONS.find((section) => section.id === 'frequencies')!;
const SECTION_IDS = TAB_SECTIONS.map((section) => section.id);

function readTab(): SoundRoomSectionId {
  try {
    const value = localStorage.getItem(TAB_KEY);
    return (SECTION_IDS as string[]).includes(value ?? '') ? (value as SoundRoomSectionId) : 'relax';
  } catch {
    return 'relax';
  }
}

function usePlayer() {
  return useSyncExternalStore(soundRoomPlayer.subscribe, soundRoomPlayer.getSnapshot, soundRoomPlayer.getSnapshot);
}

function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const onChange = () => setReduced(media.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

/** Re-renders every `ms` while `active`. */
function useTick(active: boolean, ms: number) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((n) => n + 1), ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
}

/** A real photo; if it cannot load (offline, blocked) a soft gradient takes its place. */
const SoundPhotoImg: React.FC<{ photo: SoundPhoto; width: number; height: number; className?: string; eager?: boolean; sizes?: string }> = ({
  photo, width, height, className = '', eager, sizes,
}) => {
  const t = useT();
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={`oda-sound-photo oda-sound-photo-fallback ${className}`} aria-hidden="true" />;
  return (
    <span className={`oda-sound-photo ${className}`}>
      <img
        src={unsplashUrl(photo.id, width, height)}
        srcSet={`${unsplashUrl(photo.id, Math.round(width / 2), Math.round(height / 2))} ${Math.round(width / 2)}w, ${unsplashUrl(photo.id, width, height)} ${width}w`}
        sizes={sizes ?? `${width}px`}
        alt={t(photo.alt)}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </span>
  );
};

const SoundCard: React.FC<{ sound: SoundRoomSound; sectionId: SoundRoomSectionId; playing: boolean; locked?: boolean }> = ({ sound, sectionId, playing, locked }) => {
  const t = useT();
  const { setActiveRoute } = useApp();
  const nameId = useId();
  const descriptionId = useId();
  return (
    <li className="oda-sound-card" data-playing={playing || undefined}>
      <button
        type="button"
        className="oda-sound-card-button"
        aria-pressed={playing}
        aria-labelledby={nameId}
        aria-describedby={descriptionId}
        onClick={() => (locked ? setActiveRoute('/app/upgrade') : soundRoomPlayer.toggle(sound.track, { sleep: sectionId === 'sleep' }))}
      >
        <span className="oda-sound-card-media">
          <SoundPhotoImg photo={sound.photo} width={560} height={400} sizes="(max-width: 559px) 92vw, 340px" />
          <span className="oda-sound-card-play" aria-hidden="true">
            {locked ? <LockKeyhole size={16} strokeWidth={2} /> : playing ? <Pause size={18} strokeWidth={2.2} /> : <Play size={18} strokeWidth={2.2} />}
          </span>
          {locked && <span className="oda-sound-card-pro">Pro</span>}
          {playing && <span className="oda-sound-card-live" aria-hidden="true"><i /><i /><i /></span>}
        </span>
        <span className="oda-sound-card-body">
          <span id={nameId} className="oda-sound-card-name">{t(sound.name)}</span>
          <span id={descriptionId} className="oda-sound-card-description">{t(sound.description)}</span>
          <span className="oda-sound-card-why">{t(sound.why)}</span>
          {sound.binaural && (
            <span className="oda-sound-card-note">
              <Headphones size={14} aria-hidden="true" />
              {t('Use headphones for binaural sounds')}
            </span>
          )}
        </span>
      </button>
    </li>
  );
};

/** Circle that grows on the inhale and shrinks on the exhale, in step with the breath pacer tone. */
const BreathePanel: React.FC<{ sound: SoundRoomSound; soundPlaying: boolean }> = ({ sound, soundPlaying }) => {
  const t = useT();
  const reduced = useReducedMotion();
  const [visualStartedAt, setVisualStartedAt] = useState<number | null>(null);
  const audioStartedAt = soundPlaying ? soundSynthesizer.getTrackStartedAt() : null;
  const startedAt = audioStartedAt ?? visualStartedAt;
  const active = startedAt !== null;
  useTick(active, 200);

  // A silent guide stops when the tone starts; the tone takes over the timing.
  useEffect(() => { if (soundPlaying) setVisualStartedAt(null); }, [soundPlaying]);

  const phase = active ? breathPhase(Date.now() - startedAt) : null;
  const label = phase ? (phase.phase === 'inhale' ? t('Inhale') : t('Exhale')) : t('Ready when you are');
  // Computed once per start: the CSS animation then keeps time on its own.
  const delay = useMemo(() => (startedAt !== null ? -((Date.now() - startedAt) % BREATH_CYCLE_MS) : 0), [startedAt]);

  return (
    <div className="oda-sound-breathe">
      <div className="oda-sound-breathe-stage" data-reduced={reduced || undefined}>
        {!reduced && (
          <div
            key={startedAt ?? 'idle'}
            className="oda-sound-breathe-circle"
            data-active={active || undefined}
            style={{ animationDelay: `${delay}ms`, animationDuration: `${BREATH_CYCLE_MS}ms` }}
            aria-hidden="true"
          />
        )}
        <p className="oda-sound-breathe-label" data-reduced={reduced || undefined}>
          <span className="oda-display">{label}</span>
          {phase && <span className="oda-sound-breathe-count" aria-hidden="true">{phase.secondsLeft}</span>}
        </p>
        {reduced && phase && (
          <span className="oda-sound-breathe-bar" aria-hidden="true">
            <span style={{ width: `${Math.round((phase.phase === 'inhale' ? phase.progress : 1 - phase.progress) * 100)}%` }} />
          </span>
        )}
      </div>
      <p className="oda-sound-breathe-meta">
        {t('5.5 seconds in · 5.5 seconds out · about 5.5 breaths a minute')}
      </p>
      <div className="oda-sound-breathe-actions">
        <button
          type="button"
          className="oda-sound-primary"
          aria-pressed={soundPlaying}
          onClick={() => soundRoomPlayer.toggle(sound.track)}
        >
          {soundPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {soundPlaying ? t('Pause the tone') : t('Start with the tone')}
        </button>
        {!soundPlaying && (
          <button
            type="button"
            className="oda-sound-secondary"
            aria-pressed={visualStartedAt !== null}
            onClick={() => setVisualStartedAt((current) => (current === null ? Date.now() : null))}
          >
            <Wind size={16} aria-hidden="true" />
            {visualStartedAt !== null ? t('Stop the silent guide') : t('Silent guide')}
          </button>
        )}
      </div>
      <p className="oda-sound-breathe-tip">{t('Breathe gently through your nose if you can. If you feel light-headed, return to your normal breathing.')}</p>
    </div>
  );
};

const PlayerBar: React.FC = () => {
  const t = useT();
  const player = usePlayer();
  const [volume, setVolume] = useState(() => soundRoomPlayer.getVolume());
  useTick(player.playing && player.endsAt !== null, 1000);
  const sound = soundForTrack(player.track);
  const volumeId = useId();
  const timerId = useId();

  const remaining = player.playing && player.endsAt !== null
    ? player.endsAt - Date.now()
    : player.pausedRemainingMs;

  let status: string;
  if (!sound) status = t('Choose a sound to begin');
  else if (remaining !== null && remaining > 0) status = t('{time} left', { time: formatRemaining(remaining) });
  else if (player.playing) status = t('Playing · no timer');
  else status = t('Paused');

  return (
    <div className="oda-sound-player" role="region" aria-label={t('Sound player')}>
      <div className="oda-sound-player-inner">
        <div className="oda-sound-player-now">
          {sound ? (
            <SoundPhotoImg photo={sound.photo} width={96} height={96} className="oda-sound-player-thumb" />
          ) : (
            <span className="oda-sound-photo oda-sound-photo-fallback oda-sound-player-thumb" aria-hidden="true" />
          )}
          <div className="oda-sound-player-text">
            <p className="oda-sound-player-name">{sound ? t(sound.name) : t('Sound Room')}</p>
            <p className="oda-sound-player-status" aria-live="off">{status}</p>
          </div>
          <button
            type="button"
            className="oda-sound-player-toggle"
            disabled={!sound}
            aria-label={player.playing ? t('Pause') : t('Play')}
            onClick={() => (player.playing ? soundRoomPlayer.pause() : soundRoomPlayer.resume())}
          >
            {player.playing ? <Pause size={20} strokeWidth={2.2} /> : <Play size={20} strokeWidth={2.2} />}
          </button>
        </div>
        <div className="oda-sound-player-controls">
          <label htmlFor={volumeId} className="oda-sound-player-volume">
            <span className="sr-only">{t('Volume')}</span>
            {volume < 0.5 ? <Volume1 size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
            <input
              id={volumeId}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => {
                const next = Number(event.target.value);
                setVolume(next);
                soundRoomPlayer.setVolume(next);
              }}
            />
          </label>
          <label htmlFor={timerId} className="oda-sound-player-timer">
            <Timer size={16} aria-hidden="true" />
            <span className="sr-only">{t('Timer')}</span>
            <select
              id={timerId}
              value={player.timerMinutes ?? ''}
              onChange={(event) => soundRoomPlayer.setTimer(event.target.value ? Number(event.target.value) : null)}
            >
              <option value="">{t('No timer')}</option>
              {TIMER_CHOICES.map((minutes) => (
                <option key={minutes} value={minutes}>{t('{n} min', { n: minutes })}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};

/**
 * Sound Room: relaxation, sleep, focus and breathing sounds, synthesized in
 * the browser. Honest by design: sound can help you settle; it is not a
 * treatment, and frequency claims are labelled as tradition, not science.
 */
export const SoundRoom: React.FC = () => {
  const t = useT();
  const player = usePlayer();
  const pro = usePro();
  const [tab, setTab] = useState<SoundRoomSectionId>(readTab);
  const tabRefs = useRef<Partial<Record<SoundRoomSectionId, HTMLButtonElement | null>>>({});
  const baseId = useId();
  const section = TAB_SECTIONS.find((item) => item.id === tab) ?? TAB_SECTIONS[0];

  const choose = (id: SoundRoomSectionId, focus = false) => {
    setTab(id);
    try { localStorage.setItem(TAB_KEY, id); } catch { /* per-viewer convenience only */ }
    if (focus) tabRefs.current[id]?.focus();
  };

  const onTabKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = SECTION_IDS.indexOf(tab);
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % SECTION_IDS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + SECTION_IDS.length) % SECTION_IDS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = SECTION_IDS.length - 1;
    if (next < 0) return;
    event.preventDefault();
    choose(SECTION_IDS[next], true);
  };

  // Keep the chosen tab visible in the scrolling tab row (not on first render, so the page does not jump).
  const tabMounted = useRef(false);
  useEffect(() => {
    if (tabMounted.current) tabRefs.current[tab]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    tabMounted.current = true;
  }, [tab]);

  const isPlaying = (track: SoundRoomSound['track']) => player.playing && player.track === track;

  return (
    <div className="oda-sound">
      <header className="oda-sound-intro">
        <div className="oda-sound-intro-copy">
          <p className="oda-kicker text-[var(--accent)]">{t('Sound Room')}</p>
          <h1 className="oda-display oda-sound-title">{t('Sound for calm, sleep and focus')}</h1>
          <p className="oda-sound-lede">
            {t('Sound can help you relax, settle and fall asleep more easily. It is not a treatment.')}
          </p>
        </div>
        <SoundPhotoImg photo={SOUND_ROOM_HERO} width={960} height={600} className="oda-sound-hero" eager sizes="(max-width: 759px) 100vw, 720px" />
      </header>

      <div
        role="tablist"
        aria-label={t('Sound Room sections')}
        className="oda-sound-tabs"
        onKeyDown={onTabKey}
      >
        {TAB_SECTIONS.map((item) => (
          <button
            key={item.id}
            ref={(node) => { tabRefs.current[item.id] = node; }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`${baseId}-panel`}
            tabIndex={tab === item.id ? 0 : -1}
            className="oda-sound-tab"
            onClick={() => choose(item.id)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      <section
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${section.id}`}
        className="oda-sound-panel"
      >
        <p className="oda-sound-section-intro">{t(section.intro)}</p>

        {section.id === 'breathe' ? (
          <BreathePanel sound={section.sounds[0]} soundPlaying={isPlaying('breath_pacer')} />
        ) : (
          <ul className="oda-sound-grid">
            {section.sounds.map((sound, i) => (
              <SoundCard key={`${section.id}-${sound.track}`} sound={sound} sectionId={section.id} playing={isPlaying(sound.track)} locked={isSoundLocked(i, { gating: pro.gating, pro: pro.isPro })} />
            ))}
          </ul>
        )}

        {section.id === 'sleep' && (
          <p className="oda-sound-hint">
            <Timer size={15} aria-hidden="true" />
            {t('Pick a timer in the player below. The sound fades out gently over the last minute.')}
          </p>
        )}
      </section>

      <section className="oda-sound-frequencies" aria-labelledby={`${baseId}-frequencies`}>
        <p className="oda-kicker text-[var(--accent)]">{t('Frequencies')}</p>
        <h2 id={`${baseId}-frequencies`} className="oda-display oda-sound-section-title">{t('Tones from sound-healing traditions')}</h2>
        <p className="oda-sound-section-intro">{t(FREQUENCIES.intro)}</p>
        <aside className="oda-sound-honest" aria-label={t('About these frequencies')}>
          <Info size={18} aria-hidden="true" />
          <p>
            {t('These tones come from sound-healing traditions. There is no scientific evidence that a specific frequency heals the body or repairs DNA. Many people still find them calming, and that is reason enough to listen.')}
          </p>
        </aside>
        <ul className="oda-sound-grid">
          {FREQUENCIES.sounds.map((sound, i) => (
            <SoundCard key={`frequencies-${sound.track}`} sound={sound} sectionId="frequencies" playing={isPlaying(sound.track)} locked={isSoundLocked(i, { gating: pro.gating, pro: pro.isPro })} />
          ))}
        </ul>
      </section>

      <section className="oda-sound-evidence" aria-labelledby={`${baseId}-evidence`}>
        <h2 id={`${baseId}-evidence`} className="oda-display">{t('What the research says')}</h2>
        <ol>
          <li>{t('Garcia-Argibay, Santed and Reales (2019, Psychological Research) combined 22 studies of binaural beats and found a medium overall effect (g = 0.45) on anxiety, pain perception, memory and attention. The effect depended on the beat frequency and on when and how long people listened.')}</li>
          <li>{t('de Witte and colleagues (2025, eClinicalMedicine) combined 51 studies with 3,276 participants and found that music therapy reduced anxiety (g ≈ 0.36); listening-based (receptive) methods showed g ≈ 0.42. These were sessions with trained music therapists, not an app.')}</li>
          <li>{t('Zaccaro and colleagues (2018, Frontiers in Human Neuroscience) reviewed 15 studies: breathing slower than 10 breaths a minute went with higher heart-rate variability, more relaxation and less anxiety.')}</li>
        </ol>
        <p className="oda-sound-evidence-note">{t('Studies are small and varied. Treat these sounds as a way to relax, not as a cure.')}</p>
      </section>

      <p className="oda-sound-safety">
        {t('Keep the volume low. Do not use binaural or sleep sounds while driving or doing anything that needs your full attention. Stop if you feel any discomfort.')}
      </p>

      <PlayerBar />
    </div>
  );
};
