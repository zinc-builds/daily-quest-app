import type { AppState, DailyGoal, DailyCompletion, Battlepass, BattlepassReward, MonthlyReview } from './types';

const STORAGE_KEY = 'daily-quest-app-state';

export const emptyState: AppState = {
  dailyGoals: [],
  completions: [],
  battlepasses: [],
  rewards: [],
  reviews: [],
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadState(): AppState {
  if (!isBrowser()) return emptyState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...emptyState,
      ...parsed,
    };
  } catch {
    return emptyState;
  }
}

export function saveState(state: AppState): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateState(partial: Partial<AppState>): AppState {
  const current = loadState();
  const next = { ...current, ...partial };
  saveState(next);
  return next;
}

export function clearState(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

// Entity helpers
export function addDailyGoal(goal: DailyGoal): void {
  const state = loadState();
  state.dailyGoals = [...state.dailyGoals, goal];
  saveState(state);
}

export function updateDailyGoal(id: string, updates: Partial<DailyGoal>): void {
  const state = loadState();
  state.dailyGoals = state.dailyGoals.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g));
  saveState(state);
}

export function recordCompletion(completion: DailyCompletion): void {
  const state = loadState();
  state.completions = [
    ...state.completions.filter(
      (c) => !(c.dailyGoalId === completion.dailyGoalId && c.date === completion.date)
    ),
    completion,
  ];
  saveState(state);
}

export function upsertBattlepass(battlepass: Battlepass): void {
  const state = loadState();
  state.battlepasses = [
    ...state.battlepasses.filter((b) => b.id !== battlepass.id),
    battlepass,
  ];
  saveState(state);
}

export function upsertRewards(rewards: BattlepassReward[]): void {
  const state = loadState();
  const ids = new Set(rewards.map((r) => r.id));
  state.rewards = [...state.rewards.filter((r) => !ids.has(r.id)), ...rewards];
  saveState(state);
}

export function updateReward(id: string, updates: Partial<BattlepassReward>): void {
  const state = loadState();
  state.rewards = state.rewards.map((r) => (r.id === id ? { ...r, ...updates } : r));
  saveState(state);
}

export function addReview(review: MonthlyReview): void {
  const state = loadState();
  state.reviews = [...state.reviews, review];
  saveState(state);
}
