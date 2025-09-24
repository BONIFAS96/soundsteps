# Contributing to SoundSteps

Thank you for your interest in contributing to SoundSteps! This document provides guidelines for contributing to our voice-first educational platform.

## 🎯 Project Overview

SoundSteps is a hybrid educational platform combining voice-first IVR lessons with a React Native companion app, designed specifically for visually impaired and low-literacy learners.

## 🚀 Getting Started

### Development Setup
1. **Prerequisites**:
   - Node.js 18+
   - npm or yarn
   - Git
   - Expo CLI (for mobile app)

2. **Clone and Setup**:
   ```bash
   git clone https://github.com/Eli-Keli/soundsteps.git
   cd soundsteps
   
   # Backend setup
   cd soundsteps-backend
   npm install
   cp .env.example .env
   # Configure your .env file
   
   # Frontend setup
   cd ../soundsteps-app
   npm install
   ```

3. **Start Development Servers**:
   ```bash
   # Terminal 1: Backend
   cd soundsteps-backend && npm run dev
   
   # Terminal 2: Frontend  
   cd soundsteps-app && npx expo start
   ```

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use for consistent code formatting
- **Comments**: Clear, meaningful comments for complex logic

### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Scopes** (optional):
- `backend`: Backend/API changes
- `frontend`: React Native app changes
- `ivr`: Voice/IVR system changes
- `auth`: Authentication system
- `database`: Database schema or queries
- `docs`: Documentation

**Examples**:
- `feat(ivr): add retry logic for failed DTMF input`
- `fix(auth): resolve JWT token expiration handling`
- `docs(api): update authentication endpoints`
- `refactor(database): optimize session queries`

## 🏗️ Architecture Guidelines

### Backend (Node.js + TypeScript)
- **Structure**: Follow existing folder organization in `src/`
- **Database**: Use parameterized queries (SQLite/PostgreSQL)
- **API Design**: RESTful endpoints with proper HTTP status codes
- **Error Handling**: Comprehensive error middleware
- **Authentication**: JWT tokens with proper validation

### Frontend (React Native + Expo)
- **Components**: Reusable components in `components/`
- **Hooks**: Custom hooks in `hooks/`
- **Navigation**: File-based routing with Expo Router
- **State Management**: React Query for server state
- **Styling**: Theme-based styling system

### Voice/IVR System
- **State Machine**: Clear state definitions in `lessonFlow.ts`
- **Voice XML**: Proper Africa's Talking response format
- **DTMF Handling**: Robust keypad input processing
- **Session Management**: Consistent session state tracking

## 🧪 Testing Requirements

### Backend Testing
- **Unit Tests**: Business logic and utilities
- **Integration Tests**: API endpoints
- **Voice Flow Tests**: Mock Africa's Talking webhooks
- **Database Tests**: Model operations and queries

### Frontend Testing
- **Component Tests**: UI component behavior
- **Hook Tests**: Custom hook functionality
- **Navigation Tests**: Screen routing
- **API Integration**: Mock API responses

### Testing Commands
```bash
# Backend tests
cd soundsteps-backend && npm test

# Frontend tests
cd soundsteps-app && npm test

# Linting
npm run lint
```

## 📝 Documentation Standards

### Code Documentation
- **JSDoc**: For functions and complex logic
- **README**: Keep project README up to date
- **API Docs**: Update API reference for endpoint changes
- **Comments**: Explain "why" not just "what"

### Documentation Updates
- Update relevant docs when adding features
- Include examples in API documentation
- Update architecture diagrams for major changes
- Keep deployment guides current

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Node.js version, device type
2. **Steps to Reproduce**: Clear, numbered steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots/Logs**: If applicable
6. **Additional Context**: Any other relevant information

Use this template:
```markdown
## Bug Description
Brief description of the issue

## Environment
- OS: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
- Node.js: [e.g. 18.17.0]
- Device: [e.g. iPhone 14, Android Pixel 6]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Actual Behavior
A clear description of what actually happened.

## Screenshots/Logs
If applicable, add screenshots or error logs.

## Additional Context
Any other context about the problem.
```

## 🚀 Feature Requests

For new features:

1. **Check Existing Issues**: Avoid duplicates
2. **Describe the Problem**: What problem does this solve?
3. **Proposed Solution**: How should it work?
4. **Alternatives**: Other solutions considered
5. **Additional Context**: Use cases, examples

## 🔀 Pull Request Process

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Follow coding standards
4. **Add Tests**: Ensure adequate test coverage
5. **Update Documentation**: Keep docs in sync
6. **Test Thoroughly**: All tests must pass
7. **Commit Changes**: Use conventional commit format
8. **Push Branch**: `git push origin feature/your-feature-name`
9. **Create Pull Request**: Use the PR template

### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Voice call flow tested (if applicable)
- [ ] Mobile app tested on device/simulator

## Screenshots (if applicable)
Add screenshots of UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented appropriately
- [ ] Documentation updated
- [ ] No breaking changes without version bump
- [ ] All tests pass
```

## 👥 Community Guidelines

### Be Respectful
- Use inclusive language
- Be respectful of different viewpoints
- Accept constructive criticism gracefully
- Help others learn and grow

### Be Collaborative
- Share knowledge and resources
- Ask questions when unsure
- Provide helpful feedback
- Celebrate team achievements

### Focus on Accessibility
- Remember our target users (visually impaired, low-literacy)
- Test with accessibility tools
- Consider voice-first interactions
- Maintain inclusive design principles

## 🏷️ Issue Labels

We use these labels to organize issues:

- **Type Labels**:
  - `bug` - Something isn't working
  - `enhancement` - New feature or improvement
  - `documentation` - Documentation improvements
  - `question` - Further information requested

- **Component Labels**:
  - `backend` - Backend/API related
  - `frontend` - React Native app related
  - `ivr` - Voice/IVR system related
  - `database` - Database related

- **Priority Labels**:
  - `priority: high` - Critical issues
  - `priority: medium` - Important improvements
  - `priority: low` - Nice to have

- **Status Labels**:
  - `good first issue` - Good for newcomers
  - `help wanted` - Extra attention needed
  - `blocked` - Blocked by other work

## 🎓 Learning Resources

### Project-Specific
- [Technical Architecture](docs/Technical-Architecture.md)
- [API Reference](docs/API-Reference.md)
- [Deployment Guide](docs/Deployment-Guide.md)

### Technologies
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Africa's Talking API](https://developers.africastalking.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community chat
- **Documentation**: Check our comprehensive docs first
- **Code Review**: Ask for feedback in pull requests

## 🙏 Recognition

We appreciate all contributors! Contributors will be:
- Listed in our README
- Credited in release notes
- Invited to our contributor community
- Given recognition for their valuable contributions

Thank you for helping make education more accessible! 🎓✨