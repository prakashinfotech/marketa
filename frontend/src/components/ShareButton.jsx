import React, { useEffect, useRef, useState } from 'react';
import { Share2, Copy, Check, MessageCircle, MessageSquare, Mail } from 'lucide-react';
import { useToast } from '../ToastContext';

/**
 * ShareButton — visible on ad detail / any sharable page.
 *
 * Behavior:
 *   - On mobile (Web Share API available) → opens the native share sheet.
 *   - Otherwise → opens a small menu with: Copy link, WhatsApp, Twitter/X, Facebook, Email.
 *
 * Props:
 *   url       — defaults to window.location.href
 *   title     — page title (used by Web Share + tweet text)
 *   text      — optional description for share payload
 *   className — extra classes on the trigger button
 */
export default function ShareButton({
  url,
  title = 'Check this out on Marketa',
  text = '',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const toast = useToast();

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleNativeOrOpen = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User canceled or share failed — fall back to menu
      }
    }
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const enc = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${enc(`${title} ${shareUrl}`)}`,
    sms:      `sms:?body=${enc(`${title} ${shareUrl}`)}`,
    email:    `mailto:?subject=${enc(title)}&body=${enc(`${text ? text + '\n\n' : ''}${shareUrl}`)}`,
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleNativeOrOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Share"
        className={`inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold text-sm px-4 py-2 rounded-xl transition-all ${className}`}
      >
        <Share2 className="w-4 h-4" aria-hidden="true" />
        Share
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-40 animate-scale-in"
        >
          <button
            type="button"
            onClick={copyLink}
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <ShareLink href={links.whatsapp} icon={MessageCircle}  label="WhatsApp" />
          <ShareLink href={links.sms}      icon={MessageSquare}  label="SMS" />
          <ShareLink href={links.email}    icon={Mail}           label="Email" />
        </div>
      )}
    </div>
  );
}

function ShareLink({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      role="menuitem"
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
    >
      <Icon className="w-4 h-4 text-gray-400" aria-hidden="true" />
      {label}
    </a>
  );
}
