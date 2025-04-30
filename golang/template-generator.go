// go-template-generator.go
// A simple utility to generate Go files from templates for the Life Tracker project

package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

const (
	// Template directory
	TemplateDir = "templates"
)

// TemplateData contains the data to be passed to templates
type TemplateData struct {
	PackageName  string
	EntityName   string
	EntityNameLower string
	EntityFields []EntityField
}

// EntityField represents a field in an entity
type EntityField struct {
	Name     string
	Type     string
	JsonTag  string
	Required bool
}

// Templates
var templates = map[string]string{
	"entity": `package {{.PackageName}}

import (
	"time"
	"errors"
)

// {{.EntityName}} represents a {{.EntityNameLower}} in the system
type {{.EntityName}} struct {
	ID        string    ` + "`json:\"id\"`" + `
	UserID    string    ` + "`json:\"userId\"`" + `
{{- range .EntityFields}}
	{{.Name}} {{.Type}} ` + "`json:\"{{.JsonTag}}\"`" + `
{{- end}}
	CreatedAt time.Time ` + "`json:\"createdAt\"`" + `
	UpdatedAt time.Time ` + "`json:\"updatedAt\"`" + `
}

// New{{.EntityName}} creates a new {{.EntityName}} instance
func New{{.EntityName}}(userID string{{range .EntityFields}}{{if .Required}}, {{.JsonTag}} {{.Type}}{{end}}{{end}}) ({{.EntityName}}, error) {
	// Validation
{{- range .EntityFields}}
{{- if .Required}}
	if {{.JsonTag}} == "" {
		return {{$.EntityName}}{}, errors.New("{{.JsonTag}} is required")
	}
{{- end}}
{{- end}}

	now := time.Now()
	
	return {{.EntityName}}{
		ID:        generateID(),
		UserID:    userID,
{{- range .EntityFields}}
		{{.Name}}: {{.JsonTag}},
{{- end}}
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// Helper function to generate a unique ID
func generateID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

// Helper function to generate a random string
func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
		time.Sleep(1 * time.Nanosecond)
	}
	return string(b)
}`,

	"repository_interface": `package output

import (
	"context"
	
	"github.com/systentandobr/backend-monorepo/golanginternal/domain/entity/{{.PackageName}}"
)

// {{.EntityName}}Repository defines the operations for {{.EntityName}} persistence
type {{.EntityName}}Repository interface {
	Repository[{{.PackageName}}.{{.EntityName}}]
	FindByUserID(ctx context.Context, userID string) ([]{{.PackageName}}.{{.EntityName}}, error)
{{- range .EntityFields}}
	FindBy{{.Name}}(ctx context.Context, {{.JsonTag}} {{.Type}}) ([]{{$.PackageName}}.{{$.EntityName}}, error)
{{- end}}
}`,

	"repository_implementation": `package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	
	"github.com/systentandobr/backend-monorepo/golanginternal/domain/entity/{{.PackageName}}"
	"github.com/systentandobr/backend-monorepo/golanginternal/port/output"
)

// Mongo{{.EntityName}}Repository implements the {{.EntityName}}Repository interface
type Mongo{{.EntityName}}Repository struct {
	*MongoRepository[{{.PackageName}}.{{.EntityName}}]
}

// NewMongo{{.EntityName}}Repository creates a new Mongo{{.EntityName}}Repository
func NewMongo{{.EntityName}}Repository(db *mongo.Database) *Mongo{{.EntityName}}Repository {
	return &Mongo{{.EntityName}}Repository{
		MongoRepository: NewMongoRepository[{{.PackageName}}.{{.EntityName}}](db, "{{.EntityNameLower}}s"),
	}
}

// FindByUserID finds all {{.EntityNameLower}}s for a given user
func (r *Mongo{{.EntityName}}Repository) FindByUserID(ctx context.Context, userID string) ([]{{.PackageName}}.{{.EntityName}}, error) {
	filter := bson.M{"userId": userID}
	return r.FindAll(ctx, filter)
}

{{- range .EntityFields}}
// FindBy{{.Name}} finds {{$.EntityNameLower}}s by {{.JsonTag}}
func (r *Mongo{{$.EntityName}}Repository) FindBy{{.Name}}(ctx context.Context, {{.JsonTag}} {{.Type}}) ([]{{$.PackageName}}.{{$.EntityName}}, error) {
	filter := bson.M{"{{.JsonTag}}": {{.JsonTag}}}
	return r.FindAll(ctx, filter)
}
{{end}}`,

	"use_case": `package {{.PackageName}}

import (
	"context"
	"github.com/systentandobr/backend-monorepo/golanginternal/domain/entity/{{.PackageName}}"
	"github.com/systentandobr/backend-monorepo/golanginternal/port/output"
)

// {{.EntityName}}UseCase contains business logic for {{.EntityNameLower}}s
type {{.EntityName}}UseCase struct {
	repo     output.{{.EntityName}}Repository
	eventBus output.EventPublisher
}

// New{{.EntityName}}UseCase creates a new {{.EntityName}}UseCase
func New{{.EntityName}}UseCase(
	repo output.{{.EntityName}}Repository,
	eventBus output.EventPublisher,
) *{{.EntityName}}UseCase {
	return &{{.EntityName}}UseCase{
		repo:     repo,
		eventBus: eventBus,
	}
}

// Create{{.EntityName}} creates a new {{.EntityName}}
func (uc *{{.EntityName}}UseCase) Create{{.EntityName}}(
	ctx context.Context, 
	userID string{{range .EntityFields}}{{if .Required}},
	{{.JsonTag}} {{.Type}}{{end}}{{end}},
) ({{.PackageName}}.{{.EntityName}}, error) {
	// Create entity
	entity, err := {{.PackageName}}.New{{.EntityName}}(userID{{range .EntityFields}}{{if .Required}}, {{.JsonTag}}{{end}}{{end}})
	if err != nil {
		return {{.PackageName}}.{{.EntityName}}{}, err
	}
	
	// Save to repository
	if err := uc.repo.Save(ctx, entity); err != nil {
		return {{.PackageName}}.{{.EntityName}}{}, err
	}
	
	// Publish event
	uc.eventBus.Publish(ctx, "{{.EntityNameLower}}.created", entity)
	
	return entity, nil
}

// Get{{.EntityName}} retrieves a {{.EntityName}} by ID
func (uc *{{.EntityName}}UseCase) Get{{.EntityName}}(ctx context.Context, id string) ({{.PackageName}}.{{.EntityName}}, error) {
	return uc.repo.FindByID(ctx, id)
}

// GetUserAll{{.EntityName}}s retrieves all {{.EntityNameLower}}s for a user
func (uc *{{.EntityName}}UseCase) GetUserAll{{.EntityName}}s(ctx context.Context, userID string) ([]{{.PackageName}}.{{.EntityName}}, error) {
	return uc.repo.FindByUserID(ctx, userID)
}

// Update{{.EntityName}} updates an existing {{.EntityName}}
func (uc *{{.EntityName}}UseCase) Update{{.EntityName}}(ctx context.Context, entity {{.PackageName}}.{{.EntityName}}) error {
	// Update
	if err := uc.repo.Update(ctx, entity); err != nil {
		return err
	}
	
	// Publish event
	uc.eventBus.Publish(ctx, "{{.EntityNameLower}}.updated", entity)
	
	return nil
}

// Delete{{.EntityName}} deletes a {{.EntityName}}
func (uc *{{.EntityName}}UseCase) Delete{{.EntityName}}(ctx context.Context, id string) error {
	// Get entity first for the event
	entity, err := uc.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	
	// Delete
	if err := uc.repo.Delete(ctx, id); err != nil {
		return err
	}
	
	// Publish event
	uc.eventBus.Publish(ctx, "{{.EntityNameLower}}.deleted", entity)
	
	return nil
}`,

	"controller": `package controller

import (
	"encoding/json"
	"net/http"
	
	"github.com/systentandobr/backend-monorepo/golanginternal/usecase/{{.PackageName}}"
)

// {{.EntityName}}Controller handles HTTP requests related to {{.EntityNameLower}}s
type {{.EntityName}}Controller struct {
	useCase *{{.PackageName}}.{{.EntityName}}UseCase
}

// New{{.EntityName}}Controller creates a new {{.EntityName}}Controller
func New{{.EntityName}}Controller(useCase *{{.PackageName}}.{{.EntityName}}UseCase) *{{.EntityName}}Controller {
	return &{{.EntityName}}Controller{
		useCase: useCase,
	}
}

// Create{{.EntityName}} handles POST requests to create a new {{.EntityName}}
func (c *{{.EntityName}}Controller) Create{{.EntityName}}(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID string ` + "`json:\"userId\"`" + `
{{- range .EntityFields}}
{{- if .Required}}
		{{.Name}} {{.Type}} ` + "`json:\"{{.JsonTag}}\"`" + `
{{- end}}
{{- end}}
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	entity, err := c.useCase.Create{{.EntityName}}(
		r.Context(), 
		request.UserID{{range .EntityFields}}{{if .Required}},
		request.{{.Name}}{{end}}{{end}},
	)
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(entity)
}

// Get{{.EntityName}} handles GET requests to retrieve a {{.EntityName}}
func (c *{{.EntityName}}Controller) Get{{.EntityName}}(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing ID", http.StatusBadRequest)
		return
	}
	
	entity, err := c.useCase.Get{{.EntityName}}(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entity)
}

// GetAll{{.EntityName}}s handles GET requests to retrieve all {{.EntityNameLower}}s for a user
func (c *{{.EntityName}}Controller) GetAll{{.EntityName}}s(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		http.Error(w, "Missing userID", http.StatusBadRequest)
		return
	}
	
	entities, err := c.useCase.GetUserAll{{.EntityName}}s(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entities)
}

// Delete{{.EntityName}} handles DELETE requests to delete a {{.EntityName}}
func (c *{{.EntityName}}Controller) Delete{{.EntityName}}(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing ID", http.StatusBadRequest)
		return
	}
	
	if err := c.useCase.Delete{{.EntityName}}(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}`,
}

// Main logic for template generation
func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run template-generator.go [entity|repo|usecase|controller] [options]")
		fmt.Println("Example: go run template-generator.go entity --name=BusinessIdea --package=business --fields=title:string,description:string:required")
		os.Exit(1)
	}

	// Parse command line arguments
	templateType := os.Args[1]
	options := parseOptions(os.Args[2:])

	// Prepare template data
	data := prepareTemplateData(options)

	// Generate the file
	generateFile(templateType, data)
}

// parseOptions parses command line options in the format --key=value
func parseOptions(args []string) map[string]string {
	options := make(map[string]string)
	
	for _, arg := range args {
		if strings.HasPrefix(arg, "--") {
			parts := strings.SplitN(arg[2:], "=", 2)
			if len(parts) == 2 {
				options[parts[0]] = parts[1]
			}
		}
	}
	
	return options
}

// prepareTemplateData prepares the data for template rendering
func prepareTemplateData(options map[string]string) TemplateData {
	data := TemplateData{
		PackageName:     options["package"],
		EntityName:      options["name"],
		EntityNameLower: strings.ToLower(options["name"]),
	}
	
	// Parse fields
	if fields, ok := options["fields"]; ok {
		fieldParts := strings.Split(fields, ",")
		for _, field := range fieldParts {
			parts := strings.Split(field, ":")
			
			entityField := EntityField{
				Name:    strings.Title(parts[0]),
				JsonTag: parts[0],
				Type:    "string", // Default type
			}
			
			if len(parts) > 1 {
				entityField.Type = parts[1]
			}
			
			if len(parts) > 2 && parts[2] == "required" {
				entityField.Required = true
			}
			
			data.EntityFields = append(data.EntityFields, entityField)
		}
	}
	
	return data
}

// generateFile generates a file from a template
func generateFile(templateType string, data TemplateData) {
	// Get template
	tmplContent, ok := templates[templateType]
	if !ok {
		fmt.Printf("Unknown template type: %s\n", templateType)
		os.Exit(1)
	}
	
	// Parse template
	tmpl, err := template.New(templateType).Parse(tmplContent)
	if err != nil {
		fmt.Printf("Error parsing template: %v\n", err)
		os.Exit(1)
	}
	
	// Prepare output directory and filename
	var outputDir, filename string
	
	switch templateType {
	case "entity":
		outputDir = filepath.Join("internal", "domain", "entity", data.PackageName)
		filename = strings.ToLower(data.EntityName) + ".go"
	case "repository_interface":
		outputDir = filepath.Join("internal", "port", "output")
		filename = strings.ToLower(data.EntityName) + "_repository.go"
	case "repository_implementation":
		outputDir = filepath.Join("internal", "adapter", "repository")
		filename = "mongo_" + strings.ToLower(data.EntityName) + "_repository.go"
	case "use_case":
		outputDir = filepath.Join("internal", "usecase", data.PackageName)
		filename = strings.ToLower(data.EntityName) + "_usecase.go"
	case "controller":
		outputDir = filepath.Join("internal", "adapter", "controller")
		filename = strings.ToLower(data.EntityName) + "_controller.go"
	}
	
	// Create output directory if it doesn't exist
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		os.Exit(1)
	}
	
	// Create output file
	outputPath := filepath.Join(outputDir, filename)
	file, err := os.Create(outputPath)
	if err != nil {
		fmt.Printf("Error creating file: %v\n", err)
		os.Exit(1)
	}
	defer file.Close()
	
	// Execute template
	if err := tmpl.Execute(file, data); err != nil {
		fmt.Printf("Error executing template: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Printf("Generated %s\n", outputPath)
}