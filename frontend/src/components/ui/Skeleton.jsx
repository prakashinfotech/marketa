import React from 'react';

/**
 * Skeleton — content-shaped placeholder during data fetch.
 * Uses Tailwind animate-pulse for a subtle shimmer (matches existing patterns).
 */
export default function Skeleton({
  className = '',
  rounded = 'md',
  as: Component = 'div',
  ...props
}) {
  const r = { sm: 'rounded', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl', full: 'rounded-full' }[rounded] || 'rounded-md';
  return (
    <Component
      aria-hidden="true"
      className={`bg-gray-200 animate-pulse ${r} ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

/** Ad-card skeleton — matches the AdCard layout used in SearchResults / HomePage. */
export function SkeletonAdCard() {
  return (
    <div className="card p-3" aria-hidden="true">
      <Skeleton className="h-40 w-full mb-3" rounded="xl" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonAdCard key={i} />)}
    </div>
  );
}
