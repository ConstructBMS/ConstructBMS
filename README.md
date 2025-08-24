# ConstructBMS - Construction Business Management System

A comprehensive business management system designed specifically for construction companies, built with React, TypeScript, Node.js, and Supabase.

## 🚀 Features

- **User Authentication** - Secure login/signup with JWT tokens
- **Dashboard** - Overview of key business metrics
- **Project Management** - Track projects, tasks, and timelines
- **CRM** - Manage clients, contractors, and consultants
- **Document Management** - Store and organize project documents
- **Communication Tools** - Email and messaging integration
- **Reporting** - Generate business reports and analytics

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database & Auth
- **JWT** - Authentication

### Development Tools
- **Husky** - Git hooks
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Commitlint** - Conventional commits
- **GitHub Actions** - CI/CD

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/constructbms.git
cd constructbms
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Set up environment variables
Create `.env` files in both `frontend/` and `backend/` directories:

**Frontend (.env)**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env)**
```env
PORT=5174
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

### 4. Start development servers
```bash
# Start both frontend and backend
pnpm dev

# Or start individually
pnpm dev:frontend  # Frontend on http://localhost:5173
pnpm dev:backend   # Backend on http://localhost:5174
```

## 📁 Project Structure

```
constructbms/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── database/               # Database schemas and migrations
├── docs/                   # Documentation
└── package.json           # Root package.json (monorepo)
```

## 🛠️ Development

### Available Scripts

**Root (Monorepo)**
```bash
pnpm dev              # Start both frontend and backend
pnpm build            # Build both frontend and backend
pnpm lint             # Lint all code
pnpm lint:fix         # Fix linting issues
pnpm typecheck        # Type check all TypeScript code
pnpm test             # Run tests
```

**Frontend**
```bash
pnpm dev:frontend     # Start frontend dev server
pnpm build:frontend   # Build frontend
pnpm lint:frontend    # Lint frontend code
```

**Backend**
```bash
pnpm dev:backend      # Start backend dev server
pnpm build:backend    # Build backend
pnpm lint:backend     # Lint backend code
```

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **Commitlint** - Conventional commit message validation
- **TypeScript** - Static type checking

### Git Workflow

1. **Conventional Commits** - All commits must follow conventional commit format:
   ```
   feat: add new user authentication
   fix: resolve login issue
   docs: update README
   ```

2. **Pre-commit Hooks** - Automatic linting and formatting on commit
3. **Branch Protection** - Main branch requires PR reviews

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**

### Backend Deployment
The backend can be deployed to:
- **Railway**
- **Heroku**
- **AWS EC2**
- **DigitalOcean**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all linting checks pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/constructbms/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.
