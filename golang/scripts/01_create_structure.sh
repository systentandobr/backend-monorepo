#!/bin/bash
# Creates directory structure for the project
if [ $# -lt 1 ]; then echo "Usage: $0 <base_dir>"; exit 1; fi
BASE_DIR=$1
echo "Creating directory structure in: $BASE_DIR"

mkdir -p $BASE_DIR/cmd/{api,jobs,templates}
mkdir -p $BASE_DIR/pkg/{common/{errors,logger,utils},infrastructure/{database/{mongodb,redis},http,messaging/{kafka,rabbitmq},services/{b3,binance,notifications}}}
mkdir -p $BASE_DIR/internal/domain/{asset/{entity,repository,service,valueobject},analysis/{entity,repository,service,strategy},simulation/{entity,repository,service},notification/{entity,repository,service},user/{entity,repository,service}}
mkdir -p $BASE_DIR/internal/{application/{asset,analysis,simulation,notification,user},ports/{input,output},adapter/{controller,presenter,persistence,external}}
mkdir -p $BASE_DIR/web/{src/{components,pages,hooks,store},public}
mkdir -p $BASE_DIR/deploy/{docker/{api,job-collector,job-analyzer},kubernetes}
mkdir -p $BASE_DIR/test $BASE_DIR/docs
echo "Directory structure created successfully"
