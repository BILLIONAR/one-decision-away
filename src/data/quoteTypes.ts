/** An independently sourced passage, rendered honestly as a translation or adaptation. */
export interface SourcedQuote {
  id: string;
  text: string;
  tr: string;
  source: string;
  sourceTr: string;
  sourceUrl: string;
  category: 'faith' | 'philosophy' | 'society' | 'science';
  kind: 'translation' | 'adaptation';
  tags?: string[];
  reference?: string;
  sourceExcerpt?: string;
}
