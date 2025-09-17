# CoreKfdApi

The CoreKfdApi is a RESTful API service for managing Kainos Form Definition (KFD) files. It provides endpoints to create, update, and delete KFD configurations along with their associated authentication files.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [KFD File Structure](#kfd-file-structure)
- [Storage](#storage)
- [Error Handling](#error-handling)
- [Running the Application](#running-the-application)

## Overview

The CoreKfdApi is designed to manage form definitions and their authentication configurations. It supports multiple cloud storage providers (AWS, Azure) and includes comprehensive validation for KFD file structures.

## Architecture

The application is built with:
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Winston** - Logging
- **Zod** - Schema validation
- **Cloud Storage** - AWS S3 or Azure Blob Storage

## API Endpoints

### PUT /services
Creates or updates a KFD service configuration.

**Request Body:**
```json
{
  "name": "service-name",
  "content": {
    "pages": [...],
    "authentication": {...}
  }
}
```

**Validation Rules:**
- `name` is required and must contain only letters, numbers, spaces, and dashes
- `content` is required and must pass KFD validation
- Service name is converted to lowercase

**Success Response:**
```json
{
  "message": "{service-name} KFD saved successfully!"
}
```

**Error Responses:**
- `400` - Missing or invalid fields, validation errors
- `500` - Storage operation failed

### DELETE /services/:id
Deletes all files associated with a KFD service.

**Parameters:**
- `id` - Service name (URL encoded)

**Success Response:**
- `204` - No Content (successful deletion)

**Error Responses:**
- `404` - Service not found
- `500` - Storage operation failed

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUD_PROVIDER` | Cloud storage provider | `aws` or `azure` |
| `BUCKET_NAME` | Storage bucket/container name | `my-kfd-storage` |

### AWS-specific Variables
| Variable | Description |
|----------|-------------|
| Standard AWS credentials via SDK | Access Key, Secret Key, Region, etc. |

### Azure-specific Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_STORAGE_ACCOUNT` | Azure Storage Account name | `mystorageaccount` |
| `AZURE_STORAGE_CONTAINER` | Azure Blob container name | `kfd-container` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3002` |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging level | `info` |
| `AUTH_CONFIG_FILE_NAME` | Auth file name | `auth` |
| `API_KEYS` | Comma-separated API keys for authentication | (empty - no auth) |

### Logging Levels
Available values: `error`, `warn`, `info`, `debug`

## Authentication

The API supports optional Bearer token authentication:

1. **No Authentication**: If `API_KEYS` is not set or empty, all requests are allowed
2. **API Key Authentication**: If `API_KEYS` is set, requests must include:
   ```
   Authorization: Bearer <api-key>
   ```

**API Key Configuration:**
- Multiple keys can be provided: `API_KEYS=key1,key2,key3`
- Keys are trimmed and empty keys are ignored
- Any valid key from the list will authenticate the request

**Generating API Keys:**
You can generate secure API keys using OpenSSL:
```bash
openssl rand -base64 32 | tr '+/' '-_' | tr -d '='
```
This creates a URL-safe base64 encoded key suitable for Bearer token authentication.

## KFD File Structure

KFD (Kainos Form Definition) files define form structures with validation and conditional logic.

### Basic Structure
```json
{
  "pages": [
    {
      "id": "page1",
      "elements": [...],
      "nextPage": "page2" // or conditional object
    }
  ],
  "authentication": {
    // Optional authentication configuration
    // This will be saved as a separate file
  }
}
```

### Conditional Logic
Pages can have conditional navigation:
```json
{
  "nextPage": {
    "rules": [
      {
        "page": "target-page-id",
        "match": {
          "component-id": "expected-value"
        }
      }
    ]
  }
}
```

### Validation Rules
- All page references in conditional rules must exist
- Components referenced in rules must exist and be mandatory
- RadioField and SelectListField components must have matching option values
- Component IDs must be unique

## Storage

The API supports two cloud storage providers:

### File Organization
```
bucket/container/
├── service-name/
│   ├── service-name.json    # Main KFD file
│   └── auth.json           # Authentication config (if present)
└── another-service/
    ├── another-service.json
    └── auth.json
```

### Storage Operations
- **PUT**: Creates/updates both main KFD and auth files
- **DELETE**: Removes entire service folder and all contained files
- **List**: Enumerates all files in a service folder

## Error Handling

The API includes comprehensive error handling:

1. **Validation Errors** (400): Invalid request format, missing fields, KFD validation failures
2. **Authentication Errors** (401): Missing or invalid API key
3. **Not Found Errors** (404): Service doesn't exist (DELETE only)
4. **Server Errors** (500): Storage operations, unexpected errors

All errors return JSON with descriptive messages:
```json
{
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"] // For validation errors
}
```

## Running the Application

### Development
```bash
npm run start
```

### Production Build
```bash
npm run build
node lib/index.js
```

### Docker/Serverless
The application can be deployed as:
- Azure Functions (see `function.json`, `host.json`)
- AWS Lambda (see `lambda.ts`)
- Traditional server (see `local.ts`)

## Security Features

- **Security Headers**: Applied via middleware
- **No Caching**: `nocache()` middleware prevents caching
- **Content Type Validation**: Ensures proper JSON content
- **Method Validation**: Restricts to allowed HTTP methods
- **Input Validation**: Comprehensive validation of all inputs
- **API Key Authentication**: Optional Bearer token authentication

## Monitoring and Logging

All operations are logged with structured JSON format including:
- Request details
- Validation results
- Storage operations
- Error conditions
- Performance metrics

Log levels can be adjusted via `LOG_LEVEL` environment variable for different deployment environments.