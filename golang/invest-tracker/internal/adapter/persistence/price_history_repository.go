package persistence

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
	"github.com/systentandobr/toolkit/go/shared/infrastructure/persistence/mongodb"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// PriceHistoryRepositoryMongo implementa a interface PriceHistoryRepository usando MongoDB
type PriceHistoryRepositoryMongo struct {
	client *mongodb.Client
	logger logger.Logger
}

// NewPriceHistoryRepositoryMongo cria uma nova instância do repositório
func NewPriceHistoryRepositoryMongo(client *mongodb.Client, log logger.Logger) *PriceHistoryRepositoryMongo {
	return &PriceHistoryRepositoryMongo{
		client: client,
		logger: log,
	}
}

// GetPriceHistory busca o histórico de preços de um ativo
func (r *PriceHistoryRepositoryMongo) GetPriceHistory(
	ctx context.Context,
	assetID string,
	timeframe valueobject.Timeframe,
	startDate *time.Time,
	endDate *time.Time,
) (valueobject.PriceHistory, error) {
	collection := r.client.Collection("price_history")
	
	// Filtro básico por assetID e timeframe
	filter := bson.M{
		"asset_id":  assetID,
		"timeframe": timeframe,
	}
	
	var result struct {
		AssetID     string                   `bson:"asset_id"`
		AssetSymbol string                   `bson:"asset_symbol"`
		Timeframe   valueobject.Timeframe    `bson:"timeframe"`
		Data        []valueobject.PricePoint `bson:"data"`
	}
	
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Se não existir registro, retornar um histórico vazio
			symbol := ""
			if parts := strings.Split(assetID, "-"); len(parts) > 1 {
				symbol = parts[1]
			}
			
			return valueobject.PriceHistory{
				AssetID:     assetID,
				AssetSymbol: symbol,
				Timeframe:   timeframe,
				Data:        []valueobject.PricePoint{},
			}, nil
		}
		
		return valueobject.PriceHistory{}, fmt.Errorf("falha ao buscar histórico de preços: %w", err)
	}
	
	// Filtrar pontos por data se necessário
	filteredData := result.Data
	if startDate != nil || endDate != nil {
		filteredData = make([]valueobject.PricePoint, 0)
		for _, point := range result.Data {
			// Incluir pontos que estão dentro do intervalo de datas
			if (startDate == nil || !point.Timestamp.Before(*startDate)) &&
				(endDate == nil || !point.Timestamp.After(*endDate)) {
				filteredData = append(filteredData, point)
			}
		}
	}
	
	return valueobject.PriceHistory{
		AssetID:     result.AssetID,
		AssetSymbol: result.AssetSymbol,
		Timeframe:   result.Timeframe,
		Data:        filteredData,
	}, nil
}

// SavePricePoints salva pontos de preço no histórico
func (r *PriceHistoryRepositoryMongo) SavePricePoints(
	ctx context.Context,
	assetID string,
	timeframe valueobject.Timeframe,
	points []valueobject.PricePoint,
) error {
	if len(points) == 0 {
		return nil
	}
	
	collection := r.client.Collection("price_history")
	
	// Verificar se já existe um documento para este ativo e timeframe
	filter := bson.M{
		"asset_id":  assetID,
		"timeframe": timeframe,
	}
	
	var existingDoc struct {
		AssetID     string                   `bson:"asset_id"`
		AssetSymbol string                   `bson:"asset_symbol"`
		Data        []valueobject.PricePoint `bson:"data"`
	}
	
	err := collection.FindOne(ctx, filter).Decode(&existingDoc)
	
	if err == nil {
		// O documento existe, atualizar com novos pontos
		mergedPoints := mergePoints(existingDoc.Data, points)
		
		update := bson.M{
			"$set": bson.M{
				"data":        mergedPoints,
				"updated_at":  time.Now(),
			},
		}
		
		_, err = collection.UpdateOne(ctx, filter, update)
		if err != nil {
			return fmt.Errorf("falha ao atualizar histórico de preços: %w", err)
		}
	} else if err == mongo.ErrNoDocuments {
		// Não existe documento, criar um novo
		assetSymbol := ""
		parts := strings.Split(assetID, "-")
		if len(parts) > 1 {
			assetSymbol = parts[1]
		}
		
		document := bson.M{
			"asset_id":     assetID,
			"asset_symbol": assetSymbol,
			"timeframe":    timeframe,
			"data":         points,
			"created_at":   time.Now(),
			"updated_at":   time.Now(),
		}
		
		_, err = collection.InsertOne(ctx, document)
		if err != nil {
			return fmt.Errorf("falha ao inserir histórico de preços: %w", err)
		}
	} else {
		// Outro erro ocorreu
		return fmt.Errorf("erro ao verificar existência de histórico: %w", err)
	}
	
	return nil
}

// mergePoints combina pontos existentes com novos, evitando duplicatas
func mergePoints(existing, new []valueobject.PricePoint) []valueobject.PricePoint {
	// Criar um mapa para rápida verificação de timestamps existentes
	existingMap := make(map[time.Time]bool)
	for _, point := range existing {
		existingMap[point.Timestamp] = true
	}
	
	// Adicionar novos pontos apenas se não existirem
	result := existing
	for _, point := range new {
		if !existingMap[point.Timestamp] {
			result = append(result, point)
			existingMap[point.Timestamp] = true
		}
	}
	
	return result
}

// DeleteOldPricePoints remove pontos de preço mais antigos que uma data específica
func (r *PriceHistoryRepositoryMongo) DeleteOldPricePoints(
	ctx context.Context,
	assetID string,
	timeframe valueobject.Timeframe,
	olderThan time.Time,
) error {
	collection := r.client.Collection("price_history")
	
	filter := bson.M{
		"asset_id":  assetID,
		"timeframe": timeframe,
	}
	
	// Primeiro buscar o documento para manipular seus pontos
	var doc struct {
		AssetID     string                   `bson:"asset_id"`
		AssetSymbol string                   `bson:"asset_symbol"`
		Timeframe   valueobject.Timeframe    `bson:"timeframe"`
		Data        []valueobject.PricePoint `bson:"data"`
	}
	
	err := collection.FindOne(ctx, filter).Decode(&doc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil // Nada a fazer se não existir
		}
		return fmt.Errorf("falha ao buscar histórico de preços para limpeza: %w", err)
	}
	
	// Filtrar pontos mais recentes que a data limite
	filteredPoints := make([]valueobject.PricePoint, 0)
	for _, point := range doc.Data {
		if !point.Timestamp.Before(olderThan) {
			filteredPoints = append(filteredPoints, point)
		}
	}
	
	// Atualizar documento com pontos filtrados
	update := bson.M{
		"$set": bson.M{
			"data":       filteredPoints,
			"updated_at": time.Now(),
		},
	}
	
	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("falha ao remover pontos antigos: %w", err)
	}
	
	return nil
}
