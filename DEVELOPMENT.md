# Archer Project - Development Workflow

This guide shows you the fastest ways to work with the Archer project using the new automation scripts.

## 🚀 Quick Start

### Option 1: Using the Batch File (Fastest)
```bash
# Start development server
dev start

# Start with ngrok tunnel
dev tunnel

# Kill all Node processes
dev kill

# Restart everything
dev restart
```

### Option 2: Using PowerShell Script
```powershell
# Start development server
.\scripts\dev.ps1 start

# Start with ngrok tunnel
.\scripts\dev.ps1 tunnel

# Kill all Node processes
.\scripts\dev.ps1 kill

# Restart everything
.\scripts\dev.ps1 restart
```

### Option 3: Using VS Code Tasks (Recommended)
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Tasks: Run Task"
3. Select any of these tasks:
   - **Start Dev Server** - Start development server
   - **Start Dev Server + Tunnel** - Start with ngrok
   - **Kill Node Processes** - Stop all Node processes
   - **Restart Dev Server** - Kill and restart
   - **Run Linting** - Check code quality
   - **Fix Linting** - Auto-fix linting issues
   - **Type Check** - Run TypeScript checks

### Option 4: Using npm Scripts
```bash
# Start development server
npm run dev

# Start with ngrok tunnel
npm run dev:tunnel

# Kill all Node processes
npm run kill

# Restart everything
npm run restart

# Build for production
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 🔧 Available Commands

| Command | Description | Speed |
|---------|-------------|-------|
| `dev start` | Start development server | ⚡ Fast |
| `dev tunnel` | Start dev server + ngrok | ⚡ Fast |
| `dev kill` | Kill all Node processes | ⚡ Fast |
| `dev restart` | Kill and restart dev server | ⚡ Fast |
| `dev clean` | Clean build artifacts | ⚡ Fast |
| `dev install` | Install dependencies | 🐌 Slow |
| `dev build` | Build for production | 🐌 Slow |
| `dev lint` | Run ESLint | ⚡ Fast |
| `dev typecheck` | Run TypeScript checks | ⚡ Fast |

## 🎯 Pro Tips for Speed

### 1. Use VS Code Tasks
- Press `Ctrl+Shift+P` → "Tasks: Run Task"
- Much faster than typing commands
- Integrated with VS Code's task system

### 2. Keep Multiple Terminals Open
- Terminal 1: `dev start` (keep running)
- Terminal 2: `dev tunnel` (when needed)
- Terminal 3: For other commands

### 3. Use Keyboard Shortcuts
- `Ctrl+Shift+P` → "Tasks: Run Task"
- `Ctrl+Shift+P` → "Tasks: Run Build Task"
- `Ctrl+Shift+P` → "Tasks: Run Test Task"

### 4. Debug in Browser
- Press `F5` to start debugging
- Use Chrome DevTools for React debugging
- Set breakpoints in VS Code

## 🛠️ Development Workflow

### Daily Development
1. **Start**: `dev start` or use VS Code task
2. **Code**: Make changes (hot reload will update)
3. **Test**: Check in browser
4. **Lint**: `dev lint` or use VS Code task
5. **Type Check**: `dev typecheck` if needed

### When Things Go Wrong
1. **Kill**: `dev kill` to stop all processes
2. **Clean**: `dev clean` to clear cache
3. **Restart**: `dev restart` to start fresh

### Sharing Your Work
1. **Tunnel**: `dev tunnel` to get public URL
2. **Share**: Send the ngrok URL to others
3. **Stop**: `dev kill` when done

## 📁 Project Structure

```
ArcherProject/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── services/          # API services
│   └── types/             # TypeScript types
├── scripts/               # Automation scripts
│   └── dev.ps1           # PowerShell script
├── .vscode/              # VS Code config
│   ├── tasks.json        # VS Code tasks
│   └── launch.json       # Debug config
├── dev.bat               # Quick batch file
└── package.json          # npm scripts
```

## 🚨 Troubleshooting

### "Command not found"
- Make sure you're in the project root directory
- Run `npm install` to install dependencies

### "Port already in use"
- Run `dev kill` to stop all Node processes
- Or manually kill the process using the port

### "ngrok not found"
- Install ngrok: `npm install -g ngrok`
- Or use `dev start` instead of `dev tunnel`

### VS Code tasks not working
- Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"
- Check that `.vscode/tasks.json` exists

## 🎉 You're All Set!

You now have multiple fast ways to work with the Archer project. The batch file (`dev.bat`) is probably the fastest for most tasks, but VS Code tasks are great for integrated development.

Happy coding! 🚀 