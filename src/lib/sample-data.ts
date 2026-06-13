import type { DailyGoal, Battlepass, BattlepassReward } from './types';
import { monthRange } from './dates';
import { defaultRewardLevels } from './battlepass';

export const defaultDailyGoals: Omit<DailyGoal, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Fitness',
    description: 'Train for 45 minutes or walk 8,000 steps.',
    category: 'Body',
    targetType: 'minutes',
    targetValue: 45,
    xpReward: 100,
    active: true,
  },
  {
    name: 'Deep Work',
    description: 'Complete two focused work blocks.',
    category: 'Career',
    targetType: 'count',
    targetValue: 2,
    xpReward: 100,
    active: true,
  },
  {
    name: 'Learning',
    description: 'Read 20 pages or study for 30 minutes.',
    category: 'Mind',
    targetType: 'minutes',
    targetValue: 30,
    xpReward: 100,
    active: true,
  },
  {
    name: 'Home / Admin',
    description: 'Complete one maintenance task.',
    category: 'Life',
    targetType: 'checkbox',
    xpReward: 100,
    active: true,
  },
  {
    name: 'Relationships',
    description: 'Message, call, or spend quality time with someone.',
    category: 'People',
    targetType: 'checkbox',
    xpReward: 100,
    active: true,
  },
];

export function createDefaultBattlepass(month: string): { battlepass: Battlepass; rewards: BattlepassReward[] } {
  const { start, end } = monthRange(new Date(`${month}-01`));
  const battlepassId = crypto.randomUUID();
  const battlepass: Battlepass = {
    id: battlepassId,
    name: `${month} Battlepass`,
    month,
    startDate: start,
    endDate: end,
    xpEarned: 0,
    createdAt: new Date().toISOString(),
  };
  const rewards: BattlepassReward[] = defaultRewardLevels().map((r) => ({
    id: crypto.randomUUID(),
    battlepassId,
    ...r,
    unlocked: false,
    claimed: false,
  }));
  return { battlepass, rewards };
}
