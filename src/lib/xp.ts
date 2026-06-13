import type { DailyCompletion, DailyGoal } from './types';
import { today } from './dates';

export const BASE_XP_PER_DAILY = 100;
export const PERFECT_DAY_BONUS = 100;

export function calculateDailyXp(
  goal: DailyGoal,
  completed: boolean,
  value?: number
): number {
  if (!completed) return 0;
  if (goal.targetType === 'checkbox') return goal.xpReward;
  if (goal.targetType === 'count' && value !== undefined && goal.targetValue) {
    return Math.min(1, value / goal.targetValue) * goal.xpReward;
  }
  if (goal.targetType === 'minutes' && value !== undefined && goal.targetValue) {
    return Math.min(1, value / goal.targetValue) * goal.xpReward;
  }
  if (goal.targetType === 'custom' && value !== undefined && goal.targetValue) {
    return Math.min(1, value / goal.targetValue) * goal.xpReward;
  }
  return goal.xpReward;
}

export function isPerfectDay(
  goals: DailyGoal[],
  completions: DailyCompletion[],
  date: string
): boolean {
  const activeGoals = goals.filter((g) => g.active);
  if (activeGoals.length === 0) return false;
  const completedIds = new Set(
    completions
      .filter((c) => c.date === date && c.completed)
      .map((c) => c.dailyGoalId)
  );
  return activeGoals.every((g) => completedIds.has(g.id));
}

export function xpForDate(
  goals: DailyGoal[],
  completions: DailyCompletion[],
  date: string
): { base: number; bonus: number; total: number } {
  const activeGoals = goals.filter((g) => g.active);
  const dateCompletions = completions.filter((c) => c.date === date);
  let base = 0;
  for (const goal of activeGoals) {
    const completion = dateCompletions.find((c) => c.dailyGoalId === goal.id);
    base += completion?.xpEarned ?? 0;
  }
  const bonus = isPerfectDay(goals, completions, date) ? PERFECT_DAY_BONUS : 0;
  return { base, bonus, total: base + bonus };
}

export function totalXp(completions: DailyCompletion[]): number {
  return completions.reduce((sum, c) => sum + c.xpEarned, 0);
}

export function maxXpForActiveDay(goalCount: number): number {
  return goalCount * BASE_XP_PER_DAILY;
}

export function maxXpForMonth(daysInMonth: number, goalCount: number): number {
  return daysInMonth * maxXpForActiveDay(goalCount);
}

export function maxXpForMonthWithBonus(daysInMonth: number, goalCount: number): number {
  return maxXpForMonth(daysInMonth, goalCount) + daysInMonth * PERFECT_DAY_BONUS;
}
