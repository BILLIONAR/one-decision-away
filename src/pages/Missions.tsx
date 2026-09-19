import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Plus, Check, Clock, Play } from 'lucide-react';
import { CompleteMissionModal, CreateMissionModal } from '../components/MissionFlows';
import { FocusTimerHub } from '../components/FocusTimerHub';
import { Mission, MissionType } from '../types/models';
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

  const tabs = ['All', 'Daily', 'Weekly', 'Monthly', 'Rules', 'Done'];

  const typeMap: Record<string, MissionType | 'completed' | 'all'> = {
    All: 'all',
    Daily: 'daily_quest',
    Weekly: 'weekly_mission',
    Monthly: 'monthly_boss_fight',
    Rules: 'constraint',
    Done: 'completed',
  };

  const areas = [
    { value: 'All', label: t('All areas') },
    { value: 'Work', label: t('Work') },
    { value: 'Money', label: t('Money') },
    { value: 'Health', label: t('Health') },
    { value: 'Learning', label: t('Learning') },
    { value: 'Relationships', label: t('Relationships') },
    { value: 'Environment', label: t('Environment') },
    { value: 'Personal Meaning', label: t('Meaning') },
  ];

  const filteredMissions = data.missions.filter((m) => {
    if (activeTab === 'Done') {
      if (m.status !== 'completed') return false;
    } else {
      if (m.status === 'completed') return false;
      const targetType = typeMap[activeTab];
      if (targetType && targetType !== 'all' && m.type !== targetType) return false;
    }
    if (selectedArea !== 'All' && m.area !== selectedArea) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Missions')}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">{t('Small tasks that move your dream forward.')}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="h-11 px-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] font-semibold text-[15px] shrink-0"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={1.8} />
          {t('New')}
        </button>
      </div>

      <FocusTimerHub />

      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {tabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`h-9 px-3.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 ${
                  active ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg-muted)] text-[var(--fg-muted)]'
                }`}
              >
                {t(tab)}
              </button>
            );
          })}
        </div>
        <select
          id="area-filter"
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="w-full sm:w-56 h-11 px-3 bg-[var(--bg-muted)] text-[var(--fg)] rounded-[var(--radius-sm)] text-sm focus:outline-none"
        >
          {areas.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {filteredMissions.length > 0 ? (
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
          {filteredMissions.map((mission) => {
            const reward = getBaseReward(mission.type, mission.difficulty, mission.isOneDecision);
            const isCompleted = mission.status === 'completed';
            const minutes = mission.estimatedMinutes || 30;

            return (
              <div key={mission.id} className="px-4 py-3 min-h-[56px] flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-[var(--fg)] truncate">{t(mission.title)}</div>
                  <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] mt-0.5">
                    <span>{t(mission.area)}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
                      {t('{n} min', { n: minutes })}
                    </span>
                    {mission.isOneDecision && (
                      <>
                        <span>·</span>
                        <span className="text-[var(--accent)]">{t('One decision')}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="text-[var(--accent)]">
                      {mission.type === 'constraint' ? t('Rule') : `D$ ${reward.toLocaleString()}`}
                    </span>
                  </div>
                  {mission.reflection && (
                    <div className="text-xs text-[var(--fg-muted)] mt-1 truncate">
                      {t('Next: {text}', { text: t(mission.reflection.nextStep) })}
                    </div>
                  )}
                </div>

                {!isCompleted ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        startFocusSession({
                          missionId: mission.id,
                          missionTitle: mission.title,
                          missionType: mission.type,
                          missionArea: mission.area,
                          durationMinutes: minutes,
                        })
                      }
                      aria-label={t('Focus')}
                      title={t('Focus')}
                      className="w-11 h-11 rounded-[var(--radius-sm)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--fg)]"
                    >
                      <Play className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompletingMission(mission)}
                      aria-label={t('Complete')}
                      title={t('Complete')}
                      className="w-11 h-11 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center"
                    >
                      <Check className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-[var(--accent)] inline-flex items-center gap-1 shrink-0">
                    <Check className="w-4 h-4" strokeWidth={1.8} /> {t('Done')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 text-center">
          <p className="text-[15px] font-semibold text-[var(--fg)]">{t('No missions here')}</p>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            {activeTab === 'Done'
              ? t('Nothing completed under this filter yet.')
              : t('Add a mission to start earning D$.')}
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 h-11 px-4 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] font-semibold text-[15px]"
          >
            {t('New mission')}
          </button>
        </div>
      )}

      <CompleteMissionModal
        mission={completingMission}
        isOpen={Boolean(completingMission)}
        onClose={() => setCompletingMission(null)}
        onConfirm={completeMission}
      />

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
