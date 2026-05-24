/**
 * Enterprise Card Component (New)
 * Modern card with elevation, hover effects, and flexible layouts
 */

import React from 'react';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../config/designSystem';

export function Card({
  children,
  elevated = false,
  hoverable = true,
  padding = 'md',
  className = '',
  ...props
}) {
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
    xl: 'p-8 md:p-10',
  };

  const shadowStyle = elevated ? SHADOWS.md : SHADOWS.sm;

  return (
    <div
      className={`
        bg-white rounded-lg
        transition-all duration-300 ease-out
        ${paddingStyles[padding]}
        ${hoverable ? 'hover:shadow-lg hover:-translate-y-1 cursor-default' : ''}
        ${className}
      `}
      style={{
        boxShadow: shadowStyle,
        borderRadius: BORDER_RADIUS.lg,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
