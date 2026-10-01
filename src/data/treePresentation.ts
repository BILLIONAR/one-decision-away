export const TREE_LEAVES = 60;
export const MAX_BLOSSOMS = 30;

/** Transform values preserve the supplied PNG pixels and put every root at (50%, 88%). */
const STAGES = [
  { stage: 'seedling', file: 'tree-00-seedling-0.png', scale: 0.997878, offset: [-0.132941, -4.105263], origin: [50.1329, 92.1053] },
  { stage: 'sapling', file: 'tree-01-sapling-1-9.png', scale: 0.901193, offset: [-1.242842, -3.148325], origin: [51.2428, 91.1483] },
  { stage: 'young', file: 'tree-02-young-10-29.png', scale: 0.751915, offset: [-2.550559, -5.301435], origin: [52.5506, 93.3014] },
  { stage: 'fuller', file: 'tree-03-fuller-30-59.png', scale: 0.882758, offset: [-1.888824, -6.816587], origin: [51.8888, 94.8166] },
  { stage: 'mature', file: 'tree-04-mature-60-plus.png', scale: 0.998761, offset: [-0.666376, -2.350877], origin: [50.6664, 90.3509] },
  { stage: 'flowering', file: 'tree-05-flowering-61-90.png', scale: 0.980444, offset: [-0.684949, -2.669856], origin: [50.6849, 90.6699] },
] as const;

export function treePresentation(count: number) {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const index = total === 0 ? 0 : total < 10 ? 1 : total < 30 ? 2 : total < 60 ? 3 : total === 60 ? 4 : 5;
  // Keep the flowering stage after the blossom cap; progress never shrinks or resets.
  return { ...STAGES[index], total, leaves: Math.min(total, TREE_LEAVES), blossoms: Math.min(Math.max(0, total - TREE_LEAVES), MAX_BLOSSOMS) };
}
