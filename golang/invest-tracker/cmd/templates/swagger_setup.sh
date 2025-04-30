#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Swagger documentation for the Investment Tracker API${NC}"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}Error: Go is not installed or not in PATH${NC}"
    echo "Please install Go before continuing"
    exit 1
fi

# Check if swag CLI is installed
if ! command -v swag &> /dev/null; then
    echo -e "${YELLOW}swag CLI not found. Installing...${NC}"
    go install github.com/swaggo/swag/cmd/swag@latest
    
    # Verify installation
    if ! command -v swag &> /dev/null; then
        echo -e "${RED}Failed to install swag CLI. Please check your GOPATH setup.${NC}"
        echo "You can manually install it with: go install github.com/swaggo/swag/cmd/swag@latest"
        exit 1
    fi
    
    echo -e "${GREEN}swag CLI installed successfully${NC}"
fi

# Install required dependencies
echo -e "${BLUE}Installing Swagger dependencies...${NC}"
go get -u github.com/swaggo/files
go get -u github.com/swaggo/gin-swagger
go get -u github.com/swaggo/swag

# Create docs directory if it doesn't exist
mkdir -p invest-tracker/docs

# Generate swagger.go file if it doesn't exist
if [ ! -f "invest-tracker/docs/swagger.go" ]; then
    echo -e "${YELLOW}Creating initial swagger.go file...${NC}"
    go run cmd/templates/swagger_generator.go asset Stock
else
    echo -e "${GREEN}swagger.go already exists${NC}"
fi

# Run swag init to generate swagger docs
echo -e "${BLUE}Generating Swagger documentation...${NC}"
cd invest-tracker && swag init -g cmd/api/main.go -o ./docs

echo -e "${GREEN}Swagger setup completed successfully!${NC}"
echo "You can access the Swagger UI at http://localhost:8080/swagger/index.html when the server is running"
echo ""
echo "Don't forget to add Swagger annotations to your controller methods."
echo "Example of controller annotation:"
echo ""
echo -e "${BLUE}// @Summary Get a user by ID${NC}"
echo -e "${BLUE}// @Description Get a single user by its ID${NC}"
echo -e "${BLUE}// @Tags users${NC}"
echo -e "${BLUE}// @Produce json${NC}"
echo -e "${BLUE}// @Param id path string true \"User ID\"${NC}"
echo -e "${BLUE}// @Success 200 {object} entity.User \"User found\"${NC}"
echo -e "${BLUE}// @Router /api/v1/users/{id} [get]${NC}"