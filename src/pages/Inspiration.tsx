import React, { useMemo, useState } from 'react';
import { ArrowRight, Bookmark, Check, ExternalLink, Search, Shuffle } from 'lucide-react';
import { QUOTE_COLLECTION, getScheduledQuote, quoteSource, quoteText } from '../data/quoteCollection';
import type { SourcedQuote } from '../data/quoteTypes';
import { useLocale } from '../i18n';
import { companionCopy } from '../i18n/companion';
import { useApp } from '../store/useApp';

const SAVED_KEY = 'oda_saved_sourced_quotes_v1';
function readSaved(): string[] {
  try { const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : []; } catch { return []; }
}
const normalise = (text: string) => text.toLocaleLowerCase('tr').normalize('NFD').replace(/\p{M}/gu, '');

export const Inspiration: React.FC = () => {
  const [locale] = useLocale(); const c = companionCopy(locale);
  const { setActiveRoute } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [saved, setSaved] = useState<string[]>(readSaved);
  const [visible, setVisible] = useState(12);
  const [featuredIndex, setFeaturedIndex] = useState(() => QUOTE_COLLECTION.findIndex(q => q.id === getScheduledQuote(0).id));
  const featured = QUOTE_COLLECTION[featuredIndex];
  const matches = useMemo(() => QUOTE_COLLECTION.filter(quote => {
    const text = `${quoteText(quote, locale)} ${quoteSource(quote, locale)}`;
    const courageous = quote.tags?.some(tag => /fear|courage|uncertainty|anxiety/i.test(tag)) || /kork|kayg|cesaret|endiş|belirsiz|fear|courage|anxiety/i.test(text);
    const topics = { quantum: quote.tags?.some(tag => /quantum|energy|matter/.test(tag)), sahaba: quote.tags?.includes('sahaba'), self: quote.tags?.some(tag => /ego|self|existence|identity/.test(tag)) };
    return ((filter in topics && topics[filter as keyof typeof topics]) || filter === 'all' || quote.category === filter || (filter === 'saved' && saved.includes(quote.id)) || (filter === 'courage' && courageous)) && normalise(text).includes(normalise(search.trim()));
  }), [locale, filter, saved, search]);

  function toggleSaved(id: string) {
    setSaved(current => {
      const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
      try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* Reading remains available without storage. */ }
      return next;
    });
  }

  function sourceLine(quote: SourcedQuote) {
    return <div className="space-y-1"><p className="text-[12px] font-semibold">{quoteSource(quote, locale)}</p><p className="text-[11px] text-[var(--fg-muted)]">{quote.kind === 'adaptation' ? c.adaptation : c.translation}</p></div>;
  }

  return <div className="space-y-7">
    <header className="space-y-2"><p className="text-[12px] font-medium tracking-wide text-[var(--accent)]">ODA / {c.inspiration}</p><h1 className="text-[30px] sm:text-[36px] font-semibold leading-[1.12] tracking-tight">{c.subtitle}</h1><p className="text-sm text-[var(--fg-muted)] leading-relaxed">{c.collection}</p></header>
    <section className="rounded-[var(--radius-lg)] bg-[#173e35] text-[#f7f3ea] p-6 sm:p-8 space-y-5">
      <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed">{quoteText(featured, locale)}</blockquote>
      <div className="text-xs opacity-80">{quoteSource(featured, locale)}<span className="block mt-1">{featured.kind === 'adaptation' ? c.adaptation : c.translation}</span></div>
      <div className="flex flex-wrap gap-3 pt-2"><button type="button" onClick={() => setFeaturedIndex(index => (index + 1) % QUOTE_COLLECTION.length)} className="min-h-11 inline-flex items-center gap-2 rounded-full px-4 border border-white/30 text-sm"><Shuffle size={15} />{c.next}</button><button type="button" onClick={() => toggleSaved(featured.id)} aria-label={saved.includes(featured.id) ? c.unsave : c.save} aria-pressed={saved.includes(featured.id)} className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-[#8a3042]">{saved.includes(featured.id) ? <Check size={18} /> : <Bookmark size={18} />}</button><a href={featured.sourceUrl} target="_blank" rel="noopener noreferrer" className="min-h-11 inline-flex items-center gap-1.5 text-xs underline underline-offset-4">{c.source}<ExternalLink size={12} /></a></div>
    </section>
    <button type="button" onClick={() => setActiveRoute('/app/coach')} className="w-full text-left flex gap-4 items-center p-4 rounded-[var(--radius-md)] border border-[var(--border)]"><div className="min-w-0"><p className="font-semibold text-sm">{c.talk}</p><p className="text-xs text-[var(--fg-muted)] mt-1 leading-relaxed">{c.talkHint}</p></div><ArrowRight size={18} className="ml-auto shrink-0 text-[var(--accent)]" /></button>
    <button type="button" onClick={() => setActiveRoute('/app/courses')} className="w-full text-left flex gap-4 items-center p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)]"><span><span className="block font-semibold text-sm">{c.courses}</span><span className="block text-xs text-[var(--fg-muted)] mt-1 leading-relaxed">{c.courseHint}</span></span><ArrowRight size={18} className="ml-auto shrink-0 text-[var(--accent)]" /></button>
    <section className="space-y-4" aria-label={c.inspiration}>
      <div className="relative"><Search size={18} className="absolute left-3 top-3.5 text-[var(--fg-muted)]" /><label htmlFor="quote-search" className="sr-only">{c.search}</label><input id="quote-search" value={search} onChange={event => { setSearch(event.target.value); setVisible(12); }} placeholder={c.search} className="w-full min-h-11 rounded-[var(--radius-sm)] border border-[var(--border)] pl-10 pr-3 bg-[var(--bg)] text-sm" /></div>
      <div className="flex flex-wrap gap-2">{(['all', 'faith', 'philosophy', 'society', 'science', 'quantum', 'sahaba', 'self', 'courage', 'saved'] as const).map(key => <button key={key} type="button" aria-pressed={filter === key} onClick={() => { setFilter(key); setVisible(12); }} className={`min-h-10 px-3 rounded-full text-xs border ${filter === key ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--border)]'}`}>{key === 'saved' ? c.favorites : c[key]}</button>)}</div>
      <p className="text-xs text-[var(--fg-muted)]" role="status">{matches.length} {c.results}</p>
      <div className="divide-y divide-[var(--border)]">{matches.slice(0, visible).map(quote => <article key={quote.id} className="py-5 space-y-3"><blockquote className="text-[16px] leading-relaxed">{quoteText(quote, locale)}</blockquote><div className="flex justify-between items-start gap-3"><div>{sourceLine(quote)}<a href={quote.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs min-h-9 underline underline-offset-4 text-[var(--accent)]">{c.source}<ExternalLink size={12} /></a></div><button type="button" aria-label={saved.includes(quote.id) ? c.unsave : c.save} aria-pressed={saved.includes(quote.id)} onClick={() => toggleSaved(quote.id)} className="h-11 w-11 shrink-0 flex items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--accent)]">{saved.includes(quote.id) ? <Check size={17} /> : <Bookmark size={17} />}</button></div></article>)}</div>
      {matches.length === 0 && <p className="py-8 text-sm text-[var(--fg-muted)]">{c.empty}</p>}
      {visible < matches.length && <button type="button" onClick={() => setVisible(count => count + 12)} className="w-full min-h-11 rounded-full border border-[var(--border)] text-sm">{c.more}</button>}
      <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{c.libraryNote}</p>
    </section>
  </div>;
};
