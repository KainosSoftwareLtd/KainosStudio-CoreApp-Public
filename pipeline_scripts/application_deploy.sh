#!/bin/bash -i
set -e

log_message() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1"
}

log_message "Starting application deployment"

if [ -n "$1" ]; then
  VERSION="$1"
  log_message "Using version: $VERSION"
fi

PIPELINE_DIR="$GITHUB_WORKSPACE/pipeline_scripts"
APP_DIR="$GITHUB_WORKSPACE/CoreDeployable"
FUNCTION_DIR="function-files"
TGZ_FILE="kainos-studio-coreapp-1.0.0.tgz"

# =================================
log_message "Setting up environment variables"

export ENVIRONMENT="${ENVIRONMENT:-dev}"
log_message "Environment set to: $ENVIRONMENT"

log_message "Change directory to $PIPELINE_DIR"
cd $PIPELINE_DIR || { log_message "ERROR: Pipeline directory not found"; exit 1; }
log_message "Current directory: $(pwd)"

log_message "Checking for functions.sh"
if [ ! -f "./functions.sh" ]; then
  log_message "ERROR: functions.sh not found in $(pwd)"
  log_message "Listing directory contents:"
  ls -la
  exit 1
fi

log_message "Sourcing functions.sh"
source ./functions.sh

# =================================
log_message "Initializing environment and S3 buckets"
environment
log_message "Environment function called with ENVIRONMENT=$ENVIRONMENT"

s3_bucket_static_files
log_message "S3 bucket retrieved: $S3"

S3_STATIC_FILES="$S3-$ENVIRONMENT"
log_message "Using S3 static files bucket: $S3_STATIC_FILES"

# =================================
log_message "Checking application directory"
check_app_dir || { log_message "ERROR: Application directory check failed"; exit 1; }
log_message "Application directory check passed"

# =================================
log_message "Starting NPM build"
npm run build > $APP_DIR/logs-npm-build.txt 2>&1 || {
  log_message "ERROR: NPM build failed, check logs at $APP_DIR/logs-npm-build.txt"
  tail -n 20 $APP_DIR/logs-npm-build.txt
  exit 1
}
log_message "NPM build completed successfully"

# =================================
log_message "NPM pack files into lib folder"
npm pack -q > $APP_DIR/logs-npm-pack.txt 2>&1 || {
  log_message "ERROR: NPM pack failed, check logs at $APP_DIR/logs-npm-pack.txt"
  tail -n 20 $APP_DIR/logs-npm-pack.txt
  exit 1
}
log_message "NPM pack completed successfully"

# =================================
log_message "Unpacking tgz into $FUNCTION_DIR folder"
if [ -d "$FUNCTION_DIR" ]; then
  log_message "Function directory already exists, removing it"
  rm -rf $FUNCTION_DIR
fi
mkdir $FUNCTION_DIR || { log_message "ERROR: Failed to create function directory"; exit 1; }

log_message "Extracting $TGZ_FILE"
tar -xzvf $TGZ_FILE -C $FUNCTION_DIR/ > $APP_DIR/logs-unpack-tgz.txt 2>&1 || {
  log_message "ERROR: Failed to unpack TGZ file, check logs at $APP_DIR/logs-unpack-tgz.txt"
  tail -n 20 $APP_DIR/logs-unpack-tgz.txt
  exit 1
}
log_message "TGZ file unpacked successfully"

# =================================
log_message "Uploading Static Files to S3 bucket: $S3_STATIC_FILES"

# ============ gds =============
log_message "Uploading govuk assets"
aws s3 cp node_modules/govuk-frontend/dist/govuk/assets s3://$S3_STATIC_FILES/assets --recursive || {
  log_message "ERROR: Failed to upload govuk assets to S3"
  exit 1
}
log_message "Govuk assets uploaded successfully"

log_message "Uploading core-govuk assets"
aws s3 cp node_modules/core-govuk/lib/public/gds s3://$S3_STATIC_FILES/public/gds --recursive || {
  log_message "ERROR: Failed to upload core-govuk assets to S3"
  exit 1
}
log_message "Core-govuk assets uploaded successfully"
# ==============================

# ============ gcds ============
log_message "Uploading core-gcds assets"
aws s3 cp node_modules/core-gcds/lib/public/gcds s3://$S3_STATIC_FILES/public/gcds --recursive || {
  log_message "ERROR: Failed to upload core-gcds assets to S3"
  exit 1
}
log_message "Core-gcds assets uploaded successfully"
# ==============================

# ============ ouds ============
log_message "Uploading core-ouds css assets"
aws s3 cp node_modules/core-ouds/lib/public/ouds s3://$S3_STATIC_FILES/public/ouds --recursive || {
  log_message "ERROR: Failed to upload core-ouds css assets to S3"
  exit 1
}
log_message "Core-ouds css assets uploaded successfully"

log_message "Uploading core-ouds assets"
aws s3 cp node_modules/core-ouds/lib/assets/ou s3://$S3_STATIC_FILES/assets/ou --recursive || {
  log_message "ERROR: Failed to upload core-ouds assets to S3"
  exit 1
}
log_message "Core-ouds assets uploaded successfully"
# ==============================

# ============ wds =============
log_message "Uploading core-wds css assets"
aws s3 cp node_modules/core-wds/lib/public/wds s3://$S3_STATIC_FILES/public/wds --recursive || {
  log_message "ERROR: Failed to upload core-wds css assets to S3"
  exit 1
}
log_message "Core-wds css assets uploaded successfully"

log_message "Uploading core-wds assets"
aws s3 cp node_modules/core-wds/lib/assets/wds s3://$S3_STATIC_FILES/assets/wds --recursive || {
  log_message "ERROR: Failed to upload core-wds assets to S3"
  exit 1
}
log_message "Core-wds assets uploaded successfully"
# ==============================

# ============ nhsds ===========
log_message "Uploading core-nhsuk css assets"
aws s3 cp node_modules/core-nhsuk/lib/public/nhsuk s3://$S3_STATIC_FILES/public/nhsuk --recursive || {
  log_message "ERROR: Failed to upload core-nhsuk css assets to S3"
  exit 1
}
log_message "Core-nhsuk css assets uploaded successfully"

log_message "Uploading core-nhsuk assets"
aws s3 cp node_modules/core-nhsuk/lib/assets/nhsuk s3://$S3_STATIC_FILES/assets/nhsuk --recursive || {
  log_message "ERROR: Failed to upload core-nhsuk assets to S3"
  exit 1
}
log_message "Core-nhsuk assets uploaded successfully"
# ==============================

# ============ fcads ===========
log_message "Uploading core-fcads css assets"
aws s3 cp node_modules/core-fcads/lib/public/fcads s3://$S3_STATIC_FILES/public/fcads --recursive || {
  log_message "ERROR: Failed to upload core-fcads css assets to S3"
  exit 1
}
log_message "core-fcads css assets uploaded successfully"

log_message "Uploading fcads assets"
aws s3 cp node_modules/core-fcads/lib/assets/fcads s3://$S3_STATIC_FILES/assets/fcads --recursive || {
  log_message "ERROR: Failed to upload core-fcads assets to S3"
  exit 1
}
log_message "core-fcads assets uploaded successfully"
# ==============================

log_message "Application deployment completed successfully"