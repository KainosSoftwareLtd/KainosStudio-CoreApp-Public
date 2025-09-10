# Project Prompt Kainos Core

## Overview
This monorepo contains multiple design system packages, a core deployable Express application, and cloud-native Lambda functions. It supports dynamic selection of design systems and cloud providers (AWS/Azure), with modular architecture and strong TypeScript usage.

## Structure
- **AccelerateDeployable/**: Contains environment configuration
- **CoreDeployable/**: Main Express app with modular architecture
  - Entry point: `src/index.ts` (exports `createApp`)
  - `src/config/`: Environment and Express configuration
  - `src/container/`: Cloud services factory for AWS/Azure abstraction
  - `src/middlewares/`: Authentication, SSO, and permissions middleware
  - `src/services/`: Cloud provider implementations (AWS/Azure)
  - `src/utils/`: Design system utilities and cloud provider abstractions
  - `src/interfaces/`: TypeScript interface definitions
  - `schemas/`: JSON schemas for form components and validation
  - `services/`: Service configuration files (JSON)
- **CoreFCADS, CoreGCDS, CoreGovUK, CoreNhsUK, CoreOUDS, CoreWDS, CoreRuntime/**: Each is a design system or runtime package with its own `package.json`, `tsconfig.json`, `src/`, and `lib/`.
- **CoreKfdApi/**: Serverless app with functions for file operations
- **utils/**: Utility scripts for file and folder operations
- **pipeline_scripts/**: Shell scripts for deployment and build automation

## Key Patterns
- **Modular Architecture**: `CoreDeployable` now has a well-organized structure with separate folders for config, container, middlewares, services, and utilities
- **Renderer Selection**: `createApp` dynamically chooses a renderer (e.g., FCADSRenderer, GCDSRenderer) based on `context.service.designSystem` via `rendererFunc` in `utils/designSystemUtils.ts`
- **Static Paths**: Local static paths are aggregated from each design system if `useLocalStaticPaths` is true, managed through `getStaticPaths` utility
- **Cloud Provider Abstraction**: Supports AWS and Azure via dependency injection container in `container/CloudServicesContainer.ts`
  - AWS: `AwsFileService`, `AwsDynamoDbStore`, `AwsBucketService`
  - Azure: `AzureFileService`, `AzureCosmosDbStore`, `AzureStorageService`
- **Middleware Stack**: 
  - `middlewares/authMiddleware.ts`: Authentication middleware
  - `middlewares/ssoHandler.ts`: SSO/SAML authentication with Passport
  - `middlewares/permissionsPolicy.ts`: Custom permissions policies
  - Helmet for security, Express session management
- **Configuration Management**: 
  - `config/envConfig.ts`: Environment-based configuration
  - `config/expressConfiguration.ts`: Express app setup and security headers
- **Schema-Driven**: JSON schemas in `schemas/` for form components and validation
- **TypeScript**: Strong typing throughout, with type definitions and config files
- **Serverless Functions**: Lambda functions for file operations (upload/delete)

## Extending/Integrating
- **Add new design systems**: Create a package and update renderer logic in `CoreDeployable/src/utils/designSystemUtils.ts` (both `rendererMap` and static path functions)
- **Add new cloud providers**: Implement file and store services in `CoreDeployable/src/services/`, then update `container/CloudServicesContainer.ts`
- **Extend middleware**: Add custom middleware in `CoreDeployable/src/middlewares/` and integrate in `config/expressConfiguration.ts`
- **Add new schemas**: Create JSON schemas in `CoreDeployable/schemas/` for new form components
- **Serverless KFD functions**: Add new functions following the pattern in `CoreKfdApi/*` directories
- **Environment configuration**: Update `config/envConfig.ts` and corresponding `.env` files

## Useful Entry Points
- `CoreDeployable/src/index.ts`: Main app logic and configuration entry point
- `CoreDeployable/src/config/`: Environment configuration and Express setup
- `CoreDeployable/src/container/CloudServicesContainer.ts`: Cloud provider dependency injection container
- `CoreDeployable/src/utils/designSystemUtils.ts`: Design system selection and static paths
- `CoreDeployable/src/middlewares/`: Authentication, SSO, and security middleware
- `CoreDeployable/src/interfaces/`: TypeScript interface definitions
- `CoreDeployable/schemas/`: JSON schemas for form components
- `CoreKfdApi/`: Serverless app with functions for file operations
- `pipeline_scripts/`: Deployment and build automation
- `utils/`: File/folder utilities

---
This file is intended to help contributors and AI assistants quickly understand the architecture and integration points of the project.
