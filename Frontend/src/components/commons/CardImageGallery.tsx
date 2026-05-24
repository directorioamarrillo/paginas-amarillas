import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, X, Store, ZoomIn } from 'lucide-react';
import "../../styles/cardImageGallery.css";

type Props = {
  images?: string[];
  alt?: string;
  badge?: string;
};

export default function CardImageGallery({ images = [], alt = 'imagen', badge }: Props) {
  const imgs = (images || []).slice(0, 5);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const hasImages = imgs && imgs.length > 0;

  const prev = useCallback((e?: React.MouseEvent) => { e && e.stopPropagation(); if (!hasImages) return; setIndex(i => (i - 1 + imgs.length) % imgs.length); }, [hasImages, imgs.length]);
  const next = useCallback((e?: React.MouseEvent) => { e && e.stopPropagation(); if (!hasImages) return; setIndex(i => (i + 1) % imgs.length); }, [hasImages, imgs.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndex(i => (i - 1 + imgs.length) % imgs.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIndex(i => (i + 1) % imgs.length);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, imgs.length]);

  return (
    <div
      className="w-full h-full relative group"
      onClick={() => hasImages && setOpen(true)}
      tabIndex={0}
      role="button"
      aria-label={`Galería de ${alt}`}
      onKeyDown={(e) => {
        if (!hasImages) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); }
      }}
    >
      {hasImages ? (
        <img src={imgs[index]} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <Store className="w-16 h-16 text-gray-300" />
        </div>
      )}

      {badge && (
        <div className="absolute left-3 bottom-3 bg-black/60 text-white text-xs px-2 py-1 rounded">{badge}</div>
      )}

      {hasImages && (
        <>
          <div className="absolute right-3 top-3 bg-black/60 text-white text-xs px-2 py-1 rounded" aria-live="polite">{index + 1}/{imgs.length}</div>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
            <ArrowLeft className="w-4 h-4" aria-hidden />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setOpen(true); }} className="absolute right-2 bottom-2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
            <ZoomIn className="w-4 h-4" aria-hidden />
          </button>

          <div className="absolute left-2 top-2 flex gap-2">
            {imgs.slice(0, 3).map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  alt={`${alt}-${i}`}
                  onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                  className={`w-10 h-10 object-cover rounded ${i === index ? 'ring-2 ring-white' : 'ring-1 ring-black/20'}`}
                />
                {imgs.length > 3 && i === 2 && (
                  <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center text-white text-sm">
                    +{imgs.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {open && hasImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" role="dialog" aria-modal="true" aria-label={`Imagen de ${alt}`} onClick={() => setOpen(false)}>
          <div className="relative max-w-4xl w-full mx-4 cig-modal">
            <button className="absolute right-2 top-2 bg-white rounded-full p-2 cig-control" onClick={(e) => { e.stopPropagation(); setOpen(false); }} aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
            <img src={imgs[index]} alt={alt} className="w-full h-[70vh] object-contain rounded transition-opacity duration-200" />
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="bg-white/80 p-2 rounded-full" aria-label="Anterior">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="bg-white/80 p-2 rounded-full" aria-label="Siguiente">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
