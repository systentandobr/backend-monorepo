package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/cmd/templates/common"

)

const swaggerEntityTemplate = `package docs

// {{.EntityName}} swagger documentation
// @Summary Get a {{.EntityName}} by ID
// @Description Get a single {{.EntityName}} by its ID
// @Tags {{.EntityNamePlural}}
// @Accept json
// @Produce json
// @Param id path string true "{{.EntityName}} ID"
// @Success 200 {object} entity.{{.EntityName}} "{{.EntityName}} found"
// @Failure 400 {object} map[string]interface{} "Invalid ID format"
// @Failure 404 {object} map[string]interface{} "{{.EntityName}} not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /{{.DomainName}}/{{.EntityNamePlural}}/{id} [get]

// @Summary Get all {{.EntityNamePlural}}
// @Description Get a list of all {{.EntityNamePlural}} with optional filtering
// @Tags {{.EntityNamePlural}}
// @Accept json
// @Produce json
// @Param name query string false "Filter by name"
// @Success 200 {array} entity.{{.EntityName}} "List of {{.EntityNamePlural}}"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /{{.DomainName}}/{{.EntityNamePlural}} [get]

// @Summary Create a new {{.EntityName}}
// @Description Create a new {{.EntityName}} with the provided data
// @Tags {{.EntityNamePlural}}
// @Accept json
// @Produce json
// @Param {{.EntityNameLower}} body controller.create{{.EntityName}}Request true "{{.EntityName}} data"
// @Success 201 {object} entity.{{.EntityName}} "{{.EntityName}} created"
// @Failure 400 {object} map[string]interface{} "Invalid request data"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /{{.DomainName}}/{{.EntityNamePlural}} [post]

// @Summary Update a {{.EntityName}}
// @Description Update an existing {{.EntityName}} with the provided data
// @Tags {{.EntityNamePlural}}
// @Accept json
// @Produce json
// @Param id path string true "{{.EntityName}} ID"
// @Param {{.EntityNameLower}} body controller.update{{.EntityName}}Request true "Updated {{.EntityName}} data"
// @Success 200 {object} entity.{{.EntityName}} "{{.EntityName}} updated"
// @Failure 400 {object} map[string]interface{} "Invalid request data"
// @Failure 404 {object} map[string]interface{} "{{.EntityName}} not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /{{.DomainName}}/{{.EntityNamePlural}}/{id} [put]

// @Summary Delete a {{.EntityName}}
// @Description Delete a {{.EntityName}} by its ID
// @Tags {{.EntityNamePlural}}
// @Accept json
// @Produce json
// @Param id path string true "{{.EntityName}} ID"
// @Success 204 {object} nil "{{.EntityName}} deleted"
// @Failure 400 {object} map[string]interface{} "Invalid ID format"
// @Failure 404 {object} map[string]interface{} "{{.EntityName}} not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /{{.DomainName}}/{{.EntityNamePlural}}/{id} [delete]
`

const swaggerSetupTemplate = `package docs

import "github.com/swaggo/swag"

// SwaggerInfo holds exported Swagger Info
var SwaggerInfo = &swag.Spec{
	Version:          "",
	Host:             "",
	BasePath:         "",
	Schemes:          []string{},
	Title:            "",
	Description:      "",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
}

const docTemplate = ` + "`" + `{
    "schemes": {{ marshal .Schemes }},
    "swagger": "2.0",
    "info": {
        "description": "{{.Description}}",
        "title": "{{.Title}}",
        "contact": {
            "name": "API Support",
            "url": "http://www.systentando.com.br/support",
            "email": "support@systentando.com.br"
        },
        "license": {
            "name": "Apache 2.0",
            "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
        },
        "version": "{{.Version}}"
    },
    "host": "{{.Host}}",
    "basePath": "{{.BasePath}}",
    "paths": {}
}
` + "`" + `

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
`

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run swagger_generator.go <domain-name> <entity-name>")
		fmt.Println("Example: go run swagger_generator.go asset Stock")
		os.Exit(1)
	}

	domainName := os.Args[1]
	entityName := os.Args[2]
	
	// Ensure first letter of entity name is uppercase
	entityName = strings.Title(entityName)
	
	data := common.NewTemplateData(domainName, entityName)
	
	// Define paths
	docsDir := filepath.Join("invest-tracker", "docs")
	if err := os.MkdirAll(docsDir, 0755); err != nil {
		fmt.Printf("Error creating docs directory: %v\n", err)
		os.Exit(1)
	}
	
	swaggerSetupPath := filepath.Join(docsDir, "swagger.go")
	entitySwaggerPath := filepath.Join(docsDir, strings.ToLower(entityName)+"_swagger.go")
	
	// Create swagger setup file if it doesn't exist
	if !CheckFileExists(swaggerSetupPath) {
		if err := common.CreateFileFromTemplate(swaggerSetupTemplate, swaggerSetupPath, data); err != nil {
			fmt.Printf("Error creating swagger setup file: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Created swagger setup file: %s\n", swaggerSetupPath)
	}
	
	// Create entity swagger documentation
	if common.PromptOverwrite(entitySwaggerPath) {
		if err := common.CreateFileFromTemplate(swaggerEntityTemplate, entitySwaggerPath, data); err != nil {
			fmt.Printf("Error creating entity swagger file: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Created entity swagger file: %s\n", entitySwaggerPath)
	} else {
		fmt.Printf("Skipping file: %s\n", entitySwaggerPath)
	}
	
	fmt.Printf("Successfully created Swagger documentation for '%s' in domain '%s'\n", entityName, domainName)
	fmt.Println("Remember to run 'swag init' to generate the actual swagger files before building the application.")
}

// These functions would normally be imported from common template utils
type TemplateData struct {
	DomainName      string
	EntityName      string
	EntityNameLower string
	EntityNamePlural string
	ImportBasePath  string
}

func NewTemplateData(domainName, entityName string) TemplateData {
	entityLower := strings.ToLower(entityName)
	entityPlural := entityLower + "s"
	
	// Handle irregular plurals
	if strings.HasSuffix(entityLower, "y") {
		entityPlural = entityLower[:len(entityLower)-1] + "ies"
	}
	
	return TemplateData{
		DomainName:      domainName,
		EntityName:      entityName,
		EntityNameLower: entityLower,
		EntityNamePlural: entityPlural,
		ImportBasePath:  "github.com/systentandobr/backend-monorepo/golang/invest-tracker",
	}
}

func CheckFileExists(filePath string) bool {
	_, err := os.Stat(filePath)
	return !os.IsNotExist(err)
}

func PromptOverwrite(filePath string) bool {
	if !CheckFileExists(filePath) {
		return true
	}
	
	fmt.Printf("File already exists: %s\nOverwrite? (y/n): ", filePath)
	var response string
	fmt.Scanln(&response)
	
	return strings.ToLower(response) == "y" || strings.ToLower(response) == "yes"
}

func CreateFileFromTemplate(templateStr, filePath string, data interface{}) error {
	// Ensure directory exists
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", dir, err)
	}
	
	// Create file
	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create file %s: %w", filePath, err)
	}
	defer file.Close()
	
	// For demonstration purposes - in a real implementation, you would parse and execute the template
	fmt.Fprintf(file, "// Template content for %s\n", filePath)
	fmt.Fprintf(file, "// This would contain the generated code for:\n")
	fmt.Fprintf(file, "// Domain: %s, Entity: %s\n", data.(TemplateData).DomainName, data.(TemplateData).EntityName)
	
	return nil
}