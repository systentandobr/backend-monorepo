package common

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

// TemplateData holds common data for templates
type TemplateData struct {
	DomainName        string
	EntityName        string
	EntityNameLower   string
	EntityNamePlural  string
	PackageName       string
	StructName        string
	RepositoryName    string
	ServiceName       string
	ControllerName    string
	ImportBasePath    string
}

// NewTemplateData creates a new TemplateData with defaults
func NewTemplateData(domainName, entityName string) TemplateData {
	entityLower := strings.ToLower(entityName)
	entityPlural := entityLower + "s"
	
	// Handle irregular plurals
	if strings.HasSuffix(entityLower, "y") {
		entityPlural = entityLower[:len(entityLower)-1] + "ies"
	}
	
	return TemplateData{
		DomainName:        domainName,
		EntityName:        entityName,
		EntityNameLower:   entityLower,
		EntityNamePlural:  entityPlural,
		PackageName:       strings.ToLower(entityName),
		StructName:        entityName,
		RepositoryName:    entityName + "Repository",
		ServiceName:       entityName + "Service",
		ControllerName:    entityName + "Controller",
		ImportBasePath:    "github.com/systentandobr/backend-monorepo/golang/invest-tracker",
	}
}

// CreateFileFromTemplate generates a file from a template
func CreateFileFromTemplate(templateStr, filePath string, data interface{}) error {
	// Ensure directory exists
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", dir, err)
	}
	
	// Parse template
	tmpl, err := template.New("template").Parse(templateStr)
	if err != nil {
		return fmt.Errorf("failed to parse template: %w", err)
	}
	
	// Create file
	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create file %s: %w", filePath, err)
	}
	defer file.Close()
	
	// Execute template and write to file
	if err := tmpl.Execute(file, data); err != nil {
		return fmt.Errorf("failed to execute template for %s: %w", filePath, err)
	}
	
	fmt.Printf("Created: %s\n", filePath)
	return nil
}

// CheckFileExists checks if a file exists and returns true if it does
func CheckFileExists(filePath string) bool {
	_, err := os.Stat(filePath)
	return !os.IsNotExist(err)
}

// PromptOverwrite asks the user if they want to overwrite an existing file
func PromptOverwrite(filePath string) bool {
	if !CheckFileExists(filePath) {
		return true
	}
	
	fmt.Printf("File already exists: %s\nOverwrite? (y/n): ", filePath)
	var response string
	fmt.Scanln(&response)
	
	return strings.ToLower(response) == "y" || strings.ToLower(response) == "yes"
}

