# Kainos Core Runtime

This package provides the core runtime functionality for the Kainos Core rendering engine. It serves as a foundational component for other modules in the Kainos Core ecosystem.

## Overview

Core Runtime contains shared utilities, helpers, and base classes used across the Kainos Core platform. It is designed to be lightweight and efficient, providing only the essential functionality needed by other packages.

## Prerequisites

- Node.js (LTS version recommended)
- npm

## Installation

To use this package in another project:

```shell
npm install @kainos/core-runtime
```

## Development

### Building the Package

To build the package locally:

1. Clone the repository and navigate to the CoreRuntime directory:

```shell
cd CoreRuntime
```

2. Install the required dependencies:

```shell
npm install
```

3. Build the package:

```shell
npm run build
```

4. Create a packaged version (generates a `.tgz` file):

```shell
npm pack
```

The resulting `.tgz` file can be used for local testing or deployment.

### Testing

Run the test suite with:

```shell
npm test
```

## Project Structure

- `/src` - Source code
- `/lib` - Compiled output (generated during build)
- `/__tests__` - Test files

## Contributing

Please see the [CONTRIBUTING.md](../CONTRIBUTING.md) file in the repository root for information on how to contribute to this project.

## License

This project is licensed under the terms specified in the [LICENSE](../LICENSE) file in the repository root.
