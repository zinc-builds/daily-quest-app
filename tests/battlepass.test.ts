import { describe, it, expect } from 'vitest';
import { recomputeBattlepassXp, syncBattlepassUnlocks, currentLevel, nextReward } from '@/lib/battlepass';
import type { Battlepass, BattlepassReward, DailyCompletion } from '@/lib/types';

const bp: Battlepass = {
  id: 'bp1',
  name: 'June Pass',
  month: '2026-06',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  xpEarned: 0,
  createdAt: '',
};

const rewards: BattlepassReward[] = [
  { id: 'r1', battlepassId: 'bp1', level: 1, xpRequired: 1000, rewardName: 'A', rewardType: 'treat', unlocked: false, claimed: false },
  { id: 'r2', battlepassId: 'bp1', level: 2, xpRequired: 2500, rewardName: 'B', rewardType: 'treat', unlocked: false, claimed: false },
];

describe('recomputeBattlepassXp', () => {
  it('sums completed completions in the battlepass month', () => {
    const completions: DailyCompletion[] = [
      { id: 'c1', dailyGoalId: 'g1', date: '2026-06-01', completed: true, xpEarned: 100 },
      { id: 'c2', dailyGoalId: 'g2', date: '2026-06-02', completed: true, xpEarned: 100 },
      { id: 'c3', dailyGoalId: 'g3', date: '2026-07-01', completed: true, xpEarned: 100 },
    ];
    expect(recomputeBattlepassXp(bp, completions)).toBe(200);
  });
});

describe('syncBattlepassUnlocks', () => {
  it('unlocks rewards when XP threshold is met', () => {
    const updated = syncBattlepassUnlocks({ ...bp, xpEarned: 1200 }, rewards);
    expect(updated[0].unlocked).toBe(true);
    expect(updated[1].unlocked).toBe(false);
  });
});
