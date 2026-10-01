import { IMAGE_DELIVERY_ASSETS } from './imageDeliveryAssets';

/** Slot estimates follow AppShell padding/sidebar and the existing two-column catalogue. */
export const COURSE_COVER_SIZES = '(min-width: 1280px) 460px, (min-width: 1024px) calc((100vw - 362px) / 2), (min-width: 768px) calc((100vw - 346px) / 2), (min-width: 760px) calc((100vw - 90px) / 2), (min-width: 640px) calc(100vw - 66px), calc(100vw - 42px)';
/** Keep the mobile tree's 240px canvas and the existing desktop growth columns. */
export const TREE_IMAGE_SIZES = '(min-width: 1400px) 576px, (min-width: 1024px) calc((100vw - 363px) * 0.555556), (min-width: 768px) min(480px, calc(100vw - 320px)), (min-width: 640px) min(480px, calc(100vw - 64px)), (min-width: 480px) min(480px, calc(100vw - 40px)), 240px';

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
