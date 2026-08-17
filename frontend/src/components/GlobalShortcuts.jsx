import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Command } from 'lucide-react';

/**
 * Global keyboard shortcuts.
 *   /         → focus the navbar search input
 *   g h       → go home
 *   g a       → go to /post-ad
 *   g m       → go to /my-ads
 *   ?         → open shortcuts help
 *   Esc       → close help / blur active input
 *
 * Mount once near the root (App.jsx).
 */
const SHORTCUTS = [
  { keys: '/',     description: 'Focus search' },
  { keys: 'g h',   description: 'Go to home' },
  { keys: 'g a',   description: 'Post an ad' },
  { keys: 'g m',   description: 'My ads' },
  { keys: 'g f',   description: 'Favorites' },
  { keys: '?',     description: 'Show shortcuts' },
  { keys: 'Esc',   description: 'Close dialog / blur input' },
];

function isTypingInField(target) {
  if (!target) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export default function GlobalShortcuts() {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingG, setPendingG] = useState(false);

  useEffect(() => {
    if (!pendingG) return;
    const t = setTimeout(() => setPendingG(false), 1200);
    return () => clearTimeout(t);
  }, [pendingG]);

  useEffect(() => {
    const onKey = (e) => {
      // Always allow Esc — useful even while typing
      if (e.key === 'Escape') {
        if (helpOpen) { setHelpOpen(false); return; }
        if (document.activeElement && isTypingInField(document.activeElement)) {
          document.activeElement.blur();
        }
        return;
      }

      // Don't intercept shortcuts while user is typing in a field
      if (isTypingInField(e.target)) return;

      // "?" — open help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // "/" — focus the search input in the navbar
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const input = document.querySelector('input[type="search"], input[placeholder*="Search" i]');
        if (input) {
          e.preventDefault();
          input.focus();
          input.select?.();
        }
        return;
      }

      // "g" prefix navigation
      if (pendingG) {
        if (e.key === 'h') { e.preventDefault(); navigate('/');         setPendingG(false); return; }
        if (e.key === 'a') { e.preventDefault(); navigate('/post-ad');  setPendingG(false); return; }
        if (e.key === 'm') { e.preventDefault(); navigate('/my-ads');   setPendingG(false); return; }
        if (e.key === 'f') { e.preventDefault(); navigate('/favorites');setPendingG(false); return; }
        setPendingG(false);
        return;
      }
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setPendingG(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [helpOpen, pendingG, navigate]);

  if (!helpOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={() => setHelpOpen(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-indigo-600" />
            <h2 id="shortcuts-title" className="text-lg font-bold text-gray-900">Keyboard shortcuts</h2>
          </div>
          <button
            onClick={() => setHelpOpen(false)}
            aria-label="Close"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between gap-4 py-1.5">
              <span className="text-sm text-gray-600">{s.description}</span>
              <Kbd>{s.keys}</Kbd>
            </div>
          ))}
        </div>
        <p className="px-6 pb-5 pt-1 text-xs text-gray-400">
          Tip: press <Kbd>?</Kbd> anywhere to open this list.
        </p>
      </div>
    </div>
  );
}

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs font-mono font-semibold text-gray-700 shadow-sm">
      {children}
    </kbd>
  );
}
