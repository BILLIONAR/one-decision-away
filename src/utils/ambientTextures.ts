/** Original procedural textures. No recordings, network or audio-library dependency. */
export type AmbientTexture = 'brown_noise' | 'pink_noise' | 'rain' | 'waves' | 'fireplace';
export const AMBIENT_LOOP_SECONDS = 24;
export const AMBIENT_SEAM_SECONDS = 0.25;

function randomGenerator(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Equal-power overlap; the loop boundary then joins consecutive original samples. */
export function crossfadeAmbientLoop(raw: Float32Array, overlap: number): Float32Array {
  const fade = Math.max(2, Math.min(Math.floor(overlap), Math.floor(raw.length / 3)));
  const length = raw.length - fade;
  const output = raw.slice(fade);
  for (let i = 0; i < fade; i++) {
    const angle = i / (fade - 1) * Math.PI / 2;
    output[length - fade + i] = raw[length + i] * Math.cos(angle) + raw[i] * Math.sin(angle);
  }
  return output;
}

/** Paul Kellet's pink-noise filter, retained from the existing ODA engine. */
function pinkState() {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  return (white: number) => {
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    const output = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
    return output;
  };
}

function normalize(channels: Float32Array[], targetRms: number) {
  let sum = 0, peak = 0, count = 0;
  for (const channel of channels) for (const value of channel) {
    sum += value * value; peak = Math.max(peak, Math.abs(value)); count++;
  }
  const multiplier = Math.min(targetRms / Math.max(1e-8, Math.sqrt(sum / count)), 0.72 / Math.max(1e-8, peak));
  for (const channel of channels) for (let i = 0; i < channel.length; i++) channel[i] *= multiplier;
}

/** Independently seeded stereo, long loops, and bounded peak levels before user gain. */
export function renderAmbientTexture(
  track: AmbientTexture,
  sampleRate: number,
  options: { seconds?: number; seed?: number } = {},
): [Float32Array, Float32Array] {
  if (!Number.isFinite(sampleRate) || sampleRate < 8000) throw new RangeError('A valid audio sample rate is required.');
  const seconds = Math.max(AMBIENT_LOOP_SECONDS, Number.isFinite(options.seconds) ? options.seconds! : AMBIENT_LOOP_SECONDS);
  const length = Math.round(sampleRate * seconds);
  const overlap = Math.round(sampleRate * AMBIENT_SEAM_SECONDS);
  const seed = options.seed ?? Math.floor(Math.random() * 4294967296);
  const brownAlpha = 1 - Math.exp(-2 * Math.PI * 90 / sampleRate);
  const airLowAlpha = 1 - Math.exp(-2 * Math.PI * 5200 / sampleRate);
  const airHighAlpha = 1 - Math.exp(-2 * Math.PI * 350 / sampleRate);
  const channels: Float32Array[] = [];
  for (let channel = 0; channel < 2; channel++) {
    const random = randomGenerator((seed ^ Math.imul(channel + 1, 0x9E3779B9)) >>> 0);
    const pink = pinkState();
    const raw = new Float32Array(length + overlap);
    let brown = 0, airLow = 0, airHigh = 0;
    let intensity = 0.6, nextIntensity = 0.6, intensityAt = 0, intensityEnd = 0;
    let swellAt = -random() * 6, swellLength = 8.5 + random() * 3;
    let shapeStart = 0, shapeEnd = 0, foamStart = 0, foamEnd = 0;
    const shapeBlock = 128;
    for (let i = 0; i < raw.length; i++) {
      const time = i / sampleRate;
      const white = random() * 2 - 1;
      // Sample-rate aware filters retain a consistent broad spectral identity.
      if (track === 'brown_noise') {
        brown += brownAlpha * (white - brown); raw[i] = brown; continue;
      }
      if (track === 'pink_noise') { raw[i] = pink(white); continue; }
      if (track === 'fireplace') {
        brown += brownAlpha * (white - brown); raw[i] = brown + pink(white) * 0.035; continue;
      }
      airLow += airLowAlpha * (white - airLow);
      airHigh += airHighAlpha * (airLow - airHigh);
      const pinkNoise = pink(white);
      if (track === 'rain') {
        if (time >= intensityEnd) {
          intensity = nextIntensity; nextIntensity = 0.4 + random() * 0.5;
          intensityAt = time; intensityEnd = time + 0.8 + random() * 2;
        }
        if (i % shapeBlock === 0) {
          const shape = (at: number) => intensity + (nextIntensity - intensity) * (1 - Math.cos(Math.PI * Math.min(1, (at - intensityAt) / (intensityEnd - intensityAt)))) / 2;
          shapeStart = shape(time); shapeEnd = shape(time + shapeBlock / sampleRate);
        }
        const envelope = shapeStart + (shapeEnd - shapeStart) * (i % shapeBlock) / shapeBlock;
        raw[i] = (airLow - airHigh) * envelope * 0.24 + pinkNoise * 0.045;
      } else {
        if (time - swellAt >= swellLength) { swellAt += swellLength; swellLength = 8.5 + random() * 3; }
        // Surf rises in amplitude, breaks softly, then withdraws; no single cutoff LFO.
        if (i % shapeBlock === 0) {
          const phase = (time - swellAt) / swellLength;
          const nextPhase = (time + shapeBlock / sampleRate - swellAt) / swellLength;
          shapeStart = Math.pow(Math.max(0, Math.sin(Math.PI * phase)), 2.6);
          shapeEnd = Math.pow(Math.max(0, Math.sin(Math.PI * nextPhase)), 2.6);
          foamStart = Math.exp(-Math.pow((phase - 0.62) / 0.16, 2));
          foamEnd = Math.exp(-Math.pow((nextPhase - 0.62) / 0.16, 2));
        }
        const fraction = (i % shapeBlock) / shapeBlock;
        const swell = shapeStart + (shapeEnd - shapeStart) * fraction;
        const foam = foamStart + (foamEnd - foamStart) * fraction;
        raw[i] = pinkNoise * (0.025 + swell * 0.42) + (airLow - airHigh) * foam * 0.09;
      }
    }
    if (track === 'rain' || track === 'fireplace') {
      const rain = track === 'rain';
      let time = random() * 0.12;
      while (time < seconds + AMBIENT_SEAM_SECONDS) {
        const start = Math.floor(time * sampleRate);
        const duration = rain ? 0.012 + random() * 0.028 : 0.004 + random() * 0.045;
        const count = Math.round(duration * sampleRate);
        const amplitude = rain ? 0.03 + random() * 0.085 : 0.05 + Math.pow(random(), 2) * 0.22;
        let filtered = 0;
        for (let j = 0; j < count && start + j < raw.length; j++) {
          const white = random() * 2 - 1;
          filtered += (rain ? 0.35 : 0.68) * (white - filtered);
          const attack = Math.min(1, j / Math.max(1, sampleRate * (rain ? 0.002 : 0.0008)));
          const decay = Math.exp(-j / count * (rain ? 4 : 6));
          raw[start + j] += filtered * amplitude * attack * decay;
        }
        // Exponential inter-event intervals avoid a mechanical metronome crackle.
        time += -Math.log(Math.max(1e-8, random())) / (rain ? 19 : 5.5);
      }
    }
    channels.push(crossfadeAmbientLoop(raw, overlap));
  }
  normalize(channels, track === 'fireplace' ? 0.10 : 0.15);
  return channels as [Float32Array, Float32Array];
}
