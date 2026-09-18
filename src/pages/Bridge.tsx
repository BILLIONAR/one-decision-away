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

export const Bridge: React.FC = () => {
  const {
    data,
    updateRealityBridgeSavings,
    addMission,
    setActiveRoute,
  } = useApp();

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
    const itemName = purchase?.itemSnapshot.name || 'Dream Item';

    await addMission({
      title: `${bridge.nextMilestone || `Execute next milestone for ${itemName}`}`,
      description: `Linked Reality Bridge: ${itemName}. Target: $${bridge.realCostUsd.toLocaleString()}.`,
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
        title="Reality Bridge"
        subtitle="Translate symbolic Future Life dreams into concrete savings timelines and real-world actions."
        action={
          <Button
            variant="outline"
            icon={ShoppingBag}
            onClick={() => setActiveRoute('/app/life')}
          >
            My Future Life
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
                      Reality Execution Bridge
                    </span>
                    <Badge variant="coral">{bridge.realProgressPct}% Saved</Badge>
                  </div>

                  <h3 className="text-lg font-bold font-display text-[var(--fg)]">
                    {purchase?.itemSnapshot.name || 'Connected Dream'}
                  </h3>

                  {/* Dual Savings Progress */}
                  <div className="space-y-1.5 p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--fg-muted)]">Real Saved vs Target:</span>
                      <span className="font-bold text-[var(--fg)]">
                        ${bridge.currentSavingsUsd.toLocaleString()} / ${bridge.realCostUsd.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={bridge.realProgressPct} variant="coral" />
                    <div className="flex justify-between text-[11px] text-[var(--fg-subtle)] pt-1">
                      <span>Remaining: ${remaining.toLocaleString()}</span>
                      <span>Target: {bridge.targetDate}</span>
                    </div>
                  </div>

                  {/* Blueprint details */}
                  <div className="space-y-2 text-xs text-[var(--fg-muted)]">
                    <div>
                      <span className="font-semibold text-[var(--fg)] block">Required Monthly Rate:</span>
                      ${bridge.requiredMonthlySavingsUsd.toLocaleString()} / month
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--fg)] block">Income / Funding Channel:</span>
                      {bridge.incomeProject}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--fg)] block">Next Physical Milestone:</span>
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
                    Generate Mission
                  </Button>

                  <Button
                    variant="accent"
                    size="sm"
                    icon={DollarSign}
                    onClick={() => setLoggingBridge(bridge)}
                  >
                    Log Savings
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty
          icon={Layers}
          title="No Reality Bridges Established"
          description="Purchase a dream in the Market and click 'Reality Bridge' in My Future Life to calculate real costs and savings schedules."
          actionLabel="Go to My Future Life"
          onAction={() => setActiveRoute('/app/life')}
        />
      )}

      <Disclaimer text="The Reality Bridge provides mathematical clarity for your physical life. It does not initiate real bank transactions." />

      {/* Log Savings Modal */}
      <Modal
        isOpen={Boolean(loggingBridge)}
        onClose={() => setLoggingBridge(null)}
        title="Record Real Savings"
        subtitle="Log capital set aside in your physical bank account or brokerage."
      >
        {loggingBridge && (
          <form onSubmit={handleRecordSavings} className="space-y-4">
            <Field id="savings-val" label="Amount Saved ($ USD)" required>
              <Input
                id="savings-val"
                type="number"
                min={1}
                value={savingsInput}
                onChange={(e) => setSavingsInput(parseInt(e.target.value) || 0)}
              />
            </Field>

            <Field id="savings-note-input" label="Note (Optional)">
              <Input
                id="savings-note-input"
                value={savingsNote}
                onChange={(e) => setSavingsNote(e.target.value)}
                placeholder="e.g. Monthly transfer, side revenue"
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => setLoggingBridge(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Savings
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
