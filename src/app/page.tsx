'use client';

import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { DailyList } from '@/components/DailyList';
import { BattlepassTrack } from '@/components/BattlepassTrack';
import { Panel, SectionHeader, DataLabel, DataValue, ProgressBar } from '@/components/MarathonUI';
import { loadState, saveState } from '@/lib/storage';
import { xpForDate, isPerfectDay, maxXpForActiveDay } from '@/lib/xp';
import { getCurrentBattlepass, getRewardsForBattlepass } from '@/lib/battlepass';
import { today } from '@/lib/dates';
import { defaultDailyGoals, createDefaultBattlepass } from '@/lib/sample-data';
import type { AppState } from '@/lib/types';
import { generateId } from '@/lib/uuid';

// SSR-safe empty state. Real data (with UUIDs) is loaded in useEffect.
const emptyState: AppState = {
  dailyGoals: [],
  completions: [],
  battlepasses: [],
  rewards: [],
  reviews: [],
};

function seedIfEmpty(state: AppState): AppState {
  const next = { ...state };
  if (next.dailyGoals.length === 0) {
    next.dailyGoals = defaultDailyGoals.map((g) => ({
      ...g,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
  const currentMonth = today().slice(0, 7);
  const existingBp = getCurrentBattlepass(next.battlepasses);
  if (!existingBp) {
    const { battlepass, rewards } = createDefaultBattlepass(currentMonth);
    next.battlepasses = [...next.battlepasses, battlepass];
    next.rewards = [...next.rewards, ...rewards];
  }
  saveState(next);
  return next;
}

export default function TodayPage() {
  const [state, setState] = useState<AppState>(emptyState);

  useEffect(() => {
    const loaded = loadState();
    const seeded = seedIfEmpty(loaded);
    setState(seeded);
  }, []);

  function refresh() {
    setState(loadState());
  }

  const activeGoals = state.dailyGoals.filter((g) => g.active);
  const date = today();
  const { base, bonus, total } = xpForDate(state.dailyGoals, state.completions, date);
  const maxToday = maxXpForActiveDay(activeGoals.length);
  const perfect = isPerfectDay(state.dailyGoals, state.completions, date);
  const completedCount = activeGoals.filter((g) =>
    state.completions.some((c) => c.dailyGoalId === g.id && c.date === date && c.completed)
  ).length;

  const battlepass = getCurrentBattlepass(state.battlepasses);
  const rewards = battlepass ? getRewardsForBattlepass(state.rewards, battlepass.id) : [];

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <SectionHeader>TODAY</SectionHeader>
              <p className="text-xs font-mono-data text-white/40">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <DataLabel>STATUS</DataLabel>
              <DataValue>
                {completedCount}/{activeGoals.length} COMPLETE
              </DataValue>
            </div>
          </div>

          <Panel title="DAILY OBJECTIVES" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <DataLabel>TODAY XP</DataLabel>
                <DataValue>{base.toLocaleString()} / {maxToday.toLocaleString()}</DataValue>
              </div>
              <div>
                <DataLabel>PERFECT DAY BONUS</DataLabel>
                <DataValue className={perfect ? 'text-lime' : 'text-white/30'}>
                  {perfect ? '+100 XP' : 'LOCKED'}
                </DataValue>
              </div>
              <div>
                <DataLabel>TOTAL XP</DataLabel>
                <DataValue>{total.toLocaleString()}</DataValue>
              </div>
            </div>
            <ProgressBar current={base} max={maxToday} />
          </Panel>

          <DailyList
            goals={state.dailyGoals}
            completions={state.completions}
            date={date}
            onChange={refresh}
          />
        </section>

        {battlepass && (
          <BattlepassTrack
            battlepass={battlepass}
            rewards={rewards}
            onChange={refresh}
          />
        )}
      </main>
    </div>
  );
}
