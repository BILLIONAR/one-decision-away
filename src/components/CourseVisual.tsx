import React from 'react';
import { ArrowDown } from 'lucide-react';
import { COURSE_SOURCES, type LessonVisual } from '../data/courses';

/**
 * One visual per lesson: a table, a two-column comparison, a step flow or a
 * small bar chart of verified numbers from a cited source. Content language is
 * set by the caller (course content is Turkish by design).
 */
export const CourseVisual: React.FC<{ visual: LessonVisual; lang?: string; sourceLabel: string }> = ({ visual, lang, sourceLabel }) => (
  <figure lang={lang} className="oda-course-visual">
    <figcaption className="oda-course-visual-title">{visual.title}</figcaption>
    {visual.kind === 'table' && <Table visual={visual} />}
    {visual.kind === 'compare' && <Compare visual={visual} />}
    {visual.kind === 'steps' && <Steps visual={visual} />}
    {visual.kind === 'bars' && <Bars visual={visual} sourceLabel={sourceLabel} />}
    {visual.kind !== 'bars' && visual.note && <p className="oda-course-visual-note">{visual.note}</p>}
  </figure>
);

type Of<K extends LessonVisual['kind']> = Extract<LessonVisual, { kind: K }>;

const Table: React.FC<{ visual: Of<'table'> }> = ({ visual }) => (
  <div className="oda-course-table-wrap" tabIndex={0} aria-label={visual.title}>
    <table className="oda-course-table">
      <thead><tr>{visual.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{visual.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>
);

const Compare: React.FC<{ visual: Of<'compare'> }> = ({ visual }) => (
  <div className="oda-course-compare">
    {[{ side: visual.left, tone: 'muted' }, { side: visual.right, tone: 'accent' }].map(({ side, tone }) => (
      <div key={side.label} className="oda-course-compare-col" data-tone={tone}>
        <p className="oda-course-compare-label">{side.label}</p>
        <ul>{side.items.map(item => <li key={item}>{item}</li>)}</ul>
      </div>
    ))}
  </div>
);

const Steps: React.FC<{ visual: Of<'steps'> }> = ({ visual }) => (
  <ol className="oda-course-steps-flow">
    {visual.steps.map((step, i) => (
      <li key={step.label}>
        <span className="oda-course-step-dot" aria-hidden="true">{i + 1}</span>
        <div>
          <p className="oda-course-step-label">{step.label}</p>
          <p className="oda-course-step-text">{step.text}</p>
          {i < visual.steps.length - 1 && <ArrowDown size={14} className="oda-course-step-arrow" aria-hidden="true" />}
        </div>
      </li>
    ))}
  </ol>
);

const Bars: React.FC<{ visual: Of<'bars'>; sourceLabel: string }> = ({ visual, sourceLabel }) => {
  const max = Math.max(...visual.bars.map(bar => Math.abs(bar.value)), 0.0001);
  const source = COURSE_SOURCES.find(item => item.id === visual.sourceId);
  return (
    <>
      <ul className="oda-course-bars">
        {visual.bars.map(bar => (
          <li key={bar.label}>
            <span className="oda-course-bar-label">{bar.label}</span>
            <span className="oda-course-bar-track" aria-hidden="true"><span className="oda-course-bar-fill" style={{ width: `${Math.max(4, (Math.abs(bar.value) / max) * 100)}%` }} /></span>
            <span className="oda-course-bar-value">{bar.display}</span>
          </li>
        ))}
      </ul>
      <p className="oda-course-visual-note">{visual.note}</p>
      {source && <p className="oda-course-visual-source">{sourceLabel}: {source.title}</p>}
    </>
  );
};
