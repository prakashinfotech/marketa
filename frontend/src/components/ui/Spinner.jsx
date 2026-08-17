import React from 'react';

const SIZES = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

/** Same look as the existing inline loader (border-indigo-200/600 spinner). */
export default function Spinner({ size = 'md', className = '', label = 'Loading' }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block ${SIZES[size] || SIZES.md} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin ${className}`}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageSpinner({ label = 'Loading' }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label={label}>
      <Spinner size="lg" label={label} />
    </div>
  );
}
