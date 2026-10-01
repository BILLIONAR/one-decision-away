/** Original ODA v5 artwork, drawn for this application. No stock or reference artwork. */
export type BrandVariant = 'default' | 'inverted' | 'monochrome';

export const BRAND_V5 = {
  forest: '#173E35', wine: '#8A3042', ivory: '#F7F3EA',
  branchPaths: [
    'M17 37 C18 28 17 24 13 17 C9 12 4 8 5 6',
    'M17 37 C17 29 20 25 25 22 C31 17 30 12 29 11',
  ],
  selectedLeaf: 'M28 12 C24 9 25 4 30 2 C33 0 35 1 35 1 C35 7 33 11 28 12 Z',
  // Custom high-contrast serif letterforms. The O and D counters are integral paths.
  wordmarkPaths: [
    'M21 0 C8 0 0 8 0 22 C0 36 8 44 21 44 C34 44 42 36 42 22 C42 8 34 0 21 0 Z M21 2 C14 2 10 9 10 22 C10 35 14 42 21 42 C28 42 32 35 32 22 C32 9 28 2 21 2 Z',
    'M48 0 H69 C86 0 95 8 95 22 C95 36 86 44 69 44 H48 V42 H54 V2 H48 Z M64 2 V42 H68 C79 42 85 36 85 22 C85 8 79 2 68 2 Z',
    'M123 0 H125 L142 42 H148 V44 H124 V42 H132 L128 30 H111 L107 42 H114 V44 H98 V42 H104 Z M112 28 H127 L120 7 Z',
  ],
} as const;

export function brandV5Colors(variant: BrandVariant) {
  return {
    ink: variant === 'inverted' ? BRAND_V5.ivory : BRAND_V5.forest,
    selected: variant === 'monochrome' ? BRAND_V5.forest : BRAND_V5.wine,
    selectedOutline: variant === 'inverted' ? BRAND_V5.ivory : 'none',
  };
}

/** Used by the committed asset renderer; React uses exactly the same path data. */
export function brandV5MarkSvg(variant: BrandVariant = 'default', background?: string) {
  const colors = brandV5Colors(variant);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${background ? `<rect width="40" height="40" fill="${background}"/>` : ''}<g transform="translate(0 0)">${BRAND_V5.branchPaths.map(d => `<path d="${d}" fill="none" stroke="${colors.ink}" stroke-width="2.8" stroke-linecap="round"/>`).join('')}<path d="${BRAND_V5.selectedLeaf}" fill="${colors.selected}" stroke="${colors.selectedOutline}" stroke-width=".8" stroke-linejoin="round"/></g></svg>`;
}

export function brandV5LockupSvg(variant: BrandVariant = 'default', compact = false) {
  const colors = brandV5Colors(variant);
  const mark = `${BRAND_V5.branchPaths.map(d => `<path d="${d}" fill="none" stroke="${colors.ink}" stroke-width="2.8" stroke-linecap="round"/>`).join('')}<path d="${BRAND_V5.selectedLeaf}" fill="${colors.selected}" stroke="${colors.selectedOutline}" stroke-width=".8" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${compact ? '84 32' : '192 64'}"><g transform="${compact ? 'translate(0 2) scale(.7)' : 'translate(0 8) scale(.9)'}">${mark}</g><g transform="${compact ? 'translate(34 8.5) scale(.338)' : 'translate(45 4) scale(.93)'}" fill="${colors.ink}" fill-rule="evenodd">${BRAND_V5.wordmarkPaths.map(d => `<path d="${d}"/>`).join('')}</g>${compact ? '' : `<text x="45" y="59" font-family="Arial,sans-serif" font-size="10.5" letter-spacing="1.36" fill="${colors.ink}">ONE DECISION AWAY</text>`}</svg>`;
}
