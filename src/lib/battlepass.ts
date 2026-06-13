import type { Battlepass, BattlepassReward, DailyGoal, DailyCompletion } from './types';
import { xpForDate, totalXp } from './xp';
import { daysInMonth, isDateInMonth } from './dates';

export function getCurrentBattlepass(battlepasses: Battlepass[], now: Date = new Date()): Battlepass | undefined {
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return battlepasses.find((b) => b.month === currentMonth);
}

export function getRewardsForBattlepass(rewards: BattlepassReward[], battlepassId: string): BattlepassReward[] {
  return rewards
    .filter((r) => r.battlepassId === battlepassId)
    .sort((a, b) => a.level - b.level);
}

export function recomputeBattlepassXp(
  battlepass: Battlepass,
  completions: DailyCompletion[]
): number {
  return completions
    .filter((c) => isDateInMonth(c.date, battlepass.month) && c.completed)
    .reduce((sum, c) => sum + c.xpEarned, 0);
}

export function syncBattlepassUnlocks(
  battlepass: Battlepass,
  rewards: BattlepassReward[]
): BattlepassReward[] {
  return rewards.map((r) => ({
    ...r,
    unlocked: battlepass.xpEarned >= r.xpRequired,
  }));
}

export function nextReward(
  battlepass: Battlepass,
  rewards: BattlepassReward[]
): { reward: BattlepassReward; distance: number } | undefined {
  const sorted = rewards.filter((r) => r.battlepassId === battlepass.id).sort((a, b) => a.level - b.level);
  const next = sorted.find((r) => !r.unlocked);
  if (!next) return undefined;
  return { reward: next, distance: next.xpRequired - battlepass.xpEarned };
}

export function currentLevel(
  battlepass: Battlepass,
  rewards: BattlepassReward[]
): number {
  const sorted = rewards.filter((r) => r.battlepassId === battlepass.id).sort((a, b) => a.level - b.level);
  const unlocked = sorted.filter((r) => r.unlocked);
  return unlocked.length > 0 ? unlocked[unlocked.length - 1].level : 0;
}

export function defaultRewardLevels(): Omit<BattlepassReward, 'id' | 'battlepassId' | 'unlocked' | 'claimed' | 'claimedAt'>[] {
  return [
    { level: 1, xpRequired: 1000, rewardName: 'Coffee out', rewardType: 'treat' },
    { level: 2, xpRequired: 2500, rewardName: 'Buy a new book', rewardType: 'purchase' },
    { level: 3, xpRequired: 4000, rewardName: 'Movie night', rewardType: 'experience' },
    { level: 4, xpRequired: 6000, rewardName: 'New workout gear', rewardType: 'purchase' },
    { level: 5, xpRequired: 8500, rewardName: 'Day trip', rewardType: 'experience' },
    { level: 6, xpRequired: 11000, rewardName: 'Larger personal reward', rewardType: 'custom' },
    { level: 7, xpRequired: 14000, rewardName: 'Big monthly reward', rewardType: 'custom' },
  ];
}
