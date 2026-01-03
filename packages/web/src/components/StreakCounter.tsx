'use client';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  totalAnswered: number;
  correctCount: number;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  totalAnswered,
  correctCount,
}: StreakCounterProps) {
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="font-semibold mb-3 text-sm text-[var(--foreground)]">Your Progress</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-1">
            🔥 {currentStreak}
          </div>
          <div className="text-xs text-[var(--foreground-muted)] mt-1">Current Streak</div>
        </div>

        {/* Longest Streak */}
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
          <div className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-1">
            🏆 {longestStreak}
          </div>
          <div className="text-xs text-[var(--foreground-muted)] mt-1">Best Streak</div>
        </div>

        {/* Accuracy */}
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="text-3xl font-bold text-green-400">{accuracy}%</div>
          <div className="text-xs text-[var(--foreground-muted)] mt-1">Accuracy</div>
        </div>

        {/* Questions Answered */}
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <div className="text-3xl font-bold text-blue-400">{totalAnswered}</div>
          <div className="text-xs text-[var(--foreground-muted)] mt-1">Answered</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-[var(--foreground-muted)] mb-1">
          <span>Session Progress</span>
          <span>{Math.round((totalAnswered / Math.max(totalAnswered + (20 - (totalAnswered % 20 || 20)), 1)) * 100)}%</span>
        </div>
        <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-purple-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (totalAnswered / 20) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
