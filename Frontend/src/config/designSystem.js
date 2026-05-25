/**
 * DESIGN SYSTEM - Design Tokens & Configuration
 * 
 * This file centralizes all design tokens for consistency across the application.
 * Used by components, pages, and custom hooks.
 */

export const COLORS = {
  // Brand Colors - Páginas Amarillas Modern
  brand: {
    yellow: '#FDD600',
    yellowHover: '#E6C200',
    yellowLight: '#FFF4B8',
  },
  
  // Dark Mode - Premium Blacks
  dark: {
    primary: '#111111',
    secondary: '#1A1A1A',
    tertiary: '#2A2A2A',
    quaternary: '#333333',
    text: '#F2F2F2',
    textSecondary: '#E0E0E0',
  },
  
  // Neutral Grays
  neutral: {
    50: '#F9F9F9',
    100: '#F2F2F2',
    200: '#E6E6E6',
    300: '#D1D1D1',
    400: '#999999',
    500: '#666666',
    600: '#4D4D4D',
    700: '#333333',
    800: '#2A2A2A',
    900: '#111111',
  },
  
  // Status Colors - SaaS Enterprise
  status: {
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    successLight: '#DCFCE7',
    dangerLight: '#FEE2E2',
    warningLight: '#FEF3C7',
    infoLight: '#DBEAFE',
  },
};

export const TYPOGRAPHY = {
  // Font families
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  
  // Weights
  fontWeights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  // Font sizes with line heights
  fontSizes: {
    h1: { size: '32px', lineHeight: '40px', weight: 700 },
    h2: { size: '24px', lineHeight: '32px', weight: 700 },
    h3: { size: '20px', lineHeight: '28px', weight: 600 },
    body: { size: '16px', lineHeight: '24px', weight: 400 },
    bodyMedium: { size: '16px', lineHeight: '24px', weight: 500 },
    bodySemibold: { size: '16px', lineHeight: '24px', weight: 600 },
    caption: { size: '14px', lineHeight: '20px', weight: 400 },
    captionSemibold: { size: '14px', lineHeight: '20px', weight: 600 },
    xs: { size: '12px', lineHeight: '16px', weight: 400 },
    xsSemibold: { size: '12px', lineHeight: '16px', weight: 600 },
  },
};

export const SPACING = {
  // Base: 4px units
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
  '7xl': '80px',
  '8xl': '96px',
};

export const BORDER_RADIUS = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
};

export const SHADOWS = {
  // Subtle SaaS shadows
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  
  // Elevation shadows (for hover effects)
  elevationSm: '0 2px 4px rgba(0, 0, 0, 0.08)',
  elevationMd: '0 4px 12px rgba(0, 0, 0, 0.12)',
  elevationLg: '0 8px 24px rgba(0, 0, 0, 0.15)',
};

export const TRANSITIONS = {
  // Duration in ms
  fast: 150,
  base: 200,
  slow: 300,
  slower: 500,
  
  // Timing functions
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

export const Z_INDEX = {
  base: 1,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  max: 9999,
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Helper function to get CSS transition string
export const getTransition = (property = 'all', duration = 'base', timing = 'smooth') => {
  return `${property} ${TRANSITIONS[duration]}ms ${TRANSITIONS[timing]}`;
};

// Export as a single theme object for easier consumption
export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  transitions: TRANSITIONS,
  zIndex: Z_INDEX,
  breakpoints: BREAKPOINTS,
  getTransition,
};

export default THEME;
