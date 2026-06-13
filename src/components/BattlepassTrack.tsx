'use client';

import type { Battlepass, BattlepassReward } from '@/lib/types';
import { Panel, ProgressBar, DataLabel, DataValue, TerminalButton } from './MarathonUI';
import { currentLevel, nextReward } from '@/lib/battlepass';
import { updateReward } from '@/lib/storage';

export function BattlepassTrack({
  battlepass,
  rewards,
  onChange,
}: {
  battlepass: Battlepass;
  rewards: BattlepassReward[];
  onChange: () => void;
}) {
  const sorted = [...rewards].sort((a, b) => a.level - b.level);
  const top = sorted[sorted.length - 1];
  const level = currentLevel(battlepass, rewards);
  const next = nextReward(battlepass, rewards);

  function claimReward(id: string) {
    updateReward(id, {
      claimed: true,
      claimedAt: new Date().toISOString(),
    });
    onChange();
  }

  return (
    <Panel title={`BATTLEPASS // ${battlepass.name.toUpperCase()}`}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <DataLabel>LEVEL</DataLabel>
          <DataValue>{level}</DataValue>
        </div>
        <div>
          <DataLabel>XP EARNED</DataLabel>
          <DataValue>
            {battlepass.xpEarned.toLocaleString()} / {top?.xpRequired.toLocaleString()}
          </DataValue>
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar current={battlepass.xpEarned} max={top?.xpRequired ?? 1} />
      </div>

      {next && (
        <p className="text-xs font-mono-data text-white/60 mb-4">
          NEXT REWARD IN <span className="text-lime">{next.distance.toLocaleString()} XP</span> — {next.reward.rewardName}
        </p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {sorted.map((reward) => (
          <div
            key={reward.id}
            className={`flex items-center justify-between border px-3 py-2 ${
              reward.claimed
                ? 'border-lime/30 bg-lime/5'
                : reward.unlocked
                ? 'border-lime'
                : 'border-white/10'
            }`}
          >
            <div>
              <div className="text-xs font-mono-data">
                <span className="text-white/40">LVL {reward.level}</span>{' '}
                <span className={reward.unlocked ? 'text-lime' : 'text-white'}>
                  {reward.rewardName.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-white/40">
                {reward.xpRequired.toLocaleString()} XP
                {reward.rewardDescription && ` // ${reward.rewardDescription}`}
              </div>
            </div>
            {reward.unlocked && !reward.claimed && (
              <TerminalButton variant="lime" onClick={() => claimReward(reward.id)}>
                CLAIM
              </TerminalButton>
            )}
            {reward.claimed && (
              <span className="text-[10px] font-mono-data text-lime">[ CLAIMED ]</span>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
