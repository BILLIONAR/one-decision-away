const en = {
  resumed: 'Your setup was saved on this device. Pick up where you left off.',
  restart: 'Start setup again',
  dreamHelp: 'A direction to work toward. Dream Dollars track your effort inside ODA; they are not money or a way to buy real items.',
  gentleDecision: 'Choose one small action within your control. You can adjust it when your day changes.',
  next: 'Next: your first small action',
  privacy: 'Your space starts on this device. Export a backup to keep your notes safe.',
  help: 'Help and support',
  alreadyKept: 'This decision is already kept. Your evidence is saved.',
};
const tr: typeof en = {
  resumed: 'Kurulumun bu cihazda kaydedildi. Kaldığın yerden devam et.',
  restart: 'Kuruluma yeniden başla',
  dreamHelp: 'Üzerinde çalışacağın bir yön. Hayal Dolarları ODA içindeki emeğini takip eder; para değildir ve gerçek ürün satın almaz.',
  gentleDecision: 'Kontrolünde olan küçük bir eylem seç. Günün değişirse kararını uyarlayabilirsin.',
  next: 'Sırada: ilk küçük adımın',
  privacy: 'Alanı bu cihazda başlar. Notlarını korumak için yedek dışa aktar.',
  help: 'Yardım ve destek',
  alreadyKept: 'Bu karar zaten tamamlandı. Kanıtın kayıtlı.',
};
const es: typeof en = {
  resumed: 'Tu configuración se guardó en este dispositivo. Continúa donde lo dejaste.',
  restart: 'Volver a empezar',
  dreamHelp: 'Una dirección hacia la que avanzar. Los Dream Dollars reflejan tu esfuerzo dentro de ODA; no son dinero ni compran productos reales.',
  gentleDecision: 'Elige una acción pequeña que dependa de ti. Puedes adaptarla si cambia tu día.',
  next: 'Después: tu primera acción pequeña',
  privacy: 'Tu espacio empieza en este dispositivo. Exporta una copia para proteger tus notas.',
  help: 'Ayuda y soporte',
  alreadyKept: 'Esta decisión ya está cumplida. Tu evidencia está guardada.',
};
export const firstRunCopy = (locale: string) => locale === 'tr' ? tr : locale === 'es' ? es : en;
