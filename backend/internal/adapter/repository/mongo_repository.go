
// internal/adapter/repository/mongo_repository.go
package repository

import (
	"context"
	"errors"
	"reflect"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// MongoRepository is a generic MongoDB repository
type MongoRepository[T any] struct {
	collection *mongo.Collection
	idField    string
}

// NewMongoRepository creates a new MongoRepository
func NewMongoRepository[T any](db *mongo.Database, collectionName string) *MongoRepository[T] {
	return &MongoRepository[T]{
		collection: db.Collection(collectionName),
		idField:    "id", // Default ID field
	}
}

// WithIDField sets the ID field name
func (r *MongoRepository[T]) WithIDField(fieldName string) *MongoRepository[T] {
	r.idField = fieldName
	return r
}

// FindByID finds an entity by ID
func (r *MongoRepository[T]) FindByID(ctx context.Context, id string) (T, error) {
	var entity T
	filter := bson.M{r.idField: id}
	
	err := r.collection.FindOne(ctx, filter).Decode(&entity)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			var zero T
			return zero, errors.New("entity not found")
		}
		return entity, err
	}
	
	return entity, nil
}

// FindAll finds all entities matching the filter
func (r *MongoRepository[T]) FindAll(ctx context.Context, filter map[string]interface{}) ([]T, error) {
	var entities []T
	
	// Convert map to bson.M
	bsonFilter := bson.M{}
	for k, v := range filter {
		bsonFilter[k] = v
	}
	
	cursor, err := r.collection.Find(ctx, bsonFilter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	if err := cursor.All(ctx, &entities); err != nil {
		return nil, err
	}
	
	return entities, nil
}

// Save saves an entity
func (r *MongoRepository[T]) Save(ctx context.Context, entity T) error {
	_, err := r.collection.InsertOne(ctx, entity)
	return err
}

// Update updates an entity
func (r *MongoRepository[T]) Update(ctx context.Context, entity T) error {
	// Get ID using reflection
	val := reflect.ValueOf(entity)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}
	
	idField := val.FieldByNameFunc(func(fieldName string) bool {
		field, _ := val.Type().FieldByName(fieldName)
		jsonTag := field.Tag.Get("json")
		return jsonTag == r.idField || fieldName == "ID"
	})
	
	if !idField.IsValid() {
		return errors.New("ID field not found")
	}
	
	id := idField.String()
	filter := bson.M{r.idField: id}
	
	// Update the entity
	_, err := r.collection.ReplaceOne(ctx, filter, entity)
	return err
}

// Delete deletes an entity by ID
func (r *MongoRepository[T]) Delete(ctx context.Context, id string) error {
	filter := bson.M{r.idField: id}
	_, err := r.collection.DeleteOne(ctx, filter)
	return err
}

// Count counts entities matching the filter
func (r *MongoRepository[T]) Count(ctx context.Context, filter map[string]interface{}) (int64, error) {
	// Convert map to bson.M
	bsonFilter := bson.M{}
	for k, v := range filter {
		bsonFilter[k] = v
	}
	
	return r.collection.CountDocuments(ctx, bsonFilter)
}
