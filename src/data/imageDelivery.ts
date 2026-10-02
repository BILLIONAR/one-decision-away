import { IMAGE_DELIVERY_ASSETS } from './imageDeliveryAssets';

/** Main's 240px sidebar, 20/32px page insets, 700px grid breakpoint and padded rows. */
export const COURSE_COVER_SIZES = '(min-width: 1280px) 433.2px, (min-width: 768px) calc((100vw - 413.6px) / 2), (min-width: 760px) calc((100vw - 173.6px) / 2), (min-width: 700px) calc((100vw - 170.4px) / 2), (min-width: 640px) calc(100vw - 66px), calc(100vw - 42px)';
/** The course overview uses main's existing 700px lesson column, without card padding. */
export const COURSE_OVERVIEW_COVER_SIZES = '(min-width: 1004px) 700px, (min-width: 768px) calc(100vw - 304px), (min-width: 764px) 700px, (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)';
/** Main's 260px mobile tree and unchanged 1.25:1 desktop growth columns. */
export const TREE_IMAGE_SIZES = '(min-width: 1400px) 593.78px, (min-width: 1024px) calc((100vw - 331.2px) * 0.555556), (min-width: 768px) min(480px, calc(100vw - 304px)), (min-width: 640px) min(480px, calc(100vw - 64px)), (min-width: 480px) min(480px, calc(100vw - 40px)), min(260px, calc(100vw - 40px))';
/** The existing Evidence figure has 16px side padding, a border and a 320px tree cap. */
export const EVIDENCE_TREE_IMAGE_SIZES = '(min-width: 1024px) 320px, (min-width: 768px) min(320px, calc(100vw - 338px)), (min-width: 640px) 320px, min(320px, calc(100vw - 74px))';

export function imageDeliverySources(originalSrc: string, baseUrl: string): string | undefined {
  if (!Object.hasOwn(IMAGE_DELIVERY_ASSETS, originalSrc)) return undefined;
  return IMAGE_DELIVERY_ASSETS[originalSrc as keyof typeof IMAGE_DELIVERY_ASSETS]
    .map(asset => `${baseUrl}${asset.src} ${asset.width}w`).join(', ');
}

/** An unsupported format uses the PNG normally; a failed selected WebP retries that PNG once. */
export function imageFailureKind(currentSrc: string): 'webp' | 'original' {
  try { return new URL(currentSrc, 'https://oda.invalid/').pathname.endsWith('.webp') ? 'webp' : 'original'; }
  catch { return 'original'; }
}
