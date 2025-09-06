# ConstructBMS Application Architecture

## Overview

ConstructBMS is a modern construction business management system built with a modular, scalable
architecture. The application follows a frontend-focused development approach with clean separation
between UI/UX and backend services.

## 🏗️ Architecture Principles

### Frontend-First Development

- **Single Source of Truth**: All UI/UX logic resides in the `frontend/` directory
- **Modular Structure**: Feature-based organization with clear boundaries
- **Clean Separation**: Backend and database evolve independently
- **Prompt Scoping**: Development organized into focused prompts

### Design System

- **Consistent UI**: Shared component library with design tokens
- **Accessibility**: ARIA-compliant components with keyboard navigation
- **Responsive**: Mobile-first design with breakpoint-specific layouts
- **Theming**: Light/Dark/System theme support with persistence

## 📁 Directory Structure

```
ConstructBMS/
├── frontend/                 # Frontend application (UI/UX)
│   ├── src/
│   │   ├── app/             # Core application structure
│   │   │   ├── AppShell.tsx # Main application shell
│   │   │   ├── routes.tsx   # Route configuration
│   │   │   ├── providers/   # Context providers
│   │   │   └── store/       # Zustand stores
│   │   ├── components/      # Reusable UI components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # Base UI primitives
│   │   ├── lib/             # Shared utilities
│   │   │   ├── utils/       # Utility functions
│   │   │   ├── types/       # TypeScript types
│   │   │   └── permissions/ # Permission system
│   │   ├── modules/         # Feature modules
│   │   │   ├── dashboard/   # Dashboard module
│   │   │   ├── projects/    # Project management
│   │   │   ├── permissions/ # Permission management
│   │   │   ├── settings/    # Settings module
│   │   │   └── ...          # Other modules
│   │   └── pages/           # Page components
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Backend API services
├── database/                 # Database schema and migrations
└── docs/                     # Documentation
```

## 🎯 Development Workflow

### Prompt-Based Development

Development is organized into focused prompts that target specific areas:

#### Prompt 001: AppShell, Routing, Theme

- **Target**: `frontend/src/app/` and `frontend/src/components/`
- **Focus**: Core application structure, routing, theme system
- **Deliverables**: AppShell, routing, theme provider, UI primitives

#### Prompt 002: Permissions v0 (RBAC + ABAC)

- **Target**: `frontend/src/lib/permissions/` + `frontend/src/modules/permissions/`
- **Focus**: Role-based and attribute-based access control, permission matrix UI
- **Deliverables**: Permission evaluator, hooks, guards, matrix editor, SQL migration

#### Prompt 003: Settings

- **Target**: `frontend/src/modules/settings/`
- **Focus**: User preferences, application configuration
- **Deliverables**: Settings UI, configuration management

### Entry Point Strategy

- **Frontend Prompts**: Target `frontend/` directory only
- **Backend Evolution**: Independent development and deployment
- **Database Changes**: Coordinated through migrations

## 🧩 Component Architecture

### UI Primitives

Base components built with Tailwind CSS:

- `Button` - Various styles and sizes
- `Card` - Content containers
- `Input` - Form inputs
- `Switch` - Toggle controls
- `Dialog` - Modal dialogs
- `Tabs` - Tabbed interfaces
- `Table` - Data tables
- `Badge` - Status indicators

### Layout Components

- `AppShell` - Main application wrapper
- `Sidebar` - Collapsible navigation
- `Topbar` - Header with search and actions
- `Page` - Page wrapper with breadcrumbs

### Module Structure

Each module follows a consistent structure:

```
modules/[module-name]/
├── components/     # Module-specific components
├── hooks/         # Custom hooks
├── utils/         # Module utilities
├── types/         # Module types
└── [Module]Page.tsx # Main page component
```

## 🔄 State Management

### Zustand Stores

Lightweight state management for client-side state:

- `theme.store.ts` - Theme management with persistence
- `sidebar.store.ts` - Sidebar state with collapse functionality
- `permissions.store.ts` - Permission rules and matrix management

### React Query

Server state management and caching:

- API data fetching
- Background updates
- Optimistic updates
- Error handling

### Context Providers

- `ThemeProvider` - Theme context and persistence
- `AuthProvider` - Authentication state (existing)

## 🎨 Design System

### Theme System

- **CSS Variables**: HSL-based color system
- **Dark Mode**: Class-based dark mode with system preference detection
- **Persistence**: Theme preference saved to localStorage
- **Smooth Transitions**: CSS transitions for theme changes

### Typography

- **Font**: Inter font family
- **Scale**: Consistent typography scale
- **Responsive**: Fluid typography with clamp()

### Spacing & Layout

- **Grid System**: CSS Grid for complex layouts
- **Flexbox**: Flexbox for component layouts
- **Spacing**: Consistent spacing scale
- **Breakpoints**: Mobile-first responsive design

## 🚀 Performance

### Code Splitting

- **Route-based**: Each route is lazy-loaded
- **Component-based**: Large components are code-split
- **Dynamic Imports**: React.lazy() for component loading

### Optimization

- **Tree Shaking**: Unused code elimination
- **Bundle Analysis**: Webpack bundle analyzer
- **Image Optimization**: Next-gen image formats
- **Caching**: Aggressive caching strategies

## 🧪 Testing Strategy

### Unit Tests

- **Utilities**: Test utility functions
- **Stores**: Test Zustand stores
- **Components**: Test component behavior

### Integration Tests

- **User Flows**: Test complete user journeys
- **API Integration**: Test API interactions
- **Theme Switching**: Test theme functionality

### E2E Tests

- **Critical Paths**: Test essential user flows
- **Cross-browser**: Test browser compatibility
- **Responsive**: Test responsive behavior

## 🔧 Development Tools

### Code Quality

- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks for quality gates

### Build Tools

- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **TypeScript**: Type checking and compilation

### Development Experience

- **Hot Reload**: Fast development iteration
- **TypeScript**: IntelliSense and type safety
- **Path Aliases**: Clean import paths
- **Error Boundaries**: Graceful error handling

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

### Mobile-First Approach

- **Base Styles**: Mobile-first base styles
- **Progressive Enhancement**: Add complexity for larger screens
- **Touch Targets**: Appropriate touch target sizes
- **Performance**: Optimized for mobile performance

## 🔐 Security

### Frontend Security

- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: Token-based CSRF protection
- **Content Security Policy**: Strict CSP headers
- **Input Validation**: Client-side validation

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Token Refresh**: Automatic token refresh
- **Route Protection**: Protected route components with permission guards
- **Session Management**: Secure session handling
- **RBAC + ABAC**: Role-based and attribute-based access control
- **Permission Matrix**: Visual permission management interface
- **Scope-based Access**: Global, organization, project, and user-level permissions

## 🚀 Deployment

### Build Process

1. **Type Checking**: TypeScript compilation
2. **Linting**: ESLint code quality checks
3. **Testing**: Unit and integration tests
4. **Building**: Vite production build
5. **Optimization**: Asset optimization

### Deployment Strategy

- **Static Hosting**: Deploy to CDN
- **Environment Variables**: Secure configuration
- **Monitoring**: Error tracking and analytics
- **Rollback**: Quick rollback capability

## 📈 Monitoring & Analytics

### Performance Monitoring

- **Core Web Vitals**: LCP, FID, CLS tracking
- **Bundle Size**: Bundle size monitoring
- **Load Times**: Page load time tracking
- **Error Tracking**: Error monitoring and reporting

### User Analytics

- **Usage Patterns**: User behavior analysis
- **Feature Adoption**: Feature usage tracking
- **Performance Metrics**: User experience metrics
- **A/B Testing**: Feature experimentation

## 🔮 Future Considerations

### Scalability

- **Micro-frontends**: Potential micro-frontend architecture
- **Module Federation**: Webpack module federation
- **Service Workers**: Offline functionality
- **PWA**: Progressive Web App features

### Technology Evolution

- **React 18**: Concurrent features
- **Server Components**: React Server Components
- **Streaming**: Streaming SSR
- **Edge Computing**: Edge deployment strategies
