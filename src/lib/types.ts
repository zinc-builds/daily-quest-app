export type TargetType = 'checkbox' | 'count' | 'minutes' | 'custom';
export type RewardType = 'treat' | 'purchase' | 'experience' | 'rest' | 'social' | 'custom';

export type DailyGoal = {
  id: string;
  name: string;
  description?: string;
  category: string;
  targetType: TargetType;
  targetValue?: number;
  xpReward: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DailyCompletion = {
  id: string;
  dailyGoalId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  value?: number;
  note?: string;
  xpEarned: number;
};

export type Battlepass = {
  id: string;
  name: string;
  month: string; // YYYY-MM
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  xpEarned: number;
  createdAt: string;
};

export type BattlepassReward = {
  id: string;
  battlepassId: string;
  level: number;
  xpRequired: number;
  rewardName: string;
  rewardDescription?: string;
  rewardType: RewardType;
  unlocked: boolean;
  claimed: boolean;
  claimedAt?: string;
};

export type MonthlyReview = {
  id: string;
  battlepassId: string;
  totalXpEarned: number;
  totalXpAvailable: number;
  completionPercentage: number;
  perfectDays: number;
  bestStreak: number;
  dailyCompletionRates: Record<string, number>;
  rewardsUnlocked: number;
  rewardsClaimed: number;
  notes: string;
  createdAt: string;
};

export type AppState = {
  dailyGoals: DailyGoal[];
  completions: DailyCompletion[];
  battlepasses: Battlepass[];
  rewards: BattlepassReward[];
  reviews: MonthlyReview[];
};
