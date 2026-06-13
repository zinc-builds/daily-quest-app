'use client';

import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { BattlepassTrack } from '@/components/BattlepassTrack';
import { Panel, SectionHeader, DataLabel, DataValue } from '@/components/MarathonUI';
import { loadState } from '@/lib/storage';
import { getCurrentBattlepass, getRewardsForBattlepass } from '@/lib/battlepass';
import { maxXpForActiveDay, maxXpForMonthWithBonus } from '@/lib/xp';
import { daysInMonth } from '@/lib/dates';
import type { AppState } from '@/lib/types';

export default function BattlepassPage() {
  const [state, setState] = useState<AppState>({ dailyGoals: [], completions: [], battlepasses: [], rewards: [], reviews: [] });

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setState(loadState());
  }

  const battlepass = getCurrentBattlepass(state.battlepasses);
  const rewards = battlepass ? getRewardsForBattlepass(state.rewards, battlepass.id) : [];
  const activeGoals = state.dailyGoals.filter((g) => g.active);
  const monthDays = battlepass ? daysInMonth(new Date(`${battlepass.month}-01`)) : [];
  const maxWithBonus = battlepass
    ? maxXpForMonthWithBonus(monthDays.length, activeGoals.length)
    : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <SectionHeader>BATTLEPASS</SectionHeader>

        {!battlepass ? (
          <Panel>
            <p className="text-white/50">No active battlepass. Configure one in Setup.</p>
          </Panel>
        ) : (
          <>
            <Panel title="MONTHLY PROJECTION">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <DataLabel>DAYS</DataLabel>
                  <DataValue>{monthDays.length}</DataValue>
                </div>
                <div>
                  <DataLabel>MAX BASE XP</DataLabel>
                  <DataValue>{(monthDays.length * maxXpForActiveDay(activeGoals.length)).toLocaleString()}</DataValue>
                </div>
                <div>
                  <DataLabel>MAX W/ BONUS</DataLabel>
                  <DataValue>{maxWithBonus.toLocaleString()}</DataValue>
                </div>
                <div>
                  <DataLabel>REWARD TIERS</DataLabel>
                  <DataValue>{rewards.length}</DataValue>
                </div>
              </div>
            </Panel>

            <BattlepassTrack
              battlepass={battlepass}
              rewards={rewards}
              onChange={refresh}
            />
          </>
        )}
      </main>
    </div>
  );
}
