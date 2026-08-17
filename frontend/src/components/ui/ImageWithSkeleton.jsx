import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * ImageWithSkeleton — drop-in replacement for <img>.
 * - Lazy-loads (loading="lazy", decoding="async")
 * - Shows a skeleton placeholder until the image loads
 * - Falls back to a friendly broken-image state on error
 *
 * Pass `aspect` (e.g. "aspect-square", "aspect-[4/3]") or size via className/wrapperClassName.
 */
export default function ImageWithSkeleton({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  aspect = '',
  fallbackSrc = null,
  loading = 'lazy',
  ...props
}) {
  const [status, setStatus] = useState('loading'); // loading | loaded | error
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setStatus('loading');
    } else {
      setStatus('error');
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${aspect} ${wrapperClassName}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" aria-hidden="true" />
      )}
      {status === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <ImageOff className="w-6 h-6 mb-1" aria-hidden="true" />
          <span className="text-xs">Image unavailable</span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'} ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
