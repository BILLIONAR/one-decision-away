/**
 * Utility for exporting progress visualization charts and achievement cards as PNG images
 * Supports high-DPI (2x retina) export, direct file download, and clipboard copy.
 */

import { toPng } from 'html-to-image';

export interface ExportPngOptions {
  pixelRatio?: number;
  backgroundColor?: string;
  excludeControls?: boolean;
}

/**
 * Captures a DOM node as a PNG base64 data URL
 */
export async function captureElementToPng(
  element: HTMLElement,
  options: ExportPngOptions = {}
): Promise<string> {
  const { pixelRatio = 2, backgroundColor = '#FAF8F5' } = options;

  // Filter function to exclude buttons or temporary UI elements marked with data-no-export
  const filter = (node: HTMLElement) => {
    if (node && node.dataset && node.dataset.noExport === 'true') {
      return false;
    }
    return true;
  };

  try {
    // Attempt standard export with custom fonts embedded
    return await toPng(element, {
      pixelRatio,
      backgroundColor,
      quality: 0.98,
      filter,
      cacheBust: true,
    });
  } catch (err) {
    console.warn('Standard PNG export encountered an error, falling back to skipFonts mode:', err);
    // Fallback if cross-origin font embedding is restricted
    return await toPng(element, {
      pixelRatio,
      backgroundColor,
      quality: 0.98,
      filter,
      skipFonts: true,
    });
  }
}

/**
 * Triggers a browser file download of a PNG data URL
 */
export function downloadPngDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies a PNG data URL to the user's system clipboard for instant sharing (Slack, Twitter, Discord, etc.)
 */
export async function copyPngToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Failed to copy PNG image to clipboard:', err);
    return false;
  }
}
