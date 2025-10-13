#!/bin/bash
set -e
PIPELINE_DIR="$GITHUB_WORKSPACE/pipeline_scripts"

# =================================
cd $PIPELINE_DIR
source ./functions.sh
environment
s3_bucket_zip_files

S3_ZIP_FILES="$S3-$ENVIRONMENT"

# ============== Kainos Core Deployable ============

FunctionName="/lambda/kccorename"
FunctionFile="/lambda/corezipfile"
lambda_name
lambda_zipfile

LAMBDA_NAME="$NAME-$ENVIRONMENT"
ALIAS_NAME="CoreLambda"

echo
print_lambda_values

echo
echo "Getting current Core alias version for $LAMBDA_NAME"
get_current_lambda_alias

echo
echo "Update Lambda $LAMBDA_NAME"
update_lambda

if [ -n "$NEW_LAMBDA_VERSION" ]; then
    echo
    echo "Updating Core alias to point to new version $NEW_LAMBDA_VERSION"
    
    echo "Updating Core alias..."
    update_lambda_alias
    
    echo "Core Lambda deployment completed successfully!"
    echo "Previous Core alias version: $CURRENT_ALIAS_VERSION"
    echo "New Core alias version: $NEW_LAMBDA_VERSION"
else
    echo "Warning: No new version was created, Core alias was not updated"
fi

# ============== Kainos Core KFD API ============

FunctionName="/lambda/kckfdapiname"
FunctionFile="/lambda/kckfdapizipfile"
lambda_name
lambda_zipfile

LAMBDA_NAME="$NAME-$ENVIRONMENT"
ALIAS_NAME="KFDAPILambda"


echo
print_lambda_values

echo
echo "Getting current KFD alias version for $LAMBDA_NAME"
get_current_lambda_alias

echo
echo "Update Lambda $LAMBDA_NAME"
update_lambda

if [ -n "$NEW_LAMBDA_VERSION" ]; then
    echo
    echo "Updating KFD API alias to point to new version $NEW_LAMBDA_VERSION"
    update_lambda_alias
    
    echo "KFD API Lambda deployment completed successfully!"
    echo "Previous KFD API alias version: $CURRENT_ALIAS_VERSION"
    echo "New KFD API alias version: $NEW_LAMBDA_VERSION"
else
    echo "Warning: No new version was created, KFD API alias was not updated"
fi