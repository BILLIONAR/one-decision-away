import { SOUND_ROOM_SECTIONS, type SoundRoomSectionId } from '../data/soundRoom';
import type { FocusSoundTrack } from '../types/models';
import { FREE_SOUNDS_PER_CATEGORY, tierAtLeast } from './entitlements';
import type { PurchasesState } from './purchases';

export type SoundRoomOrigin = { sectionId: SoundRoomSectionId; indexInCategory: number };
export type SoundRoomPlayOptions = Partial<SoundRoomOrigin> & { sleep?: boolean };

/** An explicit card origin must identify that exact catalog entry, including aliases. */
export function resolveSoundRoomAccess(track: FocusSoundTrack, options: SoundRoomPlayOptions):
  { origin: SoundRoomOrigin | null; restricted: boolean } | null {
  if (options.sectionId !== undefined || options.indexInCategory !== undefined) {
    const section = SOUND_ROOM_SECTIONS.find(item => item.id === options.sectionId);
    const index = options.indexInCategory;
    if (!section || typeof index !== 'number' || !Number.isInteger(index) || index < 0 || section.sounds[index]?.track !== track) return null;
    return { origin: { sectionId: section.id, indexInCategory: index }, restricted: index >= FREE_SOUNDS_PER_CATEGORY };
  }
  // Direct callers have no category. A track with any free placement stays free;
  // exclusively paid or unknown tracks require the configured native entitlement.
  const free = SOUND_ROOM_SECTIONS.some(section => section.sounds.some((sound, index) =>
    sound.track === track && index < FREE_SOUNDS_PER_CATEGORY));
  return { origin: null, restricted: !free };
}

export function canPlaySoundRoom(restricted: boolean, access: PurchasesState): boolean {
  return !access.available || !restricted ||
    (access.identityConfirmed && tierAtLeast(access.tier, 'essentials'));
}
