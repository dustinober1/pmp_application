'use client';

export function QuestionSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Question text skeleton */}
      <div className="h-6 bg-[var(--secondary)] rounded w-3/4 mb-8"></div>
      
      {/* Options skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-14 bg-[var(--secondary)] rounded"></div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 flex items-center gap-4">
        <div className="h-4 bg-[var(--secondary)] rounded w-20"></div>
        <div className="h-4 bg-[var(--secondary)] rounded w-16"></div>
      </div>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--foreground)] font-medium">Loading questions...</p>
        <p className="text-sm text-[var(--foreground-muted)]">Fetching next batch</p>
      </div>
    </div>
  );
}
