import confetti from 'canvas-confetti';

/**
 * Subtle 'small' confetti burst for micro-achievements, e.g. completing daily micro-habits.
 */
export function triggerSmallConfetti() {
  confetti({
    particleCount: 36,
    spread: 45,
    startVelocity: 28,
    origin: { y: 0.72 },
    scalar: 0.75,
    ticks: 140,
    colors: ['#708879', '#C98276', '#E2B870', '#85A98F', '#2A9D8F'],
    disableForReducedMotion: true,
  });
}

/**
 * Standard celebratory confetti burst when completing a daily quest or mission.
 */
export function triggerMissionConfetti() {
  confetti({
    particleCount: 75,
    spread: 65,
    origin: { y: 0.7 },
    colors: ['#708879', '#C98276', '#E2B870', '#85A98F', '#263238'],
    disableForReducedMotion: true,
  });
}

/**
 * Rich, high-energy confetti shower for big milestones, One Decisions, or significant D$ earnings.
 */
export function triggerBigRewardConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    disableForReducedMotion: true,
    colors: ['#D4AF37', '#E2B870', '#708879', '#C98276', '#4CAF50', '#FFD700'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Golden coins & stars sparkle for luxury grants and acquisitions.
 */
export function triggerGoldConfetti() {
  const end = Date.now() + 1000;
  const colors = ['#D4AF37', '#FFDF73', '#E6C687', '#C98276'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
