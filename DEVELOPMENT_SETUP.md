# 🛠️ ConstructBMS Development Setup Guide

This guide will help you set up essential development tools to reduce debugging time and improve productivity.

## 🚀 Essential Tools to Install

### 1. **VS Code Extensions** (if using VS Code alongside Cursor)

Install these extensions for better development experience:

```bash
# Essential Extensions
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-json
code --install-extension redhat.vscode-yaml
code --install-extension ms-vscode.vscode-css-peek
code --install-extension ms-vscode.vscode-html-css-support
code --install-extension ritwickdey.liveserver
code --install-extension ms-vscode.vscode-git-graph
code --install-extension eamodio.gitlens
code --install-extension ms-vscode.vscode-github-actions
code --install-extension github.copilot
code --install-extension github.copilot-chat
code --install-extension ms-vscode.vscode-thunder-client
code --install-extension humao.rest-client
code --install-extension yzhang.markdown-all-in-one
code --install-extension shd101wyy.markdown-preview-enhanced
code --install-extension formulahendry.auto-close-tag
code --install-extension christian-kohler.npm-intellisense
```

### 2. **Global NPM Packages** (Already Installed)

```bash
# These are already installed globally
npm install -g @commitlint/cli @commitlint/config-conventional
npm install -g typescript ts-node nodemon concurrently
```

### 3. **Development Helper Script**

Use the new development helper script for common tasks:

```bash
# Check port usage
./scripts/dev-helper.sh check-ports

# Kill processes on ports
./scripts/dev-helper.sh kill-ports

# Clean all caches
./scripts/dev-helper.sh clean

# Check and install dependencies
./scripts/dev-helper.sh deps

# Run linting
./scripts/dev-helper.sh lint

# Run type checking
./scripts/dev-helper.sh typecheck

# Start development servers (with cleanup)
./scripts/dev-helper.sh start

# Restart everything (kill, clean, restart)
./scripts/dev-helper.sh restart
```

### 4. **New NPM Scripts**

Use these improved npm scripts:

```bash
# Development
npm run dev                    # Start both servers
npm run dev:restart           # Restart with cleanup
npm run dev:check             # Check port usage
npm run dev:kill              # Kill processes on ports

# Quality checks
npm run quality               # Format, lint, and typecheck
npm run lint                  # Run linting on all packages
npm run typecheck             # Run type checking on all packages
npm run format                # Format all files with Prettier

# Building
npm run build                 # Build both frontend and backend
npm run clean                 # Clean all caches
```

## 🔧 Common Issues & Solutions

### **Hot Reload Issues**
- Use `npm run dev:restart` to fix Fast Refresh problems
- The helper script automatically cleans caches and restarts

### **Port Conflicts**
- Use `npm run dev:check` to see what's using ports 5173/5174
- Use `npm run dev:kill` to kill conflicting processes

### **TypeScript Errors**
- Run `npm run typecheck` to see all TypeScript issues
- Use `npm run quality` to fix formatting and linting issues

### **Dependency Issues**
- Use `./scripts/dev-helper.sh deps` to check and reinstall dependencies
- Use `npm run clean` to clear all caches

## 🎯 Recommended Workflow

1. **Start Development:**
   ```bash
   npm run dev:restart
   ```

2. **Before Committing:**
   ```bash
   npm run quality
   ```

3. **When Things Break:**
   ```bash
   npm run dev:restart
   ```

4. **Check for Issues:**
   ```bash
   npm run dev:check
   npm run typecheck
   npm run lint
   ```

## 🚀 Additional Tools (Optional)

### **Neovim** (if you want terminal-based editing)
```bash
# Install via Homebrew
brew install neovim

# Install essential plugins
# Create ~/.config/nvim/init.lua with:
# - nvim-lspconfig (TypeScript support)
# - nvim-treesitter (syntax highlighting)
# - telescope.nvim (fuzzy finder)
# - nvim-tree (file explorer)
```

### **Additional CLI Tools**
```bash
# Better Git experience
brew install git-delta
brew install gh  # GitHub CLI

# Better terminal
brew install zsh-autosuggestions
brew install zsh-syntax-highlighting

# Better file watching
brew install fswatch
```

## 📝 VS Code Settings (Optional)

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## 🎉 Benefits

With this setup, you'll have:

- ✅ **Automated formatting** and linting
- ✅ **Type checking** before runtime errors
- ✅ **Easy port management** and process cleanup
- ✅ **Consistent development environment**
- ✅ **Faster debugging** with better tooling
- ✅ **Reduced manual troubleshooting**

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `npm run dev:kill` |
| Hot reload broken | `npm run dev:restart` |
| TypeScript errors | `npm run typecheck` |
| Linting errors | `npm run lint` |
| Cache issues | `npm run clean` |
| Dependencies missing | `./scripts/dev-helper.sh deps` |

This setup should significantly reduce the time spent on debugging and troubleshooting! 🚀
