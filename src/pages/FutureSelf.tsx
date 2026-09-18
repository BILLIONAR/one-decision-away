import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { PageHeader, Button, Card, Field, Input, Textarea, Badge } from '../components/ui';
import { UserCheck, Edit2, Check, ShieldAlert, Sparkles, Plus, X } from 'lucide-react';

export const FutureSelf: React.FC = () => {
  const { data, saveFutureSelf } = useApp();

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(data?.futureSelf?.title || 'The Finisher');
  const [identityStatement, setIdentityStatement] = useState(
    data?.futureSelf?.identityStatement ||
      'I am someone who finishes important work, protects my attention, and acts before I feel ready.'
  );

  // Multi-line list string states for editing
  const [coreValuesText, setCoreValuesText] = useState(
    (data?.futureSelf?.coreValues || []).join('\n')
  );
  const [standardsText, setStandardsText] = useState(
    (data?.futureSelf?.dailyStandards || []).join('\n')
  );
  const [habitsText, setHabitsText] = useState(
    (data?.futureSelf?.habits || []).join('\n')
  );
  const [skillsText, setSkillsText] = useState(
    (data?.futureSelf?.skills || []).join('\n')
  );
  const [boundariesText, setBoundariesText] = useState(
    (data?.futureSelf?.boundaries || []).join('\n')
  );
  const [noLongerDoesText, setNoLongerDoesText] = useState(
    (data?.futureSelf?.noLongerDoes || []).join('\n')
  );

  // Old Self
  const [oldBehaviorsText, setOldBehaviorsText] = useState(
    (data?.futureSelf?.oldSelfBehaviors || []).join('\n')
  );
  const [oldExcusesText, setOldExcusesText] = useState(
    (data?.futureSelf?.oldSelfExcuses || []).join('\n')
  );
  const [oldPatternsText, setOldPatternsText] = useState(
    (data?.futureSelf?.oldSelfPatterns || []).join('\n')
  );
  const [oldLabelsText, setOldLabelsText] = useState(
    (data?.futureSelf?.oldSelfLabels || []).join('\n')
  );

  if (!data) return null;

  const parseLines = (text: string) =>
    text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

  const handleSave = async () => {
    await saveFutureSelf({
      title: title.trim() || 'The Finisher',
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
      <PageHeader
        title="Future Self & Old Self"
        subtitle="Identity shift precedes behavioural change. Define who you are becoming and what you leave behind."
        action={
          !isEditing ? (
            <Button variant="outline" size="sm" icon={Edit2} onClick={() => setIsEditing(true)}>
              Edit Identity
            </Button>
          ) : (
            <Button variant="accent" size="sm" icon={Check} onClick={handleSave}>
              Save Identity Profile
            </Button>
          )
        }
      />

      {/* Identity Statement Hero */}
      <Card padding="lg" className="border-2 border-[var(--color-sage)]/40 bg-[var(--bg-elevated)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[var(--color-sage)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-sage)]">
              Future Self Identity
            </span>
          </div>
          <Badge variant="sage">{data.futureSelf.title || 'The Finisher'}</Badge>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <Field id="role-title" label="Future Self Role (Not a job title)" helper="e.g. The Finisher, The Architect, The Grounded Creator">
              <Input id="role-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <Field id="identity-stmt" label="Core Identity Statement">
              <Textarea
                id="identity-stmt"
                value={identityStatement}
                onChange={(e) => setIdentityStatement(e.target.value)}
                rows={3}
              />
            </Field>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-[var(--fg)]">
              {data.futureSelf.title}
            </h2>
            <p className="text-sm font-serif italic text-[var(--fg)] bg-[var(--bg-muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] leading-relaxed">
              "{data.futureSelf.identityStatement}"
            </p>
          </div>
        )}
      </Card>

      {/* Future Self Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Values & Standards */}
        <Card padding="md" className="space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--fg)]">
            Core Values & Daily Standards
          </h3>

          {isEditing ? (
            <div className="space-y-4">
              <Field id="core-values" label="Core Values (1 per line)">
                <Textarea
                  id="core-values"
                  value={coreValuesText}
                  onChange={(e) => setCoreValuesText(e.target.value)}
                  rows={3}
                />
              </Field>
              <Field id="daily-standards" label="Daily Standards (1 per line)">
                <Textarea
                  id="daily-standards"
                  value={standardsText}
                  onChange={(e) => setStandardsText(e.target.value)}
                  rows={3}
                />
              </Field>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-[var(--fg-muted)] block mb-1.5 uppercase tracking-wider text-[10px]">
                  Core Values
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.futureSelf.coreValues.map((v, i) => (
                    <Badge key={i} variant="subtle">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-[var(--fg-muted)] block mb-1.5 uppercase tracking-wider text-[10px]">
                  Daily Standards
                </span>
                <ul className="space-y-1.5 text-[var(--fg)]">
                  {data.futureSelf.dailyStandards.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--color-sage)] font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>

        {/* Habits & Boundaries */}
        <Card padding="md" className="space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--fg)]">
            Habits, Skills & Boundaries
          </h3>

          {isEditing ? (
            <div className="space-y-4">
              <Field id="habits" label="Non-Negotiable Habits (1 per line)">
                <Textarea
                  id="habits"
                  value={habitsText}
                  onChange={(e) => setHabitsText(e.target.value)}
                  rows={3}
                />
              </Field>
              <Field id="boundaries" label="Clear Boundaries (1 per line)">
                <Textarea
                  id="boundaries"
                  value={boundariesText}
                  onChange={(e) => setBoundariesText(e.target.value)}
                  rows={3}
                />
              </Field>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-[var(--fg-muted)] block mb-1.5 uppercase tracking-wider text-[10px]">
                  Non-Negotiable Habits
                </span>
                <ul className="space-y-1.5 text-[var(--fg)]">
                  {data.futureSelf.habits.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--color-sage)] font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-[var(--fg-muted)] block mb-1.5 uppercase tracking-wider text-[10px]">
                  Clear Boundaries
                </span>
                <ul className="space-y-1.5 text-[var(--fg)]">
                  {data.futureSelf.boundaries.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--color-coral)] font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Old Self Section */}
      <Card padding="lg" className="border border-[#9A8F86]/40 bg-[var(--bg-elevated)] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <ShieldAlert className="w-5 h-5 text-[#9A8F86]" />
          <h3 className="font-display font-bold text-lg text-[var(--fg)]">
            Old Self — Patterns to Leave Behind
          </h3>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="old-behaviors" label="Behaviors to Leave Behind (1 per line)">
              <Textarea
                id="old-behaviors"
                value={oldBehaviorsText}
                onChange={(e) => setOldBehaviorsText(e.target.value)}
                rows={3}
              />
            </Field>

            <Field id="old-excuses" label="Outdated Excuses (1 per line)">
              <Textarea
                id="old-excuses"
                value={oldExcusesText}
                onChange={(e) => setOldExcusesText(e.target.value)}
                rows={3}
              />
            </Field>

            <Field id="old-patterns" label="Self-Sabotage Triggers (1 per line)">
              <Textarea
                id="old-patterns"
                value={oldPatternsText}
                onChange={(e) => setOldPatternsText(e.target.value)}
                rows={3}
              />
            </Field>

            <Field id="old-labels" label="Identity Labels to Release (1 per line)">
              <Textarea
                id="old-labels"
                value={oldLabelsText}
                onChange={(e) => setOldLabelsText(e.target.value)}
                rows={3}
              />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)]">
              <span className="font-bold text-[var(--fg-muted)] block mb-1 text-[11px]">
                Behaviors Left Behind
              </span>
              <ul className="space-y-1 text-[var(--fg)]">
                {data.futureSelf.oldSelfBehaviors.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)]">
              <span className="font-bold text-[var(--fg-muted)] block mb-1 text-[11px]">
                Old Excuses & Patterns
              </span>
              <ul className="space-y-1 text-[var(--fg)]">
                {data.futureSelf.oldSelfExcuses.map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
