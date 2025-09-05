# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **AppShell**: Complete application shell with responsive sidebar and topbar
- **Theme System**: Light/Dark/System theme support with persistent settings
- **UI Primitives**: Comprehensive component library (Button, Card, Input, Switch, Dialog, Tabs,
  Table, Badge)
- **Zustand Stores**: Lightweight state management for theme and sidebar
- **React Query**: Server state management and caching
- **Lazy Loading**: Route-based code splitting for optimal performance
- **Keyboard Shortcuts**: Cmd/Ctrl+B (toggle sidebar), Cmd/Ctrl+K (focus search)
- **Responsive Layout**: Grid-based layout with collapsible sidebar (260px → 72px)
- **Design System**: HSL-based color system with CSS variables
- **Module Structure**: Organized feature modules with consistent structure
- **Testing**: Unit tests for utilities and stores
- **Documentation**: Comprehensive README and architecture documentation

### Changed

- **Frontend Architecture**: Restructured to frontend-focused development approach
- **Routing**: Implemented lazy-loaded routes with 404 handling
- **Styling**: Migrated to modern CSS variables and Tailwind design system
- **State Management**: Added Zustand for client-side state management

### Technical

- **Dependencies**: Added zustand, @tanstack/react-query, clsx, tailwind-merge
- **Build System**: Updated Tailwind config for dark mode and design tokens
- **Type Safety**: Enhanced TypeScript types for core application interfaces
- **Code Quality**: Added comprehensive testing and documentation

## [Previous Releases]

### Added

- Initial project setup with React frontend and Node.js backend
- User authentication system with JWT tokens
- Dashboard with basic layout and navigation
- Modular architecture for easy feature expansion
- Responsive design with Tailwind CSS
- TypeScript support for both frontend and backend
- ESLint and Prettier configuration
- Husky git hooks for pre-commit checks
- Conventional commit validation with commitlint
- GitHub Actions CI/CD pipeline
- Comprehensive documentation and README

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A

## [1.0.0] - 2024-08-24

### Added

- Initial release of ConstructBMS
- Basic authentication and authorization
- Dashboard interface
- Project structure and architecture
- Development tooling and configuration
