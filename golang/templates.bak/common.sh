#!/bin/bash

# Common functions for the template generators

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a directory exists, create it if not
ensure_directory() {
  local dir=$1
  if [ ! -d "$dir" ]; then
    echo -e "${YELLOW}Creating directory: $dir${NC}"
    mkdir -p "$dir"
  fi
}

# Function to check if a file exists
file_exists() {
  local file=$1
  if [ -f "$file" ]; then
    return 0 # True
  else
    return 1 # False
  fi
}

# Function to prompt for file overwrite
prompt_overwrite() {
  local file=$1
  if file_exists "$file"; then
    echo -e "${YELLOW}File already exists: $file${NC}"
    read -p "Do you want to overwrite it? (y/n): " answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
      return 0 # Yes, overwrite
    else
      return 1 # No, don't overwrite
    fi
  else
    return 0 # File doesn't exist, so proceed
  fi
}

# Function to check if domain directory exists
check_domain_exists() {
  local domain=$1
  local domain_dir="invest-tracker/internal/domain/$domain"
  if [ ! -d "$domain_dir" ]; then
    echo -e "${YELLOW}Warning: Domain directory does not exist: $domain_dir${NC}"
    read -p "Create domain directory? (y/n): " answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
      ensure_directory "$domain_dir"
      ensure_directory "$domain_dir/entity"
      ensure_directory "$domain_dir/repository"
      ensure_directory "$domain_dir/service"
      echo -e "${GREEN}Domain directory structure created${NC}"
    else
      echo -e "${RED}Cannot proceed without domain directory${NC}"
      exit 1
    fi
  fi
}

# Function to pluralize a name (simple version)
pluralize() {
  local name=$1
  local last_char=${name: -1}
  
  # Simple pluralization rules (can be expanded)
  if [[ "$last_char" == "y" ]]; then
    echo "${name%y}ies"
  elif [[ "$last_char" == "s" || "$last_char" == "x" || "$last_char" == "z" ]]; then
    echo "${name}es"
  else
    echo "${name}s"
  fi
}

# Function to convert to camel case
to_camel_case() {
  local input=$1
  echo "$input" | awk 'BEGIN{FS="[^a-zA-Z0-9]";OFS=""} {for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1'
}

# Function to convert to snake case
to_snake_case() {
  local input=$1
  echo "$input" | sed 's/\([A-Z]\)/_\1/g' | sed 's/^_//' | tr '[:upper:]' '[:lower:]'
}

# Function to check Go installation
check_go_installation() {
  if ! command -v go &> /dev/null; then
    echo -e "${RED}Error: Go is not installed or not in PATH${NC}"
    echo "Please install Go before using these scripts"
    exit 1
  fi
  
  go_version=$(go version | awk '{print $3}')
  echo -e "${BLUE}Using Go version: $go_version${NC}"
}

# Run this check at script load time
check_go_installation

# Function to create a backup of a file before modifying
backup_file() {
  local file=$1
  if file_exists "$file"; then
    local backup="${file}.bak"
    echo -e "${YELLOW}Creating backup: $backup${NC}"
    cp "$file" "$backup"
  fi
}

# Print nice header for each generator
print_header() {
  local title=$1
  local domain=$2
  local entity=$3
  
  echo -e "${BLUE}┌─────────────────────────────────────────────────┐${NC}"
  echo -e "${BLUE}│ $title ${NC}"
  echo -e "${BLUE}│ Domain: $domain / Entity: $entity ${NC}"
  echo -e "${BLUE}└─────────────────────────────────────────────────┘${NC}"
}