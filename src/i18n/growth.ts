const en = {
  headline: 'Your next decision matters.', growth: 'Your growth', fromDecisions: 'Built from the promises you kept.',
  start: 'Your first kept decision is the beginning.', week: 'Last 7 days', evidence: 'View your decisions',
  dayKept: 'A decision kept', dayOpen: 'No kept decision',
  kept: (n: number) => `${n} kept ${n === 1 ? 'decision' : 'decisions'}`,
  ledger: (leaves: number, blossoms: number) => `${leaves} ${leaves === 1 ? 'leaf' : 'leaves'} · ${blossoms} ${blossoms === 1 ? 'blossom' : 'blossoms'}`,
  days: (n: number) => `${n} of 7 days with a kept decision`,
  treeLabel: (total: number, leaves: number, blossoms: number) => `Your growth: ${total} kept decisions, ${leaves} leaves, ${blossoms} blossoms`,
  explore: 'Explore your tree in 3D', prototype: '3D preview', static: 'Back to your tree',
  fallback: 'The illustrated tree is available here.',
};
const tr: typeof en = {
  headline: 'Bir sonraki kararın önemli.', growth: 'Gelişimin', fromDecisions: 'Tuttuğun sözlerle büyüyor.',
  start: 'Tuttuğun ilk söz bir başlangıç.', week: 'Son 7 gün', evidence: 'Kararlarını gör',
  dayKept: 'Tutulan bir söz var', dayOpen: 'Tutulan bir söz yok',
  kept: n => `${n} tutulmuş karar`, ledger: (leaves, blossoms) => `${leaves} yaprak · ${blossoms} çiçek`,
  days: n => `7 günün ${n} gününde tutulan bir söz`,
  treeLabel: (total, leaves, blossoms) => `Gelişimin: ${total} tutulmuş karar, ${leaves} yaprak, ${blossoms} çiçek`,
  explore: 'Ağacını 3D olarak keşfet', prototype: '3D önizleme', static: 'Ağacına geri dön', fallback: 'Ağacının görseli burada kullanılabilir.',
};
const es: typeof en = {
  headline: 'Tu próxima decisión importa.', growth: 'Tu crecimiento', fromDecisions: 'Crece con las promesas que cumples.',
  start: 'Tu primera decisión cumplida es el comienzo.', week: 'Últimos 7 días', evidence: 'Ver tus decisiones',
  dayKept: 'Una decisión cumplida', dayOpen: 'Sin decisión cumplida',
  kept: n => `${n} ${n === 1 ? 'decisión cumplida' : 'decisiones cumplidas'}`,
  ledger: (leaves, blossoms) => `${leaves} ${leaves === 1 ? 'hoja' : 'hojas'} · ${blossoms} ${blossoms === 1 ? 'flor' : 'flores'}`,
  days: n => `${n} de 7 días con una decisión cumplida`,
  treeLabel: (total, leaves, blossoms) => `Tu crecimiento: ${total} decisiones cumplidas, ${leaves} hojas, ${blossoms} flores`,
  explore: 'Explora tu árbol en 3D', prototype: 'Vista previa 3D', static: 'Volver a tu árbol', fallback: 'La imagen de tu árbol está disponible aquí.',
};
export const growthCopy = (locale: string) => locale === 'tr' ? tr : locale === 'es' ? es : en;
