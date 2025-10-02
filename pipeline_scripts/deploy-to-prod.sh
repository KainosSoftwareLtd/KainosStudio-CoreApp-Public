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
log_message "Starting deployment for version: $VERSION"

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

log_message "Getting bucket names from SSM parameters"
s3_bucket_zip_files
STAGING_BUCKET="$S3-staging"
PROD_BUCKET="$S3-$ENVIRONMENT"

log_message "STAGING_BUCKET: $STAGING_BUCKET"
log_message "PROD_BUCKET: $PROD_BUCKET"

# Copy artifacts from staging
log_message "Checking if version $VERSION exists in staging bucket"
aws s3 ls s3://$STAGING_BUCKET/ | grep -v '/$' | grep "v${VERSION}"
if [ $? -ne 0 ]; then
  log_message "ERROR: Version $VERSION not found in staging bucket $STAGING_BUCKET"
  exit 1
fi
log_message "Version $VERSION found in staging bucket"

log_message "Copying versioned artifacts from staging to prod"
artifacts_copied=0
aws s3 ls s3://$STAGING_BUCKET/ | grep -v '/$' | grep "v${VERSION}" | awk '{print $4}' | while read FILENAME; do
  log_message "Copying $FILENAME from staging to prod"
  aws s3 cp s3://$STAGING_BUCKET/$FILENAME s3://$PROD_BUCKET/$FILENAME
  artifacts_copied=$((artifacts_copied + 1))
done

log_message "$artifacts_copied artifacts copied successfully"

# Deploy Lambda functions
export SEMANTIC_VERSION="$VERSION"


log_message "Running update-lambda-functions.sh with version $SEMANTIC_VERSION"
./update-lambda-functions.sh "$SEMANTIC_VERSION"

log_message "Verifying Lambda deployments in $ENVIRONMENT environment"

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