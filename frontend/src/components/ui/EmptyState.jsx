import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — consistent empty/zero-data UI.
 * Visual style matches the indigo brand (light indigo icon background).
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description = null,
  action = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-indigo-500" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
