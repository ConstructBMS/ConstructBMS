# 🛠️ Code Quality Tools - ConstructBMS

## **🎯 Overview**

This document outlines all the code quality tools installed to keep your codebase clean, prevent
errors, and maintain high standards.

## **📦 Installed Tools**

### **🔧 Core Quality Tools**

#### **1. Prettier** - Code Formatting

- **Purpose**: Automatic code formatting
- **Config**: `.prettierrc`
- **Commands**:
  ```bash
  pnpm run format          # Format all files
  pnpm run format:check    # Check formatting without changing
  ```

#### **2. ESLint** - Code Linting

- **Purpose**: Find and fix code problems
- **Config**: `frontend/eslint.config.js`, `backend/eslint.config.js`
- **Commands**:
  ```bash
  pnpm run lint            # Check for issues
  pnpm run lint:fix        # Fix auto-fixable issues
  ```

#### **3. TypeScript** - Type Checking

- **Purpose**: Static type checking
- **Config**: `frontend/tsconfig.app.json`, `backend/tsconfig.json`
- **Commands**:
  ```bash
  pnpm run typecheck       # Check types across project
  ```

#### **4. Husky** - Git Hooks

- **Purpose**: Run quality checks before commits
- **Config**: `.husky/` directory
- **Features**: Pre-commit hooks for linting and formatting

#### **5. Lint-Staged** - Staged Files Only

- **Purpose**: Run linters only on staged files
- **Config**: `package.json` lint-staged section
- **Features**: Faster commits, only check changed files

#### **6. Commitlint** - Commit Message Standards

- **Purpose**: Enforce conventional commit messages
- **Config**: `commitlint.config.js`
- **Format**: `type(scope): description`

### **🚀 Development Tools**

#### **7. Nodemon** - Backend Auto-Restart

- **Purpose**: Auto-restart backend on file changes
- **Config**: `backend/nodemon.json`
- **Features**: Stable restart settings, ignore patterns

#### **8. Vite** - Frontend Development

- **Purpose**: Fast frontend development server
- **Config**: `frontend/vite.config.ts`
- **Features**: Hot module replacement, fast builds

#### **9. Concurrently** - Parallel Scripts

- **Purpose**: Run frontend and backend simultaneously
- **Usage**: `pnpm dev` runs both servers

## **🎨 VSCode Integration**

### **Recommended Extensions**

- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Tailwind CSS**: CSS framework support
- **TypeScript**: Type checking
- **Auto Rename Tag**: HTML/JSX tag renaming
- **Path Intellisense**: Import path suggestions
- **GitLens**: Git integration
- **Docker**: Container support

### **VSCode Settings**

- **Auto-format on save**: Enabled
- **Auto-fix on save**: Enabled
- **Import organization**: Enabled
- **Tab size**: 2 spaces
- **Word wrap**: 80 characters

## **📋 Quality Commands**

### **Quick Quality Check**

```bash
# Run all quality checks
pnpm run quality

# Individual checks
pnpm run format          # Format code
pnpm run lint:fix        # Fix linting issues
pnpm run typecheck       # Check types
```

### **Development Workflow**

```bash
# Start development
pnpm dev

# Before committing
pnpm run quality

# Clean and rebuild
pnpm run clean
pnpm install
```

### **Advanced Quality Script**

```bash
# Comprehensive quality check
./scripts/quality-check.sh
```

## **🔍 What Each Tool Catches**

### **Prettier**

- ✅ Inconsistent indentation
- ✅ Line length violations
- ✅ Quote style inconsistencies
- ✅ Semicolon usage
- ✅ Trailing commas

### **ESLint**

- ✅ Unused variables and imports
- ✅ Missing dependencies in hooks
- ✅ Unreachable code
- ✅ Console statements (configurable)
- ✅ TypeScript-specific issues

### **TypeScript**

- ✅ Type mismatches
- ✅ Missing properties
- ✅ Incorrect function signatures
- ✅ Import/export issues
- ✅ Interface violations

### **Husky + Lint-Staged**

- ✅ Prevents bad commits
- ✅ Auto-fixes issues before commit
- ✅ Ensures code quality standards

### **Commitlint**

- ✅ Enforces commit message format
- ✅ Prevents unclear commit messages
- ✅ Enables automated changelog generation

## **🚨 Error Prevention**

### **Before Making Changes**

1. **Check current state**: `pnpm run quality`
2. **Ensure clean working directory**: `git status`
3. **Update dependencies if needed**: `pnpm install`

### **While Developing**

1. **Save files frequently** (auto-formatting enabled)
2. **Check for errors in terminal**
3. **Use VSCode extensions for real-time feedback**

### **Before Committing**

1. **Run quality check**: `pnpm run quality`
2. **Review changes**: `git diff`
3. **Write descriptive commit message**

### **If Errors Occur**

1. **Check TypeScript**: `pnpm run typecheck`
2. **Fix linting**: `pnpm run lint:fix`
3. **Format code**: `pnpm run format`
4. **Clean and rebuild**: `pnpm run clean && pnpm install`

## **📊 Quality Metrics**

### **Current Status**

- ✅ **Code Formatting**: Consistent across project
- ✅ **Linting**: Minimal warnings, development-friendly
- ✅ **Type Safety**: Strong typing with TypeScript
- ✅ **Git Hooks**: Prevent bad commits
- ✅ **Auto-Fix**: Most issues fixed automatically

### **Quality Standards**

- **Line Length**: 80 characters (120 for JSON)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes preferred
- **Semicolons**: Required
- **Trailing Commas**: ES5 compatible

## **🔧 Configuration Files**

### **Root Level**

- `.prettierrc` - Prettier configuration
- `.gitignore` - Git ignore patterns
- `commitlint.config.js` - Commit message rules
- `package.json` - Scripts and dependencies

### **Frontend**

- `frontend/eslint.config.js` - ESLint rules
- `frontend/tsconfig.app.json` - TypeScript config
- `frontend/vite.config.ts` - Vite configuration

### **Backend**

- `backend/eslint.config.js` - ESLint rules
- `backend/tsconfig.json` - TypeScript config
- `backend/nodemon.json` - Auto-restart settings

### **VSCode**

- `.vscode/settings.json` - Editor settings
- `.vscode/extensions.json` - Recommended extensions

## **🎯 Best Practices**

### **Code Style**

1. **Consistent formatting** - Let Prettier handle it
2. **Meaningful variable names** - Descriptive and clear
3. **Proper imports** - Organized and minimal
4. **Type safety** - Use TypeScript features

### **Development Workflow**

1. **Save frequently** - Auto-formatting helps
2. **Check terminal** - Watch for errors
3. **Use VSCode features** - Extensions provide real-time feedback
4. **Commit regularly** - Small, focused commits

### **Error Handling**

1. **Read error messages** - They're usually helpful
2. **Check the logs** - Terminal output shows issues
3. **Use quality tools** - They catch most problems
4. **Ask for help** - When stuck, the tools can guide you

## **🚀 Getting Started**

### **First Time Setup**

```bash
# Install dependencies
pnpm install

# Run quality check
pnpm run quality

# Start development
pnpm dev
```

### **Daily Workflow**

```bash
# Start development
pnpm dev

# Make changes...

# Before committing
pnpm run quality

# Commit with good message
git add .
git commit -m "feat: add new feature"
```

### **Troubleshooting**

```bash
# If servers won't start
pkill -f "nodemon|ts-node|vite"
pnpm dev

# If quality checks fail
pnpm run clean
pnpm install
pnpm run quality

# If TypeScript errors
pnpm run typecheck
# Fix the errors shown
```

---

**🎉 Your codebase is now protected by comprehensive quality tools!**

These tools will help you write better code, catch errors early, and maintain high standards
throughout development.
