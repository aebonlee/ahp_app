# Contributing to AHP for Paper

First off, thank you for considering contributing to AHP for Paper! It's people like you that make AHP for Paper such a great tool.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for AHP for Paper. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting A Bug Report:**
- Check the existing issues to see if the problem has already been reported
- Check if the issue has been fixed in a recent update

**How Do I Submit A Good Bug Report?**

Bugs are tracked as GitHub issues. Create an issue and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the problem
- **Describe the exact steps which reproduce the problem** in as many details as possible
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs** if possible

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for AHP for Paper, including completely new features and minor improvements to existing functionality.

**Before Submitting An Enhancement Suggestion:**
- Check if there's already an issue that suggests the same enhancement
- Determine which repository the enhancement should be suggested in

**How Do I Submit A Good Enhancement Suggestion?**

Enhancement suggestions are tracked as GitHub issues. Create an issue and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the suggestion
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and **explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

The process described here has several goals:
- Maintain AHP for Paper's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible AHP for Paper
- Enable a sustainable system for AHP for Paper's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** in your forked repository
3. **Test your changes** thoroughly
4. **Update the documentation** if needed
5. **Commit your changes** using a descriptive commit message
6. **Push your branch** to your fork
7. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (for backend development)
- Git

### Setting Up Your Development Environment

1. **Clone the repository:**
```bash
git clone https://github.com/aebonlee/ahp_app.git
cd ahp_app
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd backend
npm install
```

4. **Set up environment variables:**
```bash
# In the backend directory
cp .env.example .env
# Edit .env with your configuration
```

5. **Run the development servers:**

Frontend:
```bash
npm start
```

Backend:
```bash
cd backend
npm run dev
```

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

## Style Guidelines

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Style Guide

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### React Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the existing component structure
- Add proper error handling

## Code of Conduct

### Our Pledge

We pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances.

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing to AHP for Paper! 🎉