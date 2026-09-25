import React, { useState } from 'react';
import type { CoursePhoto as Photo, LessonTechnique } from '../data/courses';
import { CourseArtwork } from './CourseArtwork';

const unsplash = (id: string, width: number, height: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=70`;

/**
 * A real photograph for a course or lesson (Unsplash, free licence). Lazy by
 * default; if it cannot load (offline, blocked) the course illustration takes
 * its place in the course list (the lesson hero simply steps aside) so the
 * layout never shows a broken image.
 */
export const CoursePhoto: React.FC<{
  photo?: Photo; courseId: string; variant: 'thumb' | 'hero'; lang?: string; eager?: boolean;
}> = ({ photo, courseId, variant, lang, eager }) => {
  const [failed, setFailed] = useState(false);
  // A lesson reads fine without its photo; only the list keeps an illustration in its place.
  if ((!photo || failed) && variant === 'hero') return null;
  if (!photo || failed) return <span className={`oda-course-photo oda-course-photo-${variant} oda-course-photo-fallback`}><CourseArtwork courseId={courseId} /></span>;
  const [w, h] = variant === 'thumb' ? [264, 264] : [900, 506];
  return (
    <span className={`oda-course-photo oda-course-photo-${variant}`}>
      <img
        src={unsplash(photo.id, w, h)}
        srcSet={variant === 'thumb'
          ? `${unsplash(photo.id, 132, 132)} 132w, ${unsplash(photo.id, 264, 264)} 264w`
          : `${unsplash(photo.id, 600, 338)} 600w, ${unsplash(photo.id, 900, 506)} 900w, ${unsplash(photo.id, 1400, 788)} 1400w`}
        sizes={variant === 'thumb' ? '132px' : '(max-width: 760px) 100vw, 720px'}
        alt={photo.alt}
        lang={lang}
        width={w}
        height={h}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </span>
  );
};

/** A named technique, retold in ODA's words, with an honest evidence note. */
export const TechniqueCard: React.FC<{
  technique: LessonTechnique; lang?: string; labels: { technique: string; evidence: string };
}> = ({ technique, lang, labels }) => (
  <aside className="oda-course-technique" aria-label={`${labels.technique}: ${technique.name}`}>
    <p className="oda-course-technique-kicker">{labels.technique}</p>
    <h3 lang={lang} className="oda-display oda-course-technique-name">{technique.name}</h3>
    <p lang={lang} className="oda-course-technique-origin">{technique.origin}</p>
    <ol lang={lang} className="oda-course-technique-steps">
      {technique.steps.map((step, i) => <li key={i}><span aria-hidden="true">{i + 1}</span><p>{step}</p></li>)}
    </ol>
    <div className="oda-course-technique-evidence">
      <p className="oda-course-technique-evidence-label">{labels.evidence}</p>
      <p lang={lang}>{technique.evidence}</p>
    </div>
  </aside>
);
