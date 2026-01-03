"use client";

import { Skeleton } from "@/components/Skeleton";

export function FullPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-[var(--border)] glass" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </main>
    </div>
  );
}
