# Troubleshooting: Command Hanging Issues

## Problem Description
All terminal commands are hanging and not executing properly in PowerShell.

## Root Cause Analysis
The issue appears to be related to:
1. PowerShell PSReadLine module causing command blocking
2. PowerShell execution policy restrictions
3. Corrupted PowerShell profile
4. Environment variable conflicts

## Immediate Solutions

### Option 1: Use CMD Instead of PowerShell
1. Open Command Prompt (cmd.exe) instead of PowerShell
2. Navigate to your project directory: `cd C:\Users\info\Desktop\ConstructBMS`
3. Run commands directly in CMD

### Option 2: Run the Bypass Script
1. Double-click `bypass-powershell.bat`
2. This will test and run everything using CMD directly
3. Follow the on-screen instructions

### Option 3: Fix PowerShell (Advanced)
1. Run `fix-powershell-hanging.ps1` in a new PowerShell window
2. Close PowerShell completely
3. Open a new PowerShell window
4. Try commands again

## Quick Commands to Try

### In CMD (Command Prompt):
```cmd
cd C:\Users\info\Desktop\ConstructBMS
node --version
npm --version
npm run dev
```

### In PowerShell (if working):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
Remove-Module PSReadLine -Force
node --version
npm --version
npm run dev
```

## Alternative Development Methods

### Method 1: Use Windows Terminal
1. Install Windows Terminal from Microsoft Store
2. Open it and try commands there

### Method 2: Use Git Bash
1. If you have Git installed, use Git Bash
2. Navigate to project directory
3. Run npm commands

### Method 3: Use VS Code Terminal
1. Open VS Code
2. Open integrated terminal (Ctrl+`)
3. Try commands there

## System-Level Fixes

### Reset PowerShell Profile
```powershell
# Backup current profile
Copy-Item $PROFILE "$PROFILE.backup"

# Create clean profile
@"
# Clean PowerShell Profile
`$Host.UI.RawUI.WindowTitle = "ConstructBMS Development"
"@ | Out-File -FilePath $PROFILE -Encoding UTF8
```

### Reset Environment Variables
1. Open System Properties
2. Click "Environment Variables"
3. Check PATH variable for Node.js entries
4. Remove any duplicate or corrupted entries

### Reinstall Node.js
1. Uninstall Node.js from Control Panel
2. Download latest LTS version from nodejs.org
3. Install with default settings
4. Restart computer

## Emergency Commands

### Kill All Node Processes
```cmd
taskkill /f /im node.exe
```

### Clear npm Cache
```cmd
npm cache clean --force
```

### Reset npm Configuration
```cmd
npm config set registry https://registry.npmjs.org/
```

## Testing Commands

### Basic System Test
```cmd
echo "test"
dir
node --version
npm --version
```

### Project Test
```cmd
cd C:\Users\info\Desktop\ConstructBMS
dir
if exist package.json echo "package.json exists"
if exist node_modules echo "node_modules exists"
```

### Development Server Test
```cmd
npm run dev
```

## Next Steps

1. **Try CMD first** - Most reliable solution
2. **Use bypass-powershell.bat** - Automated solution
3. **Restart computer** - Often fixes environment issues
4. **Reinstall Node.js** - If all else fails

## Prevention

1. Avoid complex PowerShell profiles
2. Keep Node.js and npm updated
3. Use CMD for npm commands when possible
4. Regular system maintenance

## Support Files Created

- `bypass-powershell.bat` - CMD-based solution
- `fix-powershell-hanging.ps1` - PowerShell fix script
- `restart-powershell.bat` - Easy restart script
- `status-check.bat` - System status checker

## Contact

If issues persist after trying all solutions:
1. Check Windows Event Viewer for errors
2. Update Windows to latest version
3. Consider system restore point
4. Contact system administrator 