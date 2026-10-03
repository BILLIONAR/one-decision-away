import React, { useState } from 'react';
import { courseCoverFor } from '../data/coursePresentation';
import { COURSE_COVER_SIZES, COURSE_OVERVIEW_COVER_SIZES, imageDeliverySources, imageFailureKind } from '../data/imageDelivery';

/** Original editorial still life. The neighboring course title supplies its context. */
export function CourseCover({ courseId, eager = false, className = '', layout = 'catalogue' }: { courseId: string; eager?: boolean; className?: string; layout?: 'catalogue' | 'overview' }) {
  const cover = courseCoverFor(courseId);
  const [failedModernSource, setFailedModernSource] = useState('');
  const [failedSource, setFailedSource] = useState('');
  const modernSources = imageDeliverySources(cover.src, import.meta.env.BASE_URL);
  return <span className={`oda-course-cover oda-course-photo ${className}`} data-image-failed={failedSource === cover.src} aria-hidden="true">
    {failedSource !== cover.src && <picture style={{ display: 'contents' }}>
      {failedModernSource !== cover.src && modernSources && <source type="image/webp" srcSet={modernSources} sizes={layout === 'overview' ? COURSE_OVERVIEW_COVER_SIZES : COURSE_COVER_SIZES} />}
      <img
      src={`${import.meta.env.BASE_URL}${cover.src}`}
      alt=""
      width={cover.width}
      height={cover.height}
      style={{ objectPosition: cover.objectPosition }}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={event => {
        if (imageFailureKind(event.currentTarget.currentSrc) === 'webp' && failedModernSource !== cover.src) setFailedModernSource(cover.src);
        else setFailedSource(cover.src);
      }}
    /></picture>}
  </span>;
}
