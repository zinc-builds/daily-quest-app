'use client';

import { useState } from 'react';
import type { DailyGoal, DailyCompletion } from '@/lib/types';
import { calculateDailyXp } from '@/lib/xp';
import { recordCompletion, loadState, saveState } from '@/lib/storage';
import { recomputeBattlepassXp, syncBattlepassUnlocks } from '@/lib/battlepass';
import {
  Panel,
  TerminalButton,
  TerminalCheckbox,
  TerminalInput,
  DataLabel,
  DataValue,
} from './MarathonUI';
import { Check, Minus, Pencil } from 'lucide-react';

function completionForGoal(
  completions: DailyCompletion[],
  goalId: string,
  date: string
): DailyCompletion | undefined {
  return completions.find((c) => c.dailyGoalId === goalId && c.date === date);
}

function completeGoal(
  goal: DailyGoal,
  date: string,
  value?: number,
  note?: string
): DailyCompletion {
  const xp = calculateDailyXp(goal, true, value);
  const completion: DailyCompletion = {
    id: crypto.randomUUID(),
    dailyGoalId: goal.id,
    date,
    completed: true,
    completedAt: new Date().toISOString(),
    value,
    note,
    xpEarned: xp,
  };
  recordCompletion(completion);

  // Sync battlepass XP and unlocks
  const state = loadState();
  const currentBp = state.battlepasses.find((b) =>
    date.startsWith(b.month)
  );
  if (currentBp) {
    currentBp.xpEarned = recomputeBattlepassXp(currentBp, state.completions);
    state.rewards = syncBattlepassUnlocks(currentBp, state.rewards);
    saveState(state);
  }

  return completion;
}

function undoGoal(goalId: string, date: string) {
  const state = loadState();
  state.completions = state.completions.filter(
    (c) => !(c.dailyGoalId === goalId && c.date === date)
  );
  const currentBp = state.battlepasses.find((b) => date.startsWith(b.month));
  if (currentBp) {
    currentBp.xpEarned = recomputeBattlepassXp(currentBp, state.completions);
    state.rewards = syncBattlepassUnlocks(currentBp, state.rewards);
  }
  saveState(state);
}

export function DailyList({
  goals,
  completions,
  date,
  onChange,
}: {
  goals: DailyGoal[];
  completions: DailyCompletion[];
  date: string;
  onChange: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [valueInput, setValueInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');

  const activeGoals = goals.filter((g) => g.active);

  function handleToggle(goal: DailyGoal) {
    const existing = completionForGoal(completions, goal.id, date);
    if (existing?.completed) {
      undoGoal(goal.id, date);
    } else {
      let value: number | undefined;
      if (goal.targetType !== 'checkbox') {
        value = goal.targetValue;
      }
      completeGoal(goal, date, value);
    }
    onChange();
  }

  function handleCustomComplete(goal: DailyGoal) {
    const value = valueInput ? Number(valueInput) : undefined;
    completeGoal(goal, date, value, noteInput || undefined);
    setEditingId(null);
    setValueInput('');
    setNoteInput('');
    onChange();
  }

  return (
    <div className="space-y-3">
      {activeGoals.map((goal) => {
        const completion = completionForGoal(completions, goal.id, date);
        const done = !!completion?.completed;
        const showValueInput =
          !done &&
          (goal.targetType === 'count' ||
            goal.targetType === 'minutes' ||
            goal.targetType === 'custom');

        return (
          <Panel
            key={goal.id}
            className={done ? 'border-lime/40' : 'border-white/10'}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <TerminalCheckbox
                    checked={done}
                    onChange={() => handleToggle(goal)}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          done ? 'line-through text-white/40' : 'text-white'
                        }
                      >
                        {goal.name}
                      </span>
                      <span className="text-[10px] font-mono-data text-lime">
                        +{goal.xpReward} XP
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">
                      {goal.description || goal.category}
                    </p>
                  </div>
                </div>

                {completion?.note && (
                  <p className="mt-2 text-xs text-white/40 font-mono-data pl-8">
                    NOTE: {completion.note}
                  </p>
                )}

                {editingId === goal.id && showValueInput && (
                  <div className="mt-3 pl-8 space-y-2">
                    <div className="flex gap-2">
                      <TerminalInput
                        type="number"
                        value={valueInput}
                        onChange={setValueInput}
                        placeholder={
                          goal.targetType === 'minutes'
                            ? 'Minutes'
                            : goal.targetType === 'count'
                            ? 'Count'
                            : 'Value'
                        }
                        className="w-32"
                      />
                      <TerminalInput
                        value={noteInput}
                        onChange={setNoteInput}
                        placeholder="Note (optional)"           
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <TerminalButton onClick={() => handleCustomComplete(goal)}>
                        <Check className="w-3 h-3 inline mr-1" /> CONFIRM
                      </TerminalButton>
                      <TerminalButton
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        <Minus className="w-3 h-3 inline mr-1" /> CANCEL
                      </TerminalButton>
                    </div>
                  </div>
                )}
              </div>

              {!done && showValueInput && editingId !== goal.id && (
                <TerminalButton
                  variant="ghost"
                  onClick={() => setEditingId(goal.id)}
                >
                  <Pencil className="w-3 h-3 inline mr-1" /> LOG
                </TerminalButton>
              )}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
