import React, { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Headphones, Info, LockKeyhole, Moon, Pause, Play, Timer, Volume1, Volume2, Waves, Wind } from 'lucide-react';
import { useApp } from '../store/useApp';
import { purchases, usePro } from '../services/purchases';
import { isSoundLocked } from '../services/entitlements';
import { useT } from '../i18n';
import {
  SOUND_ROOM_SECTIONS, soundForTrack,
  type SoundRoomSectionId, type SoundRoomSound,
} from '../data/soundRoom';
import { soundRoomPlayer } from '../services/soundRoomPlayer';
import { BREATH_CYCLE_MS, breathPhase, formatRemaining, TIMER_CHOICES } from '../services/soundRoom';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { OriginalSceneImage } from '../components/OriginalSceneImage';
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

type Scene = 'coast' | 'night' | 'dunes' | 'leaves';
const SECTION_SCENES: Record<SoundRoomSectionId, Scene> = {
  relax: 'dunes', sleep: 'leaves', focus: 'coast', breathe: 'night', frequencies: 'night',
};
const SECTION_ICONS = { relax: Waves, sleep: Moon, focus: Headphones, breathe: Wind };
const SCENE_ASSETS: Record<Scene, string> = {
  dunes: 'sound-dunes.svg', leaves: 'sound-palms.svg', coast: 'sound-ocean.svg', night: 'sound-palms.svg',
};
const SCENE_ORIGINALS = { dunes: 'dunes', leaves: 'palms', coast: 'foam', night: 'palms' } as const;

/** Approved original local art, with responsive delivery and the prior owned scene fallback. */
const SoundScene: React.FC<{ scene: Scene; className?: string; eager?: boolean; sculpture?: boolean; sizes?: string }> = ({ scene, className = '', eager = false, sculpture = false, sizes = '(min-width: 1000px) 450px, (min-width: 640px) calc(100vw - 64px), 100vw' }) => {
  const asset = sculpture ? 'sound-sculpture' : SCENE_ORIGINALS[scene];
  return (
    <span className={`oda-sound-scene ${className}`} data-scene={sculpture ? 'sculpture' : scene} data-artwork={asset} aria-hidden="true">
      <OriginalSceneImage asset={asset} sizes={sizes} eager={eager} fallback={`assets/oda/reference-fidelity/${SCENE_ASSETS[scene]}`} />
    </span>
  );
};

const CoverWave: React.FC = () => (
  <svg className="oda-sound-cover-wave" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 5C75 74 129 12 220 29S337 37 400 91V100H0Z" />
  </svg>
);

const SoundCard: React.FC<{ sound: SoundRoomSound; sectionId: SoundRoomSectionId; indexInCategory: number; playing: boolean; selected: boolean; locked?: boolean }> = ({ sound, sectionId, indexInCategory, playing, selected, locked }) => {
  const t = useT();
  const { setActiveRoute } = useApp();
  const nameId = useId();
  const descriptionId = useId();
  return (
    <li className="oda-sound-card" data-playing={playing || undefined} data-selected={selected || undefined}>
      <button
        type="button"
        className="oda-sound-card-button"
        aria-pressed={playing}
        aria-labelledby={nameId}
        aria-describedby={descriptionId}
        onClick={() => {
          const current = purchases.getState();
          const tier = current.identityConfirmed ? current.tier : 'free';
          if (isSoundLocked(indexInCategory, { gating: current.available, tier })) {
            setActiveRoute('/app/upgrade');
            return;
          }
          soundRoomPlayer.toggle(sound.track, { sleep: sectionId === 'sleep', sectionId, indexInCategory });
        }}
      >
        <span className="oda-sound-card-media">
          <SoundScene scene={SECTION_SCENES[sectionId]} />
          {locked && <span className="oda-sound-card-pro">Pro</span>}
        </span>
        <span className="oda-sound-card-body">
          <span id={nameId} className="oda-sound-card-name">{t(sound.name)}</span>
          <span id={descriptionId} className="oda-sound-card-description">{t(sound.description)}</span>
        </span>
        <span className="oda-sound-card-play" aria-hidden="true">
          {locked ? <LockKeyhole size={17} strokeWidth={2} /> : playing ? <Pause size={19} strokeWidth={2.2} /> : <Play size={19} strokeWidth={2.2} />}
        </span>
      </button>
      <details className="oda-sound-card-rationale">
        <summary aria-label={`${t('Why it matters')}: ${t(sound.name)}`} title={t('Why it matters')}><Info size={16} aria-hidden="true" /><span className="sr-only">{t('Why it matters')}</span></summary>
        <p className="oda-sound-card-why">{t(sound.why)}</p>
        {sound.binaural && <p className="oda-sound-card-note"><Headphones size={14} aria-hidden="true" />{t('Use headphones for binaural sounds')}</p>}
      </details>
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
          onClick={() => soundRoomPlayer.toggle(sound.track, { sectionId: 'breathe', indexInCategory: 0 })}
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

type PlayerControlProps = { volume: number; onVolumeChange: (volume: number) => void };

/** Both presentations use the same volume value and the existing guarded player methods. */
const PlayerControls: React.FC<PlayerControlProps> = ({ volume, onVolumeChange }) => {
  const t = useT();
  const player = usePlayer();
  const volumeId = useId();
  const timerId = useId();
  return (
    <div className="oda-sound-player-controls">
      <label htmlFor={volumeId} className="oda-sound-player-volume">
        <span className="sr-only">{t('Volume')}</span>
        {volume < 0.5 ? <Volume1 size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
        <input id={volumeId} data-sound-control="volume" type="range" min={0} max={1} step={0.01} value={volume} onChange={(event) => onVolumeChange(Number(event.target.value))} />
      </label>
      <label htmlFor={timerId} className="oda-sound-player-timer">
        <Timer size={16} aria-hidden="true" />
        <span className="sr-only">{t('Timer')}</span>
        <select id={timerId} data-sound-control="timer" value={player.timerMinutes ?? ''} onChange={(event) => soundRoomPlayer.setTimer(event.target.value ? Number(event.target.value) : null)}>
          <option value="">{t('No timer')}</option>
          {TIMER_CHOICES.map((minutes) => <option key={minutes} value={minutes}>{t('{n} min', { n: minutes })}</option>)}
        </select>
      </label>
    </div>
  );
};

function playerStatus(player: ReturnType<typeof usePlayer>, t: ReturnType<typeof useT>): string {
  const remaining = player.playing && player.endsAt !== null
    ? player.endsAt - Date.now()
    : player.pausedRemainingMs;
  if (!player.track) return t('Choose a sound to begin');
  if (remaining !== null && remaining > 0) return t('{time} left', { time: formatRemaining(remaining) });
  return player.playing ? t('Playing · no timer') : t('Paused');
}

const PlayerBar: React.FC<PlayerControlProps & { visible: boolean }> = ({ volume, onVolumeChange, visible }) => {
  const t = useT();
  const player = usePlayer();
  useTick(visible && player.playing && player.endsAt !== null, 1000);
  const sound = soundForTrack(player.track);
  const scene = SECTION_SCENES[SOUND_ROOM_SECTIONS.find((item) => item.sounds.some((entry) => entry.track === player.track))?.id ?? 'relax'];
  if (!player.track || !visible) return null;

  return (
    <div className="oda-sound-player" data-sound-surface="mini" role="region" aria-label={t('Sound player')}>
      <div className="oda-sound-player-inner">
        <div className="oda-sound-player-now">
          <SoundScene scene={scene} className="oda-sound-player-thumb" sizes="44px" />
          <div className="oda-sound-player-text">
            <p className="oda-sound-player-name">{sound ? t(sound.name) : t('Sound Room')}</p>
            <p className="oda-sound-player-status" aria-live="off">{playerStatus(player, t)}</p>
          </div>
          <button
            type="button"
            className="oda-sound-player-toggle"
            data-sound-control="toggle"
            disabled={!sound}
            aria-label={player.playing ? t('Pause') : t('Play')}
            onClick={() => (player.playing ? soundRoomPlayer.pause() : soundRoomPlayer.resume())}
          >
            {player.playing ? <Pause size={20} strokeWidth={2.2} /> : <Play size={20} strokeWidth={2.2} />}
          </button>
        </div>
        <PlayerControls volume={volume} onVolumeChange={onVolumeChange} />
      </div>
    </div>
  );
};

/** The same real player state, given the reference's larger teal-glass presentation. */
const NowPlayingPanel: React.FC<PlayerControlProps & { primary: boolean; onPrimaryVisible: (visible: boolean) => void }> = ({ volume, onVolumeChange, primary, onPrimaryVisible }) => {
  const t = useT();
  const player = usePlayer();
  const sound = soundForTrack(player.track);
  const scene = SECTION_SCENES[SOUND_ROOM_SECTIONS.find((item) => item.sounds.some((entry) => entry.track === player.track))?.id ?? 'relax'];
  const controlsRef = useRef<HTMLDivElement>(null);
  useTick(primary && player.playing && player.endsAt !== null, 1000);
  const hasSound = !!sound;
  useEffect(() => {
    const controls = controlsRef.current;
    if (!hasSound || !controls) { onPrimaryVisible(false); return; }
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const margins = () => window.matchMedia('(min-width: 768px)').matches ? [24, 24] : [64, 96];
    const check = () => {
      const rect = controls.getBoundingClientRect();
      const [top, bottom] = margins();
      onPrimaryVisible(rect.height > 0 && rect.top >= top && rect.bottom <= window.innerHeight - bottom);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(check); };
    const observe = () => {
      observer?.disconnect();
      if (typeof IntersectionObserver !== 'undefined') {
        const [top, bottom] = margins();
        observer = new IntersectionObserver(check, { rootMargin: `-${top}px 0px -${bottom}px 0px`, threshold: [0, .99, 1] });
        observer.observe(controls);
      }
      schedule();
    };
    observe();
    window.addEventListener('resize', observe);
    // Capture nested scrolling too; this also supports browsers without IntersectionObserver.
    window.addEventListener('scroll', schedule, true);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', observe);
      window.removeEventListener('scroll', schedule, true);
      onPrimaryVisible(false);
    };
  }, [hasSound, onPrimaryVisible]);
  if (!sound) return null;
  return (
    <section className="oda-sound-now-panel" data-sound-surface="expanded" data-primary={primary || undefined} aria-label={t('Sound player')}>
      <div className="oda-sound-now-heading">
        <p className="oda-kicker">{t('Sound Room')}</p>
        <h2 className="oda-display">{sound ? t(sound.name) : t('Choose a sound to begin')}</h2>
        {sound && <p>{t(sound.description)}</p>}
      </div>
      <SoundScene scene={scene} className="oda-sound-now-art" sculpture eager sizes="(min-width: 1000px) 440px, (min-width: 640px) calc(100vw - 96px), calc(100vw - 44px)" />
      <div className="oda-sound-now-control-surface" ref={controlsRef}>
      <div className="oda-sound-now-controls">
        <Headphones size={20} aria-hidden="true" />
        <button type="button" className="oda-sound-now-toggle" data-sound-control="toggle" disabled={!sound} aria-label={player.playing ? t('Pause') : t('Play')} onClick={() => (player.playing ? soundRoomPlayer.pause() : soundRoomPlayer.resume())}>
          {player.playing ? <Pause size={27} strokeWidth={2.2} /> : <Play size={27} strokeWidth={2.2} />}
        </button>
        <Timer size={20} aria-hidden="true" />
      </div>
      <p className="oda-sound-now-status" aria-live="off">{playerStatus(player, t)}</p>
      <PlayerControls volume={volume} onVolumeChange={onVolumeChange} />
      </div>
      <p className="oda-sound-now-note">{sound ? t(sound.why) : t('Sound for calm, sleep and focus')}</p>
    </section>
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
  const tier = pro.identityConfirmed ? pro.tier : 'free';
  const [tab, setTab] = useState<SoundRoomSectionId>(readTab);
  const [volume, setVolume] = useState(() => soundRoomPlayer.getVolume());
  const [expandedPrimary, setExpandedPrimary] = useState(false);
  const expandedPrimaryRef = useRef(false);
  const pendingFocus = useRef<string | null>(null);
  const soundRootRef = useRef<HTMLDivElement>(null);
  const onPrimaryVisible = useCallback((visible: boolean) => {
    if (expandedPrimaryRef.current === visible) return;
    const focused = document.activeElement as HTMLElement | null;
    const previousSurface = visible ? 'mini' : 'expanded';
    if (focused?.closest(`[data-sound-surface="${previousSurface}"]`)) {
      pendingFocus.current = focused.dataset.soundControl ?? null;
    }
    expandedPrimaryRef.current = visible;
    setExpandedPrimary(visible);
  }, []);
  useEffect(() => {
    const control = pendingFocus.current;
    pendingFocus.current = null;
    if (control) soundRootRef.current?.querySelector<HTMLElement>(`[data-sound-surface="${expandedPrimary ? 'expanded' : 'mini'}"] [data-sound-control="${control}"]`)?.focus({ preventScroll: true });
  }, [expandedPrimary]);
  const onVolumeChange = useCallback((next: number) => {
    setVolume(next);
    soundRoomPlayer.setVolume(next);
  }, []);
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
    <div className="oda-sound" ref={soundRootRef}>
      <header className="oda-sound-intro">
        <div className="oda-sound-intro-copy">
          <h1 className="oda-display oda-sound-title">{t('Sound Room')}</h1>
        </div>
      </header>

      <div className="oda-sound-experience">
      <div
        role="tablist"
        aria-label={t('Sound Room sections')}
        className="oda-sound-tabs"
        onKeyDown={onTabKey}
      >
        {TAB_SECTIONS.map((item) => {
          const Icon = SECTION_ICONS[item.id as keyof typeof SECTION_ICONS];
          return (
          <button
            key={item.id}
            ref={(node) => { tabRefs.current[item.id] = node; }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-label={t(item.label)}
            aria-controls={`${baseId}-panel`}
            tabIndex={tab === item.id ? 0 : -1}
            className="oda-sound-tab"
            data-section={item.id}
            onClick={() => choose(item.id)}
          >
            <SoundScene scene={SECTION_SCENES[item.id]} eager={item.id === 'relax'} />
            <span className="oda-sound-tab-copy">
              <span className="oda-sound-tab-icon" aria-hidden="true"><Icon size={19} strokeWidth={1.8} /></span>
              <span className="oda-sound-tab-name">{t(item.label)}</span>
              <span className="oda-sound-tab-detail">{t(item.intro)}</span>
            </span>
          </button>
          );
        })}
      </div>

      <div className="oda-sound-session-column">
      <section
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${section.id}`}
        className="oda-sound-panel"
      >
        <div className="oda-sound-panel-cover">
          <SoundScene key={section.id} scene={SECTION_SCENES[section.id]} eager />
          <div className="oda-sound-panel-heading">
          <h2 className="oda-display oda-sound-section-title">{t(section.label)}</h2>
          <p className="oda-sound-section-intro">{t(section.intro)}</p>
          </div>
          <CoverWave />
        </div>

        <div className="oda-sound-panel-body">
        <SoundScene key={section.id} scene={SECTION_SCENES[section.id]} className="oda-sound-detail-thumb" sizes="120px" />
        <p className="oda-sound-detail-credit">ODA · {t('Sound Room')}</p>
        {section.id === 'breathe' ? (
          <BreathePanel sound={section.sounds[0]} soundPlaying={isPlaying('breath_pacer')} />
        ) : (
          <ul className="oda-sound-grid">
            {section.sounds.map((sound, i) => (
              <SoundCard key={`${section.id}-${sound.track}`} sound={sound} sectionId={section.id} indexInCategory={i} playing={isPlaying(sound.track)} selected={player.track === sound.track} locked={isSoundLocked(i, { gating: pro.gating, tier })} />
            ))}
          </ul>
        )}

        {section.id === 'sleep' && (
          <p className="oda-sound-hint">
            <Timer size={15} aria-hidden="true" />
            {t('Pick a timer in the player below. The sound fades out gently over the last minute.')}
          </p>
        )}
        </div>
      </section>
      <NowPlayingPanel volume={volume} onVolumeChange={onVolumeChange} primary={expandedPrimary} onPrimaryVisible={onPrimaryVisible} />
      </div>
      </div>

      <details className="oda-sound-about">
        <summary><Info size={17} aria-hidden="true" />{t('About')}</summary>
        <p className="oda-sound-intro-line">{t('Sound for calm, sleep and focus')}</p>
        <p className="oda-sound-lede">{t('Sound can help you relax, settle and fall asleep more easily. It is not a treatment.')}</p>
      </details>

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
            <SoundCard key={`frequencies-${sound.track}`} sound={sound} sectionId="frequencies" indexInCategory={i} playing={isPlaying(sound.track)} selected={player.track === sound.track} locked={isSoundLocked(i, { gating: pro.gating, tier })} />
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

      <PlayerBar volume={volume} onVolumeChange={onVolumeChange} visible={!expandedPrimary} />
    </div>
  );
};
