package persistence

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/repository"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/infrastructure/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AssetRepositoryMongo implementa a interface AssetRepository usando MongoDB
type AssetRepositoryMongo struct {
	client *mongodb.Client
	logger logger.Logger
}

// NewAssetRepositoryMongo cria uma nova instância do repositório
func NewAssetRepositoryMongo(client *mongodb.Client, log logger.Logger) *AssetRepositoryMongo {
	return &AssetRepositoryMongo{
		client: client,
		logger: log,
	}
}

// GetByID busca um ativo pelo ID
func (r *AssetRepositoryMongo) GetByID(ctx context.Context, id string) (entity.Asset, error) {
	collection := r.client.Collection("assets")
	
	filter := bson.M{"_id": id}
	
	var result map[string]interface{}
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repository.ErrAssetNotFound
		}
		return nil, fmt.Errorf("failed to get asset by ID: %w", err)
	}
	
	return r.mapToAsset(result)
}

// GetBySymbol busca um ativo pelo símbolo e tipo
func (r *AssetRepositoryMongo) GetBySymbol(ctx context.Context, symbol string, assetType entity.AssetType) (entity.Asset, error) {
	collection := r.client.Collection("assets")
	
	filter := bson.M{
		"symbol": symbol,
		"type": assetType,
	}
	
	var result map[string]interface{}
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repository.ErrAssetNotFound
		}
		return nil, fmt.Errorf("failed to get asset by symbol: %w", err)
	}
	
	return r.mapToAsset(result)
}

// GetAll lista todos os ativos com filtro opcional
func (r *AssetRepositoryMongo) GetAll(ctx context.Context, filter map[string]interface{}) ([]entity.Asset, error) {
	collection := r.client.Collection("assets")
	
	mongoFilter := bson.M{}
	for k, v := range filter {
		mongoFilter[k] = v
	}
	
	cursor, err := collection.Find(ctx, mongoFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to get assets: %w", err)
	}
	defer cursor.Close(ctx)
	
	var results []map[string]interface{}
	if err := cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("failed to decode assets: %w", err)
	}
	
	assets := make([]entity.Asset, 0, len(results))
	for _, result := range results {
		asset, err := r.mapToAsset(result)
		if err != nil {
			r.logger.Warn("Failed to map asset", logger.Error(err))
			continue
		}
		assets = append(assets, asset)
	}
	
	return assets, nil
}

// GetByType lista os ativos de um tipo específico
func (r *AssetRepositoryMongo) GetByType(ctx context.Context, assetType entity.AssetType) ([]entity.Asset, error) {
	return r.GetAll(ctx, map[string]interface{}{
		"type": assetType,
	})
}

// GetFavorites lista os ativos favoritos
func (r *AssetRepositoryMongo) GetFavorites(ctx context.Context) ([]entity.Asset, error) {
	return r.GetAll(ctx, map[string]interface{}{
		"is_favorite": true,
	})
}

// Save salva um novo ativo
func (r *AssetRepositoryMongo) Save(ctx context.Context, asset entity.Asset) error {
	collection := r.client.Collection("assets")
	
	// Verificar se o ativo já existe
	filter := bson.M{"_id": asset.GetID()}
	count, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to check if asset exists: %w", err)
	}
	
	if count > 0 {
		return repository.ErrDuplicateAsset
	}
	
	document := r.assetToBSON(asset)
	_, err = collection.InsertOne(ctx, document)
	if err != nil {
		return fmt.Errorf("failed to save asset: %w", err)
	}
	
	return nil
}

// Update atualiza um ativo existente
func (r *AssetRepositoryMongo) Update(ctx context.Context, asset entity.Asset) error {
	collection := r.client.Collection("assets")
	
	filter := bson.M{"_id": asset.GetID()}
	document := r.assetToBSON(asset)
	
	result, err := collection.ReplaceOne(ctx, filter, document)
	if err != nil {
		return fmt.Errorf("failed to update asset: %w", err)
	}
	
	if result.MatchedCount == 0 {
		return repository.ErrAssetNotFound
	}
	
	return nil
}

// SetFavorite marca/desmarca um ativo como favorito
func (r *AssetRepositoryMongo) SetFavorite(ctx context.Context, id string, favorite bool) error {
	collection := r.client.Collection("assets")
	
	filter := bson.M{"_id": id}
	update := bson.M{
		"$set": bson.M{
			"is_favorite": favorite,
		},
	}
	
	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update favorite status: %w", err)
	}
	
	if result.MatchedCount == 0 {
		return repository.ErrAssetNotFound
	}
	
	return nil
}

// UpdatePrice atualiza o preço de um ativo
func (r *AssetRepositoryMongo) UpdatePrice(ctx context.Context, id string, price float64) error {
	collection := r.client.Collection("assets")
	
	// Primeiro obter o preço atual para definir como anterior
	var asset map[string]interface{}
	filter := bson.M{"_id": id}
	err := collection.FindOne(ctx, filter).Decode(&asset)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return repository.ErrAssetNotFound
		}
		return fmt.Errorf("failed to get asset: %w", err)
	}
	
	currentPrice, ok := asset["current_price"].(float64)
	if !ok {
		currentPrice = price
	}
	
	changePercent := 0.0
	if currentPrice > 0 {
		changePercent = ((price - currentPrice) / currentPrice) * 100
	}
	
	update := bson.M{
		"$set": bson.M{
			"current_price":      price,
			"previous_close":     currentPrice,
			"change_percentage":  changePercent,
			"last_updated":       time.Now(),
		},
	}
	
	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update price: %w", err)
	}
	
	if result.MatchedCount == 0 {
		return repository.ErrAssetNotFound
	}
	
	return nil
}

// Search busca ativos por texto e tipo
func (r *AssetRepositoryMongo) Search(ctx context.Context, query string, types []entity.AssetType) ([]entity.Asset, error) {
	collection := r.client.Collection("assets")
	
	filter := bson.M{
		"$or": []bson.M{
			{"symbol": bson.M{"$regex": query, "$options": "i"}},
			{"name": bson.M{"$regex": query, "$options": "i"}},
		},
	}
	
	if len(types) > 0 {
		typeValues := make([]string, len(types))
		for i, t := range types {
			typeValues[i] = string(t)
		}
		filter["type"] = bson.M{"$in": typeValues}
	}
	
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to search assets: %w", err)
	}
	defer cursor.Close(ctx)
	
	var results []map[string]interface{}
	if err := cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("failed to decode search results: %w", err)
	}
	
	assets := make([]entity.Asset, 0, len(results))
	for _, result := range results {
		asset, err := r.mapToAsset(result)
		if err != nil {
			r.logger.Warn("Failed to map search result", logger.Error(err))
			continue
		}
		assets = append(assets, asset)
	}
	
	return assets, nil
}

// Helper functions for mapping between domain and database
func (r *AssetRepositoryMongo) mapToAsset(data map[string]interface{}) (entity.Asset, error) {
	assetType, ok := data["type"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid asset type")
	}
	
	switch entity.AssetType(assetType) {
	case entity.AssetTypeStock:
		return r.mapToStock(data)
	case entity.AssetTypeREIT:
		return r.mapToREIT(data)
	case entity.AssetTypeCrypto:
		return r.mapToCrypto(data)
	default:
		return nil, repository.ErrInvalidAssetType
	}
}

func (r *AssetRepositoryMongo) mapToStock(data map[string]interface{}) (*entity.Stock, error) {
	baseAsset, err := r.mapToBaseAsset(data)
	if err != nil {
		return nil, err
	}
	
	company, _ := data["company"].(string)
	sector, _ := data["sector"].(string)
	dividendYield, _ := data["dividend_yield"].(float64)
	priceToEarnings, _ := data["price_to_earnings"].(float64)
	marketCap, _ := data["market_cap"].(float64)
	
	return &entity.Stock{
		BaseAsset:       *baseAsset,
		Company:         company,
		Sector:          sector,
		DividendYield:   dividendYield,
		PriceToEarnings: priceToEarnings,
		MarketCap:       marketCap,
	}, nil
}

func (r *AssetRepositoryMongo) mapToREIT(data map[string]interface{}) (*entity.REIT, error) {
	baseAsset, err := r.mapToBaseAsset(data)
	if err != nil {
		return nil, err
	}
	
	segment, _ := data["segment"].(string)
	dividendYield, _ := data["dividend_yield"].(float64)
	propertyCount, _ := data["property_count"].(int32)
	pvp, _ := data["pvp"].(float64)
	lastDividend, _ := data["last_dividend"].(float64)
	
	return &entity.REIT{
		BaseAsset:      *baseAsset,
		Segment:        segment,
		DividendYield:  dividendYield,
		PropertyCount:  int(propertyCount),
		PVP:            pvp,
		LastDividend:   lastDividend,
	}, nil
}

func (r *AssetRepositoryMongo) mapToCrypto(data map[string]interface{}) (*entity.Cryptocurrency, error) {
	baseAsset, err := r.mapToBaseAsset(data)
	if err != nil {
		return nil, err
	}
	
	marketCap, _ := data["market_cap"].(float64)
	circulatingSupply, _ := data["circulating_supply"].(float64)
	
	var maxSupply *float64
	if val, ok := data["max_supply"].(float64); ok {
		maxSupply = &val
	}
	
	allTimeHigh, _ := data["all_time_high"].(float64)
	
	var allTimeHighDate *time.Time
	if val, ok := data["all_time_high_date"].(time.Time); ok {
		allTimeHighDate = &val
	}
	
	return &entity.Cryptocurrency{
		BaseAsset:         *baseAsset,
		MarketCap:         marketCap,
		CirculatingSupply: circulatingSupply,
		MaxSupply:         maxSupply,
		AllTimeHigh:       allTimeHigh,
		AllTimeHighDate:   allTimeHighDate,
	}, nil
}

func (r *AssetRepositoryMongo) mapToBaseAsset(data map[string]interface{}) (*entity.BaseAsset, error) {
	id, _ := data["_id"].(string)
	symbol, _ := data["symbol"].(string)
	name, _ := data["name"].(string)
	typeName, _ := data["type"].(string)
	currentPrice, _ := data["current_price"].(float64)
	previousClose, _ := data["previous_close"].(float64)
	changePercentage, _ := data["change_percentage"].(float64)
	volume, _ := data["volume"].(float64)
	lastUpdated, _ := data["last_updated"].(time.Time)
	favorite, _ := data["is_favorite"].(bool)
	
	if id == "" || symbol == "" || typeName == "" {
		return nil, fmt.Errorf("missing required fields")
	}
	
	return &entity.BaseAsset{
		ID:               id,
		Symbol:           symbol,
		Name:             name,
		Type:             entity.AssetType(typeName),
		CurrentPrice:     currentPrice,
		PreviousClose:    previousClose,
		ChangePercentage: changePercentage,
		Volume:           volume,
		LastUpdated:      lastUpdated,
		Favorite:         favorite,
	}, nil
}

func (r *AssetRepositoryMongo) assetToBSON(asset entity.Asset) interface{} {
	switch a := asset.(type) {
	case *entity.Stock:
		return bson.M{
			"_id":               a.ID,
			"symbol":            a.Symbol,
			"name":              a.Name,
			"type":              a.Type,
			"current_price":     a.CurrentPrice,
			"previous_close":    a.PreviousClose,
			"change_percentage": a.ChangePercentage,
			"volume":            a.Volume,
			"last_updated":      a.LastUpdated,
			"is_favorite":       a.Favorite,
			"company":           a.Company,
			"sector":            a.Sector,
			"dividend_yield":    a.DividendYield,
			"price_to_earnings": a.PriceToEarnings,
			"market_cap":        a.MarketCap,
		}
	case *entity.REIT:
		return bson.M{
			"_id":               a.ID,
			"symbol":            a.Symbol,
			"name":              a.Name,
			"type":              a.Type,
			"current_price":     a.CurrentPrice,
			"previous_close":    a.PreviousClose,
			"change_percentage": a.ChangePercentage,
			"volume":            a.Volume,
			"last_updated":      a.LastUpdated,
			"is_favorite":       a.Favorite,
			"segment":           a.Segment,
			"dividend_yield":    a.DividendYield,
			"property_count":    a.PropertyCount,
			"pvp":               a.PVP,
			"last_dividend":     a.LastDividend,
		}
	case *entity.Cryptocurrency:
		document := bson.M{
			"_id":                a.ID,
			"symbol":             a.Symbol,
			"name":               a.Name,
			"type":               a.Type,
			"current_price":      a.CurrentPrice,
			"previous_close":     a.PreviousClose,
			"change_percentage":  a.ChangePercentage,
			"volume":             a.Volume,
			"last_updated":       a.LastUpdated,
			"is_favorite":        a.Favorite,
			"market_cap":         a.MarketCap,
			"circulating_supply": a.CirculatingSupply,
		}
		
		if a.MaxSupply != nil {
			document["max_supply"] = *a.MaxSupply
		}
		
		if a.AllTimeHighDate != nil {
			document["all_time_high"] = a.AllTimeHigh
			document["all_time_high_date"] = *a.AllTimeHighDate
		}
		
		return document
	default:
		return bson.M{
			"_id":               asset.GetID(),
			"symbol":            asset.GetSymbol(),
			"name":              asset.GetName(),
			"type":              asset.GetType(),
			"current_price":     asset.GetCurrentPrice(),
			"previous_close":    asset.GetPreviousClose(),
			"change_percentage": asset.GetChangePercentage(),
			"last_updated":      asset.GetLastUpdated(),
			"is_favorite":       asset.IsFavorite(),
		}
	}
}
