#!/bin/bash

# ConstructBMS Development Helper Script
# This script helps with common development tasks and troubleshooting

set -e

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

# Function to check if ports are in use
check_ports() {
    print_status "Checking port usage..."
    
    if lsof -ti:5173 >/dev/null 2>&1; then
        print_warning "Port 5173 (frontend) is in use"
        lsof -ti:5173 | xargs ps -p
    else
        print_success "Port 5173 (frontend) is available"
    fi
    
    if lsof -ti:5174 >/dev/null 2>&1; then
        print_warning "Port 5174 (backend) is in use"
        lsof -ti:5174 | xargs ps -p
    else
        print_success "Port 5174 (backend) is available"
    fi
}

# Function to kill processes on ports
kill_ports() {
    print_status "Killing processes on ports 5173 and 5174..."
    
    if lsof -ti:5173 >/dev/null 2>&1; then
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
        print_success "Killed processes on port 5173"
    fi
    
    if lsof -ti:5174 >/dev/null 2>&1; then
        lsof -ti:5174 | xargs kill -9 2>/dev/null || true
        print_success "Killed processes on port 5174"
    fi
}

# Function to clean caches
clean_caches() {
    print_status "Cleaning caches..."
    
    # Clean frontend cache
    if [ -d "frontend" ]; then
        cd frontend
        npm run clean 2>/dev/null || true
        cd ..
        print_success "Cleaned frontend cache"
    fi
    
    # Clean node_modules cache
    if [ -d "node_modules" ]; then
        rm -rf node_modules/.cache 2>/dev/null || true
        print_success "Cleaned node_modules cache"
    fi
}

# Function to check dependencies
check_deps() {
    print_status "Checking dependencies..."
    
    if [ -f "package.json" ]; then
        if [ ! -d "node_modules" ]; then
            print_warning "node_modules not found, installing dependencies..."
            npm install
        else
            print_success "Dependencies are installed"
        fi
    fi
    
    if [ -f "frontend/package.json" ]; then
        if [ ! -d "frontend/node_modules" ]; then
            print_warning "Frontend node_modules not found, installing dependencies..."
            cd frontend && npm install && cd ..
        else
            print_success "Frontend dependencies are installed"
        fi
    fi
    
    if [ -f "backend/package.json" ]; then
        if [ ! -d "backend/node_modules" ]; then
            print_warning "Backend node_modules not found, installing dependencies..."
            cd backend && npm install && cd ..
        else
            print_success "Backend dependencies are installed"
        fi
    fi
}

# Function to run linting
run_lint() {
    print_status "Running linting..."
    
    if [ -f "frontend/package.json" ]; then
        cd frontend
        npm run lint 2>/dev/null || print_warning "Linting failed or not configured"
        cd ..
    fi
    
    if [ -f "backend/package.json" ]; then
        cd backend
        npm run lint 2>/dev/null || print_warning "Linting failed or not configured"
        cd ..
    fi
}

# Function to run type checking
run_typecheck() {
    print_status "Running type checking..."
    
    if [ -f "frontend/package.json" ]; then
        cd frontend
        npm run typecheck 2>/dev/null || print_warning "Type checking failed or not configured"
        cd ..
    fi
    
    if [ -f "backend/package.json" ]; then
        cd backend
        npm run typecheck 2>/dev/null || print_warning "Type checking failed or not configured"
        cd ..
    fi
}

# Function to start development servers
start_dev() {
    print_status "Starting development servers..."
    
    # Kill any existing processes
    kill_ports
    
    # Clean caches
    clean_caches
    
    # Check dependencies
    check_deps
    
    # Start servers
    print_status "Starting servers with npm run dev..."
    npm run dev
}

# Function to show help
show_help() {
    echo "ConstructBMS Development Helper"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  check-ports    Check if ports 5173 and 5174 are in use"
    echo "  kill-ports     Kill processes on ports 5173 and 5174"
    echo "  clean          Clean all caches"
    echo "  deps           Check and install dependencies"
    echo "  lint           Run linting on all packages"
    echo "  typecheck      Run type checking on all packages"
    echo "  start          Start development servers (with cleanup)"
    echo "  restart        Kill ports, clean, and restart servers"
    echo "  help           Show this help message"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "check-ports")
        check_ports
        ;;
    "kill-ports")
        kill_ports
        ;;
    "clean")
        clean_caches
        ;;
    "deps")
        check_deps
        ;;
    "lint")
        run_lint
        ;;
    "typecheck")
        run_typecheck
        ;;
    "start")
        start_dev
        ;;
    "restart")
        kill_ports
        clean_caches
        check_deps
        print_status "Starting fresh development servers..."
        npm run dev
        ;;
    "help"|*)
        show_help
        ;;
esac
