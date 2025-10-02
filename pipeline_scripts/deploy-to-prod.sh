#!/bin/bash
set -e

log_message() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1"
}

if [ -z "$1" ]; then
  log_message "ERROR: Version parameter is required"
  echo "Usage: $0 <version>"
  exit 1
fi

VERSION="$1"
log_message "Starting artifact copy for version: $VERSION"

PIPELINE_DIR="$GITHUB_WORKSPACE/pipeline_scripts"
export ENVIRONMENT="prod"

log_message "Setting ENVIRONMENT=$ENVIRONMENT"

cd $PIPELINE_DIR || { log_message "ERROR: Pipeline directory not found"; exit 1; }

log_message "Sourcing functions.sh"
if [ ! -f "./functions.sh" ]; then
  log_message "ERROR: functions.sh not found in $(pwd)"
  ls -la
  exit 1
fi
source ./functions.sh

log_message "Getting bucket names from SSM parameters (using prod profile)"
# Get S3 bucket base name using prod profile since SSM parameters are in prod account
export AWS_PROFILE=prod
s3_bucket_zip_files
STAGING_BUCKET="$S3-staging"
PROD_BUCKET="$S3-$ENVIRONMENT"

log_message "STAGING_BUCKET: $STAGING_BUCKET"
log_message "PROD_BUCKET: $PROD_BUCKET"

log_message "Checking if version $VERSION exists in staging bucket (using nonprod profile)"

# Switch to nonprod profile for staging bucket access
export AWS_PROFILE=nonprod
aws s3 ls s3://$STAGING_BUCKET/ | grep -v '/$' | grep "v${VERSION}"
if [ $? -ne 0 ]; then
  log_message "ERROR: Version $VERSION not found in staging bucket $STAGING_BUCKET"
  exit 1
fi
log_message "Version $VERSION found in staging bucket"

# Create temporary directory for artifacts
TEMP_DIR="/tmp/artifacts_v${VERSION}"
mkdir -p "$TEMP_DIR"
log_message "Created temporary directory: $TEMP_DIR"

log_message "Downloading versioned artifacts from staging to local runner (using nonprod profile)"
artifacts_downloaded=0

# Use nonprod profile for staging bucket access
export AWS_PROFILE=nonprod
aws s3 ls s3://$STAGING_BUCKET/ | grep -v '/$' | grep "v${VERSION}" | awk '{print $4}' | while read FILENAME; do
  log_message "Downloading $FILENAME from staging to local runner"
  aws s3 cp s3://$STAGING_BUCKET/$FILENAME "$TEMP_DIR/$FILENAME"
  artifacts_downloaded=$((artifacts_downloaded + 1))
done

log_message "Downloaded artifacts to local runner"

log_message "Uploading artifacts from local runner to prod bucket (using prod profile)"
artifacts_uploaded=0
# Switched to prod profile for prod bucket access
export AWS_PROFILE=prod
for FILENAME in "$TEMP_DIR"/*; do
  if [ -f "$FILENAME" ]; then
    BASENAME=$(basename "$FILENAME")
    log_message "Uploading $BASENAME from runner to prod bucket"
    aws s3 cp "$FILENAME" s3://$PROD_BUCKET/$BASENAME
    artifacts_uploaded=$((artifacts_uploaded + 1))
  fi
done

log_message "$artifacts_uploaded artifacts uploaded successfully to prod"

# Clean up temporary directory
rm -rf "$TEMP_DIR"
log_message "Cleaned up temporary directory"

export SEMANTIC_VERSION="$VERSION"


log_message "Running update-lambda-functions.sh with version $SEMANTIC_VERSION"
./update-lambda-functions.sh "$SEMANTIC_VERSION"

log_message "Verifying Lambda deployments in $ENVIRONMENT environment (using prod profile)"

export AWS_PROFILE=prod

CORE_LAMBDA=$(aws ssm get-parameter \
  --name /lambda/kccorename \
  --query Parameter.Value \
  --output text)-$ENVIRONMENT
  
KFD_LAMBDA=$(aws ssm get-parameter \
  --name /lambda/kckfdapiname \
  --query Parameter.Value \
  --output text)-$ENVIRONMENT

log_message "Checking $CORE_LAMBDA code version..."
aws lambda get-function --function-name $CORE_LAMBDA --query 'Configuration.LastModified'

log_message "Checking $KFD_LAMBDA code version..."
aws lambda get-function --function-name $KFD_LAMBDA --query 'Configuration.LastModified'

log_message "Deployment verification completed successfully"