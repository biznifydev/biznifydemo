# Biznify

A scalable, modular Next.js 14 business management platform built with the App Router, Tailwind CSS, and shadcn/ui.

## Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, and Tailwind CSS
- **Component Library**: shadcn/ui for consistent, accessible components
- **Responsive Design**: Mobile-first approach with responsive layout
- **Modular Architecture**: Easy to extend with new modules (Legal, Finance, HR, etc.)
- **Server Components**: Built with React Server Components by default
- **Type Safety**: Full TypeScript support throughout the application

## Project Structure

```
biznify/
├── app/
│   ├── layout.tsx              # Root layout with nav + sidebar
│   ├── page.tsx                # Dashboard page
│   ├── legal/
│   │   ├── page.tsx            # Legal documents page
│   │   └── components/
│   │       ├── TermsOfServiceCard.tsx
│   │       └── PrivacyPolicyCard.tsx
│   └── api/
│       └── legal/
│           └── route.ts        # Legal documents API
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── separator.tsx
│   └── layout/
│       ├── TopNav.tsx          # Top navigation
│       └── SideNav.tsx         # Sidebar navigation
├── lib/
│   ├── constants.ts            # App constants and navigation
│   └── utils.ts                # Utility functions
└── styles/
    └── globals.css             # Global styles and Tailwind
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd biznify
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

### Layout System
- **TopNav**: Sticky header with app branding and quick actions
- **SideNav**: Collapsible sidebar with navigation links
- **Main Content**: Responsive content area with proper overflow handling

### Component Design
- **Server Components**: Used by default for better performance
- **Client Components**: Only when interactivity is needed
- **Modular**: Each component is self-contained and reusable
- **TypeScript**: Full type safety with proper interfaces

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Consistent component library
- **CSS Variables**: Theme-aware color system
- **Responsive**: Mobile-first responsive design

## Extending the App

### Adding New Modules

1. Create a new directory under `app/` (e.g., `app/finance/`)
2. Add navigation item to `lib/constants.ts`
3. Create page component and any sub-components
4. Add API routes under `app/api/` if needed

### Example: Adding Finance Module

```typescript
// lib/constants.ts
export const NAVIGATION_ITEMS = [
  // ... existing items
  {
    title: "Finance",
    href: "/finance",
    icon: "DollarSign",
  },
]

// app/finance/page.tsx
export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Finance</h1>
      {/* Finance content */}
    </div>
  )
}
```

## API Routes

The app includes a placeholder API route for legal documents:

- `GET /api/legal` - Retrieve legal documents
- `POST /api/legal` - Update legal documents

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Keep components modular and reusable
4. Add proper TypeScript interfaces
5. Use Tailwind CSS for styling
6. Test responsive design on multiple screen sizes

## License

MIT License - see LICENSE file for details. 