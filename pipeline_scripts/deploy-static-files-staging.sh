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
log_message "Starting static files deployment for version: $VERSION"

PIPELINE_DIR="$GITHUB_WORKSPACE/pipeline_scripts"
export ENVIRONMENT="staging"

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
s3_bucket_static_files
DEV_BUCKET="$S3-dev"
STAGING_BUCKET="$S3-$ENVIRONMENT"

log_message "DEV_BUCKET: $DEV_BUCKET"
log_message "STAGING_BUCKET: $STAGING_BUCKET"

log_message "Verifying buckets exist"
aws s3 ls s3://$DEV_BUCKET/ > /dev/null || { log_message "ERROR: Dev bucket not found or not accessible"; exit 1; }
aws s3 ls s3://$STAGING_BUCKET/ > /dev/null || { log_message "ERROR: Staging bucket not found or not accessible"; exit 1; }

log_message "Starting copy of all static files from dev to staging"
file_count=$(aws s3 ls s3://$DEV_BUCKET/ --recursive | wc -l)
log_message "Found $file_count files to copy"

# Copy all files from dev to staging
aws s3 sync s3://$DEV_BUCKET/ s3://$STAGING_BUCKET/ --delete

log_message "Verifying copy operation"
staging_count=$(aws s3 ls s3://$STAGING_BUCKET/ --recursive | wc -l)
log_message "Files in staging bucket: $staging_count"

if [ $staging_count -ge $file_count ]; then
  log_message "✅ Successfully copied all static files to staging bucket"
else
  log_message "⚠️ Warning: Number of files in staging ($staging_count) doesn't match source ($file_count)"
fi

log_message "Tagging staging bucket with version info"
aws s3api put-bucket-tagging --bucket $STAGING_BUCKET --tagging "TagSet=[{Key=DeployedVersion,Value=v$VERSION},{Key=DeployedDate,Value=$(date +"%Y-%m-%d")}]"

log_message "Static files deployment completed successfully"