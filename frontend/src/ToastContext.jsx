import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Global Toast system.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Saved!');
 *   toast.error('Failed to save');
 *   toast.info('Heads up');
 *   toast.warning('Careful');
 *
 * Render <ToastProvider> at the root (wraps the app). It mounts a fixed-position
 * <ToastContainer/> automatically so you don't have to place it manually.
 */
const ToastContext = createContext(null);

let toastIdCounter = 0;
const nextId = () => ++toastIdCounter;

const VARIANT_STYLES = {
  success: {
    cls: 'toast-success',
    Icon: CheckCircle,
  },
  error: {
    cls: 'toast-error',
    Icon: AlertCircle,
  },
  info: {
    cls: 'bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-sky-800',
    Icon: Info,
  },
  warning: {
    cls: 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900',
    Icon: AlertTriangle,
  },
};

export function ToastProvider({ children, max = 4 }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, opts = {}) => {
    const id = nextId();
    const toast = {
      id,
      message,
      variant: opts.variant || 'info',
      duration: opts.duration ?? 4000,
      title: opts.title || null,
    };
    setToasts((curr) => {
      const next = [...curr, toast];
      return next.length > max ? next.slice(next.length - max) : next;
    });
    if (toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration);
    }
    return id;
  }, [dismiss, max]);

  const value = {
    show,
    dismiss,
    success: (msg, opts) => show(msg, { ...opts, variant: 'success' }),
    error:   (msg, opts) => show(msg, { ...opts, variant: 'error'   }),
    info:    (msg, opts) => show(msg, { ...opts, variant: 'info'    }),
    warning: (msg, opts) => show(msg, { ...opts, variant: 'warning' }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside a <ToastProvider>');
  }
  return ctx;
}

function ToastContainer({ toasts, onDismiss }) {
  // One Esc handler for the whole container — closes the most recent toast.
  // Previously each toast attached its own listener which caused every Esc
  // press to fire N close calls when multiple toasts were visible.
  useEffect(() => {
    if (toasts.length === 0) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const newest = toasts[toasts.length - 1];
      if (newest) onDismiss(newest.id);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toasts, onDismiss]);

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { cls, Icon } = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info;
  const [leaving, setLeaving] = useState(false);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto rounded-xl px-4 py-3 shadow-lg flex items-start gap-2.5 ${cls} ${leaving ? 'opacity-0 translate-x-2' : 'animate-slide-in'} transition-all duration-200`}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-bold text-sm">{toast.title}</p>}
        <p className="text-sm leading-snug">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Dismiss notification"
        className="-mr-1 p-1 rounded hover:bg-black/5 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
