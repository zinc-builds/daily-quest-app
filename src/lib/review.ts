import type { Battlepass, BattlepassReward, DailyCompletion, DailyGoal, MonthlyReview } from './types';
import { isPerfectDay, maxXpForActiveDay, PERFECT_DAY_BONUS } from './xp';
import { daysInMonth, isDateInMonth } from './dates';
import { getRewardsForBattlepass } from './battlepass';
import { generateId } from '@/lib/uuid';

export function buildMonthlyReview(
  battlepass: Battlepass,
  goals: DailyGoal[],
  completions: DailyCompletion[],
  rewards: BattlepassReward[],
  notes: string = ''
): MonthlyReview {
  const activeGoals = goals.filter((g) => g.active);
  const monthDays = daysInMonth(new Date(`${battlepass.month}-01`));
  const monthCompletions = completions.filter((c) => isDateInMonth(c.date, battlepass.month));

  const totalXpEarned = monthCompletions.reduce((sum, c) => sum + c.xpEarned, 0);
  const totalXpAvailable = monthDays.length * maxXpForActiveDay(activeGoals.length);
  const completionPercentage = totalXpAvailable > 0 ? Math.round((totalXpEarned / totalXpAvailable) * 100) : 0;

  let perfectDays = 0;
  let bestStreak = 0;
  let currentStreak = 0;
  for (const date of monthDays) {
    if (isPerfectDay(goals, completions, date)) {
      perfectDays++;
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const dailyCompletionRates: Record<string, number> = {};
  for (const goal of activeGoals) {
    const completedDays = monthCompletions.filter(
      (c) => c.dailyGoalId === goal.id && c.completed
    ).length;
    dailyCompletionRates[goal.id] = Math.round((completedDays / monthDays.length) * 100);
  }

  const bpRewards = getRewardsForBattlepass(rewards, battlepass.id);
  const rewardsUnlocked = bpRewards.filter((r) => r.unlocked).length;
  const rewardsClaimed = bpRewards.filter((r) => r.claimed).length;

  return {
    id: generateId(),
    battlepassId: battlepass.id,
    totalXpEarned,
    totalXpAvailable,
    completionPercentage,
    perfectDays,
    bestStreak,
    dailyCompletionRates,
    rewardsUnlocked,
    rewardsClaimed,
    notes,
    createdAt: new Date().toISOString(),
  };
}
