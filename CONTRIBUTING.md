# 🤝 Contributing to ConstructBMS

Thank you for your interest in contributing to ConstructBMS! This document provides guidelines and
information for contributors.

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Provide detailed reproduction steps
- Include system information and screenshots

### 🚀 Suggesting Features

- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Explain the problem and proposed solution
- Consider user impact and project alignment

### 💻 Code Contributions

- Fork the repository
- Create a feature branch
- Make your changes
- Submit a pull request

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git
- Supabase account (for development)

### Local Setup

```bash
# Fork and clone
git clone git@github.com:YOUR_USERNAME/ConstructBMS.git
cd ConstructBMS

# Install dependencies
pnpm install

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Start development servers
pnpm dev:backend  # Terminal 1
pnpm dev:frontend # Terminal 2
```

## 📝 Code Standards

### TypeScript

- Use strict mode
- Provide proper type annotations
- Avoid `any` type
- Use interfaces for object shapes

### React Components

- Functional components with hooks
- PascalCase naming
- Props interface definition
- Default exports for components

### Styling

- Tailwind CSS utilities
- Responsive design principles
- Accessibility considerations
- Consistent spacing and colors

### Backend

- Express.js best practices
- Middleware for common functionality
- Proper error handling
- Input validation

## 🔍 Code Quality

### Pre-commit Hooks

- ESLint: Code quality and style
- Prettier: Code formatting
- TypeScript: Type checking
- Husky: Git hooks management

### Testing

- Unit tests for utilities and hooks
- Integration tests for API endpoints
- Component testing with React Testing Library
- E2E testing for critical user flows

## 📋 Pull Request Process

### 1. Create Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 2. Make Changes

- Follow coding standards
- Add tests for new functionality
- Update documentation if needed

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 4. Push and Create PR

```bash
git push origin feature/amazing-feature
# Create PR on GitHub
```

### 5. PR Review

- Address review comments
- Ensure all checks pass
- Update PR description if needed

## 📚 Documentation

### Code Documentation

- JSDoc comments for functions
- README updates for new features
- API documentation updates
- Component prop documentation

### User Documentation

- Feature usage guides
- Troubleshooting guides
- Video tutorials (if applicable)
- Screenshots and examples

## 🧪 Testing Guidelines

### Frontend Testing

- Component unit tests
- Hook testing
- Integration tests
- Accessibility testing
- Cross-browser testing

### Backend Testing

- API endpoint testing
- Database operation testing
- Authentication testing
- Error handling testing

### Test Coverage

- Aim for 80%+ coverage
- Test critical user paths
- Test error scenarios
- Test edge cases

## 🔒 Security Considerations

### Code Review

- Review for security vulnerabilities
- Validate input handling
- Check authentication logic
- Verify authorization checks

### Dependencies

- Keep dependencies updated
- Monitor for vulnerabilities
- Use security scanning tools
- Review new package additions

## 📊 Performance

### Frontend

- Bundle size optimization
- Lazy loading implementation
- Image optimization
- Caching strategies

### Backend

- Database query optimization
- Caching implementation
- Rate limiting
- Response time monitoring

## 🎨 UI/UX Guidelines

### Design Principles

- Consistency across components
- Accessibility compliance
- Mobile-first responsive design
- Performance optimization

### Component Guidelines

- Reusable and composable
- Clear prop interfaces
- Default values where appropriate
- Error state handling

## 🚀 Release Process

### Versioning

- Semantic versioning (SemVer)
- Changelog maintenance
- Release notes preparation
- Tag creation

### Deployment

- Automated testing
- Build verification
- Deployment to staging
- Production deployment

## 📞 Getting Help

### Communication Channels

- GitHub Issues for bugs and features
- GitHub Discussions for questions
- Pull Request reviews for code feedback

### Resources

- [Development Guide](DEVELOPMENT_GUIDE.md)
- [README](README.md)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## 🙏 Recognition

Contributors will be recognized in:

- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors list

---

**Thank you for contributing to ConstructBMS! 🚀✨**

Your contributions help make construction business management better for everyone.
