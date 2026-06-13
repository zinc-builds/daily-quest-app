'use client';

import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import {
  Panel,
  SectionHeader,
  TerminalButton,
  TerminalInput,
  TerminalCheckbox,
  DataLabel,
} from '@/components/MarathonUI';
import { loadState, updateDailyGoal, upsertBattlepass, upsertRewards } from '@/lib/storage';
import { defaultDailyGoals } from '@/lib/sample-data';
import { defaultRewardLevels } from '@/lib/battlepass';
import type { DailyGoal, Battlepass, BattlepassReward, TargetType, RewardType, AppState } from '@/lib/types';
import { Trash2, Plus } from 'lucide-react';

const targetTypes: TargetType[] = ['checkbox', 'count', 'minutes', 'custom'];
const rewardTypes: RewardType[] = ['treat', 'purchase', 'experience', 'rest', 'social', 'custom'];

export default function SetupPage() {
  const [state, setState] = useState<AppState>({ dailyGoals: [], completions: [], battlepasses: [], rewards: [], reviews: [] });
  const [month, setMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [bpName, setBpName] = useState('');
  const [rewards, setRewards] = useState<Omit<BattlepassReward, 'id' | 'battlepassId' | 'unlocked' | 'claimed' | 'claimedAt'>[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadState();
    setState(s);
    const current = s.battlepasses.find((b) => b.month === month);
    if (current) {
      setBpName(current.name);
      const existing = s.rewards
        .filter((r) => r.battlepassId === current.id)
        .sort((a, b) => a.level - b.level)
        .map((r) => ({
          level: r.level,
          xpRequired: r.xpRequired,
          rewardName: r.rewardName,
          rewardDescription: r.rewardDescription,
          rewardType: r.rewardType,
        }));
      setRewards(existing.length ? existing : defaultRewardLevels());
    } else {
      setBpName(`${month} Battlepass`);
      setRewards(defaultRewardLevels());
    }
  }, [month]);

  function refresh() {
    setState(loadState());
  }

  function ensureDefaults() {
    if (state.dailyGoals.filter((g) => g.active).length === 0) {
      const goals = defaultDailyGoals.map((g) => ({
        ...g,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setState((prev) => ({ ...prev, dailyGoals: goals }));
    }
  }

  function updateGoal(id: string, patch: Partial<DailyGoal>) {
    updateDailyGoal(id, patch);
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function addGoal() {
    const goal: DailyGoal = {
      id: crypto.randomUUID(),
      name: 'New Daily',
      description: '',
      category: 'Custom',
      targetType: 'checkbox',
      targetValue: 1,
      xpReward: 100,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = { ...state, dailyGoals: [...state.dailyGoals, goal] };
    setState(next);
  }

  function removeGoal(id: string) {
    const next = { ...state, dailyGoals: state.dailyGoals.filter((g) => g.id !== id) };
    setState(next);
  }

  function saveGoals() {
    const s = loadState();
    s.dailyGoals = state.dailyGoals;
    // enforce max 5 active
    const active = s.dailyGoals.filter((g) => g.active);
    if (active.length > 5) {
      alert('Only five dailies may be active at once.');
      return;
    }
    // save battlepass
    const existing = s.battlepasses.find((b) => b.month === month);
    const bpId = existing?.id ?? crypto.randomUUID();
    const battlepass: Battlepass = {
      id: bpId,
      name: bpName || `${month} Battlepass`,
      month,
      startDate: `${month}-01`,
      endDate: `${month}-${new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate()}`,
      xpEarned: existing?.xpEarned ?? 0,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    upsertBattlepass(battlepass);

    const rewardEntities: BattlepassReward[] = rewards.map((r) => ({
      id: crypto.randomUUID(),
      battlepassId: bpId,
      ...r,
      unlocked: battlepass.xpEarned >= r.xpRequired,
      claimed: false,
    }));
    upsertRewards(rewardEntities);

    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  useEffect(() => {
    ensureDefaults();
  }, [state.dailyGoals.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <SectionHeader>SYSTEM CONFIG</SectionHeader>

        <Panel title="DAILY GOALS">
          <p className="text-xs text-white/50 mb-4 font-mono-data">
            DEFINE EXACTLY FIVE ACTIVE DAILIES. XP REWARD DEFAULTS TO 100.
          </p>
          <div className="space-y-4">
            {state.dailyGoals.map((goal) => (
              <div key={goal.id} className="border border-white/10 p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <TerminalInput
                    value={goal.name}
                    onChange={(v) =>
                      setState((prev) => ({
                        ...prev,
                        dailyGoals: prev.dailyGoals.map((g) =>
                          g.id === goal.id ? { ...g, name: v } : g
                        ),
                      }))
                    }
                    placeholder="Name"
                  />
                  <TerminalInput
                    value={goal.category}
                    onChange={(v) =>
                      setState((prev) => ({
                        ...prev,
                        dailyGoals: prev.dailyGoals.map((g) =>
                          g.id === goal.id ? { ...g, category: v } : g
                        ),
                      }))
                    }
                    placeholder="Category"
                  />
                </div>
                <TerminalInput
                  value={goal.description || ''}
                  onChange={(v) =>
                    setState((prev) => ({
                      ...prev,
                      dailyGoals: prev.dailyGoals.map((g) =>
                        g.id === goal.id ? { ...g, description: v } : g
                      ),
                    }))
                  }
                  placeholder="Description"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={goal.targetType}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        dailyGoals: prev.dailyGoals.map((g) =>
                          g.id === goal.id
                            ? { ...g, targetType: e.target.value as TargetType }
                            : g
                        ),
                      }))
                    }
                    className="bg-black border border-white/20 text-white text-sm px-2 py-2 font-mono-data"
                  >
                    {targetTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {goal.targetType !== 'checkbox' && (
                    <TerminalInput
                      type="number"
                      value={goal.targetValue ?? ''}
                      onChange={(v) =>
                        setState((prev) => ({
                          ...prev,
                          dailyGoals: prev.dailyGoals.map((g) =>
                            g.id === goal.id
                              ? { ...g, targetValue: Number(v) }
                              : g
                          ),
                        }))
                      }
                      placeholder="Target"
                      className="w-24"
                    />
                  )}
                  <TerminalInput
                    type="number"
                    value={goal.xpReward}
                    onChange={(v) =>
                      setState((prev) => ({
                        ...prev,
                        dailyGoals: prev.dailyGoals.map((g) =>
                          g.id === goal.id ? { ...g, xpReward: Number(v) } : g
                        ),
                      }))
                    }
                    placeholder="XP"
                    className="w-24"
                  />
                  <TerminalCheckbox
                    checked={goal.active}
                    onChange={(checked) =>
                      setState((prev) => ({
                        ...prev,
                        dailyGoals: prev.dailyGoals.map((g) =>
                          g.id === goal.id ? { ...g, active: checked } : g
                        ),
                      }))
                    }
                    label="ACTIVE"
                  />
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="ml-auto text-white/40 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <TerminalButton onClick={addGoal}>
              <Plus className="w-3 h-3 inline mr-1" /> ADD DAILY
            </TerminalButton>
          </div>
        </Panel>

        <Panel title="BATTLEPASS CONFIG">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <DataLabel>MONTH</DataLabel>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white font-mono-data focus:border-lime focus:outline-none"
              />
            </div>
            <div>
              <DataLabel>PASS NAME</DataLabel>
              <TerminalInput
                value={bpName}
                onChange={setBpName}
                placeholder="e.g. Rebuild Momentum"
              />
            </div>
          </div>

          <div className="space-y-2">
            {rewards.map((reward, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 border border-white/10 p-2">
                <div className="col-span-1">
                  <span className="text-xs font-mono-data text-white/40">{reward.level}</span>
                </div>
                <div className="col-span-3">
                  <TerminalInput
                    value={reward.rewardName}
                    onChange={(v) =>
                      setRewards((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, rewardName: v } : r))
                      )
                    }
                    placeholder="Reward"
                  />
                </div>
                <div className="col-span-2">
                  <TerminalInput
                    type="number"
                    value={reward.xpRequired}
                    onChange={(v) =>
                      setRewards((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, xpRequired: Number(v) } : r
                        )
                      )
                    }
                    placeholder="XP"
                  />
                </div>
                <div className="col-span-3">
                  <TerminalInput
                    value={reward.rewardDescription || ''}
                    onChange={(v) =>
                      setRewards((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, rewardDescription: v } : r
                        )
                      )
                    }
                    placeholder="Description"
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={reward.rewardType}
                    onChange={(e) =>
                      setRewards((prev) =>
                        prev.map((r, i) =>
                          i === idx
                            ? { ...r, rewardType: e.target.value as RewardType }
                            : r
                        )
                      )
                    }
                    className="w-full bg-black border border-white/20 text-white text-sm px-2 py-2 font-mono-data"
                  >
                    {rewardTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex items-center gap-4">
          <TerminalButton variant="lime" onClick={saveGoals}>
            SAVE CONFIG
          </TerminalButton>
          {saved && (
            <span className="text-xs font-mono-data text-lime">[ CONFIG STORED ]</span>
          )}
        </div>
      </main>
    </div>
  );
}
