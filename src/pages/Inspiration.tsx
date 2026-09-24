import React, { useMemo, useState } from 'react';
import { ArrowRight, Bookmark, Check, ExternalLink, Search, Shuffle } from 'lucide-react';
import { QUOTE_COLLECTION, getScheduledQuote, quoteSource, quoteText } from '../data/quoteCollection';
import type { SourcedQuote } from '../data/quoteTypes';
import { useLocale } from '../i18n';
import { companionCopy } from '../i18n/companion';
import { useApp } from '../store/useApp';

const SAVED_KEY = 'oda_saved_sourced_quotes_v1';
function readStoredSaved(): string[] | null {
  try { const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : []; } catch { return null; }
}
const readSaved = () => readStoredSaved() ?? [];
// Locale-neutral folding so "I", "İ" and "ı" all match "i" in every language.
const normalise = (text: string) => text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i');

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
    // Start from storage so a save made in another tab is not overwritten.
    const current = readStoredSaved() ?? saved;
    const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* Reading remains available without storage. */ }
    setSaved(next);
  }

  function sourceLine(quote: SourcedQuote) {
    return <div className="space-y-1"><p className="text-[12px] font-semibold">{quoteSource(quote, locale)}</p><p className="text-[11px] text-[var(--fg-muted)]">{quote.kind === 'adaptation' ? c.adaptation : c.translation}</p></div>;
  }

  return <div className="space-y-8">
    <header className="space-y-3 max-w-[680px]"><p className="oda-kicker text-[var(--accent)]">ODA / {c.inspiration}</p><h1 className="oda-display text-[36px] sm:text-[48px] leading-[1.12] tracking-tight">{c.subtitle}</h1><p className="text-sm text-[var(--fg-muted)] leading-relaxed">{c.collection}</p></header>
    <section className="relative rounded-[var(--radius-lg)] bg-[var(--forest)] text-[var(--on-forest)] p-6 sm:p-10 space-y-5">
      <span aria-hidden="true" className="block text-5xl h-8 font-serif text-[#D7ABA6]">“</span>
      <blockquote className="oda-display text-[25px] sm:text-[32px] leading-[1.4] max-w-[52ch]">{quoteText(featured, locale)}</blockquote>
      <div className="text-xs opacity-80">{quoteSource(featured, locale)}<span className="block mt-1">{featured.kind === 'adaptation' ? c.adaptation : c.translation}</span></div>
      <div className="flex flex-wrap gap-3 pt-2"><button type="button" onClick={() => setFeaturedIndex(index => (index + 1) % QUOTE_COLLECTION.length)} className="min-h-11 inline-flex items-center gap-2 rounded-full px-4 border border-white/30 text-sm"><Shuffle size={15} />{c.next}</button><button type="button" onClick={() => toggleSaved(featured.id)} aria-label={saved.includes(featured.id) ? c.unsave : c.save} aria-pressed={saved.includes(featured.id)} className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-[#843D4B]">{saved.includes(featured.id) ? <Check size={18} /> : <Bookmark size={18} />}</button><a href={featured.sourceUrl} target="_blank" rel="noopener noreferrer" className="min-h-11 inline-flex items-center gap-1.5 text-xs underline underline-offset-4">{c.source}<ExternalLink size={12} /></a></div>
    </section>
    <div className="flex flex-wrap items-center gap-x-7 gap-y-1 border-b border-[var(--border)] pb-5">
      <button type="button" onClick={() => setActiveRoute('/app/coach')} className="inline-flex gap-2 items-center min-h-11 text-sm font-medium text-[var(--accent)]">{c.talk}<ArrowRight size={16} /></button>
      <button type="button" onClick={() => setActiveRoute('/app/courses')} className="inline-flex gap-2 items-center min-h-11 text-sm font-medium text-[var(--brand-burgundy)]">{c.courses}<ArrowRight size={16} /></button>
    </div>
    <section className="space-y-4" aria-label={c.inspiration}>
      <div className="relative"><Search size={18} className="absolute left-3 top-3.5 text-[var(--fg-muted)]" /><label htmlFor="quote-search" className="sr-only">{c.search}</label><input id="quote-search" value={search} onChange={event => { setSearch(event.target.value); setVisible(12); }} placeholder={c.search} className="w-full min-h-12 rounded-[var(--radius-sm)] border border-[var(--border-strong)] pl-10 pr-3 bg-[var(--bg-elevated)] text-sm" /></div>
      <div className="flex flex-wrap gap-2">{(['all', 'faith', 'philosophy', 'society', 'science', 'quantum', 'sahaba', 'self', 'courage', 'saved'] as const).map(key => <button key={key} type="button" aria-pressed={filter === key} onClick={() => { setFilter(key); setVisible(12); }} className={`min-h-11 px-3.5 rounded-full text-xs border ${filter === key ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--on-accent)]' : 'border-[var(--border)]'}`}>{key === 'saved' ? c.favorites : c[key]}</button>)}</div>
      <p className="text-xs text-[var(--fg-muted)]" role="status">{matches.length} {c.results}</p>
      <div className="grid md:grid-cols-2 gap-x-10">{matches.slice(0, visible).map(quote => <article key={quote.id} className="py-6 space-y-4 border-t border-[var(--border)]"><blockquote className="text-[17px] leading-[1.7]">{quoteText(quote, locale)}</blockquote><div className="flex justify-between items-start gap-3"><div>{sourceLine(quote)}<a href={quote.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs min-h-9 underline underline-offset-4 text-[var(--accent)]">{c.source}<ExternalLink size={12} /></a></div><button type="button" aria-label={saved.includes(quote.id) ? c.unsave : c.save} aria-pressed={saved.includes(quote.id)} onClick={() => toggleSaved(quote.id)} className="h-11 w-11 shrink-0 flex items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--accent)]">{saved.includes(quote.id) ? <Check size={17} /> : <Bookmark size={17} />}</button></div></article>)}</div>
      {matches.length === 0 && <p className="py-8 text-sm text-[var(--fg-muted)]">{c.empty}</p>}
      {visible < matches.length && <button type="button" onClick={() => setVisible(count => count + 12)} className="w-full min-h-11 rounded-full border border-[var(--border)] text-sm">{c.more}</button>}
      <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{c.libraryNote}</p>
    </section>
  </div>;
};
