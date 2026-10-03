import React, { useEffect, useState } from 'react';
import { ORIGINAL_SCENE_ASSETS, type OriginalSceneId } from '../data/originalSceneAssets';

const OWNED_FALLBACK = 'assets/oda/delivery/course-covers/oda-growth-values-640.webp';

/** Decorative original artwork with responsive delivery and bounded local fallbacks. */
export function OriginalSceneImage({ asset, sizes, eager = false, fallback, className }: {
  asset: OriginalSceneId;
  sizes: string;
  eager?: boolean;
  fallback?: string;
  className?: string;
}) {
  const image = ORIGINAL_SCENE_ASSETS[asset];
  const [modernFailed, setModernFailed] = useState(false);
  const [failedPaths, setFailedPaths] = useState<readonly string[]>([]);
  useEffect(() => { setModernFailed(false); setFailedPaths([]); }, [asset]);
  const candidates = [...new Set([image.src, fallback, OWNED_FALLBACK].filter((path): path is string => Boolean(path)))];
  const source = candidates.find(path => !failedPaths.includes(path));
  if (!source) return null;
  const original = source === image.src;
  return <picture style={{ display: 'contents' }} data-original-scene={asset} data-image-mode={original ? modernFailed ? 'png' : 'webp' : 'fallback'}>
    {original && !modernFailed && <source type="image/webp" srcSet={image.sources.map(item => `${import.meta.env.BASE_URL}${item.src} ${item.width}w`).join(', ')} sizes={sizes} />}
    <img
      src={`${import.meta.env.BASE_URL}${source}`}
      alt=""
      width={image.width}
      height={image.height}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={event => {
        if (original && !modernFailed && event.currentTarget.currentSrc.endsWith('.webp')) setModernFailed(true);
        else setFailedPaths(paths => paths.includes(source) ? paths : [...paths, source]);
      }}
    />
  </picture>;
}
