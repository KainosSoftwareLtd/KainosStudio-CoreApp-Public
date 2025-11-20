#!/bin/sh
# Setup script for Git hooks - works on Linux, macOS, and Windows (Git Bash)

echo "Installing Git hooks..."

# Get the git hooks directory
HOOKS_DIR=".git/hooks"

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository root directory"
    exit 1
fi

# Copy the commit-msg hook
if [ -f "hooks/commit-msg" ]; then
    cp hooks/commit-msg "$HOOKS_DIR/commit-msg"
    chmod +x "$HOOKS_DIR/commit-msg"
    echo "✅ commit-msg hook installed"
else
    echo "❌ Error: hooks/commit-msg not found"
    exit 1
fi

echo ""
echo "✅ Git hooks installed successfully!"
echo ""
echo "All commits must now follow Conventional Commits format:"
echo "  <type>[optional scope]: <description>"
echo ""
echo "Example: feat: add new authentication feature"
