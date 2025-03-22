// internal/domain/asset/repository/asset_repository.go
package repository

import (
	"context"
	"time"

	"github.com/yourusername/investment-tracker/internal/domain/asset/entity"
	"github.com/yourusername/investment-tracker/internal/domain/asset/valueobject"
)

// AssetRepository define as operações para manipulação de ativos
type AssetRepository interface {
	// Busca um ativo pelo ID
	GetByID(ctx context.Context, id string) (entity.Asset, error)
	
	// Busca um ativo pelo símbolo e tipo
	GetBySymbol(ctx context.Context, symbol string, assetType entity.AssetType) (entity.Asset, error)
	
	// Lista todos os ativos
	GetAll(ctx context.Context, filter map[string]interface{}) ([]entity.Asset, error)
	
	// Lista os ativos de um tipo específico
	GetByType(ctx context.Context, assetType entity.AssetType) ([]entity.Asset, error)
	
	// Lista os ativos favoritos
	GetFavorites(ctx context.Context) ([]entity.Asset, error)
	
	// Salva um ativo
	Save(ctx context.Context, asset entity.Asset) error
	
	// Atualiza um ativo
	Update(ctx context.Context, asset entity.Asset) error
	
	// Marca/desmarca um ativo como favorito
	SetFavorite(ctx context.Context, id string, favorite bool) error
	
	// Atualiza o preço de um ativo
	UpdatePrice(ctx context.Context, id string, price float64) error
	
	// Busca ativos por consulta de texto
	Search(ctx context.Context, query string, types []entity.AssetType) ([]entity.Asset, error)
}

// PriceHistoryRepository define as operações para manipulação de histórico de preços
type PriceHistoryRepository interface {
	// Busca o histórico de preços de um ativo
	GetPriceHistory(
		ctx context.Context, 
		assetID string, 
		timeframe valueobject.Timeframe, 
		startDate *time.Time, 
		endDate *time.Time,
	) (valueobject.PriceHistory, error)
	
	// Salva pontos de preço no histórico
	SavePricePoints(ctx context.Context, assetID string, timeframe valueobject.Timeframe, points []valueobject.PricePoint) error
}

// Erros comuns de repositório
var (
	ErrAssetNotFound      = NewRepositoryError("asset not found")
	ErrDuplicateAsset     = NewRepositoryError("asset already exists")
	ErrRepositoryInternal = NewRepositoryError("internal repository error")
	ErrInvalidAssetType   = NewRepositoryError("invalid asset type")
)

// RepositoryError representa um erro de repositório
type RepositoryError struct {
	Message string
}

func (e RepositoryError) Error() string {
	return e.Message
}

func NewRepositoryError(message string) RepositoryError {
	return RepositoryError{Message: message}
}