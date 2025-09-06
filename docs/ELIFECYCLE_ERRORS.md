# ELIFECYCLE Error Prevention Guide

## What is ELIFECYCLE Error?

ELIFECYCLE errors occur when npm/pnpm processes are terminated unexpectedly, often with exit codes
like 143 (SIGTERM) or 130 (SIGINT). These errors can be caused by:

- Process conflicts
- Resource exhaustion
- Signal interruptions
- Port conflicts
- Cache corruption

## Common Exit Codes

- **Exit Code 143**: Process terminated by SIGTERM signal
- **Exit Code 130**: Process terminated by SIGINT (Ctrl+C)
- **Exit Code 1**: General error
- **Exit Code 2**: Misuse of shell builtins

## Prevention Strategies

### 1. Use the Development Manager Script

We've created a robust development manager script to handle process management:

```bash
# Start development servers with proper cleanup
./scripts/dev-manager.sh start

# Kill all processes on ports 5173 and 5174
./scripts/dev-manager.sh kill

# Clean cache and restart
./scripts/dev-manager.sh restart

# Run quality checks
./scripts/dev-manager.sh quality
```

### 2. Available npm Scripts

```bash
# Root level scripts
pnpm dev:clean    # Clean restart of all servers
pnpm dev:kill     # Kill processes on ports 5173/5174
pnpm dev:manager  # Access to dev-manager script

# Frontend scripts
cd frontend
pnpm clean        # Clean cache and temporary files
pnpm kill-ports   # Kill processes on ports 5173/5174
pnpm dev:clean    # Clean and start development server
```

### 3. Manual Process Management

If you encounter ELIFECYCLE errors, follow these steps:

#### Step 1: Kill Existing Processes

```bash
# Kill processes on specific ports
lsof -ti:5173,5174 | xargs kill -9 2>/dev/null || true

# Or use the script
./scripts/dev-manager.sh kill
```

#### Step 2: Clean Cache

```bash
# Frontend
cd frontend
rm -rf dist .eslintcache node_modules/.vite

# Backend
cd backend
rm -rf dist .eslintcache

# Or use the script
./scripts/dev-manager.sh clean
```

#### Step 3: Restart Services

```bash
# Use the manager script for clean restart
./scripts/dev-manager.sh restart
```

### 4. Troubleshooting Specific Commands

#### ESLint Stalling

```bash
# Use specific glob pattern (already fixed in package.json)
pnpm lint

# If still stalling, run on specific directories
npx eslint src/modules/settings/ --ext .ts,.tsx
```

#### Build Failures

```bash
# Clean and rebuild
pnpm clean
pnpm build

# Check TypeScript configuration
pnpm typecheck
```

#### Development Server Issues

```bash
# Kill and restart
pnpm dev:kill
pnpm dev:clean
```

### 5. System Resource Management

#### Check System Resources

```bash
# Check memory usage
top -l 1 | grep -E "(CPU|PhysMem)"

# Check disk space
df -h

# Check running processes
ps aux | grep -E "(node|pnpm|vite)" | grep -v grep
```

#### Optimize System Performance

- Close unnecessary applications
- Restart your terminal/IDE if needed
- Clear system cache if experiencing memory issues

### 6. IDE and Extension Conflicts

Sometimes Cursor/VS Code extensions can interfere with processes:

- Disable ESLint extension temporarily
- Restart Cursor/VS Code
- Check for conflicting extensions

### 7. Network and Port Issues

#### Check Port Availability

```bash
# Check if ports are in use
lsof -i :5173
lsof -i :5174

# Kill processes on specific ports
lsof -ti:5173 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

#### Alternative Ports

If ports 5173/5174 are consistently problematic, you can change them:

```bash
# Frontend (edit frontend/package.json)
"dev": "vite --port 3000"

# Backend (edit backend/package.json)
"dev": "tsx watch src/server.ts --port 3001"
```

## Best Practices

### 1. Always Use Clean Shutdown

- Use Ctrl+C to stop development servers
- Don't force-kill processes unless necessary
- Use the dev-manager script for proper cleanup

### 2. Regular Maintenance

```bash
# Weekly cleanup
pnpm clean
rm -rf node_modules
pnpm install
```

### 3. Monitor System Resources

- Keep an eye on memory usage
- Close unused applications
- Restart your system if needed

### 4. Use Process Management Tools

```bash
# Install process manager (optional)
npm install -g pm2

# Use our dev-manager script
./scripts/dev-manager.sh start
```

## Emergency Recovery

If you're stuck with persistent ELIFECYCLE errors:

1. **Kill all Node processes**:

   ```bash
   pkill -f node
   pkill -f pnpm
   ```

2. **Clean everything**:

   ```bash
   rm -rf node_modules
   rm -rf frontend/node_modules
   rm -rf backend/node_modules
   rm -rf frontend/dist
   rm -rf backend/dist
   ```

3. **Reinstall dependencies**:

   ```bash
   pnpm install
   ```

4. **Restart with clean slate**:
   ```bash
   ./scripts/dev-manager.sh restart
   ```

## Monitoring and Logs

### Check Process Logs

```bash
# Check for error logs
tail -f ~/.npm/_logs/*.log

# Check system logs
tail -f /var/log/system.log | grep -i node
```

### Debug Mode

```bash
# Run with debug output
DEBUG=* pnpm dev

# Run with verbose output
pnpm dev --verbose
```

## Summary

ELIFECYCLE errors are usually caused by process conflicts or resource issues. The key is to:

1. **Use proper process management** (our dev-manager script)
2. **Clean cache regularly**
3. **Monitor system resources**
4. **Use clean shutdown procedures**
5. **Have recovery procedures ready**

The development manager script (`./scripts/dev-manager.sh`) is your best tool for preventing and
recovering from these errors.
