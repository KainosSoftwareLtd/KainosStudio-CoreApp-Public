# Kainos Core Deployable

This directory contains the deployable components of the Kainos Core rendering engine.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm
- Docker (optional, for local DynamoDB)

### Environment Configuration

Set up the environment by adding a `.env` file to the root folder (CoreDeployable folder) with the following configuration:

#### Required Variables

| Variable | Description |
|----------|-------------|
| `COOKIE_SECRET` | Secret key for encrypting session data |
| `SESSION_SECRET` | Secret key for encrypting auth session data |
| `AUTH_CONFIG_FILE_NAME` | Name for auth configuration file for each form |
| `ALLOWED_ORIGIN` | Used for API endpoint CORS configuration |
| `CLOUD_PROVIDER` | Cloud provider to use (must be 'aws' or 'azure') |
| `FORM_SESSION_TABLE_NAME` | Table name for storing user's form data |

##### AWS-specific Required Variables (when CLOUD_PROVIDER='aws')

| Variable | Description |
|----------|-------------|
| `BUCKET_NAME` | S3 bucket name for KFD files |
| `BUCKET_NAME_FOR_FORM_FILES` | S3 bucket name for storing files uploaded by users |
| `BUCKET_REGION_FOR_FORM_FILES` | AWS region where the file storage bucket is hosted |

##### Azure-specific Required Variables (when CLOUD_PROVIDER='azure')

| Variable | Description |
|----------|-------------|
| `AZURE_STORAGE_ACCOUNT` | Azure Storage Account name for KFD files |
| `AZURE_STORAGE_CONTAINER` | Azure Storage Container name for KFD files |
| `AZURE_STORAGE_ACCOUNT_FOR_FORM_FILES` | Azure Storage Account name for storing files uploaded by users |
| `AZURE_STORAGE_CONTAINER_FOR_FORM_FILES` | Azure Storage Container name for storing files uploaded by users |
| `AZURE_COSMOS_ENDPOINT` | Azure Cosmos DB endpoint URL |
| `AZURE_COSMOS_DATABASE` | Azure Cosmos DB database name |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `USE_LOCAL_SERVICES` | Load KFD files from `services` folder | false |
| `LOG_LEVEL` | Log verbosity | info |
| `MAX_ALLOWED_FILE_SIZE_TO_UPLOAD` | Maximum file upload size in MB | 100 |
| `USE_LOCAL_DYNAMODB` | Use local DynamoDB instance | false |

##### Available Log Levels
- trace
- debug
- info
- warn
- error
- fatal

#### Example Configuration

##### AWS Configuration Example
```
COOKIE_SECRET='your-secure-cookie-secret'
SESSION_SECRET='your-secure-session-secret'
CLOUD_PROVIDER='aws'
BUCKET_NAME='your-kfd-files-bucket'
BUCKET_NAME_FOR_FORM_FILES='your-form-data-bucket'
BUCKET_REGION_FOR_FORM_FILES='your-aws-region'
AUTH_CONFIG_FILE_NAME='auth'
PORT=3000
USE_LOCAL_SERVICES='true'
LOG_LEVEL='debug'
ALLOWED_ORIGIN='http://localhost:3000/'
MAX_ALLOWED_FILE_SIZE_TO_UPLOAD='10'
USE_LOCAL_DYNAMODB='false'
FORM_SESSION_TABLE_NAME='Core_FormSessions_dev'
```

##### Azure Configuration Example
```
COOKIE_SECRET='your-secure-cookie-secret'
SESSION_SECRET='your-secure-session-secret'
CLOUD_PROVIDER='azure'
AZURE_STORAGE_ACCOUNT='your-storage-account'
AZURE_STORAGE_CONTAINER='kfd-files'
AZURE_STORAGE_ACCOUNT_FOR_FORM_FILES='your-form-files-storage-account'
AZURE_STORAGE_CONTAINER_FOR_FORM_FILES='submitted-forms'
AZURE_COSMOS_ENDPOINT='https://your-cosmosdb.documents.azure.com:443/'
AZURE_COSMOS_DATABASE='your-database-name'
AUTH_CONFIG_FILE_NAME='auth'
PORT=3000
USE_LOCAL_SERVICES='true'
LOG_LEVEL='debug'
ALLOWED_ORIGIN='http://localhost:3000/'
MAX_ALLOWED_FILE_SIZE_TO_UPLOAD='10'
FORM_SESSION_TABLE_NAME='FormSessions'
```

> **Note:** Never commit your `.env` file to version control. It has been added to `.gitignore` for your protection.

---

## Installation and Running

### Building the Application

The required packages can be built and installed by running:

```bash
npm run build
```

You do not need to run `npm install` first, as the build command also installs the required packages.

### Running in Development Mode

To run the application with automatic reloading on code changes:

```bash
npm run start:watch
```

For a full list of available commands, refer to the `package.json` file.

## Form Definition Files

When running locally with `USE_LOCAL_SERVICES=true`, the application reads KFD (Kainos Form Definition) files from the `services` folder. The filename is used as the route key.

For example:
- A file named `form.json` will be accessible at `http://localhost:3000/form/`
- The port may differ based on your environment configuration

## Local Development with DynamoDB

For local development, you can use a containerized DynamoDB instance:

### 1. Pull and Run DynamoDB Local

```bash
docker pull amazon/dynamodb-local
docker run -d -p 8000:8000 amazon/dynamodb-local
```

### 2. Create Required Table

DynamoDB local stores data in memory by default. After restarting the container, you'll need to recreate tables.

For macOS/Linux:
```bash
export AWS_ACCESS_KEY_ID="local"
export AWS_SECRET_ACCESS_KEY="local"

aws dynamodb create-table \
    --table-name Core_FormSessions_dev \
    --attribute-definitions \
        AttributeName=form_id,AttributeType=S \
        AttributeName=session_id,AttributeType=S \
    --key-schema \
        AttributeName=form_id,KeyType=HASH \
        AttributeName=session_id,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --endpoint-url http://localhost:8000 \
    --region local
```

For Windows PowerShell:
```powershell
$env:AWS_ACCESS_KEY_ID = "local"
$env:AWS_SECRET_ACCESS_KEY = "local"

aws dynamodb create-table `
    --table-name Core_FormSessions_dev `
    --attribute-definitions `
        AttributeName=form_id,AttributeType=S `
        AttributeName=session_id,AttributeType=S `
    --key-schema `
        AttributeName=form_id,KeyType=HASH `
        AttributeName=session_id,KeyType=RANGE `
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 `
    --endpoint-url http://localhost:8000 `
    --region local
```
---

## Testing

### UI Tests

The application uses Cucumber with Selenium for feature/UI testing:

```bash
npm run test
```

Selected tests can be run with the below command. Only tests tagged with @torun will be performed:

```bash
npm run selected_test
```

### Debugging tests
In order to be able to debug tests, create `launch.json` file in `CoreDeployable/.vscode`. Sample content below:

```
{
    "version": "0.2.0",
    "configurations": [

        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${file}",
            "outFiles": [
                "${workspaceFolder}/**/*.js"
            ]
        },
        {
      "name": "testDebugger",
      "type": "node",
      "request": "launch",      
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "program": "node_modules/@cucumber/cucumber/bin/cucumber-js",
      "args": [
        "--config",
        "cucumber.js",
        "--tags",
        "@torun",       
        "--format", "progress",
        "--format", "json:./Reports/cucumber_report.json"    
      ]
    }
    ]
}
```

---
### Performance Tests
K6 performance testing scripts simulate a complete user journey through a form-based web application, testing both page load performance and form submission capabilities. Documentation can be found here: https://grafana.com/docs/k6/latest/

#### TLDR
- Add `PERF_TEST_URL` to your `.env` file
- Launch docker
- Run `npm run perftest` or `npm run perftestwin`


#### Scripts
All performance testing scripts are located in the `test/performance` folder:
- **script.js** - Comprehensive form workflow performance testing
    - **Page load performance**: GET request testing for all form pages
    - **Form submission performance**: POST request testing with realistic form data
    - **End-to-end user journey**: Complete workflow testing from initial page load through final submission
- **warmup.js** - Lambda cold start mitigation script
    - **Purpose**: Provisions 5 Lambda instances before main performance tests to eliminate cold start delays
    - **Execution**: Sends 5 concurrent requests to warm up Lambda instances
    - **Integration**: Automatically executed in GitHub Actions workflow before main performance tests

#### Features
- Individual thresholds for each form step defined in options.threshold:
    - `'http_req_duration{name:enter_text}': ['p(95)<1000']`
    - `'http_req_duration{name:enter_text_submit}': ['p(95)<2000'],`
- Separate monitoring for GET (page load) and POST (form submission) operations

#### Configuration
- **Load stages**: Ramp-up, sustained load, and ramp-down phases are defined in `options.stages` with the number of virtual users for each stage
- **Form pages**: Each form page is defined in `tagNames`. The `services` array contains partial URLs for those pages. The `formData` object defines request body data for page submissions.


#### Running from Docker
##### setup on DEV:
- Add `PERF_TEST_URL` to your `.env` file pointing out to DEV  CoreApp environment

##### setup on local CoreApp:
- make sure you have local CoreApp running on the selected port with `USE_LOCAL_SERVICES=true`
- add `PERF_TEST_URL` defined in your `.env` file as `http://host.docker.internal:{$port}` where port is the same as for local CoreApp instance
- make sure your Docker is up and running

##### running:

```bash
# For macOS/Linux
npm run perftest

# For Windows
npm run perftestwin
```
#### Running from local machine
1. install k6 on your machine `brew install k6`
2. run in terminal: `export PERF_TEST_URL={url for environment here} && k6 run ./test/performance/script.js`

#### Reporting
After each run CSV report is available in `test/performance/test_results.csv`
The script provides tagged metrics for:
- **http_req_duration** - Overall response time distribution
- **http_req_failed** - Request failure rate
- Individual endpoint performance by tag name
    - **Page Load Performance**: {name:endpoint_name}
    - **Form Submission Performance**: {name:endpoint_name_submit}
    - **Complete User Journey**: End-to-end timing analysis
- Form submission vs. page load performance comparison

#### GitHub Actions Integration
Performance tests can be automated via GitHub Actions workflow (`.github/workflows/run-perf-tests.yaml`):

**Workflow Features:**
- **Scheduled execution**: Automatically runs on DEV environment daily at 6pm UTC
- **Manual trigger**: Use `workflow_dispatch` to run on-demand with environment selection (DEV/STAGING)
- **Lambda warmup**: Automatically executes `warmup.js` before main tests to prevent cold start impact
- **Environment management**: Uses GitHub secrets for environment-specific configuration
- **Artifact collection**: Uploads CSV test results as workflow artifacts

**Environment Variables:**
- DEV: Uses `PERF_TEST_URL_DEV` secret
- STAGING: Uses `PERF_TEST_URL_STAGING` secret
---
## Deployment

### Local vs Cloud Deployment

The application has two main entry points:
- `local.ts` - Used when running locally, loads form definitions from the `services` folder when `USE_LOCAL_SERVICES=true`
- `lambda.ts` - Used when running in AWS, loads form definitions from an S3 bucket

### Cloud Deployment Instructions

For cloud deployment, you'll need to:
1. Configure appropriate AWS credentials and permissions
2. Set up your infrastructure (S3 buckets, DynamoDB tables, etc.)
3. Deploy using your preferred method (AWS CDK, CloudFormation, Terraform, etc.)

### Form Definition Files in the Cloud

When deployed to the cloud, form definition files should be stored in an S3 bucket with appropriate naming conventions.

## Contributing

Please see the [CONTRIBUTING.md](../CONTRIBUTING.md) file in the repository root for details on how to contribute to this project.

## License

This project is licensed under the terms specified in the [LICENSE](../LICENSE) file in the repository root.