import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Pencil, Check } from 'lucide-react';
import { useT } from '../i18n';

const textareaCls =
  'w-full p-3 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-[var(--fg)] resize-y min-h-[88px] leading-relaxed';
const inputCls =
  'w-full h-11 px-3 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-[var(--fg)]';

const LinesField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}> = ({ id, label, value, onChange, hint }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm text-[var(--fg-muted)]">
      {label}
    </label>
    <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={textareaCls} />
    {hint && <p className="text-xs text-[var(--fg-subtle)]">{hint}</p>}
  </div>
);

const ListBlock: React.FC<{ label: string; items: string[]; t: (s: string) => string }> = ({ label, items, t }) => (
  <div>
    <div className="text-xs text-[var(--fg-muted)] mb-1.5">{label}</div>
    {items.length > 0 ? (
      <ul className="space-y-1.5 text-sm text-[var(--fg)]">
        {items.map((s, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-[var(--fg-subtle)] mt-2 shrink-0" />
            <span>{t(s)}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-[var(--fg-subtle)]">{t('Nothing yet')}</p>
    )}
  </div>
);

export const FutureSelf: React.FC = () => {
  const { data, saveFutureSelf } = useApp();
  const t = useT();

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(data?.futureSelf?.title || t('The Finisher'));
  const [identityStatement, setIdentityStatement] = useState(
    data?.futureSelf?.identityStatement ||
      t('I am someone who finishes important work, protects my attention, and acts before I feel ready.')
  );

  const [coreValuesText, setCoreValuesText] = useState((data?.futureSelf?.coreValues || []).join('\n'));
  const [standardsText, setStandardsText] = useState((data?.futureSelf?.dailyStandards || []).join('\n'));
  const [habitsText, setHabitsText] = useState((data?.futureSelf?.habits || []).join('\n'));
  const [skillsText, setSkillsText] = useState((data?.futureSelf?.skills || []).join('\n'));
  const [boundariesText, setBoundariesText] = useState((data?.futureSelf?.boundaries || []).join('\n'));
  const [noLongerDoesText, setNoLongerDoesText] = useState((data?.futureSelf?.noLongerDoes || []).join('\n'));

  const [oldBehaviorsText, setOldBehaviorsText] = useState((data?.futureSelf?.oldSelfBehaviors || []).join('\n'));
  const [oldExcusesText, setOldExcusesText] = useState((data?.futureSelf?.oldSelfExcuses || []).join('\n'));
  const [oldPatternsText, setOldPatternsText] = useState((data?.futureSelf?.oldSelfPatterns || []).join('\n'));
  const [oldLabelsText, setOldLabelsText] = useState((data?.futureSelf?.oldSelfLabels || []).join('\n'));

  if (!data) return null;

  const parseLines = (text: string) =>
    text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

  const handleSave = async () => {
    await saveFutureSelf({
      title: title.trim() || t('The Finisher'),
      identityStatement: identityStatement.trim(),
      coreValues: parseLines(coreValuesText),
      dailyStandards: parseLines(standardsText),
      habits: parseLines(habitsText),
      skills: parseLines(skillsText),
      boundaries: parseLines(boundariesText),
      noLongerDoes: parseLines(noLongerDoesText),
      oldSelfBehaviors: parseLines(oldBehaviorsText),
      oldSelfExcuses: parseLines(oldExcusesText),
      oldSelfPatterns: parseLines(oldPatternsText),
      oldSelfLabels: parseLines(oldLabelsText),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Future self')}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">{t('Who you are becoming, and what you leave behind.')}</p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="h-11 px-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] text-sm font-medium shrink-0"
          >
            <Pencil className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t('Edit')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="h-11 px-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-sm font-semibold shrink-0"
          >
            <Check className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t('Save')}
          </button>
        )}
      </div>

      <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-3">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="role-title" className="block text-sm text-[var(--fg-muted)]">
                {t('Who you are')}
              </label>
              <input id="role-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
              <p className="text-xs text-[var(--fg-subtle)]">{t('e.g. The Finisher, The Architect')}</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="identity-stmt" className="block text-sm text-[var(--fg-muted)]">
                {t('Identity statement')}
              </label>
              <textarea
                id="identity-stmt"
                value={identityStatement}
                onChange={(e) => setIdentityStatement(e.target.value)}
                rows={3}
                className={textareaCls}
              />
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--fg)]">{t(data.futureSelf.title)}</h2>
            <p className="text-[15px] text-[var(--fg)] leading-relaxed">{t(data.futureSelf.identityStatement)}</p>
          </>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Standards')}</h2>
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
          {isEditing ? (
            <>
              <LinesField id="core-values" label={t('Values, one per line')} value={coreValuesText} onChange={setCoreValuesText} />
              <LinesField id="daily-standards" label={t('Daily standards, one per line')} value={standardsText} onChange={setStandardsText} />
              <LinesField id="habits" label={t('Habits, one per line')} value={habitsText} onChange={setHabitsText} />
              <LinesField id="skills" label={t('Skills, one per line')} value={skillsText} onChange={setSkillsText} />
              <LinesField id="boundaries" label={t('Boundaries, one per line')} value={boundariesText} onChange={setBoundariesText} />
              <LinesField id="no-longer" label={t('No longer does, one per line')} value={noLongerDoesText} onChange={setNoLongerDoesText} />
            </>
          ) : (
            <>
              <ListBlock label={t('Values')} items={data.futureSelf.coreValues} t={t} />
              <ListBlock label={t('Daily standards')} items={data.futureSelf.dailyStandards} t={t} />
              <ListBlock label={t('Habits')} items={data.futureSelf.habits} t={t} />
              <ListBlock label={t('Boundaries')} items={data.futureSelf.boundaries} t={t} />
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Old self')}</h2>
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
          {isEditing ? (
            <>
              <LinesField id="old-behaviors" label={t('Behaviours to leave behind, one per line')} value={oldBehaviorsText} onChange={setOldBehaviorsText} />
              <LinesField id="old-excuses" label={t('Old excuses, one per line')} value={oldExcusesText} onChange={setOldExcusesText} />
              <LinesField id="old-patterns" label={t('Triggers, one per line')} value={oldPatternsText} onChange={setOldPatternsText} />
              <LinesField id="old-labels" label={t('Labels to drop, one per line')} value={oldLabelsText} onChange={setOldLabelsText} />
            </>
          ) : (
            <>
              <ListBlock label={t('Behaviours')} items={data.futureSelf.oldSelfBehaviors} t={t} />
              <ListBlock label={t('Excuses')} items={data.futureSelf.oldSelfExcuses} t={t} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
