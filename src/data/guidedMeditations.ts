/**
 * Guided Meditations — 10 voice-guided sessions.
 * Each cue is spoken by the VoiceGuide at `atSeconds` of elapsed session time
 * and shown as a subtitle on the Focus Lock screen.
 */

import { FocusSoundTrack } from '../types/models';

export type MeditationIntent =
  | 'relax'
  | 'dopamine'
  | 'feel_good'
  | 'manifest'
  | 'belief'
  | 'motivation'
  | 'gratitude'
  | 'confidence'
  | 'focus'
  | 'sleep'
  | 'two_futures';

export interface MeditationCue {
  atSeconds: number;
  text: string;
}

export interface GuidedMeditation {
  id: string;
  intent: MeditationIntent;
  title: string;
  tagline: string;
  description: string;
  durationMinutes: number;
  track: FocusSoundTrack;
  emoji: string;
  benefits: string[];
  cues: MeditationCue[];
}

/**
 * Authoring helper: [pauseBeforeSeconds, text] → absolute cue times.
 * Gaps are stretched proportionally so the final cue lands ~15s before the session ends.
 */
function script(durationMinutes: number, lines: [number, string][]): MeditationCue[] {
  const total = durationMinutes * 60;
  const raw = lines.reduce((acc, [gap]) => acc + gap, 0);
  const firstGap = lines[0]?.[0] ?? 0;
  const scale = raw > firstGap ? (total - 15 - firstGap) / (raw - firstGap) : 1;
  let t = 0;
  return lines.map(([gap, text], i) => {
    t += i === 0 ? gap : Math.round(gap * scale);
    return { atSeconds: t, text };
  });
}

export const GUIDED_MEDITATIONS: GuidedMeditation[] = [
  {
    id: 'gm-relax',
    intent: 'relax',
    title: 'Deep Relaxation',
    tagline: 'Let the whole body go',
    description: 'A slow body scan that releases tension from head to toe and settles the nervous system.',
    durationMinutes: 8,
    track: 'meditation_432hz',
    emoji: '🌊',
    benefits: ['Lower stress', 'Muscle release', 'Calm mind'],
    cues: script(8, [
      [2, 'Welcome. Find a comfortable position, and let your eyes gently close.'],
      [12, 'Take a slow breath in through your nose... and let it out through your mouth, like a long sigh.'],
      [14, 'Again. Breathe in... and release. There is nothing you need to do right now, except be here.'],
      [16, 'Bring your attention to the top of your head. Let the scalp soften. Let the forehead smooth out.'],
      [18, 'Relax the small muscles around your eyes. Unclench your jaw. Let your tongue rest.'],
      [20, 'Feel your shoulders drop away from your ears. Let them become heavy.'],
      [20, 'Warmth flows down your arms, into your hands, all the way to your fingertips.'],
      [22, 'Your chest rises and falls on its own. Each exhale lets the body sink a little deeper.'],
      [22, 'Soften your belly. Release your lower back. Let the hips be heavy and supported.'],
      [24, 'Relax your thighs... your knees... your calves... your feet. Let every part of you be held.'],
      [30, 'Now simply rest in this stillness. Nothing to fix. Nothing to chase. Just breathing.'],
      [45, 'If a thought appears, let it drift past like a cloud, and return to the feeling of the breath.'],
      [60, 'You are safe. You are calm. You are allowed to rest.'],
      [60, 'Slowly bring a little movement back to your fingers and toes.'],
      [20, 'Take one deeper breath. When you are ready, gently open your eyes, carrying this calm with you.'],
    ]),
  },
  {
    id: 'gm-dopamine',
    intent: 'dopamine',
    title: 'Dopamine Reset',
    tagline: 'Quiet the craving, reclaim your drive',
    description: 'Settles the restless urge for quick hits and re-anchors your reward system to meaningful action.',
    durationMinutes: 7,
    track: 'theta_meditation',
    emoji: '🧠',
    benefits: ['Less impulsivity', 'Boredom tolerance', 'Clean focus'],
    cues: script(7, [
      [2, 'Put your phone face down. Sit tall. Close your eyes. This is a reset for your reward system.'],
      [12, 'Breathe in for four... hold for four... and out for six. Slow the whole system down.'],
      [16, 'Notice any restlessness in your body. The urge to check, to scroll, to reach for something. Just notice it.'],
      [18, 'You do not have to act on the urge. Watch it rise, like a wave. Watch it fall. It always falls.'],
      [22, 'Your brain has been trained to expect a reward every few seconds. Right now, you are retraining it.'],
      [20, 'Every second you stay here, doing nothing, you are building tolerance for boredom. That is strength.'],
      [24, 'Breathe in. Feel the stillness. Breathe out. Let the noise settle like dust in a quiet room.'],
      [26, 'Think of one meaningful thing you are building. A goal that actually matters to you.'],
      [18, 'Imagine the feeling of finishing it. That quiet, deep satisfaction. That is real reward.'],
      [24, 'Cheap dopamine feels loud and empties you. Earned dopamine feels quiet and fills you.'],
      [30, 'Sit with the stillness. Let your baseline come back up. You are recalibrating.'],
      [50, 'Notice: the urge is already softer. You are stronger than the pull.'],
      [50, 'Take a full breath. When you open your eyes, choose one real action instead of one more scroll.'],
      [20, 'Open your eyes. Go do the meaningful thing.'],
    ]),
  },
  {
    id: 'gm-feel-good',
    intent: 'feel_good',
    title: 'Feel-Good Boost',
    tagline: 'Turn the inner weather to sunshine',
    description: 'A warm, uplifting session that raises your mood through breath, memory and a gentle inner smile.',
    durationMinutes: 7,
    track: 'solfeggio_528hz',
    emoji: '☀️',
    benefits: ['Mood lift', 'Lightness', 'Inner warmth'],
    cues: script(7, [
      [2, 'Settle in. Let your shoulders soften and let a small smile rest on your lips, even if it feels silly.'],
      [12, 'Breathe in, and imagine the breath is light. Breathe out, and let that light spread through your chest.'],
      [16, 'Bring to mind a moment when you felt truly good. A laugh. A sunrise. A hug. A win.'],
      [18, 'Step into that memory. What did you see? What did you hear? Feel it in your body now.'],
      [22, 'Let that warmth grow with every breath. It moves from your chest into your face, your hands, your whole body.'],
      [22, 'Say silently: I am allowed to feel good today. I do not have to earn it. It is already mine.'],
      [24, 'Feel the corners of your mouth lift a little more. Your body believes what you show it.'],
      [26, 'Breathe in joy. Breathe out heaviness. Breathe in lightness. Breathe out worry.'],
      [30, 'Picture the rest of your day going well. Small kindnesses. Easy moments. Things clicking into place.'],
      [40, 'Rest in this brightness. Let it sink in, like sunlight into skin.'],
      [50, 'You carry this feeling. It is not outside you. It never was.'],
      [50, 'Take one deep, grateful breath. Let it out with a smile.'],
      [20, 'Open your eyes and bring this glow into the world.'],
    ]),
  },
  {
    id: 'gm-manifest',
    intent: 'manifest',
    title: 'Design Your Future',
    tagline: 'Live the vision before you build it',
    description: 'A vivid visualization of your future self and your dream life, so your daily decisions start pointing there.',
    durationMinutes: 10,
    track: 'solfeggio_639hz',
    emoji: '✨',
    benefits: ['Clear vision', 'Emotional alignment', 'Daily direction'],
    cues: script(10, [
      [2, 'Sit comfortably and close your eyes. In this session, you will visit the life you are building.'],
      [12, 'Breathe slowly. With each exhale, let today loosen its grip. You are about to travel forward in time.'],
      [18, 'Imagine a door in front of you. On the other side is your life, three years from now, if you keep choosing well.'],
      [16, 'Open the door and step through. Look around. Where are you? What does the light look like?'],
      [22, 'Notice the home you live in. Walk through it slowly. Touch the surfaces. Feel how it feels to be here.'],
      [26, 'Notice your body. How do you carry yourself? How do you move, breathe, stand?'],
      [24, 'Look at your morning. What do you do first? What do you no longer do at all?'],
      [26, 'See your work. The kind of work you do, the people you serve, the freedom it gives you.'],
      [26, 'Feel your finances. Calm. Enough. Growing. Money is a tool in your hands, not a weight on your chest.'],
      [28, 'See the people around you. Who is there? How do they look at you? How do you make them feel?'],
      [28, 'Now find your future self in this life. Look into their eyes. They are calm, clear, and proud of you.'],
      [24, 'Ask them: what was the one decision that changed everything? Listen quietly for the answer.'],
      [40, 'Whatever came, hold it. That is your instruction for today.'],
      [30, 'Feel this future in your body now. It is not a wish. It is a memory of something coming.'],
      [40, 'Say silently: I am becoming this person, one decision at a time.'],
      [50, 'Walk back through the door, bringing the feeling with you. Nothing is lost. It is all ahead.'],
      [40, 'Take a deep breath. Open your eyes. Now write down the one decision your future self gave you.'],
    ]),
  },
  {
    id: 'gm-belief',
    intent: 'belief',
    title: 'Unshakeable Belief',
    tagline: 'Release doubt, install certainty',
    description: 'Dissolves the old stories of "I can\'t" and replaces them with grounded, quiet certainty in yourself.',
    durationMinutes: 8,
    track: 'solfeggio_396hz',
    emoji: '🪨',
    benefits: ['Self-trust', 'Release doubt', 'Grounded courage'],
    cues: script(8, [
      [2, 'Close your eyes and feel your feet on the ground. Feel how solid the earth is beneath you.'],
      [14, 'Breathe in through your nose. Breathe out slowly. Let your weight sink downward, rooted and stable.'],
      [18, 'Bring to mind one doubt you carry. A sentence that starts with "I can\'t", or "I am not the kind of person who..."'],
      [20, 'Notice where that doubt lives in your body. A tightness. A heaviness. Just locate it.'],
      [20, 'Now recognize: this is not truth. It is a story. Someone, or something, taught it to you.'],
      [22, 'Breathe into that place. And as you exhale, imagine the story loosening, like an old rope untying.'],
      [24, 'Remember one time you did something you were sure you could not do. You were wrong then. You are wrong now.'],
      [24, 'Say silently: I have proof. I have done hard things before. I will do them again.'],
      [26, 'Feel a steady strength rising from the ground, up through your legs, into your spine. Quiet. Certain.'],
      [26, 'Say silently: I trust myself. I keep my word to myself. What I decide, I do.'],
      [30, 'Let that certainty settle into your chest. It is not loud. It does not need to prove anything.'],
      [45, 'Rest here. Rooted. Solid. Unshakeable.'],
      [50, 'The doubt may return. That is fine. Now you know it is only a story, and you are the author.'],
      [40, 'Breathe in strength. Breathe out doubt. One more time.'],
      [25, 'Open your eyes. Stand tall. Go prove it again today.'],
    ]),
  },
  {
    id: 'gm-motivation',
    intent: 'motivation',
    title: 'Ignite Motivation',
    tagline: 'Wake the fire and move',
    description: 'An energizing session that connects you to your why and pushes you off the couch and into action.',
    durationMinutes: 7,
    track: 'binaural',
    emoji: '🔥',
    benefits: ['Energy', 'Clarity of why', 'Action momentum'],
    cues: script(7, [
      [2, 'Sit up straight. Spine tall. Chin level. This session is not for resting. It is for igniting.'],
      [10, 'Take three sharp breaths in through the nose, and out through the mouth. Wake the body up.'],
      [16, 'Now, why are you doing this? Not the small reason. The real one. Who are you becoming? Who are you doing it for?'],
      [20, 'See their face, or see your own future face. Feel what it would cost to give up now.'],
      [20, 'Your future self is watching this exact moment. Every hour you waste, they lose. Every hour you invest, they win.'],
      [22, 'Feel energy building in your chest. A warm pressure. That is your drive. It was never gone, only buried.'],
      [22, 'Say silently: I do not wait to feel ready. I act, and readiness follows.'],
      [24, 'Think of the very next action. Not the whole project. The next fifteen minutes. See yourself starting.'],
      [22, 'Breathe in power. Breathe out excuses. Breathe in fire. Breathe out hesitation.'],
      [26, 'Say silently: Today I move. Today I build. Today is one decision away from a different life.'],
      [30, 'Feel it in your hands. They want to work. Feel it in your legs. They want to stand.'],
      [40, 'Let the fire grow with every breath. Brighter. Hotter. Ready.'],
      [40, 'On the next breath, you will open your eyes and go straight to the first action. No delay.'],
      [26, 'Breathe in... and go. Now.'],
    ]),
  },
  {
    id: 'gm-gratitude',
    intent: 'gratitude',
    title: 'Gratitude Flow',
    tagline: 'See how much is already here',
    description: 'Shifts the mind from scarcity to abundance by feeling deep thanks for what you already have.',
    durationMinutes: 7,
    track: 'solfeggio_528hz',
    emoji: '🙏',
    benefits: ['Abundance mindset', 'Contentment', 'Heart opening'],
    cues: script(7, [
      [2, 'Close your eyes and place one hand on your heart. Feel it beating. It has never stopped, not once.'],
      [14, 'Breathe slowly. With each breath, thank your lungs, quietly, for doing this without being asked.'],
      [18, 'Think of one person who has helped you. See their face. Feel a warm thank you rise toward them.'],
      [20, 'Think of something in your home that makes your life easier. Something you rarely notice. Thank it.'],
      [20, 'Think of your body. Whatever it can do today, it is carrying you. Thank it for that.'],
      [22, 'Think of a hard time that taught you something. Somehow it made you who you are. Thank it too.'],
      [22, 'Now think of something small from today. A taste. A sound. A moment of comfort. Thank it.'],
      [24, 'Feel the warmth in your chest expanding. Gratitude is not a thought. It is a feeling in the body.'],
      [26, 'Say silently: I have enough. I am enough. And more is on its way.'],
      [30, 'Let yourself feel rich in this moment. Not later. Now.'],
      [40, 'Rest in the fullness of what is already here.'],
      [50, 'Notice: nothing outside you changed. Only what you looked at. This is a superpower.'],
      [40, 'Take a deep, grateful breath. Hold the feeling.'],
      [20, 'Open your eyes and look for something to appreciate in the next sixty seconds.'],
    ]),
  },
  {
    id: 'gm-confidence',
    intent: 'confidence',
    title: 'Confident Identity',
    tagline: 'Step into who you already are',
    description: 'Builds calm confidence by embodying your future self\'s posture, voice and standards.',
    durationMinutes: 8,
    track: 'tibetan_bowls',
    emoji: '🦁',
    benefits: ['Self-image', 'Presence', 'Calm authority'],
    cues: script(8, [
      [2, 'Sit as if you are already the person you are becoming. Notice how the posture changes on its own.'],
      [14, 'Breathe deeply and slowly. Confident people breathe slowly. Let your breath teach your body.'],
      [18, 'Picture your future self walking into a room. Calm. Unhurried. Comfortable in their own skin.'],
      [20, 'Notice how they hold their shoulders. Their eyes. The pace of their words. Feel it in your own body now.'],
      [22, 'Say silently: I do not need permission. I do not need approval. I am already enough.'],
      [22, 'Remember three things you have done that you are proud of. Let them stack, one on top of the other.'],
      [26, 'Feel the weight of that evidence. You are not pretending. You are remembering.'],
      [24, 'Think of the old self. The one who apologized for taking up space. Thank them, and let them go.'],
      [24, 'Say silently: I speak clearly. I decide quickly. I keep my standards, even when no one is watching.'],
      [28, 'Feel a quiet strength in your chest. Confidence is not loud. It is calm.'],
      [40, 'Rest in this identity. Let it become familiar. Let it become home.'],
      [50, 'This is who you are now. Every choice today comes from this place.'],
      [40, 'Take one strong breath in. Let it out slowly.'],
      [24, 'Open your eyes, and walk into your day as this person.'],
    ]),
  },
  {
    id: 'gm-focus',
    intent: 'focus',
    title: 'Deep Focus Primer',
    tagline: 'Clear the desk of the mind',
    description: 'A short pre-work session that empties mental clutter and sets a single, sharp intention before deep work.',
    durationMinutes: 6,
    track: 'binaural',
    emoji: '🎯',
    benefits: ['Mental clarity', 'Single-tasking', 'Flow entry'],
    cues: script(6, [
      [2, 'Sit at your workspace. Close your eyes. In six minutes you will begin the most important work of your day.'],
      [12, 'Breathe in for four. Out for six. Let the breathing slow down the mind.'],
      [16, 'Picture your mind as a desk covered in papers. Every open loop. Every unfinished thought.'],
      [18, 'One by one, place each paper in a drawer. It will still be there later. Right now, it is closed.'],
      [22, 'The desk is clearing. Feel the space appearing. Quiet. Clean. Ready.'],
      [20, 'Now name your one task. Only one. Say it silently, clearly, as a single sentence.'],
      [20, 'See yourself doing it. The first step. Then the next. Steady. Uninterrupted.'],
      [22, 'Say silently: For the next session, this is the only thing that exists.'],
      [24, 'If distractions come, you will write them down and return. You do not chase them.'],
      [30, 'Feel your attention narrowing, like a lens coming into focus. Sharp. Bright. Still.'],
      [40, 'Breathe. The mind is quiet. The task is clear. The body is ready.'],
      [40, 'On the next breath, open your eyes and begin, without checking anything else first.'],
      [14, 'Begin.'],
    ]),
  },
  {
    id: 'gm-sleep',
    intent: 'sleep',
    title: 'Evening Wind-Down',
    tagline: 'Close the day, open to rest',
    description: 'A soft, slow session that reviews the day with kindness and guides the body toward deep sleep.',
    durationMinutes: 10,
    track: 'rain',
    emoji: '🌙',
    benefits: ['Better sleep', 'Let go of the day', 'Nervous system reset'],
    cues: script(10, [
      [2, 'Lie down or lean back. Let the day be over. There is nothing left to do tonight.'],
      [14, 'Breathe in gently... and let out a long, slow exhale. Let each breath be a little slower than the last.'],
      [18, 'Think back over today. Find one thing you did well, even something small. Let yourself feel it.'],
      [22, 'If something went wrong, let it be. Tomorrow is a new chance. Tonight, you rest.'],
      [24, 'Say silently: I did enough today. I am allowed to stop now.'],
      [24, 'Feel your eyes growing heavier. Your face softening. Your jaw releasing.'],
      [26, 'Your shoulders melt into the surface beneath you. Your arms are heavy. Your hands are warm.'],
      [28, 'Your breath is slow and deep, like waves rolling onto a quiet shore.'],
      [30, 'Your legs are heavy. Your feet are warm. The whole body is sinking, safe and supported.'],
      [40, 'Thoughts may drift by. Let them go, like leaves on a slow river.'],
      [50, 'You are safe. You are warm. You are done for today.'],
      [60, 'Breathe... and drift.'],
      [70, 'Let go a little more with every breath.'],
      [80, 'Rest now. Sleep well.'],
    ]),
  },
];

GUIDED_MEDITATIONS.push({
  id: 'gm-two-futures',
  intent: 'two_futures',
  title: 'The Two Futures Walk',
  tagline: 'Visit the life you refuse, then the one you choose',
  description:
    'Walk honestly through the default future first, feel its weight, then cross over into the life you are building. Ends with one decision.',
  durationMinutes: 9,
  track: 'solfeggio_396hz',
  emoji: '🌗',
  benefits: ['Clarity', 'Urgency without panic', 'Decision'],
  cues: script(9, [
    [2, 'Sit down and close your eyes. This walk has two halves. The first one is not comfortable, and that is the point.'],
    [12, 'Breathe slowly. In through the nose. Out through the mouth. Let the shoulders drop.'],
    [16, 'Imagine a road splitting in two. Take the left path first. This is the road where nothing changes.'],
    [18, 'It is one year from now. Same habits. Same excuses. Look around. What is exactly the same? Feel how familiar it is.'],
    [22, 'Now it is three years. The projects you were going to start are still ideas. Notice what you stopped mentioning to people.'],
    [24, 'Ten years. Look at your body. Look at your bank account. Look at the people who needed you to become someone. What do they see?'],
    [24, 'Stand in this future for a moment. Do not run from it yet. Let its weight land. This is what waiting costs.'],
    [26, 'Say silently: I see you. I understand how I got here. And I refuse to stay.'],
    [20, 'Now turn around. Walk back to the fork. Feel each step getting lighter.'],
    [18, 'Take the right path. This is the road where you kept your word to yourself.'],
    [20, 'One year. One decision every day. Small things, done anyway. Notice how your posture is different here.'],
    [22, 'Three years. The work is real now. The money is calmer. Someone you respect just told you they are proud of you.'],
    [24, 'Ten years. Look at your body. Your home. The people around you. This is what one decision a day builds.'],
    [26, 'Stand in this future. Breathe it in. It is not luck. It is the sum of the days you did not drift.'],
    [28, 'Now, from this place, look back at today. What is the one decision that moved you onto this road?'],
    [40, 'Hold it. That is your One Decision. Not for someday. For today.'],
    [30, 'Take one deep breath. Open your eyes. Go set it, and go do it.'],
  ]),
});

export const INTENT_LABELS: Record<MeditationIntent, string> = {
  relax: 'Relaxation',
  dopamine: 'Dopamine Reset',
  feel_good: 'Feel Good',
  manifest: 'Manifestation',
  belief: 'Belief',
  motivation: 'Motivation',
  gratitude: 'Gratitude',
  confidence: 'Confidence',
  focus: 'Focus',
  sleep: 'Sleep',
  two_futures: 'Two Futures',
};

export function getGuidedMeditation(id?: string | null): GuidedMeditation | undefined {
  if (!id) return undefined;
  return GUIDED_MEDITATIONS.find((m) => m.id === id);
}
