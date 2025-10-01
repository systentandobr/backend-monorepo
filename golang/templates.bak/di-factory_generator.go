package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/cmd/templates/common"

)

const factoryTemplate = `package factory

import (
	"context"
	"sync"

	"github.com/gin-gonic/gin"
	"{{.ImportBasePath}}/internal/adapter/controller"
	"{{.ImportBasePath}}/internal/adapter/persistence/mongodb"
	"{{.ImportBasePath}}/internal/application/{{.DomainName}}"
	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/repository"
	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/service"
	"{{.ImportBasePath}}/pkg/common/logger"
	mongoDb "{{.ImportBasePath}}/pkg/infrastructure/database/mongodb"
)

// {{.DomainName}}Factory creates and wires up the {{.DomainName}} domain components
type {{.DomainName}}Factory struct {
	mongoClient *mongoDb.Client
	logger      logger.Logger
	controllers map[string]interface{}
	services    map[string]interface{}
	repositories map[string]interface{}
	lock        sync.RWMutex
}

// New{{.DomainName}}Factory creates a new factory for the {{.DomainName}} domain
func New{{.DomainName}}Factory(mongoClient *mongoDb.Client, logger logger.Logger) *{{.DomainName}}Factory {
	return &{{.DomainName}}Factory{
		mongoClient:  mongoClient,
		logger:       logger,
		controllers:  make(map[string]interface{}),
		services:     make(map[string]interface{}),
		repositories: make(map[string]interface{}),
	}
}

// Get{{.EntityName}}Controller returns the {{.EntityName}} controller, creating it if needed
func (f *{{.DomainName}}Factory) Get{{.EntityName}}Controller() *controller.{{.EntityName}}Controller {
	f.lock.RLock()
	ctrl, exists := f.controllers["{{.EntityNameLower}}"]
	f.lock.RUnlock()
	
	if exists {
		return ctrl.(*controller.{{.EntityName}}Controller)
	}
	
	f.lock.Lock()
	defer f.lock.Unlock()
	
	// Check again in case another goroutine created it
	if ctrl, exists = f.controllers["{{.EntityNameLower}}"]; exists {
		return ctrl.(*controller.{{.EntityName}}Controller)
	}
	
	// Create repository
	repo := f.get{{.EntityName}}Repository()
	
	// Create service
	svc := f.get{{.EntityName}}Service(repo)
	
	// Create controller
	ctrl = controller.New{{.EntityName}}Controller(svc, f.logger)
	f.controllers["{{.EntityNameLower}}"] = ctrl
	
	return ctrl.(*controller.{{.EntityName}}Controller)
}

// get{{.EntityName}}Service returns the {{.EntityName}} service
func (f *{{.DomainName}}Factory) get{{.EntityName}}Service(repo repository.{{.EntityName}}Repository) service.{{.EntityName}}Service {
	f.lock.RLock()
	svc, exists := f.services["{{.EntityNameLower}}"]
	f.lock.RUnlock()
	
	if exists {
		return svc.(service.{{.EntityName}}Service)
	}
	
	f.lock.Lock()
	defer f.lock.Unlock()
	
	// Check again in case another goroutine created it
	if svc, exists = f.services["{{.EntityNameLower}}"]; exists {
		return svc.(service.{{.EntityName}}Service)
	}
	
	svc = {{.DomainName}}.New{{.EntityName}}Service(repo, f.logger)
	f.services["{{.EntityNameLower}}"] = svc
	
	return svc.(service.{{.EntityName}}Service)
}

// get{{.EntityName}}Repository returns the {{.EntityName}} repository
func (f *{{.DomainName}}Factory) get{{.EntityName}}Repository() repository.{{.EntityName}}Repository {
	f.lock.RLock()
	repo, exists := f.repositories["{{.EntityNameLower}}"]
	f.lock.RUnlock()
	
	if exists {
		return repo.(repository.{{.EntityName}}Repository)
	}
	
	f.lock.Lock()
	defer f.lock.Unlock()
	
	// Check again in case another goroutine created it
	if repo, exists = f.repositories["{{.EntityNameLower}}"]; exists {
		return repo.(repository.{{.EntityName}}Repository)
	}
	
	repo = mongodb.NewMongo{{.EntityName}}Repository(f.mongoClient, f.logger)
	f.repositories["{{.EntityNameLower}}"] = repo
	
	return repo.(repository.{{.EntityName}}Repository)
}

// RegisterRoutes registers all {{.DomainName}} domain controllers to the given router
func (f *{{.DomainName}}Factory) RegisterRoutes(router *gin.RouterGroup) {
	// Create the domain router group
	domainRouter := router.Group("/{{.DomainName}}")
	
	// Register {{.EntityName}} controller routes
	f.Get{{.EntityName}}Controller().RegisterRoutes(domainRouter)
	
	// Add more controllers as needed
	// f.GetOtherEntityController().RegisterRoutes(domainRouter)
}

// Bootstrap initializes all services and controllers for this domain
// Call this method during application startup to eagerly initialize components
func (f *{{.DomainName}}Factory) Bootstrap() {
	f.logger.Info("Bootstrapping {{.DomainName}} domain components")
	
	// Initialize the controllers (which will cascade and initialize their dependencies)
	_ = f.Get{{.EntityName}}Controller()
	
	// Add more controllers as they are added to the domain
	// _ = f.GetOtherEntityController()
	
	f.logger.Info("{{.DomainName}} domain components initialized successfully")
}
`

const appBootstrapTemplate = `package bootstrap

import (
	"context"

	"github.com/gin-gonic/gin"
	"{{.ImportBasePath}}/internal/adapter/factory"
	"{{.ImportBasePath}}/pkg/common/logger"
	"{{.ImportBasePath}}/pkg/infrastructure/database/mongodb"
)

// AppBootstrap handles application initialization and dependency wiring
type AppBootstrap struct {
	logger       logger.Logger
	mongoClient  *mongodb.Client
	router       *gin.Engine
	domainFactories []interface{}
}

// NewAppBootstrap creates a new application bootstrap instance
func NewAppBootstrap(
	logger logger.Logger,
	mongoClient *mongodb.Client,
	router *gin.Engine,
) *AppBootstrap {
	return &AppBootstrap{
		logger:      logger,
		mongoClient: mongoClient,
		router:      router,
		domainFactories: make([]interface{}, 0),
	}
}

// Bootstrap initializes all application components
func (b *AppBootstrap) Bootstrap(ctx context.Context) error {
	b.logger.Info("Starting application bootstrap")
	
	// Create API router group
	apiRouter := b.router.Group("/api/v1")
	
	// Initialize domain factories
	{{.DomainName}}Factory := factory.New{{.DomainName}}Factory(b.mongoClient, b.logger)
	b.domainFactories = append(b.domainFactories, {{.DomainName}}Factory)
	
	// Bootstrap domain components
	{{.DomainName}}Factory.Bootstrap()
	
	// Register domain routes
	{{.DomainName}}Factory.RegisterRoutes(apiRouter)
	
	b.logger.Info("Application bootstrap completed successfully")
	return nil
}

// Shutdown gracefully shuts down application components
func (b *AppBootstrap) Shutdown(ctx context.Context) error {
	b.logger.Info("Shutting down application components")
	
	// Add any cleanup logic here
	
	return nil
}
`

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run di-factory-generator.go <domain-name> <entity-name>")
		fmt.Println("Example: go run di-factory-generator.go asset Stock")
		os.Exit(1)
	}

	domainName := os.Args[1]
	entityName := os.Args[2]
	
	// Ensure first letter of entity name is uppercase
	entityName = strings.Title(entityName)
	
	data := common.NewTemplateData(domainName, entityName)
	
	// Define paths
	factoryDir := filepath.Join("invest-tracker", "internal", "adapter", "factory")
	if err := os.MkdirAll(factoryDir, 0755); err != nil {
		fmt.Printf("Error creating factory directory: %v\n", err)
		os.Exit(1)
	}
	
	bootstrapDir := filepath.Join("invest-tracker", "internal", "bootstrap")
	if err := os.MkdirAll(bootstrapDir, 0755); err != nil {
		fmt.Printf("Error creating bootstrap directory: %v\n", err)
		os.Exit(1)
	}
	
	factoryPath := filepath.Join(factoryDir, strings.ToLower(domainName)+"_factory.go")
	bootstrapPath := filepath.Join(bootstrapDir, "app.go")
	
	// Create the factory file
	if common.PromptOverwrite(factoryPath) {
		if err := common.CreateFileFromTemplate(factoryTemplate, factoryPath, data); err != nil {
			fmt.Printf("Error creating factory: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Created factory file: %s\n", factoryPath)
	} else {
		fmt.Printf("Skipping file: %s\n", factoryPath)
	}
	
	// Create the bootstrap file if it doesn't exist
	if !CheckFileExists(bootstrapPath) {
		if err := common.CreateFileFromTemplate(appBootstrapTemplate, bootstrapPath, data); err != nil {
			fmt.Printf("Error creating bootstrap file: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Created bootstrap file: %s\n", bootstrapPath)
	} else {
		fmt.Printf("Bootstrap file already exists: %s\n", bootstrapPath)
		fmt.Println("Please manually update it to include the new domain factory")
	}
	
	fmt.Printf("Successfully created DI factory for domain '%s' with entity '%s'\n", domainName, entityName)
	fmt.Println("Don't forget to update your main.go to use the bootstrap component")
}

// These functions would normally be imported from common template utils
type TemplateData struct {
	DomainName      string
	EntityName      string
	EntityNameLower string
	ImportBasePath  string
}

func NewTemplateData(domainName, entityName string) TemplateData {
	return TemplateData{
		DomainName:      domainName,
		EntityName:      entityName,
		EntityNameLower: strings.ToLower(entityName),
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
}package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const factoryTemplate = `package factory

import (
	"context"
	"sync"

	"github.com/gin-gonic/gin"
	"{{.ImportBasePath}}/internal/adapter/controller"
	"{{.ImportBasePath}}/internal/adapter/persistence/mongodb"
	"{{.ImportBasePath}}/internal/application/{{.DomainName}}"
	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/repository"
	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/service"
	"{{.ImportBasePath}}/pkg/common/logger"
	mongoDb "{{.ImportBasePath}}/pkg/infrastructure/database/mongodb"
)

// {{.DomainName}}Factory creates and wires up the {{.DomainName}} domain components
type {{.DomainName}}Factory struct {
	mongoClient *mongoDb.Client
	logger      logger.Logger
	controllers map[string]interface{}
	services    map[string]interface{}
	repositories map[string]interface{}
	lock        sync.RWMutex
}

// New{{.DomainName}}Factory creates a new factory for the {{.DomainName}} domain
func New{{.DomainName}}Factory(mongoClient *mongoDb.Client, logger logger.Logger) *{{.DomainName}}Factory {
	return &{{.DomainName}}Factory{
		mongoClient:  mongoClient,
		logger:       logger,
		controllers:  make(map[string]interface{}),
		services:     make(map[string]interface{}),
		repositories: make(map[string]interface{}),
	}
}

// Get{{.EntityName}}Controller returns the {{.EntityName}} controller, creating it if needed
func (f *{{.DomainName}}Factory) Get{{.EntityName}}Controller() *controller.{{.EntityName}}Controller {
	f.lock.RLock()
	ctrl, exists := f.controllers["{{.EntityNameLower}}"]
	f.lock.RUnlock()
	
	if exists {
		return ctrl.(*controller.{{.EntityName}}Controller)
	}
	
	f.lock.Lock()
	defer f.lock.Unlock()
	
	// Check again in case another goroutine created it
	if ctrl, exists = f.controllers["{{.EntityNameLower}}"]; exists {
		return ctrl.(*controller.{{.EntityName}}Controller)
	}
	
	// Create repository
	repo := f.get{{.EntityName}}Repository()
	
	// Create service
	svc := f.get{{.EntityName}}Service(repo)
	
	// Create controller
	ctrl = controller.New{{.EntityName}}Controller(svc, f.logger)
	f.controllers["{{.EntityNameLower}}"] = ctrl
	
	return ctrl.(*controller.{{.EntityName}}Controller)
}

// get{{.EntityName}}Service returns the {{.EntityName}} service
func (f *{{.DomainName}}Factory) get{{.EntityName}}Service(repo repository.{{.EntityName}}Repository) service.{{.EntityName}}Service {
	f.lock.RLock()
	svc, exists := f.services["{{.EntityNameLower}}"]
	f.lock.RUnlock()
	
	if exists {
		return svc.(service.{{.EntityName}}Service)
	}
	
	f.lock.Lock()
	defer f.lock.Unlock()
	
	// Check again in case another goroutine created it
	if svc, exists = f.services["{{.EntityNameLower}}"]; exists {
		return svc.(service.{{.EntityName}}Service)
	}
	
	svc = {{.DomainName}}.New{{.EntityName}}Service(repo, f.logger)
	f.services["{{.EntityNameLower}}"] = svc
	
	return svc.(service.{{.EntityName}}Service)
}

// get{{.EntityName}}Repository returns the {{.EntityName}} repository
func (f *{{.DomainName}}Factory) get{{.EntityName}}Repository() repository.{{.EntityName}}Repository {
	f.lock.RLock()
	repo, exists := f.repositories["{{.EntityNameLower}}"]
	f.lock.RUnlock()
	
	if exists {
		return repo.(repository.{{.EntityName}}Repository)
	}
	
	f.lock.Lock()
	defer f.lock.Unlock()
	
	// Check again in case another goroutine created it
	if repo, exists = f.repositories["{{.EntityNameLower}}"]; exists {
		return repo.(repository.{{.EntityName}}Repository)
	}
	
	repo = mongodb.NewMongo{{.EntityName}}Repository(f.mongoClient, f.logger)
	f.repositories["{{.EntityNameLower}}"] = repo
	
	return repo.(repository.{{.EntityName}}Repository)
}

// RegisterRoutes registers all {{.DomainName}} domain controllers to the given router
func (f *{{.DomainName}}Factory) RegisterRoutes(router *gin.RouterGroup) {
	// Create the domain router group
	domainRouter := router.Group("/{{.DomainName}}")
	
	// Register {{.EntityName}} controller routes
	f.Get{{.EntityName}}Controller().RegisterRoutes(domainRouter)
	
	// Add more controllers as needed
	// f.GetOtherEntityController().RegisterRoutes(domainRouter)
}

// Bootstrap initializes all services and controllers for this domain
// Call this method during application startup to eagerly initialize components
func (f *{{.DomainName}}Factory) Bootstrap() {
	f.logger.Info("Bootstrapping {{.DomainName}} domain components")
	
	// Initialize the controllers (which will cascade and initialize their dependencies)
	_ = f.Get{{.EntityName}}Controller()
	
	// Add more controllers as they are added to the domain
	// _ = f.GetOtherEntityController()
	
	f.logger.Info("{{.DomainName}} domain components initialized successfully")
}
`

const appBootstrapTemplate = `package bootstrap

import (
	"context"

	"github.com/gin-gonic/gin"
	"{{.ImportBasePath}}/internal/adapter/factory"
	"{{.ImportBasePath}}/pkg/common/logger"
	"{{.ImportBasePath}}/pkg/infrastructure/database/mongodb"
)

// AppBootstrap handles application initialization and dependency wiring
type AppBootstrap struct {
	logger       logger.Logger
	mongoClient  *mongodb.Client
	router       *gin.Engine
	domainFactories []interface{}
}

// NewAppBootstrap creates a new application bootstrap instance
func NewAppBootstrap(
	logger logger.Logger,
	mongoClient *mongodb.Client,
	router *gin.Engine,
) *AppBootstrap {
	return &AppBootstrap{
		logger:      logger,
		mongoClient: mongoClient,
		router:      router,
		domainFactories: make([]interface{}, 0),
	}
}

// Bootstrap initializes all application components
func (b *AppBootstrap) Bootstrap(ctx context.Context) error {
	b.logger.Info("Starting application bootstrap")
	
	// Create API router group
	apiRouter := b.router.Group("/api/v1")
	
	// Initialize domain factories
	{{.DomainName}}Factory := factory.New{{.DomainName}}Factory(b.mongoClient, b.logger)
	b.domainFactories = append(b.domainFactories, {{.DomainName}}Factory)
	
	// Bootstrap domain components
	{{.DomainName}}Factory.Bootstrap()
	
	// Register domain routes
	{{.DomainName}}Factory.RegisterRoutes(apiRouter)
	
	b.logger.Info("Application bootstrap completed successfully")
	return nil
}

// Shutdown gracefully shuts down application components
func (b *AppBootstrap) Shutdown(ctx context.Context) error {
	b.logger.Info("Shutting down application components")
	
	// Add any cleanup logic here
	
	return nil
}
`

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run di-factory-generator.go <domain-name> <entity-name>")
		fmt.Println("Example: go run di-factory-generator.go asset Stock")
		os.Exit(1)
	}

	domainName := os.Args[1]
	entityName := os.Args[2]
	
	// Ensure first letter of entity name is uppercase
	entityName = strings.Title(entityName)
	
	data := common.NewTemplateData(domainName, entityName)
	
	// Define paths
	factoryDir := filepath.Join("invest-tracker", "internal", "adapter", "factory")
	if err := os.MkdirAll(factoryDir, 0755); err != nil {
		fmt.Printf("Error creating factory directory: %v\n", err)
		os.Exit(1)
	}
	
	bootstrapDir := filepath.Join("invest-tracker", "internal", "bootstrap")
	if err := os.MkdirAll(bootstrapDir, 0755); err != nil {
		fmt.Printf("Error creating bootstrap directory: %v\n", err)
		os.Exit(1)
	}
	
	factoryPath := filepath.Join(factoryDir, strings.ToLower(domainName)+"_factory.go")
	bootstrapPath := filepath.Join(bootstrapDir, "app.go")
	
	// Create the factory file
	if common.PromptOverwrite(factoryPath) {
		if err := common.CreateFileFromTemplate(factoryTemplate, factoryPath, data); err != nil {
			fmt.Printf("Error creating factory: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Created factory file: %s\n", factoryPath)
	} else {
		fmt.Printf("Skipping file: %s\n", factoryPath)
	}
	
	// Create the bootstrap file if it doesn't exist
	if !CheckFileExists(bootstrapPath) {
		if err := common.CreateFileFromTemplate(appBootstrapTemplate, bootstrapPath, data); err != nil {
			fmt.Printf("Error creating bootstrap file: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Created bootstrap file: %s\n", bootstrapPath)
	} else {
		fmt.Printf("Bootstrap file already exists: %s\n", bootstrapPath)
		fmt.Println("Please manually update it to include the new domain factory")
	}
	
	fmt.Printf("Successfully created DI factory for domain '%s' with entity '%s'\n", domainName, entityName)
	fmt.Println("Don't forget to update your main.go to use the bootstrap component")
}

// These functions would normally be imported from common template utils
type TemplateData struct {
	DomainName      string
	EntityName      string
	EntityNameLower string
	ImportBasePath  string
}

func NewTemplateData(domainName, entityName string) TemplateData {
	return TemplateData{
		DomainName:      domainName,
		EntityName:      entityName,
		EntityNameLower: strings.ToLower(entityName),
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