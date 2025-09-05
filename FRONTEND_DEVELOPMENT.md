# Frontend Development Guidelines

## 🎯 Entry Point Strategy

**All Cursor prompts should target `frontend/` directory only.** This keeps backend and database
clean and decoupled.

## 📁 Directory Structure

```
frontend/src/
├── app/                    # Prompt 001: AppShell, routing, themes
│   ├── AppShell.tsx
│   ├── routes/
│   └── layouts/
├── components/             # Shared UI components
│   └── ui/                # Base UI components
├── lib/                   # Shared utilities and hooks
│   ├── utils/
│   ├── hooks/
│   └── constants/
├── modules/               # Feature modules
│   ├── permissions/       # Prompt 002: Permissions & RBAC
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── settings/          # Prompt 003: Settings & Configuration
│       ├── components/
│       ├── hooks/
│       └── utils/
├── pages/                 # Page components
├── contexts/              # React contexts
├── services/              # API services
└── types/                 # TypeScript types
```

## 🔄 CI/CD Integration

Every push to `main` runs:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
```

## 📋 Prompt Scoping

### Prompt 001: AppShell, Routing, Themes

- **Target**: `frontend/src/app/` and `frontend/src/components/`
- **Focus**: Core application structure, routing, theme system

### Prompt 002: Permissions

- **Target**: `frontend/src/lib/` + `frontend/src/modules/permissions/`
- **Focus**: Role-based access control, permission checking

### Prompt 003: Settings

- **Target**: `frontend/src/modules/settings/`
- **Focus**: User preferences, application configuration

## 🛠️ Development Workflow

1. **Frontend-focused prompts** target `frontend/` only
2. **Backend/database** evolve independently
3. **Single source of truth** for UI/UX in `frontend/`
4. **Modular structure** for scalable development

## ✅ Benefits

- **Clean separation** between frontend and backend
- **Focused development** with clear boundaries
- **Scalable architecture** with modular approach
- **CI/CD alignment** with professional standards
