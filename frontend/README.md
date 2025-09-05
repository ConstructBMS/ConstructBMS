# ConstructBMS Frontend

A modern, responsive frontend application built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### AppShell & Core Structure

- **Responsive Layout**: Grid-based layout with collapsible sidebar and sticky topbar
- **Theme System**: Light/Dark/System theme with persistent settings
- **Keyboard Shortcuts**:
  - `Cmd/Ctrl + B` - Toggle sidebar
  - `Cmd/Ctrl + K` - Focus global search
- **Lazy Loading**: All routes are lazy-loaded for optimal performance

### UI Components

- **Design System**: Consistent UI primitives built with Tailwind CSS
- **Accessibility**: ARIA-compliant components with keyboard navigation
- **Responsive**: Mobile-first design with breakpoint-specific layouts

### State Management

- **Zustand Stores**: Lightweight state management for theme and sidebar
- **React Query**: Server state management and caching
- **Persistent Storage**: Theme and sidebar preferences saved to localStorage

## 📁 Project Structure

```
frontend/src/
├── app/                    # Core application structure
│   ├── AppShell.tsx       # Main application shell
│   ├── routes.tsx         # Route configuration
│   ├── providers/         # Context providers
│   └── store/            # Zustand stores
├── components/            # Reusable UI components
│   ├── layout/           # Layout components
│   └── ui/               # Base UI primitives
├── lib/                  # Shared utilities
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript types
├── modules/              # Feature modules
│   ├── dashboard/        # Dashboard module
│   ├── projects/         # Project management
│   ├── settings/         # Settings module
│   └── ...               # Other modules
└── pages/                # Page components
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm

### Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Run type checking
pnpm typecheck
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript checks
- `pnpm test` - Run tests
- `pnpm prettier` - Check formatting
- `pnpm prettier:fix` - Fix formatting

## 🎨 Theming

The application supports three theme modes:

- **Light**: Clean, bright interface
- **Dark**: Dark mode for low-light environments
- **System**: Automatically follows OS preference

Themes are managed through Zustand and persist across sessions.

## 🧩 UI Components

### Available Components

- `Button` - Various button styles and sizes
- `Card` - Content containers with headers and footers
- `Input` - Form input fields
- `Switch` - Toggle switches
- `Dialog` - Modal dialogs
- `Tabs` - Tabbed interfaces
- `Table` - Data tables
- `Badge` - Status indicators

### Usage

```tsx
import { Button, Card } from '@/components/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant='default'>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## 🧪 Testing

Tests are located in `__tests__` directories alongside the code they test.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔧 Configuration

### Tailwind CSS

Custom design tokens and utilities are configured in `tailwind.config.js`.

### TypeScript

Strict TypeScript configuration with path aliases for clean imports.

## 🚀 Deployment

The application builds to static files that can be deployed to any static hosting service.

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Query Documentation](https://tanstack.com/query/latest)
