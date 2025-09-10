#!/bin/bash

function environment {
    ENVIRONMENT="$ENVIRONMENT"
}

function common {
    AWS_REGION=`aws ssm get-parameter \
        --name /infra/region \
        --query Parameter.Value \
        | sed 's/\"//g'`
}

function check_lambda_dir {
    if [ -d "$LAMBDA_DIR" ] 
    then
        echo "Directory exists."
        cd $LAMBDA_DIR
    else
        echo "Error: Directory $LAMBDA_DIR does not exists."
        exit 1
    fi
}

function check_app_dir {
    if [ -d "$APP_DIR" ] 
    then
        echo "Directory exists."
        cd $APP_DIR
    else
        echo "Error: Directory $APP_DIR does not exists."
        exit 1
    fi
}

function update_lambda {
  aws lambda get-function --function-name $LAMBDA_NAME > /dev/null 2>&1
  if [ 0 -eq $? ]; then
    echo "Lambda $LAMBDA_NAME exists"
    echo
    aws lambda update-function-code \
        --function-name $LAMBDA_NAME \
        --s3-key $LAMBDA_ZIP_FILE \
        --s3-bucket $S3_ZIP_FILES \
        --output text
  else
    echo "Lambda $LAMBDA_NAME does not exist"
  fi
}

function get_lambda_alias_version {
    version=$(aws lambda get-alias \
                        --function-name $LAMBDA_NAME \
                        --name $ALIAS_NAME \
                        --query 'FunctionVersion' \
                        --output text)
}


function lambda_name {
    NAME=`aws ssm get-parameter \
        --name $FunctionName \
        --query Parameter.Value \
        | sed 's/\"//g'`
}

function lambda_zipfile {
    BASE_LAMBDA_ZIP_FILE=`aws ssm get-parameter \
        --name $FunctionFile \
        --query Parameter.Value \
        | sed 's/\"//g'`
    
    if [ -n "$SEMANTIC_VERSION" ]; then
        FILENAME=$(basename "$BASE_LAMBDA_ZIP_FILE" .zip)
        EXTENSION=".zip"
        
        LAMBDA_ZIP_FILE="${FILENAME}-v${SEMANTIC_VERSION}${EXTENSION}"
        echo "Using versioned artifact: $LAMBDA_ZIP_FILE"
    else
        FILENAME=$(basename "$BASE_LAMBDA_ZIP_FILE" .zip)
        LAMBDA_ZIP_FILE="${FILENAME}.zip"
        echo "No version provided, using default artifact name: $LAMBDA_ZIP_FILE"
    fi
}

function s3_bucket_zip_files {
    S3=`aws ssm get-parameter \
        --name /s3/kcappzipfiles \
        --query Parameter.Value \
        | sed 's/\"//g'`
}

function s3_bucket_kfd_files {
    S3=`aws ssm get-parameter \
        --name /s3/kcappkfdfiles \
        --query Parameter.Value \
        | sed 's/\"//g'`
}

function s3_bucket_static_files {
    S3=`aws ssm get-parameter \
        --name /s3/kcappstaticfiles \
        --query Parameter.Value \
        | sed 's/\"//g'`
}

function print_lambda_values {
    echo "============================="
    echo "Lambda Name: $LAMBDA_NAME"
    echo "Lambda File: $LAMBDA_ZIP_FILE"
    echo "S3 Bucket: $S3_ZIP_FILES"
}