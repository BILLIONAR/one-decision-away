import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUpRight, Quote, Search } from 'lucide-react';
import { useLocale } from '../../i18n';
import { notebookHybridCopy } from '../../i18n/notebookHybrid';
import { QUOTE_COLLECTION, quoteSource, quoteText } from '../../data/quoteCollection';
import type { OriginalSceneId } from '../../data/originalSceneAssets';
import { filterSourcedQuotes, quoteSourceHref, type QuoteFilterCategory } from '../../services/notebookHybrid';
import { OriginalSceneImage } from '../OriginalSceneImage';

const PAGE_SIZE = 12;
const CATEGORY_ART: Record<Exclude<QuoteFilterCategory, 'all'>, OriginalSceneId> = {
  faith: 'dunes', philosophy: 'today-scene', society: 'palms', science: 'foam',
};

/** The saved catalogue is the sole text/source authority; imagery is decorative. */
export const QuotesBrowser: React.FC = () => {
  const [locale] = useLocale();
  const c = notebookHybridCopy(locale);
  const [category, setCategory] = useState<QuoteFilterCategory>('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const matches = useMemo(() => filterSourcedQuotes(QUOTE_COLLECTION, category, query, locale), [category, query, locale]);
  const visible = matches.slice(0, visibleCount);
  const categories: QuoteFilterCategory[] = ['all', 'faith', 'philosophy', 'society', 'science'];
  const passageLanguage = locale === 'tr' ? 'tr' : 'en';
  return <div className="oda-quotes-browser">
    <header className="oda-quotes-heading">
      <div><h2>{c.quotes}</h2><p>{c.collection(QUOTE_COLLECTION.length)}</p></div>
      <Quote size={23} strokeWidth={1.5} aria-hidden="true" />
    </header>
    <div className="oda-quotes-categories" role="group" aria-label={c.categories}>
      {categories.map(id => <button type="button" key={id} aria-pressed={category === id} onClick={() => { setCategory(id); setVisibleCount(PAGE_SIZE); }}>{c[id]}</button>)}
    </div>
    <label className="oda-quotes-search"><Search size={18} aria-hidden="true" /><span className="sr-only">{c.searchQuotes}</span><input type="search" value={query} onChange={event => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder={c.searchQuotes} /></label>
    {locale === 'es' && <p className="oda-quotes-language">{c.englishQuotes}</p>}
    <p className="oda-quotes-count" role="status">{c.shown(visible.length, matches.length)}</p>
    {matches.length === 0 ? <div className="oda-quotes-empty"><p>{c.noQuotes}</p><button type="button" onClick={() => { setQuery(''); setCategory('all'); setVisibleCount(PAGE_SIZE); }}>{c.clearSearch}</button></div> : <div className="oda-quotes-grid">
      {visible.map(quote => {
        const href = quoteSourceHref(quote.sourceUrl);
        return <article key={quote.id} className="oda-quote-card" data-quote-id={quote.id} data-quote-category={quote.category}>
          <Quote className="oda-quote-mark" size={20} aria-hidden="true" />
          <blockquote lang={passageLanguage}>{quoteText(quote, locale)}</blockquote>
          <div className="oda-quote-citation">
            <p lang={passageLanguage}>{quoteSource(quote, locale)}</p>
            {quote.reference && <p lang="en" className="oda-quote-reference">{quote.reference}</p>}
            <span className="oda-quote-kind">{quote.kind === 'adaptation' ? c.adaptation : c.translation}</span>
            {href && <a href={href} target="_blank" rel="noopener noreferrer">{c.source}<ArrowUpRight size={14} aria-hidden="true" /></a>}
          </div>
          <div className="oda-quote-illustration" aria-hidden="true"><OriginalSceneImage asset={CATEGORY_ART[quote.category]} sizes="120px" /></div>
        </article>;
      })}
    </div>}
    {visible.length < matches.length && <button type="button" className="oda-quotes-more" onClick={() => setVisibleCount(count => count + PAGE_SIZE)}>{c.moreQuotes}<ArrowDown size={16} aria-hidden="true" /></button>}
    <p className="oda-quotes-art-note">{c.decorativeArt}</p>
  </div>;
};
