# 🏗️ ConstructBMS - Construction Business Management System

A comprehensive, modern construction business management platform built with React, Node.js, and
TypeScript.

## ✨ Features

- **📊 Dashboard**: Real-time business metrics and insights
- **👥 User Management**: Role-based access control with admin, manager, user, and viewer roles
- **📋 Project Management**: Multiple view modes (Card, Grid, Kanban, List)
- **📈 Programme Manager**: Asta PowerProject-style project planning with ribbon interface
- **🔐 Authentication**: Secure JWT-based authentication with Supabase
- **🎨 Modern UI**: Responsive design with Tailwind CSS and custom themes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:ConstructBMS/ConstructBMS.git
   cd ConstructBMS
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment setup**

   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your Supabase credentials
   ```

4. **Start development servers**

   ```bash
   # Terminal 1 - Backend (Port 5174)
   pnpm dev:backend

   # Terminal 2 - Frontend (Port 5173)
   pnpm dev:frontend
   ```

## 🏗️ Architecture

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT + Supabase Auth
- **Code Quality**: ESLint + Prettier + Husky + lint-staged

## 📁 Project Structure

```
ConstructBMS/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── database/          # Database schemas and migrations
├── .github/           # GitHub Actions workflows
├── docs/              # Documentation
└── scripts/           # Development and deployment scripts
```

## 🛠️ Development

### Available Scripts

- `pnpm dev` - Start both frontend and backend
- `pnpm build` - Build both applications
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Run TypeScript checks
- `pnpm quality` - Run all quality checks
- `pnpm snap` - Quick commit with timestamp

### Code Quality

- **Pre-commit hooks** automatically lint and format code
- **ESLint** enforces code style and catches errors
- **Prettier** ensures consistent formatting
- **TypeScript** provides type safety

## 🔐 Environment Variables

### Backend (.env)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=5174
```

## 📱 Features

### Dashboard

- Business metrics overview
- Recent activity feed
- Quick action buttons
- Responsive design for all devices

### Projects

- **Card View**: Visual project cards with status indicators
- **Grid View**: Compact table layout
- **Kanban View**: Drag-and-drop project management
- **List View**: Detailed project information

### Programme Manager

- **Outlook-style Ribbon**: Professional toolbar interface
- **Three-Pane Layout**: Programme tree, task list, and Gantt chart
- **Resizable Panes**: Customizable workspace layout
- **Task Management**: Full CRUD operations for tasks and phases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the development guide in `DEVELOPMENT_GUIDE.md`

---

**Built with ❤️ for the construction industry**

# Mirroring test - Thu Sep 4 11:41:10 BST 2025

# Mirroring test completed - Thu Sep 4 11:42:02 BST 2025

# Testing mirror workflow - Thu Sep 4 12:44:17 BST 2025

# Mirroring test - Thu Sep 4 13:26:42 BST 2025
