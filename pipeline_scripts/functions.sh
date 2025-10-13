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
    # Update function code and publish a new version
    NEW_LAMBDA_VERSION=$(aws lambda update-function-code \
        --function-name $LAMBDA_NAME \
        --s3-key $LAMBDA_ZIP_FILE \
        --s3-bucket $S3_ZIP_FILES \
        --publish \
        --query 'Version' \
        --output text)
    
    echo "New Lambda version created: $NEW_LAMBDA_VERSION"
    export NEW_LAMBDA_VERSION
  else
    echo "Lambda $LAMBDA_NAME does not exist"
  fi
}



function update_core_lambda_alias {
    if [ -z "$NEW_LAMBDA_VERSION" ]; then
        echo "Error: NEW_LAMBDA_VERSION is not set"
        return 1
    fi
    
    if [ -z "$CORE_ALIAS_NAME" ]; then
        echo "Error: CORE_ALIAS_NAME is not set"
        return 1
    fi
    
    if [ -z "$LAMBDA_NAME" ]; then
        echo "Error: LAMBDA_NAME is not set"
        return 1
    fi
    
    # Check if alias exists
    aws lambda get-alias --function-name $LAMBDA_NAME --name $CORE_ALIAS_NAME > /dev/null 2>&1
    if [ 0 -eq $? ]; then
        echo "Updating existing Core alias $CORE_ALIAS_NAME to point to version $NEW_LAMBDA_VERSION"
        aws lambda update-alias \
            --function-name $LAMBDA_NAME \
            --name $CORE_ALIAS_NAME \
            --function-version $NEW_LAMBDA_VERSION \
            --output text
    else
        echo "Creating new Core alias $CORE_ALIAS_NAME pointing to version $NEW_LAMBDA_VERSION"
        aws lambda create-alias \
            --function-name $LAMBDA_NAME \
            --name $CORE_ALIAS_NAME \
            --function-version $NEW_LAMBDA_VERSION \
            --output text
    fi
}

function update_kfd_lambda_alias {
    if [ -z "$NEW_LAMBDA_VERSION" ]; then
        echo "Error: NEW_LAMBDA_VERSION is not set"
        return 1
    fi
    
    if [ -z "$KFD_ALIAS_NAME" ]; then
        echo "Error: KFD_ALIAS_NAME is not set"
        return 1
    fi
    
    if [ -z "$LAMBDA_NAME" ]; then
        echo "Error: LAMBDA_NAME is not set"
        return 1
    fi
    
    # Check if alias exists
    aws lambda get-alias --function-name $LAMBDA_NAME --name $KFD_ALIAS_NAME > /dev/null 2>&1
    if [ 0 -eq $? ]; then
        echo "Updating existing KFD alias $KFD_ALIAS_NAME to point to version $NEW_LAMBDA_VERSION"
        aws lambda update-alias \
            --function-name $LAMBDA_NAME \
            --name $KFD_ALIAS_NAME \
            --function-version $NEW_LAMBDA_VERSION \
            --output text
    else
        echo "Creating new KFD alias $KFD_ALIAS_NAME pointing to version $NEW_LAMBDA_VERSION"
        aws lambda create-alias \
            --function-name $LAMBDA_NAME \
            --name $KFD_ALIAS_NAME \
            --function-version $NEW_LAMBDA_VERSION \
            --output text
    fi
}

function get_current_core_lambda_alias {
    if [ -z "$CORE_ALIAS_NAME" ]; then
        echo "Error: CORE_ALIAS_NAME is not set"
        return 1
    fi
    
    if [ -z "$LAMBDA_NAME" ]; then
        echo "Error: LAMBDA_NAME is not set"
        return 1
    fi
    
    # Check if alias exists and get current version
    CURRENT_CORE_VERSION=$(aws lambda get-alias \
                        --function-name $LAMBDA_NAME \
                        --name $CORE_ALIAS_NAME \
                        --query 'FunctionVersion' \
                        --output text 2>/dev/null)
    
    if [ $? -eq 0 ] && [ "$CURRENT_CORE_VERSION" != "None" ]; then
        echo "Current Core alias $CORE_ALIAS_NAME points to version: $CURRENT_CORE_VERSION"
        export CURRENT_CORE_ALIAS_VERSION=$CURRENT_CORE_VERSION
    else
        echo "Core alias $CORE_ALIAS_NAME does not exist or could not be retrieved"
        export CURRENT_CORE_ALIAS_VERSION=""
    fi
}

function get_current_kfd_lambda_alias {
    if [ -z "$KFD_ALIAS_NAME" ]; then
        echo "Error: KFD_ALIAS_NAME is not set"
        return 1
    fi
    
    if [ -z "$LAMBDA_NAME" ]; then
        echo "Error: LAMBDA_NAME is not set"
        return 1
    fi
    
    # Check if alias exists and get current version
    CURRENT_KFD_VERSION=$(aws lambda get-alias \
                        --function-name $LAMBDA_NAME \
                        --name $KFD_ALIAS_NAME \
                        --query 'FunctionVersion' \
                        --output text 2>/dev/null)
    
    if [ $? -eq 0 ] && [ "$CURRENT_KFD_VERSION" != "None" ]; then
        echo "Current KFD alias $KFD_ALIAS_NAME points to version: $CURRENT_KFD_VERSION"
        export CURRENT_KFD_ALIAS_VERSION=$CURRENT_KFD_VERSION
    else
        echo "KFD alias $KFD_ALIAS_NAME does not exist or could not be retrieved"
        export CURRENT_KFD_ALIAS_VERSION=""
    fi
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