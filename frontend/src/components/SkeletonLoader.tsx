/**
 * SkeletonLoader — animated placeholder shown while data loads.
 * Matches the dark theme. Used on every page that fetches from Firestore.
 */

interface SkeletonProps {
  rows?: number;
  className?: string;
}

/** Single animated skeleton bar */
export function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-800/60 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Table skeleton — mimics a device list */
export function TableSkeleton({ rows = 6 }: SkeletonProps) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading…">
      {/* Header */}
      <div className="flex gap-3 px-3 py-2">
        <SkeletonBar className="h-3 w-4" />
        <SkeletonBar className="h-3 w-32" />
        <SkeletonBar className="h-3 w-20 ml-auto" />
        <SkeletonBar className="h-3 w-16" />
        <SkeletonBar className="h-3 w-20" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900/40 border border-slate-800/40"
          style={{ opacity: 1 - i * 0.12 }}
        >
          <SkeletonBar className="h-4 w-4 rounded" />
          <SkeletonBar className="h-4 w-40" />
          <SkeletonBar className="h-4 w-24" />
          <SkeletonBar className="h-4 w-28 ml-auto" />
          <SkeletonBar className="h-6 w-20 rounded-full" />
          <SkeletonBar className="h-7 w-16 rounded-lg" />
        </div>
      ))}
      <span className="sr-only">Loading devices…</span>
    </div>
  );
}

/** Card skeleton — for dashboard stat cards */
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <SkeletonBar className="h-3 w-20" />
          <SkeletonBar className="h-8 w-16" />
          <SkeletonBar className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
