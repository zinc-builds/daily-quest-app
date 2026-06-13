'use client';

import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import {
  Panel,
  SectionHeader,
  TerminalButton,
  TerminalInput,
  DataLabel,
  DataValue,
  ProgressBar,
} from '@/components/MarathonUI';
import { loadState, addReview } from '@/lib/storage';
import { getCurrentBattlepass, getRewardsForBattlepass } from '@/lib/battlepass';
import { buildMonthlyReview } from '@/lib/review';
import type { AppState, MonthlyReview } from '@/lib/types';

const prompts = [
  'Which daily was easiest to maintain?',
  'Which daily was hardest?',
  'Which daily created the most positive impact?',
  'Was the XP target realistic?',
  'Were the rewards motivating?',
  'Did any reward feel too small, too large, or poorly matched?',
  'Should any daily be replaced next month?',
  'What should the theme of next month be?',
];

export default function ReviewPage() {
  const [state, setState] = useState<AppState>({ dailyGoals: [], completions: [], battlepasses: [], rewards: [], reviews: [] });
  const [notes, setNotes] = useState('');
  const [review, setReview] = useState<MonthlyReview | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadState();
    setState(s);
    const bp = getCurrentBattlepass(s.battlepasses);
    if (bp) {
      const rewards = getRewardsForBattlepass(s.rewards, bp.id);
      setReview(buildMonthlyReview(bp, s.dailyGoals, s.completions, rewards));
    }
  }, []);

  function saveReview() {
    if (!review) return;
    const final = { ...review, notes };
    addReview(final);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <SectionHeader>MONTHLY REVIEW</SectionHeader>

        {!review ? (
          <Panel>
            <p className="text-white/50">No active battlepass to review.</p>
          </Panel>
        ) : (
          <>
            <Panel title="PERFORMANCE SUMMARY">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <DataLabel>XP EARNED</DataLabel>
                  <DataValue>{review.totalXpEarned.toLocaleString()}</DataValue>
                </div>
                <div>
                  <DataLabel>AVAILABLE</DataLabel>
                  <DataValue>{review.totalXpAvailable.toLocaleString()}</DataValue>
                </div>
                <div>
                  <DataLabel>PERFECT DAYS</DataLabel>
                  <DataValue>{review.perfectDays}</DataValue>
                </div>
                <div>
                  <DataLabel>BEST STREAK</DataLabel>
                  <DataValue>{review.bestStreak}</DataValue>
                </div>
              </div>
              <div className="mb-2">
                <DataLabel>COMPLETION {review.completionPercentage}%</DataLabel>
              </div>
              <ProgressBar current={review.totalXpEarned} max={review.totalXpAvailable} />
            </Panel>

            <Panel title="DAILY COMPLETION RATES">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {state.dailyGoals.filter((g) => g.active).map((goal) => (
                  <div key={goal.id} className="flex justify-between border border-white/10 px-3 py-2">
                    <span className="text-sm">{goal.name}</span>
                    <span className="text-sm font-mono-data text-lime">
                      {review.dailyCompletionRates[goal.id] ?? 0}%
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="REWARDS">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <DataLabel>UNLOCKED</DataLabel>
                  <DataValue>{review.rewardsUnlocked}</DataValue>
                </div>
                <div>
                  <DataLabel>CLAIMED</DataLabel>
                  <DataValue>{review.rewardsClaimed}</DataValue>
                </div>
                <div>
                  <DataLabel>UNCLAIMED</DataLabel>
                  <DataValue>{review.rewardsUnlocked - review.rewardsClaimed}</DataValue>
                </div>
              </div>
            </Panel>

            <Panel title="REFLECTION PROMPTS">
              <div className="space-y-4">
                {prompts.map((prompt, idx) => (
                  <div key={idx}>
                    <p className="text-xs text-white/60 font-mono-data mb-1">
                      {idx + 1}. {prompt}
                    </p>
                  </div>
                ))}
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type your monthly reflection here..."
                  rows={6}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-lime focus:outline-none font-mono-data resize-none"
                />
              </div>
            </Panel>

            <div className="flex items-center gap-4">
              <TerminalButton variant="lime" onClick={saveReview}>
                SAVE REVIEW
              </TerminalButton>
              {saved && (
                <span className="text-xs font-mono-data text-lime">[ REVIEW ARCHIVED ]</span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
