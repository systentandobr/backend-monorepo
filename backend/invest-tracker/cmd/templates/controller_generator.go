package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/templates/common"

)

const controllerTemplate = `package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/service"
	"{{.ImportBasePath}}/pkg/common/errors"
	"{{.ImportBasePath}}/pkg/common/logger"
)

// {{.ControllerName}} handles HTTP requests for {{.EntityName}} resources
type {{.ControllerName}} struct {
	service service.{{.ServiceName}}
	logger  logger.Logger
}

// New{{.ControllerName}} creates a new {{.ControllerName}} instance
func New{{.ControllerName}}(service service.{{.ServiceName}}, logger logger.Logger) *{{.ControllerName}} {
	return &{{.ControllerName}}{
		service: service,
		logger:  logger,
	}
}

// GetByID handles GET /{{"{"}}id{{"}"}} request
func (c *{{.ControllerName}}) GetByID(ctx *gin.Context) {
	id := ctx.Param("id")
	
	{{.EntityNameLower}}, err := c.service.Get{{.EntityName}}(ctx, id)
	if err != nil {
		var appErr *errors.AppError
		if errors.As(err, &appErr) {
			ctx.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
			return
		}
		
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	
	ctx.JSON(http.StatusOK, {{.EntityNameLower}})
}

// GetAll handles GET / request
func (c *{{.ControllerName}}) GetAll(ctx *gin.Context) {
	// Handle query parameters for filtering
	filter := make(map[string]interface{})
	
	// Example filter parsing from query parameters
	if name := ctx.Query("name"); name != "" {
		filter["name"] = name
	}
	
	{{.EntityNamePlural}}, err := c.service.GetAll{{.EntityNamePlural}}(ctx, filter)
	if err != nil {
		var appErr *errors.AppError
		if errors.As(err, &appErr) {
			ctx.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
			return
		}
		
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	
	ctx.JSON(http.StatusOK, {{.EntityNamePlural}})
}

type create{{.EntityName}}Request struct {
	Name        string ` + "`json:\"name\" binding:\"required\"`" + `
	Description string ` + "`json:\"description\"`" + `
}

// Create handles POST / request
func (c *{{.ControllerName}}) Create(ctx *gin.Context) {
	var req create{{.EntityName}}Request
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	
	{{.EntityNameLower}}, err := c.service.Create{{.EntityName}}(ctx, req.Name, req.Description)
	if err != nil {
		var appErr *errors.AppError
		if errors.As(err, &appErr) {
			ctx.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
			return
		}
		
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	
	ctx.JSON(http.StatusCreated, {{.EntityNameLower}})
}

type update{{.EntityName}}Request struct {
	Name        string ` + "`json:\"name\" binding:\"required\"`" + `
	Description string ` + "`json:\"description\"`" + `
}

// Update handles PUT /{{"{"}}id{{"}"}} request
func (c *{{.ControllerName}}) Update(ctx *gin.Context) {
	id := ctx.Param("id")
	
	var req update{{.EntityName}}Request
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	
	{{.EntityNameLower}}, err := c.service.Update{{.EntityName}}(ctx, id, req.Name, req.Description)
	if err != nil {
		var appErr *errors.AppError
		if errors.As(err, &appErr) {
			ctx.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
			return
		}
		
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	
	ctx.JSON(http.StatusOK, {{.EntityNameLower}})
}

// Delete handles DELETE /{{"{"}}id{{"}"}} request
func (c *{{.ControllerName}}) Delete(ctx *gin.Context) {
	id := ctx.Param("id")
	
	err := c.service.Delete{{.EntityName}}(ctx, id)
	if err != nil {
		var appErr *errors.AppError
		if errors.As(err, &appErr) {
			ctx.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
			return
		}
		
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	
	ctx.JSON(http.StatusNoContent, nil)
}

// RegisterRoutes registers the controller routes to the router group
func (c *{{.ControllerName}}) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/{{.EntityNamePlural}}")
	{
		group.GET("/", c.GetAll)
		group.POST("/", c.Create)
		group.GET("/:id", c.GetByID)
		group.PUT("/:id", c.Update)
		group.DELETE("/:id", c.Delete)
	}
}
`

func main() {
	// Validate input arguments
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run controller-generator.go <domain-name> <entity-name>")
		fmt.Println("Example: go run controller-generator.go asset Stock")
		os.Exit(1)
	}

	domainName := os.Args[1]
	entityName := os.Args[2]
	
	// Ensure first letter of entity name is uppercase
	entityName = strings.Title(entityName)
	
	data := common.NewTemplateData(domainName, entityName)
	
	// Define path for controller
	controllerDir := filepath.Join("invest-tracker", "internal", "adapter", "controller")
	if err := os.MkdirAll(controllerDir, 0755); err != nil {
		fmt.Printf("Error creating controller directory: %v\n", err)
		os.Exit(1)
	}
	
	controllerPath := filepath.Join(controllerDir, strings.ToLower(entityName)+"_controller.go")
	
	// Check if file already exists and prompt for overwrite
	if !PromptOverwrite(controllerPath) {
		fmt.Printf("Skipping file: %s\n", controllerPath)
		return
	}
	
	// Create the controller file
	if err := CreateFileFromTemplate(controllerTemplate, controllerPath, data); err != nil {
		fmt.Printf("Error creating controller: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Printf("Successfully created controller for '%s' in domain '%s'\n", entityName, domainName)
}