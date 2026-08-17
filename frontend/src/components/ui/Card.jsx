import React from 'react';

/**
 * Card — uses the existing .card class from index.css.
 * Wrapper to standardize padding & semantics across the app.
 */
export default function Card({
  as: Component = 'div',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...props
}) {
  const paddingClass = {
    none: '',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
  }[padding] ?? 'p-6';

  const classes = [
    'card',
    paddingClass,
    interactive ? 'cursor-pointer hover:-translate-y-0.5' : '',
    className,
  ].filter(Boolean).join(' ');

  return <Component className={classes} {...props}>{children}</Component>;
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {title && <h3 className="text-base font-bold text-gray-900 truncate">{title}</h3>}
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
