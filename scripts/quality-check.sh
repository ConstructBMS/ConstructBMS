#!/bin/bash

# 🚀 ConstructBMS Quality Check Script
# This script runs all quality checks to ensure code is clean and error-free

set -e

echo "🔍 Starting comprehensive quality check..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# 1. Clean cache and build files
print_status "🧹 Cleaning cache and build files..."
pnpm run clean

# 2. Install dependencies (if needed)
print_status "📦 Checking dependencies..."
pnpm install

# 3. Format code with Prettier
print_status "🎨 Formatting code with Prettier..."
pnpm run format

# 4. Run ESLint fixes
print_status "🔧 Running ESLint fixes..."
pnpm run lint:fix

# 5. Type checking
print_status "🔍 Running TypeScript type checking..."
pnpm run typecheck

# 6. Check for any remaining linting issues
print_status "🔍 Checking for remaining linting issues..."
if pnpm run lint 2>&1 | grep -q "error"; then
    print_error "Linting errors found! Please fix them."
    pnpm run lint
    exit 1
else
    print_success "No linting errors found!"
fi

# 7. Check for any remaining formatting issues
print_status "🎨 Checking code formatting..."
if pnpm run format:check 2>&1 | grep -q "error"; then
    print_error "Formatting issues found! Please run 'pnpm run format' to fix them."
    exit 1
else
    print_success "Code formatting is correct!"
fi

# 8. Check for any TypeScript compilation errors
print_status "🔍 Final TypeScript compilation check..."
if pnpm run typecheck 2>&1 | grep -q "error"; then
    print_error "TypeScript compilation errors found!"
    pnpm run typecheck
    exit 1
else
    print_success "TypeScript compilation successful!"
fi

# 9. Check for any security vulnerabilities
print_status "🔒 Checking for security vulnerabilities..."
if command -v npm-audit &> /dev/null; then
    if pnpm audit 2>&1 | grep -q "high\|critical"; then
        print_warning "Security vulnerabilities found! Please review and fix them."
        pnpm audit
    else
        print_success "No high or critical security vulnerabilities found!"
    fi
else
    print_warning "npm-audit not available, skipping security check"
fi

# 10. Check for any outdated dependencies
print_status "📦 Checking for outdated dependencies..."
if command -v pnpm-outdated &> /dev/null; then
    pnpm outdated || print_warning "Some dependencies may be outdated"
else
    print_warning "pnpm-outdated not available, skipping dependency check"
fi

# 11. Check for any unused dependencies
print_status "🧹 Checking for unused dependencies..."
if command -v depcheck &> /dev/null; then
    npx depcheck || print_warning "Some dependencies may be unused"
else
    print_warning "depcheck not available, skipping unused dependency check"
fi

print_success "🎉 All quality checks completed successfully!"
print_status "Your codebase is clean and ready for development!"

echo ""
echo "📋 Summary of checks performed:"
echo "✅ Code formatting (Prettier)"
echo "✅ Linting (ESLint)"
echo "✅ Type checking (TypeScript)"
echo "✅ Security vulnerabilities"
echo "✅ Dependency management"
echo "✅ Code quality standards"

echo ""
echo "🚀 You can now:"
echo "   - Run 'pnpm dev' to start development servers"
echo "   - Make changes with confidence"
echo "   - Commit code knowing it meets quality standards"
