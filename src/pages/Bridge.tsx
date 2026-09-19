import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Progress,
  Modal,
  Field,
  Input,
  Disclaimer,
  Empty,
} from '../components/ui';
import {
  Layers,
  Plus,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { RealityBridge } from '../types/models';
import { useT } from '../i18n';

export const Bridge: React.FC = () => {
  const {
    data,
    updateRealityBridgeSavings,
    addMission,
    setActiveRoute,
  } = useApp();
  const t = useT();

  const [loggingBridge, setLoggingBridge] = useState<RealityBridge | null>(null);
  const [savingsInput, setSavingsInput] = useState<number>(150);
  const [savingsNote, setSavingsNote] = useState<string>('');

  if (!data) return null;

  const handleRecordSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingBridge || savingsInput <= 0) return;
    await updateRealityBridgeSavings(loggingBridge.id, savingsInput, savingsNote);
    setLoggingBridge(null);
    setSavingsInput(150);
    setSavingsNote('');
  };

  const handleCreateMissionFromBridge = async (bridge: RealityBridge) => {
    const purchase = data.purchases.find((p) => p.id === bridge.purchaseId);
    const itemName = purchase?.itemSnapshot.name || t('Dream Item');

    await addMission({
      title: bridge.nextMilestone || t('Execute next milestone for {itemName}', { itemName }),
      description: t('Linked Reality Bridge: {itemName}. Target: ${cost}.', { itemName, cost: bridge.realCostUsd.toLocaleString() }),
      area: 'Money',
      type: 'weekly_mission',
      difficulty: 'medium',
      estimatedMinutes: 60,
      rewardDreamDollar: 450,
      status: 'active',
      isOneDecision: false,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Reality Bridge')}
        subtitle={t('Translate symbolic Future Life dreams into concrete savings timelines and real-world actions.')}
        action={
          <Button
            variant="outline"
            icon={ShoppingBag}
            onClick={() => setActiveRoute('/app/life')}
          >
            {t('My Future Life')}
          </Button>
        }
      />

      {data.realityBridges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.realityBridges.map((bridge) => {
            const purchase = data.purchases.find((p) => p.id === bridge.purchaseId);
            const remaining = Math.max(0, bridge.realCostUsd - bridge.currentSavingsUsd);

            return (
              <Card
                key={bridge.id}
                padding="md"
                className="flex flex-col justify-between space-y-4 border border-[var(--border)] bg-[var(--bg-elevated)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-coral)]">
                      {t('Reality Execution Bridge')}
                    </span>
                    <Badge variant="coral">{t('{n}% Saved', { n: bridge.realProgressPct })}</Badge>
                  </div>

                  <h3 className="text-lg font-bold font-display text-[var(--fg)]">
                    {purchase?.itemSnapshot.name || t('Connected Dream')}
                  </h3>

                  {/* Dual Savings Progress */}
                  <div className="space-y-1.5 p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--fg-muted)]">{t('Real Saved vs Target:')}</span>
                      <span className="font-bold text-[var(--fg)]">
                        ${bridge.currentSavingsUsd.toLocaleString()} / ${bridge.realCostUsd.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={bridge.realProgressPct} variant="coral" />
                    <div className="flex justify-between text-[11px] text-[var(--fg-subtle)] pt-1">
                      <span>{t('Remaining: ${n}', { n: remaining.toLocaleString() })}</span>
                      <span>{t('Target: {date}', { date: bridge.targetDate })}</span>
                    </div>
                  </div>

                  {/* Blueprint details */}
                  <div className="space-y-2 text-xs text-[var(--fg-muted)]">
                    <div>
                      <span className="font-semibold text-[var(--fg)] block">{t('Required Monthly Rate:')}</span>
                      {t('${n} / month', { n: bridge.requiredMonthlySavingsUsd.toLocaleString() })}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--fg)] block">{t('Income / Funding Channel:')}</span>
                      {bridge.incomeProject}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--fg)] block">{t('Next Physical Milestone:')}</span>
                      {bridge.nextMilestone}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateMissionFromBridge(bridge)}
                  >
                    {t('Generate Mission')}
                  </Button>

                  <Button
                    variant="accent"
                    size="sm"
                    icon={DollarSign}
                    onClick={() => setLoggingBridge(bridge)}
                  >
                    {t('Log Savings')}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty
          icon={Layers}
          title={t('No Reality Bridges Established')}
          description={t("Purchase a dream in the Market and click 'Reality Bridge' in My Future Life to calculate real costs and savings schedules.")}
          actionLabel={t('Go to My Future Life')}
          onAction={() => setActiveRoute('/app/life')}
        />
      )}

      <Disclaimer text={t('The Reality Bridge provides mathematical clarity for your physical life. It does not initiate real bank transactions.')} />

      {/* Log Savings Modal */}
      <Modal
        isOpen={Boolean(loggingBridge)}
        onClose={() => setLoggingBridge(null)}
        title={t('Record Real Savings')}
        subtitle={t('Log capital set aside in your physical bank account or brokerage.')}
      >
        {loggingBridge && (
          <form onSubmit={handleRecordSavings} className="space-y-4">
            <Field id="savings-val" label={t('Amount Saved ($ USD)')} required>
              <Input
                id="savings-val"
                type="number"
                min={1}
                value={savingsInput}
                onChange={(e) => setSavingsInput(parseInt(e.target.value) || 0)}
              />
            </Field>

            <Field id="savings-note-input" label={t('Note (Optional)')}>
              <Input
                id="savings-note-input"
                value={savingsNote}
                onChange={(e) => setSavingsNote(e.target.value)}
                placeholder={t('e.g. Monthly transfer, side revenue')}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => setLoggingBridge(null)}>
                {t('Cancel')}
              </Button>
              <Button variant="primary" type="submit">
                {t('Update Savings')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
