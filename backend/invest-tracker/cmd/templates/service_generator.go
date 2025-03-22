package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const serviceInterfaceTemplate = `package service

import (
	"context"

	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/entity"
)

// {{.ServiceName}} defines the interface for {{.EntityName}} business logic
type {{.ServiceName}} interface {
	// Get{{.EntityName}} retrieves a {{.EntityName}} by its ID
	Get{{.EntityName}}(ctx context.Context, id string) (*entity.{{.EntityName}}, error)
	
	// GetAll{{.EntityNamePlural}} retrieves all {{.EntityNamePlural}} based on optional filter
	GetAll{{.EntityNamePlural}}(ctx context.Context, filter map[string]interface{}) ([]*entity.{{.EntityName}}, error)
	
	// Create{{.EntityName}} creates a new {{.EntityName}}
	Create{{.EntityName}}(ctx context.Context, name, description string) (*entity.{{.EntityName}}, error)
	
	// Update{{.EntityName}} updates an existing {{.EntityName}}
	Update{{.EntityName}}(ctx context.Context, id, name, description string) (*entity.{{.EntityName}}, error)
	
	// Delete{{.EntityName}} removes a {{.EntityName}} by its ID
	Delete{{.EntityName}}(ctx context.Context, id string) error
}
`

const serviceImplementationTemplate = `package service

import (
	"context"

	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/entity"
	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/repository"
	"{{.ImportBasePath}}/pkg/common/errors"
	"{{.ImportBasePath}}/pkg/common/logger"
)

// {{.ServiceName}}Impl implements {{.ServiceName}} interface
type {{.ServiceName}}Impl struct {
	repo   repository.{{.RepositoryName}}
	logger logger.Logger
}

// New{{.ServiceName}} creates a new instance of {{.ServiceName}}
func New{{.ServiceName}}(repo repository.{{.RepositoryName}}, logger logger.Logger) {{.ServiceName}} {
	return &{{.ServiceName}}Impl{
		repo:   repo,
		logger: logger,
	}
}

// Get{{.EntityName}} retrieves a {{.EntityName}} by its ID
func (s *{{.ServiceName}}Impl) Get{{.EntityName}}(ctx context.Context, id string) (*entity.{{.EntityName}}, error) {
	s.logger.Debug("Getting {{.EntityName}} by ID", logger.String("id", id))
	
	{{.EntityNameLower}}, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.Err{{.EntityName}}NotFound {
			return nil, errors.NewNotFoundError("{{.EntityName}} not found", err)
		}
		return nil, errors.NewInternalError("Failed to get {{.EntityName}}", err)
	}
	
	return {{.EntityNameLower}}, nil
}

// GetAll{{.EntityNamePlural}} retrieves all {{.EntityNamePlural}}
func (s *{{.ServiceName}}Impl) GetAll{{.EntityNamePlural}}(ctx context.Context, filter map[string]interface{}) ([]*entity.{{.EntityName}}, error) {
	s.logger.Debug("Getting all {{.EntityNamePlural}}")
	
	{{.EntityNamePlural}}, err := s.repo.FindAll(ctx, filter)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get {{.EntityNamePlural}}", err)
	}
	
	return {{.EntityNamePlural}}, nil
}

// Create{{.EntityName}} creates a new {{.EntityName}}
func (s *{{.ServiceName}}Impl) Create{{.EntityName}}(ctx context.Context, name, description string) (*entity.{{.EntityName}}, error) {
	s.logger.Debug("Creating new {{.EntityName}}", logger.String("name", name))
	
	{{.EntityNameLower}} := entity.New{{.EntityName}}(name, description)
	
	if err := {{.EntityNameLower}}.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.repo.Create(ctx, {{.EntityNameLower}}); err != nil {
		if err == repository.Err{{.EntityName}}Duplicate {
			return nil, errors.NewValidationError("{{.EntityName}} with this name already exists", nil, err)
		}
		return nil, errors.NewInternalError("Failed to create {{.EntityName}}", err)
	}
	
	return {{.EntityNameLower}}, nil
}

// Update{{.EntityName}} updates an existing {{.EntityName}}
func (s *{{.ServiceName}}Impl) Update{{.EntityName}}(ctx context.Context, id, name, description string) (*entity.{{.EntityName}}, error) {
	s.logger.Debug("Updating {{.EntityName}}", logger.String("id", id))
	
	{{.EntityNameLower}}, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.Err{{.EntityName}}NotFound {
			return nil, errors.NewNotFoundError("{{.EntityName}} not found", err)
		}
		return nil, errors.NewInternalError("Failed to get {{.EntityName}} for update", err)
	}
	
	{{.EntityNameLower}}.Name = name
	{{.EntityNameLower}}.Description = description
	
	if err := {{.EntityNameLower}}.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.repo.Update(ctx, {{.EntityNameLower}}); err != nil {
		return nil, errors.NewInternalError("Failed to update {{.EntityName}}", err)
	}
	
	return {{.EntityNameLower}}, nil
}

// Delete{{.EntityName}} removes a {{.EntityName}} by its ID
func (s *{{.ServiceName}}Impl) Delete{{.EntityName}}(ctx context.Context, id string) error {
	s.logger.Debug("Deleting {{.EntityName}}", logger.String("id", id))
	
	if err := s.repo.Delete(ctx, id); err != nil {
		if err == repository.Err{{.EntityName}}NotFound {
			return errors.NewNotFoundError("{{.EntityName}} not found", err)
		}
		return errors.NewInternalError("Failed to delete {{.EntityName}}", err)
	}
	
	return nil
}
`

func main() {
	// Validate input arguments
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run service-generator.go <domain-name> <entity-name>")
		fmt.Println("Example: go run service-generator.go asset Stock")
		os.Exit(1)
	}

	domainName := os.Args[1]
	entityName := os.Args[2]
	
	// Ensure first letter of entity name is uppercase
	entityName = strings.Title(entityName)
	
	data := NewTemplateData(domainName, entityName)
	
	// Define paths
	serviceInterfacePath := filepath.Join("invest-tracker", "internal", "domain", domainName, "service", strings.ToLower(entityName)+"_service.go")
	serviceImplPath := filepath.Join("invest-tracker", "internal", "application", domainName, strings.ToLower(entityName)+"_service.go")
	
	// Create service interface
	if PromptOverwrite(serviceInterfacePath) {
		if err := CreateFileFromTemplate(serviceInterfaceTemplate, serviceInterfacePath, data); err != nil {
			fmt.Printf("Error creating service interface: %v\n", err)
			os.Exit(1)
		}
	} else {
		fmt.Printf("Skipping file: %s\n", serviceInterfacePath)
	}
	
	// Create service implementation
	if PromptOverwrite(serviceImplPath) {
		if err := CreateFileFromTemplate(serviceImplementationTemplate, serviceImplPath, data); err != nil {
			fmt.Printf("Error creating service implementation: %v\n", err)
			os.Exit(1)
		}
	} else {
		fmt.Printf("Skipping file: %s\n", serviceImplPath)
	}
	
	fmt.Printf("Successfully created service interface and implementation for '%s' in domain '%s'\n", entityName, domainName)
}
