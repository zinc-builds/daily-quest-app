import { describe, it, expect } from 'vitest';
import {
  calculateDailyXp,
  isPerfectDay,
  xpForDate,
  totalXp,
  maxXpForActiveDay,
  BASE_XP_PER_DAILY,
  PERFECT_DAY_BONUS,
} from '@/lib/xp';
import type { DailyGoal, DailyCompletion } from '@/lib/types';

const fitnessGoal: DailyGoal = {
  id: 'g1',
  name: 'Fitness',
  category: 'Body',
  targetType: 'checkbox',
  xpReward: 100,
  active: true,
  createdAt: '',
  updatedAt: '',
};

const learningGoal: DailyGoal = {
  id: 'g2',
  name: 'Learning',
  category: 'Mind',
  targetType: 'minutes',
  targetValue: 30,
  xpReward: 100,
  active: true,
  createdAt: '',
  updatedAt: '',
};

describe('calculateDailyXp', () => {
  it('returns 0 for incomplete checkbox', () => {
    expect(calculateDailyXp(fitnessGoal, false)).toBe(0);
  });

  it('returns full XP for completed checkbox', () => {
    expect(calculateDailyXp(fitnessGoal, true)).toBe(100);
  });

  it('scales XP by value/target for minutes', () => {
    expect(calculateDailyXp(learningGoal, true, 15)).toBe(50);
    expect(calculateDailyXp(learningGoal, true, 30)).toBe(100);
    expect(calculateDailyXp(learningGoal, true, 60)).toBe(100);
  });
});

describe('isPerfectDay', () => {
  it('returns true when all active goals completed', () => {
    const completions: DailyCompletion[] = [
      { id: 'c1', dailyGoalId: 'g1', date: '2026-06-13', completed: true, xpEarned: 100 },
      { id: 'c2', dailyGoalId: 'g2', date: '2026-06-13', completed: true, xpEarned: 100 },
    ];
    expect(isPerfectDay([fitnessGoal, learningGoal], completions, '2026-06-13')).toBe(true);
  });

  it('returns false when any active goal is missing', () => {
    const completions: DailyCompletion[] = [
      { id: 'c1', dailyGoalId: 'g1', date: '2026-06-13', completed: true, xpEarned: 100 },
    ];
    expect(isPerfectDay([fitnessGoal, learningGoal], completions, '2026-06-13')).toBe(false);
  });
});

describe('xpForDate', () => {
  it('calculates base, bonus and total', () => {
    const goals = [fitnessGoal, learningGoal];
    const completions: DailyCompletion[] = [
      { id: 'c1', dailyGoalId: 'g1', date: '2026-06-13', completed: true, xpEarned: 100 },
      { id: 'c2', dailyGoalId: 'g2', date: '2026-06-13', completed: true, xpEarned: 100 },
    ];
    const result = xpForDate(goals, completions, '2026-06-13');
    expect(result.base).toBe(200);
    expect(result.bonus).toBe(PERFECT_DAY_BONUS);
    expect(result.total).toBe(300);
  });
});

describe('maxXpForActiveDay', () => {
  it('returns goal count times base XP', () => {
    expect(maxXpForActiveDay(5)).toBe(500);
  });
});
