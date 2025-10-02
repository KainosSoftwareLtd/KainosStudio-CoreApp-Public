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
echo "Update Lambda $LAMBDA_NAME"
update_lambda

# ============== Kainos Core KFD API ============

FunctionName="/lambda/kckfdapiname"
FunctionFile="/lambda/kckfdapizipfile"
lambda_name
lambda_zipfile

LAMBDA_NAME="$NAME-$ENVIRONMENT"

echo
print_lambda_values

echo
echo "Update Lambda $LAMBDA_NAME"
update_lambda