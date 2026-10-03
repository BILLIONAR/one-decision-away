import type { FocusSoundTrack } from '../types/models';
import { N_ } from '../i18n';

/**
 * Sound Room catalog. Strings are English source strings marked with N_()
 * and rendered through t(). Photos: Unsplash (free licence), by photo id.
 * Framing rule: sound can help people relax and settle; nothing here is
 * presented as a treatment.
 */

export type SoundRoomSectionId = 'relax' | 'sleep' | 'focus' | 'breathe' | 'frequencies';

export type SoundPhoto = { id: string; alt: string };

export type SoundRoomSound = {
  track: Exclude<FocusSoundTrack, 'silence'>;
  name: string;
  description: string;
  why: string;
  photo: SoundPhoto;
  /** Needs headphones: a binaural beat only exists when each ear gets its own tone. */
  binaural?: boolean;
};

export const SOUND_ROOM_HERO: SoundPhoto = {
  id: '1533757879476-8f4a3cb1ae4b',
  alt: N_('A wide, still lake at sunset'),
};

const photos = {
  headphones: { id: '1625786682948-2168238883d2', alt: N_('A woman wearing white headphones, eyes closed') },
  waves: { id: '1518837695005-2083093ee35b', alt: N_('Open sea under a wide sky') },
  lakeDusk: { id: '1757911261159-c3d020451341', alt: N_('Misty mountains reflected in a calm lake at dusk') },
  bowl: { id: '1593810451410-8fbb422cc15e', alt: N_('Hands holding a brass singing bowl') },
  moon: { id: '1593664028538-b8c65d4e2a91', alt: N_('A crescent moon above soft purple clouds') },
  pinkCloud: { id: '1559060017-445fb9722f2a', alt: N_('A soft pink and white cloud') },
  dunes: { id: '1506147854445-5a3f534191f8', alt: N_('Rolling desert dunes') },
  rain: { id: '1509635022432-0220ac12960b', alt: N_('Raindrops on a window') },
  fire: { id: '1543393470-b2c833b98dce', alt: N_('A fire burning in a fireplace') },
  mist: { id: '1502252430442-aac78f397426', alt: N_('Pine trees in morning mist') },
  sunset: { id: '1500534623283-312aade485b7', alt: N_('Mountain silhouettes at sunset') },
  stones: { id: '1604951832436-90867d74f4de', alt: N_('A smooth stone in a clear stream') },
  flowers: { id: '1674668560191-536c9fd88b8d', alt: N_('A meadow full of wildflowers') },
  milkyWay: { id: '1505144566083-38fb92594b3a', alt: N_('The Milky Way over still water') },
} satisfies Record<string, SoundPhoto>;

const alpha: SoundRoomSound = {
  track: 'binaural',
  name: N_('Alpha beat · 10 Hz'),
  description: N_('Two soft tones, 216 Hz and 226 Hz, one in each ear.'),
  why: N_('Studies link binaural beats to lower anxiety; results depend on the frequency and how long you listen.'),
  photo: photos.headphones,
  binaural: true,
};
const waves: SoundRoomSound = {
  track: 'waves',
  name: N_('Ocean waves'),
  description: N_('A slow swell of surf, rising and falling about every ten seconds.'),
  why: N_('A slow, predictable rhythm gives your attention somewhere easy to rest.'),
  photo: photos.waves,
};
const tone432: SoundRoomSound = {
  track: 'meditation_432hz',
  name: N_('Warm drone · 432 Hz'),
  description: N_('A warm 432 Hz drone with a soft bowl every half minute.'),
  why: N_('A steady, warm drone is easy to settle into. 432 Hz itself is not proven to be special.'),
  photo: photos.lakeDusk,
};
const bowls: SoundRoomSound = {
  track: 'tibetan_bowls',
  name: N_('Singing bowls'),
  description: N_('A low drone with a singing bowl struck every 18 seconds.'),
  why: N_('Following a long tone until it fades is a simple way to anchor your attention.'),
  photo: photos.bowl,
};
const delta: SoundRoomSound = {
  track: 'delta_sleep',
  name: N_('Delta beat · 2 Hz'),
  description: N_('Very low tones, 100 Hz and 102 Hz, over a soft brown-noise bed.'),
  why: N_('Low, quiet sound for winding down. Evidence that delta beats improve sleep is still limited.'),
  photo: photos.moon,
  binaural: true,
};
const pinkSleep: SoundRoomSound = {
  track: 'pink_noise',
  name: N_('Pink noise'),
  description: N_('An even, soft hiss, gentler and deeper than white noise.'),
  why: N_('Steady sound can cover sudden noises that might wake you.'),
  photo: photos.pinkCloud,
};
const brownSleep: SoundRoomSound = {
  track: 'brown_noise',
  name: N_('Brown noise'),
  description: N_('A deep, low rumble, like a distant waterfall.'),
  why: N_('Low, even noise covers traffic and household sounds.'),
  photo: photos.dunes,
};
const rainSleep: SoundRoomSound = {
  track: 'rain',
  name: N_('Rain'),
  description: N_('Light, steady rain against a window.'),
  why: N_('A familiar, harmless sound that makes it easier to let the day go.'),
  photo: photos.rain,
};

export const SOUND_ROOM_SECTIONS: {
  id: SoundRoomSectionId;
  label: string;
  intro: string;
  sounds: SoundRoomSound[];
}[] = [
  {
    id: 'relax',
    label: N_('Relax'),
    intro: N_('Slow, steady sound to help your body settle.'),
    sounds: [alpha, waves, tone432, bowls],
  },
  {
    id: 'sleep',
    label: N_('Sleep'),
    intro: N_('Low, even sound for winding down. Set a timer and it fades out over the last minute.'),
    sounds: [delta, pinkSleep, brownSleep, rainSleep],
  },
  {
    id: 'focus',
    label: N_('Focus'),
    intro: N_('Steady sound that masks chatter and small noises while you work.'),
    sounds: [
      { ...brownSleep, why: N_('Many people find a low, steady wall of sound easier to work in than silence.') },
      { ...pinkSleep, why: N_('Masks voices and background noise, so less pulls at your attention.') },
      {
        track: 'fireplace',
        name: N_('Fireplace'),
        description: N_('The low crackle of a wood fire.'),
        why: N_('A cosy, irregular crackle that keeps a quiet room from feeling empty.'),
        photo: photos.fire,
      },
      { ...rainSleep, why: N_('A soft, varied texture that covers distractions without asking for attention.') },
    ],
  },
  {
    id: 'breathe',
    label: N_('Breathe'),
    intro: N_('Breathe with the circle and the tone: in for 5.5 seconds, out for 5.5 seconds.'),
    sounds: [
      {
        track: 'breath_pacer',
        name: N_('Breath pacer'),
        description: N_('A soft tone that rises as you breathe in and falls as you breathe out.'),
        why: N_('Breathing slowly, under 10 breaths a minute, is linked to feeling calmer and more relaxed.'),
        photo: photos.mist,
      },
    ],
  },
  {
    id: 'frequencies',
    label: N_('Frequencies'),
    intro: N_('Offered for calm and curiosity, not as medicine.'),
    sounds: [
      { ...tone432, why: N_('Some musicians prefer tuning to 432 Hz. Claims that it heals are not supported by evidence.') },
      {
        track: 'solfeggio_528hz',
        name: N_('528 Hz'),
        description: N_('A 528 Hz tone with a soft shimmer and bowl strikes.'),
        why: N_('Called the “love frequency” in sound-healing circles. Enjoy it as a pleasant tone.'),
        photo: photos.sunset,
      },
      {
        track: 'solfeggio_396hz',
        name: N_('396 Hz'),
        description: N_('A grounded 396 Hz tone with low harmonics.'),
        why: N_('Linked to “letting go of fear” in the solfeggio tradition.'),
        photo: photos.stones,
      },
      {
        track: 'solfeggio_639hz',
        name: N_('639 Hz'),
        description: N_('A bright 639 Hz tone with gentle chimes.'),
        why: N_('Linked to “connection” in the solfeggio tradition.'),
        photo: photos.flowers,
      },
      {
        track: 'theta_meditation',
        name: N_('Theta beat · 6 Hz'),
        description: N_('A 6 Hz binaural beat on warm, low tones.'),
        why: N_('Theta rhythms are linked with drowsy, dreamy states. Many people find it deeply restful.'),
        photo: photos.milkyWay,
        binaural: true,
      },
    ],
  },
];

/** First catalog entry for a track (for the player bar when a sound was started elsewhere, e.g. Focus). */
export function soundForTrack(track: FocusSoundTrack | null): SoundRoomSound | undefined {
  if (!track || track === 'silence') return undefined;
  for (const section of SOUND_ROOM_SECTIONS) {
    const found = section.sounds.find((sound) => sound.track === track);
    if (found) return found;
  }
  return undefined;
}

export const unsplashUrl = (id: string, width: number, height: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=70`;
