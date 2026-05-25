/**
 * Enterprise Modal Component (New)
 * Backdrop blur, animations, responsive sizing
 */

import React, { useEffect } from 'react';
import { Z_INDEX, SHADOWS, BORDER_RADIUS } from '../../config/designSystem';

export const Modal = React.forwardRef(({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeButton = true,
  className = '',
  ...props
}, ref) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-96',
    md: 'w-[500px]',
    lg: 'w-[640px]',
    xl: 'w-[800px]',
    full: 'w-11/12',
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
      style={{ zIndex: Z_INDEX.modalBackdrop }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={ref}
        className={`
          relative bg-white rounded-lg overflow-hidden
          max-h-[90vh] overflow-y-auto
          ${sizeClasses[size]}
          animate-scale-in
          ${className}
        `}
        style={{
          boxShadow: SHADOWS['2xl'],
          zIndex: Z_INDEX.modal,
        }}
        {...props}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-6 py-4 sticky top-0 bg-white">
            <h2 className="text-h3 font-bold text-neutral-900">
              {title}
            </h2>
            {closeButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-neutral-100 rounded-md transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-neutral-200 px-6 py-4 bg-neutral-50 flex gap-3 justify-end sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
