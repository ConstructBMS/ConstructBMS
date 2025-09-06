# 🚀 ConstructBMS Development Guide

## 🎯 Development Workflow

### Branch Strategy

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: Individual feature development
- **`hotfix/*`**: Critical production fixes

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Pre-commit Hooks

- **ESLint**: Code quality and style
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks management

## 🛠️ Development Setup

### 1. Environment Setup

```bash
# Install dependencies
pnpm install

# Copy environment files
cp backend/.env.example backend/.env
# Edit .env with your Supabase credentials
```

### 2. Database Setup

```bash
# Run database initialization
cd backend
pnpm run init-database
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend (Port 5174)
pnpm dev:backend

# Terminal 2 - Frontend (Port 5173)
pnpm dev:frontend
```

## 📱 Frontend Development

### Component Structure

- **Pages**: Main application views
- **Components**: Reusable UI components
- **Contexts**: React context providers
- **Hooks**: Custom React hooks
- **Services**: API and external service integrations

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Themes**: Light/dark mode support
- **Responsive Design**: Mobile-first approach
- **Component Library**: Consistent UI components

### State Management

- **React Context**: Global state management
- **Local State**: Component-level state
- **Supabase**: Real-time database subscriptions

## 🔧 Backend Development

### API Structure

- **Routes**: Express route definitions
- **Controllers**: Business logic handlers
- **Services**: External service integrations
- **Middleware**: Authentication and validation
- **Types**: TypeScript type definitions

### Database

- **Supabase**: PostgreSQL database service
- **Migrations**: Schema version control
- **Seeding**: Sample data for development
- **Real-time**: Live data subscriptions

### Authentication

- **JWT**: JSON Web Token authentication
- **Role-based Access**: Admin, Manager, User, Viewer
- **Middleware**: Route protection
- **Session Management**: User session handling

## 🧪 Testing

### Frontend Testing

```bash
# Run tests
pnpm test:frontend

# Run tests with coverage
pnpm test:frontend --coverage
```

### Backend Testing

```bash
# Run tests
pnpm test:backend

# Run tests with coverage
pnpm test:backend --coverage
```

### E2E Testing

```bash
# Run end-to-end tests
pnpm test:e2e
```

## 📦 Building and Deployment

### Development Build

```bash
# Build both applications
pnpm build

# Build frontend only
pnpm build:frontend

# Build backend only
pnpm build:backend
```

### Production Build

```bash
# Production build with optimization
NODE_ENV=production pnpm build
```

## 🔍 Debugging

### Frontend Debugging

- **React DevTools**: Browser extension
- **Console Logging**: Strategic console.log statements
- **Error Boundaries**: React error handling
- **Source Maps**: Debug original TypeScript code

### Backend Debugging

- **Nodemon**: Auto-restart on changes
- **Console Logging**: Structured logging
- **Error Handling**: Try-catch blocks
- **TypeScript**: Compile-time error checking

## 📚 Code Quality

### ESLint Rules

- **TypeScript**: Strict type checking
- **React**: React-specific rules
- **Accessibility**: A11y best practices
- **Performance**: Performance optimization rules

### Prettier Configuration

- **Semi-colons**: Always
- **Quotes**: Single quotes
- **Trailing commas**: ES5 compatible
- **Print width**: 80 characters

### Git Hooks

- **Pre-commit**: Lint and format staged files
- **Commit-msg**: Validate commit messages
- **Pre-push**: Run tests before pushing

## 🚀 Performance Optimization

### Frontend

- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Component lazy loading
- **Memoization**: React.memo and useMemo
- **Bundle Analysis**: Webpack bundle analyzer

### Backend

- **Caching**: Redis or in-memory caching
- **Database Optimization**: Query optimization
- **Compression**: Gzip compression
- **Rate Limiting**: API rate limiting

## 🔒 Security

### Authentication

- **JWT Expiration**: Short-lived tokens
- **Refresh Tokens**: Secure token refresh
- **Password Hashing**: bcrypt with salt
- **Rate Limiting**: Prevent brute force attacks

### Data Validation

- **Input Sanitization**: Clean user inputs
- **SQL Injection**: Parameterized queries
- **XSS Prevention**: Content Security Policy
- **CORS**: Cross-origin resource sharing

## 📊 Monitoring and Logging

### Application Monitoring

- **Error Tracking**: Sentry or similar
- **Performance Monitoring**: APM tools
- **User Analytics**: User behavior tracking
- **Health Checks**: Application health endpoints

### Logging

- **Structured Logging**: JSON format logs
- **Log Levels**: Error, Warn, Info, Debug
- **Log Rotation**: Prevent log file bloat
- **Centralized Logging**: Log aggregation

## 🎨 UI/UX Guidelines

### Design Principles

- **Consistency**: Uniform design language
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsiveness**: Mobile-first design
- **Performance**: Fast loading times

### Component Guidelines

- **Reusability**: Generic, reusable components
- **Props Interface**: Clear TypeScript interfaces
- **Default Values**: Sensible defaults
- **Error States**: Graceful error handling

## 🔄 Continuous Integration

### GitHub Actions

- **Quality Checks**: ESLint, Prettier, TypeScript
- **Testing**: Unit and integration tests
- **Building**: Production builds
- **Deployment**: Automated deployments
- **Auto Summary**: Build summaries posted to `reports/LATEST.md` and GitHub issues

### Build Summaries

On each push to `main` or `develop`, the CI automatically generates and commits build summaries:

- **Location**: `reports/LATEST.md` (latest summary) and `reports/<commit-sha>.md` (historical)
- **Content**: Branch, author, commit message, changed files, and statistics
- **GitHub Issue**: Posted to the "Automated Build Summaries" issue for team visibility
- **Artifacts**: Uploaded as GitHub Actions artifacts for download

### Quality Gates

- **Code Coverage**: Minimum 80% coverage
- **Performance**: Lighthouse score > 90
- **Accessibility**: A11y score > 95
- **Security**: No high-severity vulnerabilities

---

**Happy coding! 🚀✨**
