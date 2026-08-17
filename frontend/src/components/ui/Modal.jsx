import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

const SIZES = {
  sm:    'max-w-sm',
  md:    'max-w-md',
  lg:    'max-w-lg',
  xl:    'max-w-2xl',
  '2xl': 'max-w-3xl',
};

/**
 * Accessible modal — visually identical to existing custom modals in the codebase
 * (white card, rounded-2xl, scale-in animation, backdrop blur).
 * Handles: Escape to close, scroll lock, focus trap on initial focus, ARIA.
 */
export default function Modal({
  open,
  onClose,
  title = null,
  description = null,
  size = 'md',
  closeOnBackdrop = true,
  showClose = true,
  footer = null,
  children,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Move focus into dialog for screen readers
    requestAnimationFrame(() => {
      dialogRef.current?.focus?.();
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl shadow-2xl border border-gray-100 w-full ${SIZES[size] || SIZES.md} animate-scale-in outline-none`}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="min-w-0">
              {title && <h2 id="modal-title" className="text-lg font-bold text-gray-900">{title}</h2>}
              {description && <p id="modal-description" className="mt-1 text-sm text-gray-500">{description}</p>}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-2 -mt-1 p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Confirm dialog — drop-in replacement for window.confirm().
 * Uses the visual style of confirmation modals already in the project.
 */
export function ConfirmDialog({
  open, onClose, onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  icon: Icon = AlertTriangle,
  iconBg = 'bg-red-100',
  iconColor = 'text-red-500',
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={loading ? undefined : onClose} showClose={false} size="sm">
      <div className="text-center -mt-2">
        <div className={`w-14 h-14 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`w-7 h-7 ${iconColor}`} aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-5">{description}</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button variant={variant} fullWidth onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
