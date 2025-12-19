// Design System for Biznify
// This file contains all design tokens and utilities for consistent styling across the application

export const colors = {
  // Background colors
  background: {
    primary: '#fafafa',    // Main page background
    secondary: '#ffffff',  // Card backgrounds
    sidebar: '#fafafa',    // Sidebar background
  },
  
  // Border colors
  border: {
    primary: '#f2f3f7',    // Main border color
    secondary: '#e5e7eb',  // Secondary border
    accent: '#d1d5db',     // Accent border
  },
  
  // Text colors
  text: {
    primary: '#111827',    // Main text (gray-800)
    secondary: '#4b5563',  // Secondary text (gray-600)
    muted: '#6b7280',      // Muted text (gray-500)
    light: '#9ca3af',      // Light text (gray-400)
  },
  
  // Interactive colors
  interactive: {
    primary: '#374151',    // Primary button (gray-700)
    hover: '#1f2937',      // Hover state (gray-800)
    active: '#111827',     // Active state (gray-900)
  },
  
  // Status colors
  status: {
    success: '#059669',    // Green-600
    error: '#dc2626',      // Red-600
    warning: '#d97706',    // Amber-600
    info: '#2563eb',       // Blue-600
  }
} as const

export const typography = {
  // Font sizes
  size: {
    xs: 'text-xs',         // 12px
    sm: 'text-sm',         // 14px
    base: 'text-base',     // 16px
    lg: 'text-lg',         // 18px
    xl: 'text-xl',         // 20px
    '2xl': 'text-2xl',     // 24px
    '3xl': 'text-3xl',     // 30px
    '4xl': 'text-4xl',     // 36px
  },
  
  // Font weights
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
  
  // Line heights
  leading: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  },
  
  // Heading styles
  heading: {
    h1: 'text-2xl font-bold text-gray-800 leading-tight',
    h2: 'text-xl font-semibold text-gray-800 leading-tight',
    h3: 'text-lg font-semibold text-gray-800 leading-tight',
    h4: 'text-base font-medium text-gray-800 leading-tight',
    h5: 'text-sm font-medium text-gray-800 leading-tight',
    h6: 'text-xs font-medium text-gray-800 leading-tight',
  },
  
  // Body text styles
  body: {
    large: 'text-base text-gray-600 leading-relaxed',
    base: 'text-sm text-gray-600 leading-normal',
    small: 'text-xs text-gray-600 leading-normal',
    caption: 'text-xs text-gray-500 leading-normal',
  }
} as const

export const spacing = {
  // Padding
  padding: {
    xs: 'p-1',      // 4px
    sm: 'p-2',      // 8px
    base: 'p-4',    // 16px
    lg: 'p-6',      // 24px
    xl: 'p-8',      // 32px
    '2xl': 'p-12',  // 48px
  },
  
  // Margin
  margin: {
    xs: 'm-1',      // 4px
    sm: 'm-2',      // 8px
    base: 'm-4',    // 16px
    lg: 'm-6',      // 24px
    xl: 'm-8',      // 32px
    '2xl': 'm-12',  // 48px
  },
  
  // Gap
  gap: {
    xs: 'gap-1',    // 4px
    sm: 'gap-2',    // 8px
    base: 'gap-4',  // 16px
    lg: 'gap-6',    // 24px
    xl: 'gap-8',    // 32px
    '2xl': 'gap-12', // 48px
  }
} as const

export const layout = {
  // Container styles
  container: {
    page: 'min-h-screen bg-[#fafafa]',
    sidebar: 'w-64 bg-[#fafafa] border-r border-[#f2f3f7]',
    main: 'flex-1 overflow-auto p-6',
    card: 'bg-white border border-[#f2f3f7] rounded-lg max-w-7xl mx-auto',
    cardInner: 'bg-white border border-[#f2f3f7] rounded-lg',
    cardHeader: 'border-b border-[#f2f3f7] bg-gray-50 px-6 py-6 rounded-t-lg',
    statCard: 'bg-white border border-[#f2f3f7] rounded-lg w-full max-w-sm',
  },
  
  // Grid layouts
  grid: {
    stats: 'grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full justify-items-center',
    cards: 'grid gap-6 md:grid-cols-2 w-full',
    list: 'grid gap-4 w-full',
  }
} as const

export const components = {
  // Button variants
  button: {
    primary: 'bg-gray-700 hover:bg-gray-800 text-white border-0',
    secondary: 'border-[#f2f3f7] text-gray-700 hover:bg-gray-50',
    outline: 'border-gray-300 text-gray-700 hover:bg-gray-50',
  },
  
  // Card variants
  card: {
    container: 'bg-white border-0 rounded-lg',
    content: 'bg-white border border-[#f2f3f7] rounded-lg',
    header: 'border-b border-[#f2f3f7]',
  },
  
  // Input styles
  input: {
    base: 'w-full px-3 py-2 bg-white border border-[#f2f3f7] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
    search: 'w-full pl-10 pr-3 py-2 bg-white border border-[#f2f3f7] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
  }
} as const

// Utility functions for consistent styling
export const designUtils = {
  // Get heading class
  heading: (level: keyof typeof typography.heading) => typography.heading[level],
  
  // Get body text class
  body: (size: keyof typeof typography.body) => typography.body[size],
  
  // Get spacing class
  spacing: (type: keyof typeof spacing, size: keyof typeof spacing.padding) => spacing[type][size],
  
  // Get component variant
  component: (type: keyof typeof components, variant: string) => components[type][variant as keyof typeof components[typeof type]],
  
  // Get color
  color: (category: keyof typeof colors, shade: string) => colors[category][shade as keyof typeof colors[typeof category]],
} as const

// Type definitions for better TypeScript support
export type ColorCategory = keyof typeof colors
export type TypographySize = keyof typeof typography.size
export type TypographyWeight = keyof typeof typography.weight
export type SpacingSize = keyof typeof spacing.padding
export type ComponentType = keyof typeof components 