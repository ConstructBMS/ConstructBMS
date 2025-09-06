#!/bin/bash

# Development Server Manager
# Helps prevent ELIFECYCLE errors by properly managing processes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill processes on specific ports
kill_ports() {
    echo -e "${YELLOW}Killing processes on ports 5173 and 5174...${NC}"
    lsof -ti:5173,5174 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}Ports cleared${NC}"
}

# Function to clean cache and temporary files
clean_cache() {
    echo -e "${YELLOW}Cleaning cache and temporary files...${NC}"
    rm -rf frontend/dist frontend/.eslintcache frontend/node_modules/.vite
    rm -rf backend/dist backend/.eslintcache
    echo -e "${GREEN}Cache cleaned${NC}"
}

# Function to start development servers
start_dev() {
    echo -e "${YELLOW}Starting development servers...${NC}"

    # Kill any existing processes
    kill_ports

    # Clean cache
    clean_cache

    # Start backend in background
    echo -e "${GREEN}Starting backend on port 5174...${NC}"
    cd backend && pnpm dev &
    BACKEND_PID=$!

    # Wait a moment for backend to start
    sleep 2

    # Start frontend
    echo -e "${GREEN}Starting frontend on port 5173...${NC}"
    cd ../frontend && pnpm dev &
    FRONTEND_PID=$!

    # Function to cleanup on exit
    cleanup() {
        echo -e "\n${YELLOW}Shutting down servers...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        kill $FRONTEND_PID 2>/dev/null || true
        kill_ports
        echo -e "${GREEN}Servers stopped${NC}"
        exit 0
    }

    # Set up signal handlers
    trap cleanup SIGINT SIGTERM

    echo -e "${GREEN}Development servers started successfully!${NC}"
    echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
    echo -e "${GREEN}Backend: http://localhost:5174${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

    # Wait for processes
    wait
}

# Function to run quality checks
quality_check() {
    echo -e "${YELLOW}Running quality checks...${NC}"

    # Frontend checks
    echo -e "${GREEN}Running frontend linting...${NC}"
    cd frontend && pnpm lint

    echo -e "${GREEN}Running frontend typecheck...${NC}"
    pnpm typecheck

    echo -e "${GREEN}Running frontend build...${NC}"
    pnpm build

    # Backend checks
    echo -e "${GREEN}Running backend linting...${NC}"
    cd ../backend && pnpm lint

    echo -e "${GREEN}Running backend typecheck...${NC}"
    pnpm typecheck

    echo -e "${GREEN}All quality checks passed!${NC}"
}

# Main script logic
case "$1" in
    "start"|"dev")
        start_dev
        ;;
    "kill"|"stop")
        kill_ports
        ;;
    "clean")
        clean_cache
        ;;
    "quality"|"check")
        quality_check
        ;;
    "restart")
        kill_ports
        clean_cache
        start_dev
        ;;
    *)
        echo -e "${RED}Usage: $0 {start|dev|kill|stop|clean|quality|check|restart}${NC}"
        echo -e "${YELLOW}Commands:${NC}"
        echo -e "  start/dev  - Start development servers"
        echo -e "  kill/stop  - Kill processes on ports 5173 and 5174"
        echo -e "  clean      - Clean cache and temporary files"
        echo -e "  quality    - Run all quality checks"
        echo -e "  restart    - Kill, clean, and start servers"
        exit 1
        ;;
esac
