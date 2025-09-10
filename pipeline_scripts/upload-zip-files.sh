#!/bin/bash
set -e
PIPELINE_DIR="$GITHUB_WORKSPACE/pipeline_scripts"

# =================================
cd $PIPELINE_DIR
source ./functions.sh
environment
s3_bucket_zip_files

S3_ZIP_FILES="$S3-$ENVIRONMENT"

# ============== Kainos Core Deployable ZIP ============

LAMBDA_DIR="$GITHUB_WORKSPACE/CoreDeployable/function-files/package"

FunctionFile="/lambda/corezipfile"
lambda_zipfile

echo
echo "Check Lambda directory:"
check_lambda_dir

echo
echo "Creating the Lambda ZIP file:"
zip -r -q $LAMBDA_ZIP_FILE ./

echo
echo "Upload the Lambda ZIP file to S3:"
aws s3 cp $LAMBDA_ZIP_FILE s3://$S3_ZIP_FILES/$LAMBDA_ZIP_FILE


# ============== Kainos Core KFD API ZIP ============

LAMBDA_DIR="$GITHUB_WORKSPACE/CoreKfdApi/function-files/package"

FunctionFile="/lambda/kckfdapizipfile"
lambda_zipfile

echo
echo "Check Lambda directory:"
check_lambda_dir

echo
echo "Creating the Lambda ZIP file:"
zip -r -q $LAMBDA_ZIP_FILE ./

echo
echo "Upload the Lambda ZIP file to S3:"
aws s3 cp $LAMBDA_ZIP_FILE s3://$S3_ZIP_FILES/$LAMBDA_ZIP_FILE