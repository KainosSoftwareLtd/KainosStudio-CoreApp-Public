# Git Hooks

This directory contains Git hooks that enforce code quality and commit standards.

## Installation

### On Linux/macOS:
```bash
chmod +x hooks/install-hooks.sh
./hooks/install-hooks.sh
```

### On Windows (Command Prompt):
```cmd
hooks\install-hooks.bat
```

### On Windows (Git Bash):
```bash
chmod +x hooks/install-hooks.sh
./hooks/install-hooks.sh
```

## commit-msg Hook

This hook enforces [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages.

### Required Format

```
<type>[optional scope]: <description>
```

### Allowed Types

- **feat**: A new feature (triggers minor version bump)
- **fix**: A bug fix (triggers patch version bump)
- **docs**: Documentation only changes (triggers patch version bump)
- **chore**: Changes that don't modify src or test files (triggers patch version bump)
- **refactor**: Code refactoring (triggers patch version bump)
- **test**: Adding or updating tests (triggers patch version bump)
- **perf**: Performance improvements (triggers patch version bump)
- **ci**: CI/CD configuration changes (triggers patch version bump)
- **build**: Build system or dependency changes (triggers patch version bump)
- **style**: Code style changes (formatting, semicolons, etc.) (triggers patch version bump)
- **revert**: Reverting a previous commit (triggers patch version bump)

### Examples

```
feat: add user authentication
fix: resolve memory leak in data processing
docs: update API documentation
chore: update dependencies
feat(auth): add OAuth2 support
fix(api)!: change response format
```

### Breaking Changes

For breaking changes, add `!` after the type/scope or include `BREAKING CHANGE:` in the commit footer.

## Why This Hook?

This repository uses semantic versioning with automated releases. The commit message format determines:
- Which version number to increment (major.minor.patch)
- What appears in the changelog
- Whether a release should be created

Without conventional commits, the CI/CD pipeline will fail.
