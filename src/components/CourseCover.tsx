import React, { useState } from 'react';
import { courseCoverFor } from '../data/coursePresentation';

/** Original editorial still life. The neighboring course title supplies its context. */
export function CourseCover({ courseId, eager = false, className = '' }: { courseId: string; eager?: boolean; className?: string }) {
  const cover = courseCoverFor(courseId);
  const [failedSource, setFailedSource] = useState('');
  return <span className={`oda-course-cover oda-course-photo ${className}`} data-image-failed={failedSource === cover.src} aria-hidden="true">
    {failedSource !== cover.src && <img
      src={`${import.meta.env.BASE_URL}${cover.src}`}
      alt=""
      width={cover.width}
      height={cover.height}
      style={{ objectPosition: cover.objectPosition }}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailedSource(cover.src)}
    />}
  </span>;
}
