import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { EvidenceTree } from './EvidenceTree';
import { treePresentation } from '../../data/treePresentation';
import { growthCopy } from '../../i18n/growth';
import { formatDate, useLocale } from '../../i18n';
import type { EvidenceSummary } from '../../services/momentum';

export const GrowthTreePanel: React.FC<{ count: number; onEvidence: () => void }> = ({ count, onEvidence }) => {
  const [locale] = useLocale();
  const copy = growthCopy(locale);
  const tree = treePresentation(count);
  return <figure className="oda-growth-panel">
    <div className="oda-growth-heading"><h2>{copy.growth}</h2><p>{copy.fromDecisions}</p></div>
    <EvidenceTree count={count} label={copy.treeLabel(tree.total, tree.leaves, tree.blossoms)} />
    <figcaption className="oda-growth-caption">
      <button type="button" onClick={onEvidence} className="oda-growth-count">{copy.kept(tree.total)}<ArrowRight size={15} aria-hidden="true" /></button>
      <p className="oda-growth-ledger">{tree.total === 0 ? copy.start : copy.ledger(tree.leaves, tree.blossoms)}</p>
    </figcaption>
  </figure>;
};

export const GrowthWeek: React.FC<{ summary: EvidenceSummary; onEvidence: () => void }> = ({ summary, onEvidence }) => {
  const [locale] = useLocale();
  const copy = growthCopy(locale);
  return <section className="oda-growth-week" data-kept-days={summary.last7} aria-labelledby="growth-week-title">
    <div><h2 id="growth-week-title" className="oda-display">{copy.week}</h2><p>{copy.days(summary.last7)}</p></div>
    <ol className="oda-growth-days">{summary.weekDays.map(day => <li key={day.dayKey}>
      <span className="oda-growth-day-name">{formatDate(`${day.dayKey}T12:00:00`, { weekday: 'short' })}</span>
      <span role="img" className="oda-growth-day" data-kept={day.kept} aria-label={`${formatDate(`${day.dayKey}T12:00:00`, { weekday: 'long', day: 'numeric', month: 'long' })}: ${day.kept ? copy.dayKept : copy.dayOpen}`}>
        {day.kept && <Check size={17} strokeWidth={2} aria-hidden="true" />}
      </span>
    </li>)}</ol>
    <button type="button" onClick={onEvidence} className="oda-growth-evidence-link">{copy.evidence}<ArrowRight size={17} aria-hidden="true" /></button>
  </section>;
};
