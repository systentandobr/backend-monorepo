package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/cmd/templates/common"

)

const repositoryInterfaceTemplate = `package repository

import (
	"context"

	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/entity"
)

// {{.RepositoryName}} defines the interface for {{.EntityName}} data access
type {{.RepositoryName}} interface {
	// FindByID retrieves a {{.EntityName}} by its ID
	FindByID(ctx context.Context, id string) (*entity.{{.EntityName}}, error)
	
	// FindAll retrieves all {{.EntityNamePlural}} based on optional filter
	FindAll(ctx context.Context, filter map[string]interface{}) ([]*entity.{{.EntityName}}, error)
	
	// Create stores a new {{.EntityName}}
	Create(ctx context.Context, {{.EntityNameLower}} *entity.{{.EntityName}}) error
	
	// Update modifies an existing {{.EntityName}}
	Update(ctx context.Context, {{.EntityNameLower}} *entity.{{.EntityName}}) error
	
	// Delete removes a {{.EntityName}} by its ID
	Delete(ctx context.Context, id string) error
}

// Common error types for repositories
var (
	Err{{.EntityName}}NotFound = fmt.Errorf("{{.EntityNameLower}} not found")
	Err{{.EntityName}}Duplicate = fmt.Errorf("{{.EntityNameLower}} already exists")
)
`

const mongoRepositoryTemplate = `package mongodb

import (
	"context"
	"time"

	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/entity"
	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/repository"
	"{{.ImportBasePath}}/pkg/common/logger"
	"{{.ImportBasePath}}/pkg/infrastructure/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const {{.EntityNameLower}}Collection = "{{.EntityNamePlural}}"

// Mongo{{.RepositoryName}} implements {{.RepositoryName}} interface using MongoDB
type Mongo{{.RepositoryName}} struct {
	client *mongodb.Client
	logger logger.Logger
}

// NewMongo{{.RepositoryName}} creates a new MongoDB repository for {{.EntityName}}
func NewMongo{{.RepositoryName}}(client *mongodb.Client, logger logger.Logger) repository.{{.RepositoryName}} {
	return &Mongo{{.RepositoryName}}{
		client: client,
		logger: logger,
	}
}

// FindByID retrieves a {{.EntityName}} by its ID
func (r *Mongo{{.RepositoryName}}) FindByID(ctx context.Context, id string) (*entity.{{.EntityName}}, error) {
	collection := r.client.Collection({{.EntityNameLower}}Collection)
	
	var {{.EntityNameLower}} entity.{{.EntityName}}
	
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&{{.EntityNameLower}})
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repository.Err{{.EntityName}}NotFound
		}
		return nil, err
	}
	
	return &{{.EntityNameLower}}, nil
}

// FindAll retrieves all {{.EntityNamePlural}} based on optional filter
func (r *Mongo{{.RepositoryName}}) FindAll(ctx context.Context, filter map[string]interface{}) ([]*entity.{{.EntityName}}, error) {
	collection := r.client.Collection({{.EntityNameLower}}Collection)
	
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{"{", "}", "key:", "\"created_at\"", ", ", "value:", "-1}"}}.)
	
	mongoFilter := bson.M{}
	if filter != nil {
		mongoFilter = bson.M(filter)
	}
	
	cursor, err := collection.Find(ctx, mongoFilter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var results []*entity.{{.EntityName}}
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	
	return results, nil
}

// Create stores a new {{.EntityName}}
func (r *Mongo{{.RepositoryName}}) Create(ctx context.Context, {{.EntityNameLower}} *entity.{{.EntityName}}) error {
	collection := r.client.Collection({{.EntityNameLower}}Collection)
	
	{{.EntityNameLower}}.BeforeSave()
	
	if {{.EntityNameLower}}.ID == "" {
		{{.EntityNameLower}}.ID = primitive.NewObjectID().Hex()
	}
	
	_, err := collection.InsertOne(ctx, {{.EntityNameLower}})
	if err != nil {
		// Check for duplicate key error
		if mongo.IsDuplicateKeyError(err) {
			return repository.Err{{.EntityName}}Duplicate
		}
		return err
	}
	
	return nil
}

// Update modifies an existing {{.EntityName}}
func (r *Mongo{{.RepositoryName}}) Update(ctx context.Context, {{.EntityNameLower}} *entity.{{.EntityName}}) error {
	collection := r.client.Collection({{.EntityNameLower}}Collection)
	
	{{.EntityNameLower}}.UpdatedAt = time.Now()
	
	objectID, err := primitive.ObjectIDFromHex({{.EntityNameLower}}.ID)
	if err != nil {
		return err
	}
	
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": {{.EntityNameLower}}}
	
	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	
	if result.MatchedCount == 0 {
		return repository.Err{{.EntityName}}NotFound
	}
	
	return nil
}

// Delete removes a {{.EntityName}} by its ID
func (r *Mongo{{.RepositoryName}}) Delete(ctx context.Context, id string) error {
	collection := r.client.Collection({{.EntityNameLower}}Collection)
	
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	
	result, err := collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return err
	}
	
	if result.DeletedCount == 0 {
		return repository.Err{{.EntityName}}NotFound
	}
	
	return nil
}
`

func main() {
	// Validate input arguments
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run repository-generator.go <domain-name> <entity-name>")
		fmt.Println("Example: go run repository-generator.go asset Stock")
		os.Exit(1)
	}

	domainName := os.Args[1]
	entityName := os.Args[2]
	
	// Ensure first letter of entity name is uppercase
	entityName = strings.Title(entityName)
	
	data := common.NewTemplateData(domainName, entityName)
	
	// Define paths
	repoInterfacePath := filepath.Join("invest-tracker", "internal", "domain", domainName, "repository", strings.ToLower(entityName)+"_repository.go")
	mongoRepoPath := filepath.Join("invest-tracker", "internal", "adapter", "persistence", "mongodb", strings.ToLower(entityName)+"_repository.go")
	
	// Create repository interface
	if common.PromptOverwrite(repoInterfacePath) {
		if err := common.CreateFileFromTemplate(repositoryInterfaceTemplate, repoInterfacePath, data); err != nil {
			fmt.Printf("Error creating repository interface: %v\n", err)
			os.Exit(1)
		}
	} else {
		fmt.Printf("Skipping file: %s\n", repoInterfacePath)
	}
	
	// Create MongoDB repository implementation
	if common.PromptOverwrite(mongoRepoPath) {
		if err := common.CreateFileFromTemplate(mongoRepositoryTemplate, mongoRepoPath, data); err != nil {
			fmt.Printf("Error creating MongoDB repository: %v\n", err)
			os.Exit(1)
		}
	} else {
		fmt.Printf("Skipping file: %s\n", mongoRepoPath)
	}
	
	fmt.Printf("Successfully created repository interface and MongoDB implementation for '%s' in domain '%s'\n", entityName, domainName)
}