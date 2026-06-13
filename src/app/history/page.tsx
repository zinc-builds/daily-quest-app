'use client';

import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { Panel, SectionHeader, DataLabel, DataValue } from '@/components/MarathonUI';
import { loadState } from '@/lib/storage';
import { xpForDate, isPerfectDay } from '@/lib/xp';
import { daysInMonth } from '@/lib/dates';
import type { AppState } from '@/lib/types';

export default function HistoryPage() {
  const [state, setState] = useState<AppState>({ dailyGoals: [], completions: [], battlepasses: [], rewards: [], reviews: [] });
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    setState(loadState());
  }, []);

  const activeGoals = state.dailyGoals.filter((g) => g.active);
  const monthDays = daysInMonth(new Date(`${month}-01`));

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <SectionHeader>MISSION LOG</SectionHeader>

        <Panel>
          <div className="flex items-center gap-4 mb-4">
            <DataLabel>MONTH</DataLabel>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-black border border-white/20 text-white px-3 py-2 font-mono-data focus:border-lime focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-2 px-2 text-[10px] font-mono-data text-white/50">DATE</th>
                  {activeGoals.map((g) => (
                    <th key={g.id} className="py-2 px-2 text-[10px] font-mono-data text-white/50">
                      {g.name.toUpperCase()}
                    </th>
                  ))}
                  <th className="py-2 px-2 text-[10px] font-mono-data text-white/50">XP</th>
                  <th className="py-2 px-2 text-[10px] font-mono-data text-white/50">PERFECT</th>
                </tr>
              </thead>
              <tbody>
                {monthDays.map((date) => {
                  const { total } = xpForDate(state.dailyGoals, state.completions, date);
                  const perfect = isPerfectDay(state.dailyGoals, state.completions, date);
                  return (
                    <tr key={date} className="border-b border-white/5">
                      <td className="py-2 px-2 text-xs font-mono-data">{date}</td>
                      {activeGoals.map((g) => {
                        const done = state.completions.some(
                          (c) => c.dailyGoalId === g.id && c.date === date && c.completed
                        );
                        return (
                          <td key={g.id} className="py-2 px-2 text-xs">
                            {done ? (
                              <span className="text-lime">✓</span>
                            ) : (
                              <span className="text-white/20">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-xs font-mono-data text-lime">{total}</td>
                      <td className="py-2 px-2 text-xs">
                        {perfect ? <span className="text-lime">YES</span> : <span className="text-white/20">NO</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {state.reviews.length > 0 && (
          <Panel title="ARCHIVED REVIEWS">
            <div className="space-y-3">
              {state.reviews.map((review) => {
                const bp = state.battlepasses.find((b) => b.id === review.battlepassId);
                return (
                  <div key={review.id} className="border border-white/10 p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-mono-data">{bp?.name || 'Unknown Pass'}</span>
                      <span className="text-xs text-lime">{review.completionPercentage}%</span>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-3">{review.notes}</p>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
      </main>
    </div>
  );
}
