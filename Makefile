.PHONY: install install-hooks install-all clean

OS := $(shell uname -s)
PIP := $(shell command -v pip3 || command -v pip)

install:
	@echo "Detected OS: $(OS)"
ifeq ($(OS),Darwin)
	@echo "Installing pre-commit using Homebrew..."
	@if command -v brew >/dev/null 2>&1; then \
		brew install pre-commit; \
	else \
		echo "Homebrew not found. Please install Homebrew first."; \
		exit 1; \
	fi
else
	@if [ -n "$(PIP)" ]; then \
		echo "Installing pre-commit using $(PIP)..."; \
		$(PIP) install --upgrade pip && $(PIP) install pre-commit; \
	else \
		echo "pip or pip3 not found. Please install Python and pip."; \
		echo "❌ pre-commit could not be installed using this Makefile."; \
		echo "👉 Please install pre-commit manually using your OS package manager."; \
		exit 1; \
	fi
endif

install-hooks:
	@echo "Installing git hooks..."
	pre-commit install
	pre-commit install --hook-type commit-msg
	pre-commit autoupdate

install-all: install install-hooks

clean:
	rm -rf .cache __pycache__
