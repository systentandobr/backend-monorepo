package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const entityTemplate = `package entity

import (
	"time"

	"{{.ImportBasePath}}/pkg/common/errors"
)

// {{.EntityName}} represents a {{.EntityNameLower}} in the system
type {{.EntityName}} struct {
	ID          string    ` + "`json:\"id\" bson:\"_id\"`" + `
	Name        string    ` + "`json:\"name\" bson:\"name\"`" + `
	Description string    ` + "`json:\"description\" bson:\"description\"`" + `
	CreatedAt   time.Time ` + "`json:\"createdAt\" bson:\"created_at\"`" + `
	UpdatedAt   time.Time ` + "`json:\"updatedAt\" bson:\"updated_at\"`" + `
}

// Validate checks if the entity data is valid
func (e *{{.EntityName}}) Validate() error {
	if e.Name == "" {
		return errors.NewValidationError("name is required", nil, nil)
	}
	
	return nil
}

// BeforeSave prepares the entity before saving
func (e *{{.EntityName}}) BeforeSave() {
	now := time.Now()
	
	if e.CreatedAt.IsZero() {
		e.CreatedAt = now
	}
	
	e.UpdatedAt = now
}

// New{{.EntityName}} creates a new {{.EntityName}} instance
func New{{.EntityName}}(name, description string) *{{.EntityName}} {
	return &{{.EntityName}}{
		Name:        name,
		Description: description,
	}
}
`

func main() {
	// Validate input arguments
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run entity-generator.go <domain-name> <entity-name>")
		fmt.Println("Example: go run entity-generator.go asset Stock")
		os.Exit(1)
	}

	domainName := os.Args[1]
	entityName := os.Args[2]
	
	// Ensure first letter of entity name is uppercase
	entityName = strings.Title(entityName)
	
	data := NewTemplateData(domainName, entityName)
	
	// Define the path where the entity file will be created
	filePath := filepath.Join("invest-tracker", "internal", "domain", domainName, "entity", strings.ToLower(entityName)+".go")
	
	// Check if file already exists and prompt for overwrite
	if !PromptOverwrite(filePath) {
		fmt.Printf("Skipping file: %s\n", filePath)
		return
	}
	
	// Create the entity file
	if err := CreateFileFromTemplate(entityTemplate, filePath, data); err != nil {
		fmt.Printf("Error creating entity: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Printf("Successfully created entity '%s' in domain '%s'\n", entityName, domainName)
}