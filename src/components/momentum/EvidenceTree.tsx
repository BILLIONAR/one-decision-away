import React, { useId, useMemo } from 'react';

/**
 * A tree that grows one leaf for every kept decision (a Finch-style identity
 * reward instead of abstract points). It starts as a seedling, becomes a
 * sapling, fills its canopy at 60 leaves and then blossoms. Drawn with
 * tapered bark, real leaf shapes and a soft canopy; the newest leaf is fresh light-green growth so it reads as a living
 * tree, not an icon. Deterministic: the same count always draws the same tree.
 */
type P = [number, number];
type Curve = { from: P; ctrl: P; to: P };
type Branch = Curve & { w: number };

const BRANCHES: Branch[] = [
  { from: [120, 150], ctrl: [92, 140], to: [52, 104], w: 5.5 },
  { from: [121, 138], ctrl: [154, 130], to: [190, 96], w: 5.2 },
  { from: [121, 118], ctrl: [96, 100], to: [68, 58], w: 4.6 },
  { from: [122, 104], ctrl: [150, 90], to: [178, 52], w: 4.4 },
  { from: [122, 82], ctrl: [118, 56], to: [124, 20], w: 3.8 },
];
const PER_BRANCH = 12;
export const TREE_LEAVES = BRANCHES.length * PER_BRANCH;
const MAX_BLOSSOMS = 30;
const LEAF_GREENS = ['#3E6B47', '#4F7F52', '#5E8F5B', '#6E9B63', '#88AD72', '#476F4B'];
const TRUNK: Curve = { from: [120, 194], ctrl: [116, 150], to: [122, 58] };
const LEAF = 'M0 0 C3 -3.6 9 -4.2 13 0 C9 4.2 3 3.6 0 0 Z';

const bez = (b: Curve, t: number): P => {
  const u = 1 - t;
  return [u * u * b.from[0] + 2 * u * t * b.ctrl[0] + t * t * b.to[0], u * u * b.from[1] + 2 * u * t * b.ctrl[1] + t * t * b.to[1]];
};

/** A filled, tapering limb along a quadratic curve: thick at the base, fine at the tip. */
function limb(b: Curve, w0: number, w1: number, steps = 14): string {
  const left: P[] = []; const right: P[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = bez(b, t);
    const [x2, y2] = bez(b, Math.min(1, t + 0.01));
    const [x0, y0] = bez(b, Math.max(0, t - 0.01));
    const a = Math.atan2(y2 - y0, x2 - x0) + Math.PI / 2;
    const w = (w0 + (w1 - w0) * t) / 2;
    left.push([x + Math.cos(a) * w, y + Math.sin(a) * w]);
    right.push([x - Math.cos(a) * w, y - Math.sin(a) * w]);
  }
  const pts = [...left, ...right.reverse()];
  return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;
}

function layout() {
  const leaves: { x: number; y: number; tx: number; ty: number; angle: number; branch: number; color: string; size: number }[] = [];
  // Round-robin across branches, inner leaves first, so the canopy fills evenly.
  for (let j = 0; j < PER_BRANCH; j++) {
    BRANCHES.forEach((b, i) => {
      const t = 0.28 + 0.72 * (j / (PER_BRANCH - 1));
      const [tx, ty] = bez(b, t);
      const [x2, y2] = bez(b, Math.min(1, t + 0.02));
      const along = Math.atan2(y2 - ty, x2 - tx) * 180 / Math.PI;
      const side = j % 2 === 0 ? 1 : -1;
      const reach = 5 + ((i * 7 + j * 3) % 5);
      const rad = (along - 70 * side) * Math.PI / 180;
      leaves.push({
        x: tx + Math.cos(rad) * reach, y: ty + Math.sin(rad) * reach, tx, ty,
        angle: along - 55 * side + (((i + j) % 3) - 1) * 12, branch: i,
        color: LEAF_GREENS[(i * 5 + j * 7) % LEAF_GREENS.length], size: 0.9 + ((i * 3 + j * 5) % 5) / 12,
      });
    });
  }
  return leaves;
}

export const EvidenceTree: React.FC<{ count: number; className?: string; label: string }> = ({ count, className = '', label }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const leaves = useMemo(layout, []);
  const shown = Math.min(count, TREE_LEAVES);
  const blossoms = Math.min(Math.max(0, count - TREE_LEAVES), MAX_BLOSSOMS);
  const firstLeafOnBranch = (i: number) => leaves.findIndex(l => l.branch === i);
  const growth = Math.min(1, count / 30);
  // A sapling first: the whole tree grows from the ground until ~30 leaves.
  const scale = 0.48 + 0.52 * growth;
  const leafGrow = 1.3 - 0.3 * growth;
  const trunkBase = 7 + Math.min(count, TREE_LEAVES) / 7;
  const canopy = Math.min(1, shown / TREE_LEAVES);
  const bark = `bark${uid}`; const ground = `ground${uid}`; const glow = `canopy${uid}`;

  return (
    <svg viewBox="0 0 240 205" role="img" aria-label={label} className={`oda-evidence-tree ${className}`}>
      <defs>
        <linearGradient id={bark} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#5A4030" />
          <stop offset="0.45" stopColor="#8A6A4E" />
          <stop offset="1" stopColor="#4E372A" />
        </linearGradient>
        <radialGradient id={ground} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#6F7F55" stopOpacity="0.45" />
          <stop offset="1" stopColor="#6F7F55" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={glow} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#6E9B63" stopOpacity="0.5" />
          <stop offset="1" stopColor="#6E9B63" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="195" rx="86" ry="9" fill={`url(#${ground})`} />
      {[[96, 196, -8], [104, 197, 6], [138, 196, -5], [146, 197, 9], [128, 198, 3]].map(([x, y, a], i) => (
        <path key={i} d={`M${x} ${y} q${a / 3} -5 ${a / 2} -8`} stroke="#6F8A55" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.7" />
      ))}

      {count === 0 ? (
        <g>
          <path d="M120 195 C119 186 121 180 120 172" stroke="#6B8F4E" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d={LEAF} transform="translate(120 174) rotate(-150) scale(1.1)" fill="#6E9B63" />
          <path d={LEAF} transform="translate(120 172) rotate(-30) scale(1.2)" fill="#5E8F5B" />
        </g>
      ) : (
        <g transform={`translate(120 194) scale(${scale.toFixed(3)}) translate(-120 -194)`}>
          {canopy > 0.15 && (
            <g opacity={Math.min(0.9, canopy)}>
              <ellipse cx="120" cy="82" rx={50 + 30 * canopy} ry={40 + 22 * canopy} fill={`url(#${glow})`} />
              <ellipse cx="82" cy="100" rx={24 + 18 * canopy} ry={20 + 10 * canopy} fill={`url(#${glow})`} />
              <ellipse cx="160" cy="92" rx={24 + 18 * canopy} ry={20 + 10 * canopy} fill={`url(#${glow})`} />
            </g>
          )}
          <path d={limb(TRUNK, trunkBase, 2.6)} fill={`url(#${bark})`} />
          <path d={`M${(120 - trunkBase * 0.95).toFixed(1)} 195 Q120 ${(186 - trunkBase * 0.3).toFixed(1)} ${(120 + trunkBase * 0.95).toFixed(1)} 195 Z`} fill="#5A4030" />
          {BRANCHES.map((b, i) => shown > firstLeafOnBranch(i) && (
            <path key={i} d={limb(b, Math.max(1.6, b.w * (0.45 + 0.55 * growth)), 0.8)} fill={`url(#${bark})`} />
          ))}
          {leaves.slice(0, shown).map((leaf, k) => {
            const s = leaf.size * leafGrow;
            const newest = k === shown - 1 && !blossoms;
            return (
              <g key={k}>
                <path d={`M${leaf.tx.toFixed(1)} ${leaf.ty.toFixed(1)} L${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}`} stroke="#5A4A36" strokeWidth="0.6" opacity="0.7" />
                <g transform={`translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) rotate(${leaf.angle.toFixed(1)}) scale(${s.toFixed(2)})`}>
                  <path d={LEAF} fill={newest ? '#A8CF7E' : leaf.color} />
                  <path d="M1 0 L12 0" stroke="#EAF2DC" strokeWidth="0.45" opacity="0.55" />
                </g>
              </g>
            );
          })}
          {leaves.slice(0, blossoms).map((leaf, k) => (
            <g key={`b${k}`} transform={`translate(${(leaf.x + 2).toFixed(1)} ${(leaf.y - 2).toFixed(1)})`}>
              {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-2.2" rx="1.5" ry="2.3" transform={`rotate(${a})`} fill="#F4C7CF" />)}
              <circle r="1.1" fill="#E8A13A" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};
