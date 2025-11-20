# Kainos Core App

## Kainos Core Repository

This repository contains the source code for the **Kainos Core** rendering engine.

Please refer to the README files within other subdirectories for further information.
<br>

The following folders are used by the **Application only**: 
- `CoreDeployable` - Core deployable files
- `CoreRuntime` - Core runtime files
- `Core...` - Code for specific design systems
- `CoreKfdApi` - Source code for uploading or deleting KFD files via serverless app

<br>

---

To build and start Kainos Core **LOCALLY**:

``` shell
cd CoreDeployable

npm run build

npm run start
```

## Development Setup

### Git Hooks Installation

This repository uses Git hooks to enforce [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages. This is required for automated semantic versioning and releases.

**Install the hooks before making your first commit:**

#### On Linux/macOS/Git Bash:
```bash
chmod +x hooks/install-hooks.sh
./hooks/install-hooks.sh
```

#### On Windows (Command Prompt):
```cmd
hooks\install-hooks.bat
```

### Commit Message Format

All commits must follow this format:
```
<type>[optional scope]: <description>
```

**Allowed types:**
- `feat`: New feature (minor version bump)
- `fix`: Bug fix (patch version bump)
- `docs`: Documentation changes (patch version bump)
- `chore`: Maintenance tasks (patch version bump)
- `refactor`: Code refactoring (patch version bump)
- `test`: Test updates (patch version bump)
- `perf`: Performance improvements (patch version bump)
- `ci`: CI/CD changes (patch version bump)
- `build`: Build system changes (patch version bump)
- `style`: Code formatting (patch version bump)

**Examples:**
```
feat: add user authentication
fix: resolve memory leak in data processing
docs: update API documentation
chore: update dependencies
feat(auth): add OAuth2 support
fix(api)!: change response format (breaking change)
```

For more details, see [hooks/README.md](hooks/README.md).

## License

This project is licensed under the terms of the license file included in this repository. Please see the [LICENSE](LICENSE) file for more information.

## Contributing

We welcome contributions to Kainos Core! Please read our [contributing guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.


