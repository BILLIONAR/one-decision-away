import React from 'react';
import { ArrowDown } from 'lucide-react';
import { sourcesFor, type LessonVisual } from '../data/courses';
import { getLocale } from '../i18n';

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
    {visual.kind === 'cycle' && <Cycle visual={visual} />}
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
  const source = sourcesFor(getLocale()).find(item => item.id === visual.sourceId);
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

/** A loop: numbered points on a ring (with arrows between them) and the steps listed beneath. */
const Cycle: React.FC<{ visual: Of<'cycle'> }> = ({ visual }) => {
  const n = visual.nodes.length;
  const size = 220, r = 82, c = size / 2;
  const at = (i: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
  };
  return (
    <div className="oda-course-cycle">
      <svg viewBox={`0 0 ${size} ${size}`} className="oda-course-cycle-ring" aria-hidden="true">
        <defs>
          <marker id="cycle-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="currentColor" />
          </marker>
        </defs>
        <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />
        {visual.nodes.map((_, i) => {
          const a1 = -Math.PI / 2 + ((i + 0.22) / n) * Math.PI * 2;
          const a2 = -Math.PI / 2 + ((i + 0.78) / n) * Math.PI * 2;
          const p1 = [c + r * Math.cos(a1), c + r * Math.sin(a1)];
          const p2 = [c + r * Math.cos(a2), c + r * Math.sin(a2)];
          return <path key={`a${i}`} d={`M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${r} ${r} 0 0 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`} fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#cycle-arrow)" className="oda-course-cycle-arc" />;
        })}
        {visual.nodes.map((node, i) => {
          const [x, y] = at(i);
          return (
            <g key={node.label}>
              <circle cx={x} cy={y} r="17" className="oda-course-cycle-dot" />
              <text x={x} y={y + 5} textAnchor="middle" className="oda-course-cycle-num">{i + 1}</text>
            </g>
          );
        })}
        {visual.center && <text x={c} y={c + 5} textAnchor="middle" className="oda-course-cycle-center">{visual.center}</text>}
      </svg>
      <ol className="oda-course-cycle-list">
        {visual.nodes.map((node, i) => (
          <li key={node.label}><span className="oda-course-step-dot" aria-hidden="true">{i + 1}</span><div><p className="oda-course-step-label">{node.label}</p><p className="oda-course-step-text">{node.text}</p></div></li>
        ))}
      </ol>
    </div>
  );
};
