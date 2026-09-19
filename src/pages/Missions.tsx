import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import {
  PageHeader,
  Button,
  Card,
  Badge,
  ChipGroup,
  Empty,
  Select,
} from '../components/ui';
import {
  Plus,
  CheckCircle,
  Clock,
  Flame,
  Shield,
  Layers,
  Sparkles,
  Calendar,
  Timer,
  Play,
} from 'lucide-react';
import { CompleteMissionModal, CreateMissionModal } from '../components/MissionFlows';
import { FocusTimerHub } from '../components/FocusTimerHub';
import { Mission, MissionType, MissionArea } from '../types/models';
import { getBaseReward } from '../services/economy';
import { useT } from '../i18n';

export const Missions: React.FC = () => {
  const { data, addMission, completeMission, startFocusSession } = useApp();
  const t = useT();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completingMission, setCompletingMission] = useState<Mission | null>(null);

  if (!data) return null;

  const tabs = ['All', 'Daily Quests', 'Weekly Missions', 'Boss Fights', 'Constraints', 'Completed'];
  const tabLabels = tabs.map((tab) => t(tab));

  const typeMap: Record<string, MissionType | 'completed' | 'all'> = {
    All: 'all',
    'Daily Quests': 'daily_quest',
    'Weekly Missions': 'weekly_mission',
    'Boss Fights': 'monthly_boss_fight',
    Constraints: 'constraint',
    Completed: 'completed',
  };

  const filteredMissions = data.missions.filter((m) => {
    // Tab filter
    if (activeTab === 'Completed') {
      if (m.status !== 'completed') return false;
    } else {
      if (m.status === 'completed') return false;
      const targetType = typeMap[activeTab];
      if (targetType && targetType !== 'all' && m.type !== targetType) return false;
    }

    // Area filter
    if (selectedArea !== 'All' && m.area !== selectedArea) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Missions & Quests')}
        subtitle={t('Turn meaningful life projects into structured daily quests, deep-work focus sprints, and boss fights.')}
        action={
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            {t('Create Mission')}
          </Button>
        }
      />

      {/* Dedicated Deep Work Focus Timer Hub */}
      <FocusTimerHub />

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <ChipGroup
          items={tabLabels}
          selected={t(activeTab)}
          onSelect={(label) => setActiveTab(tabs[tabLabels.indexOf(label)] ?? label)}
        />

        <div className="w-full sm:w-48">
          <Select
            id="area-filter"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            options={[
              { value: 'All', label: t('All Life Domains') },
              { value: 'Work', label: t('Work & Enterprise') },
              { value: 'Money', label: t('Money') },
              { value: 'Health', label: t('Health') },
              { value: 'Learning', label: t('Learning') },
              { value: 'Relationships', label: t('Relationships') },
              { value: 'Environment', label: t('Environment') },
              { value: 'Personal Meaning', label: t('Personal Meaning') },
            ]}
          />
        </div>
      </div>

      {/* Missions Grid / List */}
      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMissions.map((mission) => {
            const reward = getBaseReward(mission.type, mission.difficulty, mission.isOneDecision);
            const isCompleted = mission.status === 'completed';

            return (
              <Card
                key={mission.id}
                padding="md"
                className={`flex flex-col justify-between space-y-4 border transition-all ${
                  mission.isOneDecision
                    ? 'border-[var(--color-coral)]/40 bg-[var(--bg-elevated)] shadow-xs'
                    : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--fg-muted)]">
                        {t(mission.area)}
                      </span>
                      {mission.isOneDecision && <Badge variant="coral">{t('One Decision')}</Badge>}
                    </div>

                    <span className="text-xs font-bold text-[var(--color-sage)]">
                      {mission.type === 'constraint' ? t('Rule') : `+ D$ ${reward.toLocaleString()}`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-display text-[var(--fg)] leading-snug">
                    {t(mission.title)}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-[var(--fg-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t('{n} mins', { n: mission.estimatedMinutes || 30 })}
                    </span>
                    <span className="capitalize">{t(mission.difficulty)}</span>
                    {mission.recurring && (
                      <span className="flex items-center gap-1 text-[var(--color-sage)]">
                        <Calendar className="w-3.5 h-3.5" /> {t(mission.recurring)}
                      </span>
                    )}
                  </div>

                  {mission.reflection && (
                    <div className="p-2.5 bg-[var(--bg-muted)] rounded-[var(--radius-sm)] text-[11px] text-[var(--fg-muted)] space-y-1">
                      <div className="font-semibold text-[var(--fg)]">{t('Reflection:')}</div>
                      <div>{t('Completed: {text}', { text: t(mission.reflection.completedSummary) })}</div>
                      <div>{t('Next Step: {text}', { text: t(mission.reflection.nextStep) })}</div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--fg-subtle)] capitalize">
                    {t('Type: {type}', { type: t(mission.type.replace('_', ' ')) })}
                  </span>

                  {!isCompleted ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Play}
                        onClick={() =>
                          startFocusSession({
                            missionId: mission.id,
                            missionTitle: mission.title,
                            missionType: mission.type,
                            missionArea: mission.area,
                            durationMinutes: mission.estimatedMinutes || 30,
                          })
                        }
                        title={t('Lock app into dedicated Deep Work for this quest')}
                      >
                        {t('Focus ({n}m)', { n: mission.estimatedMinutes || 30 })}
                      </Button>
                      <Button
                        variant={mission.isOneDecision ? 'accent' : 'primary'}
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => setCompletingMission(mission)}
                      >
                        {t('Complete')}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[var(--color-sage)] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {t('Completed')}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty
          title={t('No missions found')}
          description={
            activeTab === 'Completed'
              ? t('You have not completed any missions under this filter yet.')
              : t('Add a new mission to begin earning D$ and building momentum.')
          }
          actionLabel={t('Create a Mission')}
          onAction={() => setIsCreateOpen(true)}
        />
      )}

      {/* Complete Mission Modal */}
      <CompleteMissionModal
        mission={completingMission}
        isOpen={Boolean(completingMission)}
        onClose={() => setCompletingMission(null)}
        onConfirm={completeMission}
      />

      {/* Create Mission Modal */}
      <CreateMissionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (newMission) => {
          await addMission(newMission);
        }}
      />
    </div>
  );
};

