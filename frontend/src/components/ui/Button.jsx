import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button — matches existing indigo/purple design language.
 * Variants reuse current classes so visuals stay identical.
 */
const VARIANTS = {
  primary:   'btn-primary',
  secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm',
  ghost:     'text-gray-600 hover:text-indigo-600 hover:bg-gray-50 font-semibold text-sm px-4 py-2 rounded-xl transition-colors',
  danger:    'bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm',
  amber:     'flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-200/40 hover:shadow-lg hover:shadow-amber-300/40 transition-all',
};

const SIZES = {
  sm: '!px-3 !py-1.5 !text-xs',
  md: '',
  lg: '!px-6 !py-3 !text-base',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const baseFlex = 'inline-flex items-center justify-center gap-2';
  const classes = [
    baseFlex,
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || '',
    fullWidth ? 'w-full' : '',
    disabled || loading ? 'opacity-60 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component
      className={classes}
      disabled={Component === 'button' ? (disabled || loading) : undefined}
      aria-busy={loading || undefined}
      aria-disabled={(disabled || loading) || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4" aria-hidden="true" />
      ) : null}
      {children}
      {!loading && RightIcon ? <RightIcon className="w-4 h-4" aria-hidden="true" /> : null}
    </Component>
  );
}
