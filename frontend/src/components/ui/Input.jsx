import React, { forwardRef, useId } from 'react';

/**
 * Input — uses existing .input-field and .label classes. Same look.
 * Adds: label, hint, error message, left icon, right slot — all optional.
 */
const Input = forwardRef(function Input({
  label,
  hint,
  error,
  required = false,
  leftIcon: LeftIcon = null,
  rightSlot = null,
  className = '',
  id,
  ...props
}, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <LeftIcon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={[
            'input-field',
            LeftIcon ? 'pl-10' : '',
            rightSlot ? 'pr-10' : '',
            error ? '!border-red-300 focus:!border-red-500' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />
        {rightSlot && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;

export const Textarea = forwardRef(function Textarea({
  label, hint, error, required = false, className = '', id, rows = 4, ...props
}, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        className={['input-field resize-y', error ? '!border-red-300' : '', className].filter(Boolean).join(' ')}
        {...props}
      />
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p>
        : hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
});

export const Select = forwardRef(function Select({
  label, hint, error, required = false, className = '', id, children, ...props
}, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        className={['input-field', error ? '!border-red-300' : '', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p>
        : hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
});
