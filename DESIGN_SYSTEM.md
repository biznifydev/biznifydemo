# Biznify Design System

A comprehensive design system for consistent, scalable UI development across all Biznify applications.

## 🎨 Color Palette

### Background Colors
- **Primary**: `#fafafa` - Main page and sidebar background
- **Secondary**: `#ffffff` - Card backgrounds
- **Sidebar**: `#fafafa` - Sidebar background

### Border Colors
- **Primary**: `#f2f3f7` - Main border color for cards and inputs
- **Secondary**: `#e5e7eb` - Secondary border
- **Accent**: `#d1d5db` - Accent border

### Text Colors
- **Primary**: `#111827` (gray-800) - Main headings and important text
- **Secondary**: `#4b5563` (gray-600) - Body text
- **Muted**: `#6b7280` (gray-500) - Captions and metadata
- **Light**: `#9ca3af` (gray-400) - Placeholder text

### Status Colors
- **Success**: `#059669` (green-600) - Positive states
- **Error**: `#dc2626` (red-600) - Error states
- **Warning**: `#d97706` (amber-600) - Warning states
- **Info**: `#2563eb` (blue-600) - Information states

## 📝 Typography

### Heading Styles
```typescript
import { designUtils } from '@/lib/design-system'

// Usage
<h1 className={designUtils.heading('h1')}>Page Title</h1>
<h2 className={designUtils.heading('h2')}>Section Title</h2>
<h3 className={designUtils.heading('h3')}>Subsection Title</h3>
```

### Body Text Styles
```typescript
// Usage
<p className={designUtils.body('large')}>Large body text</p>
<p className={designUtils.body('base')}>Regular body text</p>
<p className={designUtils.body('small')}>Small body text</p>
<p className={designUtils.body('caption')}>Caption text</p>
```

### Typography Scale
- **H1**: `text-2xl font-bold` (24px)
- **H2**: `text-xl font-semibold` (20px)
- **H3**: `text-lg font-semibold` (18px)
- **H4**: `text-base font-medium` (16px)
- **H5**: `text-sm font-medium` (14px)
- **H6**: `text-xs font-medium` (12px)

## 🏗️ Layout Components

### Container Classes
```typescript
import { layout } from '@/lib/design-system'

// Page container
<div className={layout.container.page}>

// Sidebar
<div className={layout.container.sidebar}>

// Main content area
<main className={layout.container.main}>

// Card containers
<Card className={layout.container.card}>      // Outer card (no border)
<Card className={layout.container.cardInner}> // Inner card (with border)
```

### Grid Layouts
```typescript
// Stats grid (4 columns on large screens)
<div className={layout.grid.stats}>

// Cards grid (2 columns on medium screens)
<div className={layout.grid.cards}>

// List grid
<div className={layout.grid.list}>
```

## 🧩 Component Variants

### Button Styles
```typescript
import { components } from '@/lib/design-system'

// Primary button
<Button className={components.button.primary}>Primary Action</Button>

// Secondary button
<Button className={components.button.secondary}>Secondary Action</Button>

// Outline button
<Button className={components.button.outline}>Outline Action</Button>
```

### Input Styles
```typescript
// Base input
<input className={components.input.base} />

// Search input
<input className={components.input.search} />
```

## 📏 Spacing System

### Consistent Spacing
```typescript
import { spacing } from '@/lib/design-system'

// Padding
<div className={spacing.padding.lg}>  // 24px padding
<div className={spacing.padding.xl}>  // 32px padding

// Margin
<div className={spacing.margin.base}> // 16px margin
<div className={spacing.margin.lg}>   // 24px margin

// Gap
<div className={spacing.gap.xl}>      // 32px gap
```

## 🎯 Best Practices

### 1. Always Use Design System Tokens
```typescript
// ✅ Good - Using design system
<h1 className={designUtils.heading('h1')}>Title</h1>
<Card className={layout.container.cardInner}>

// ❌ Bad - Hardcoded values
<h1 className="text-3xl font-bold text-gray-800">Title</h1>
<Card className="bg-white border border-gray-200">
```

### 2. Consistent Component Structure
```typescript
// ✅ Good - Consistent page structure
export default function MyPage() {
  return (
    <Card className={layout.container.card}>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h1 className={designUtils.heading('h1')}>Page Title</h1>
            <p className={designUtils.body('base')}>Description</p>
          </div>
          <div className={layout.grid.cards}>
            {/* Content cards */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Responsive Design
- Use the predefined grid classes for responsive layouts
- Always test on mobile, tablet, and desktop
- Use semantic HTML with proper heading hierarchy

### 4. Accessibility
- Maintain proper color contrast ratios
- Use semantic HTML elements
- Include proper ARIA labels where needed
- Ensure keyboard navigation works

## 🔧 Adding New Components

### 1. Define Component Variants
```typescript
// In lib/design-system.ts
export const components = {
  // ... existing components
  newComponent: {
    primary: 'bg-gray-700 hover:bg-gray-800 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  }
}
```

### 2. Add Type Definitions
```typescript
// Add to the existing types
export type ComponentType = keyof typeof components
```

### 3. Update Documentation
- Add usage examples to this file
- Include accessibility considerations
- Document any special behavior

## 🚀 Migration Guide

### From Hardcoded Styles
```typescript
// Before
<div className="bg-white border border-gray-200 rounded-lg p-6">

// After
<Card className={layout.container.cardInner}>
  <CardContent className="p-6">
```

### From Inline Typography
```typescript
// Before
<h1 className="text-3xl font-bold text-gray-800">

// After
<h1 className={designUtils.heading('h1')}>
```

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

When adding new design tokens or components:

1. Update `lib/design-system.ts`
2. Add TypeScript types
3. Update this documentation
4. Create usage examples
5. Test across different screen sizes
6. Ensure accessibility compliance 