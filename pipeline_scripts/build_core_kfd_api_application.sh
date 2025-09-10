#!/bin/bash -i
set -e
PIPELINE_DIR="$GITHUB_WORKSPACE/pipeline_scripts"
APP_DIR="$GITHUB_WORKSPACE/CoreKfdApi"
FUNCTION_DIR="function-files"
TGZ_FILE="kainos-studio-core-kfd-api-1.0.0.tgz"


# =================================
cd $PIPELINE_DIR
source ./functions.sh

# =================================
echo
echo "Check Application directory:"
check_app_dir

# =================================
echo
echo "Start NPM install:"
npm ci > $APP_DIR/logs-npm-ci.txt 2>&1

# =================================
echo
echo "Start NPM build:"
npm run build > $APP_DIR/logs-npm-build.txt 2>&1

# =================================
echo
echo "NPM pack files into lib folder:"
npm pack -q > $APP_DIR/logs-npm-pack.txt 2>&1

# =================================
echo
echo "Unpack tgz into $FUNCTION_DIR folder:"
mkdir $FUNCTION_DIR
tar -xzvf $TGZ_FILE -C $FUNCTION_DIR/ > $APP_DIR/logs-unpack-tgz.txt 2>&1