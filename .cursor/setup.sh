#!/bin/bash

# ConstructBMS Cursor Setup Script
# This script automatically starts both frontend and backend servers

echo "========================================"
echo "   ConstructBMS Cursor Auto-Setup"
echo "========================================"
echo

# Kill any existing Node processes
echo "Stopping any existing processes..."
pkill -f node 2>/dev/null || true
sleep 2

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start both servers using concurrently
echo "Starting development servers..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001/api/health"
echo

npm run dev:concurrent 