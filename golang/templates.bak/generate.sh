#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if arguments are provided
if [ $# -lt 3 ]; then
  echo -e "${RED}Error: Not enough arguments${NC}"
  echo "Usage: $0 <generator-type> <domain-name> <entity-name>"
  echo "  generator-type: entity, repository, service, controller, strategy, factory, or all"
  echo "  domain-name: The domain name (e.g., asset, analysis)"
  echo "  entity-name: The entity name (e.g., Stock, REIT)"
  echo ""
  echo "Example: $0 all asset Stock"
  exit 1
fi

GENERATOR_TYPE=$1
DOMAIN_NAME=$2
ENTITY_NAME=$3

# Import common functions
source "$(dirname "$0")/common.sh"

# Function to run a specific generator
run_generator() {
  local gen_type=$1
  echo -e "${BLUE}Running $gen_type generator...${NC}"
  
  go run "${gen_type}_generator.go" $DOMAIN_NAME $ENTITY_NAME
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}$gen_type generator completed successfully${NC}"
  else
    echo -e "${RED}$gen_type generator failed${NC}"
    exit 1
  fi
}

# Execute the requested generator(s)
case $GENERATOR_TYPE in
  entity)
    run_generator "entity"
    ;;
  repository)
    run_generator "repository"
    ;;
  service)
    run_generator "service"
    ;;
  controller)
    run_generator "controller"
    ;;
  strategy)
    run_generator "strategy"
    ;;
  factory)
    run_generator "di-factory"
    ;;
  all)
    echo -e "${YELLOW}Generating all components for $ENTITY_NAME in $DOMAIN_NAME domain${NC}"
    run_generator "entity"
    run_generator "repository"
    run_generator "service"
    run_generator "controller"
    
    if [ "$DOMAIN_NAME" == "analysis" ] || [ "$DOMAIN_NAME" == "investment" ]; then
      echo -e "${YELLOW}Also generating strategy for $ENTITY_NAME${NC}"
      run_generator "strategy"
    fi
    
    echo -e "${YELLOW}Generating DI factory${NC}"
    run_generator "di-factory"
    
    echo -e "${GREEN}All generators completed successfully!${NC}"
    ;;
  *)
    echo -e "${RED}Error: Invalid generator type${NC}"
    echo "Valid types: entity, repository, service, controller, strategy, factory, all"
    exit 1
    ;;
esac

echo -e "${GREEN}Generation process completed!${NC}"
echo "Don't forget to update your dependency injection setup to include the new components."
echo "For API components, ensure routes are registered in your main application setup."