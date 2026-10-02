const en = {
  preview: 'Preview voice',
  stopPreview: 'Stop voice preview',
  recorded: 'Recorded English',
  device: 'English device voice',
  loading: 'Loading English recording…',
  unavailable: 'English voice unavailable. Follow the captions.',
  fallback: 'If a recording is unavailable, an installed English device voice may be used.',
};

const tr: typeof en = {
  preview: 'Sesi önizle',
  stopPreview: 'Ses önizlemesini durdur',
  recorded: 'Kaydedilmiş İngilizce ses',
  device: 'Cihazın İngilizce sesi',
  loading: 'İngilizce kayıt yükleniyor…',
  unavailable: 'İngilizce ses kullanılamıyor. Altyazıları takip et.',
  fallback: 'Kayıt kullanılamazsa cihazdaki bir İngilizce ses kullanılabilir.',
};

const es: typeof en = {
  preview: 'Escuchar voz de muestra',
  stopPreview: 'Detener voz de muestra',
  recorded: 'Grabación en inglés',
  device: 'Voz del dispositivo en inglés',
  loading: 'Cargando grabación en inglés…',
  unavailable: 'Voz en inglés no disponible. Sigue los subtítulos.',
  fallback: 'Si la grabación no está disponible, se puede usar una voz en inglés instalada.',
};

export const guidanceCopy = (locale: string): typeof en => locale === 'tr' ? tr : locale === 'es' ? es : en;
