#!/bin/bash

# ConstructBMS Setup Script
# This script automates the setup process for the ConstructBMS application

set -e

echo "🏗️  ConstructBMS Setup Script"
echo "================================"

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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    cd frontend
    
    print_status "Installing frontend dependencies..."
    npm install
    
    print_status "Creating environment file..."
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
# Frontend Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5174/api
VITE_APP_NAME=ConstructBMS
VITE_APP_VERSION=1.0.0
EOF
        print_warning "Created .env.local file. Please update with your Supabase credentials."
    else
        print_status ".env.local file already exists"
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    cd backend
    
    print_status "Installing backend dependencies..."
    npm install
    
    print_status "Creating environment file..."
    if [ ! -f .env ]; then
        cat > .env << EOF
# Backend Environment Variables
PORT=5174
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
EOF
        print_warning "Created .env file. Please update with your Supabase credentials."
    else
        print_status ".env file already exists"
    fi
    
    cd ..
    print_success "Backend setup completed"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Create start-dev.sh script
    cat > start-dev.sh << 'EOF'
#!/bin/bash

# ConstructBMS Development Server Starter
echo "🚀 Starting ConstructBMS Development Servers..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "📡 Starting backend server on port 5174..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🌐 Starting frontend server on port 5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5174"
echo "   Press Ctrl+C to stop all servers"

# Wait for both processes
wait
EOF

    # Make the script executable
    chmod +x start-dev.sh
    
    print_success "Created start-dev.sh script"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. Set up your Supabase database:"
    echo "   - Create a new Supabase project"
    echo "   - Run the SQL commands from database/schema.sql"
    echo "   - Run the seed data from database/seed.sql"
    echo ""
    echo "2. Update environment variables:"
    echo "   - Edit frontend/.env.local with your Supabase URL and anon key"
    echo "   - Edit backend/.env with your Supabase service role key"
    echo ""
    echo "3. Start development servers:"
    echo "   ./start-dev.sh"
    echo ""
    echo "4. Access the application:"
    echo "   - Frontend: http://localhost:5173"
    echo "   - Backend:  http://localhost:5174"
    echo "   - Default admin: admin@constructbms.com"
    echo ""
    echo "📚 For more information, see README.md"
}

# Main setup function
main() {
    print_status "Starting ConstructBMS setup..."
    
    # Check prerequisites
    check_node
    check_npm
    
    # Setup frontend and backend
    setup_frontend
    setup_backend
    
    # Create development scripts
    create_dev_scripts
    
    # Show next steps
    show_next_steps
}

# Run the main function
main
