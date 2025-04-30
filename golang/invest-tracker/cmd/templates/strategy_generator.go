package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/cmd/templates/common"

)

const strategyInterfaceTemplate = `package strategy

import (
	"context"

	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/entity"
)

// InvestmentStrategy defines the interface that all investment strategies must implement
type InvestmentStrategy interface {
	// GetType returns the strategy type identifier
	GetType() string
	
	// GetName returns the readable name of the strategy
	GetName() string
	
	// GetDescription returns a description of how the strategy works
	GetDescription() string
	
	// IsAssetSuitable checks if an asset is suitable for this strategy
	IsAssetSuitable(asset entity.Asset) bool
	
	// AnalyzeAsset analyzes an asset and determines if it's a good investment opportunity
	// based on the strategy's criteria
	AnalyzeAsset(ctx context.Context, asset entity.Asset, priceHistory []entity.PricePoint) (*entity.InvestmentOpportunity, error)
	
	// ShouldSell determines if an asset that was bought using this strategy should be sold
	ShouldSell(ctx context.Context, asset entity.Asset, entryPrice float64, priceHistory []entity.PricePoint) (bool, string, error)
	
	// GetParameters returns the configurable parameters for this strategy
	GetParameters() map[string]interface{}
	
	// SetParameters updates the strategy parameters
	SetParameters(params map[string]interface{}) error
}
`

const strategyImplementationTemplate = `package {{.PackageName}}

import (
	"context"
	"fmt"

	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/entity"
	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/strategy"
	"{{.ImportBasePath}}/pkg/common/logger"
)

const {{.StructName}}StrategyType = "{{.EntityNameLower}}"

// {{.StructName}}Strategy implements the {{.StructName}} investment strategy
type {{.StructName}}Strategy struct {
	logger     logger.Logger
	parameters map[string]interface{}
}

// New{{.StructName}}Strategy creates a new instance of {{.StructName}}Strategy
func New{{.StructName}}Strategy(logger logger.Logger) strategy.InvestmentStrategy {
	return &{{.StructName}}Strategy{
		logger: logger,
		parameters: map[string]interface{}{
			// Default parameters here
			"param1": 10.0,
			"param2": 5,
		},
	}
}

// GetType returns the strategy type identifier
func (s *{{.StructName}}Strategy) GetType() string {
	return {{.StructName}}StrategyType
}

// GetName returns the readable name of the strategy
func (s *{{.StructName}}Strategy) GetName() string {
	return "{{.EntityName}} Strategy"
}

// GetDescription returns a description of how the strategy works
func (s *{{.StructName}}Strategy) GetDescription() string {
	return "This strategy analyzes assets based on {{.EntityNameLower}} principles and identifies opportunities accordingly."
}

// IsAssetSuitable checks if an asset is suitable for this strategy
func (s *{{.StructName}}Strategy) IsAssetSuitable(asset entity.Asset) bool {
	// Implement logic to determine if this asset can be analyzed with this strategy
	// For example, some strategies might only work with stocks, others with all assets
	return true
}

// AnalyzeAsset analyzes an asset and determines if it's a good investment opportunity
func (s *{{.StructName}}Strategy) AnalyzeAsset(
	ctx context.Context,
	asset entity.Asset,
	priceHistory []entity.PricePoint,
) (*entity.InvestmentOpportunity, error) {
	s.logger.Debug("Analyzing asset with {{.EntityName}} strategy", 
		logger.String("asset", asset.GetSymbol()))
	
	// Implement your strategy-specific analysis logic here
	// This is where you would apply the actual investment strategy algorithm
	
	// Example placeholder analysis (replace with real logic)
	if len(priceHistory) < 5 {
		return nil, fmt.Errorf("not enough price history to analyze")
	}
	
	// Example: Check if current price is below the average of the last 5 days
	var sum float64
	for i := 0; i < 5; i++ {
		sum += priceHistory[len(priceHistory)-1-i].Close
	}
	average := sum / 5
	
	// Decision logic
	if asset.GetCurrentPrice() < average*0.95 {
		// Create a buy opportunity
		opportunity := &entity.InvestmentOpportunity{
			AssetID:     asset.GetID(),
			AssetSymbol: asset.GetSymbol(),
			Type:        "BUY",
			Strength:    0.7, // Example strength score
			Reason:      fmt.Sprintf("Current price (%.2f) is below 5-day average (%.2f)", asset.GetCurrentPrice(), average),
			Strategy:    {{.StructName}}StrategyType,
			Timestamp:   priceHistory[len(priceHistory)-1].Timestamp,
		}
		
		return opportunity, nil
	}
	
	// No opportunity detected
	return nil, nil
}

// ShouldSell determines if an asset that was bought using this strategy should be sold
func (s *{{.StructName}}Strategy) ShouldSell(
	ctx context.Context,
	asset entity.Asset,
	entryPrice float64,
	priceHistory []entity.PricePoint,
) (bool, string, error) {
	s.logger.Debug("Checking sell signal with {{.EntityName}} strategy", 
		logger.String("asset", asset.GetSymbol()))
	
	// Implement your strategy-specific sell signal logic here
	
	// Example placeholder logic (replace with real logic)
	currentPrice := asset.GetCurrentPrice()
	percentGain := ((currentPrice - entryPrice) / entryPrice) * 100
	
	// Example: Sell if gained more than 20%
	if percentGain > 20 {
		reason := fmt.Sprintf("Gain of %.2f%% reached target threshold", percentGain)
		return true, reason, nil
	}
	
	// Example: Sell if lost more than 10%
	if percentGain < -10 {
		reason := fmt.Sprintf("Loss of %.2f%% reached stop loss threshold", percentGain)
		return true, reason, nil
	}
	
	return false, "", nil
}

// GetParameters returns the configurable parameters for this strategy
func (s *{{.StructName}}Strategy) GetParameters() map[string]interface{} {
	return s.parameters
}

// SetParameters updates the strategy parameters
func (s *{{.StructName}}Strategy) SetParameters(params map[string]interface{}) error {
	// Validate parameters
	for k, v := range params {
		switch k {
		case "param1":
			// Validate param1 is a float64
			if _, ok := v.(float64); !ok {
				return fmt.Errorf("param1 must be a number")
			}
		case "param2":
			// Validate param2 is an int
			if _, ok := v.(int); !ok {
				return fmt.Errorf("param2 must be an integer")
			}
		default:
			return fmt.Errorf("unknown parameter: %s", k)
		}
	}
	
	// Update parameters
	for k, v := range params {
		s.parameters[k] = v
	}
	
	return nil
}
`

func main() {
	// Validate input arguments
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run strategy-generator.go <domain-name> <strategy-name>")
		fmt.Println("Example: go run strategy-generator.go analysis ValueInvestment")
		os.Exit(1)
	}

	domainName := os.Args[1]
	strategyName := os.Args[2]
	
	// Ensure first letter of strategy name is uppercase
	strategyName = strings.Title(strategyName)
	
	data := common.NewTemplateData(domainName, strategyName)
	
	// Define paths
	strategyInterfacePath := filepath.Join("invest-tracker", "internal", "domain", domainName, "strategy", "strategy.go")
	strategyImplPath := filepath.Join("invest-tracker", "internal", "domain", domainName, "strategy", strings.ToLower(strategyName)+"_strategy.go")
	
	// Create strategy interface if it doesn't exist
	if !CheckFileExists(strategyInterfacePath) {
		if err := common.CreateFileFromTemplate(strategyInterfaceTemplate, strategyInterfacePath, data); err != nil {
			fmt.Printf("Error creating strategy interface: %v\n", err)
			os.Exit(1)
		}
	}
	
	// Create strategy implementation
	if common.PromptOverwrite(strategyImplPath) {
		if err := common.CreateFileFromTemplate(strategyImplementationTemplate, strategyImplPath, data); err != nil {
			fmt.Printf("Error creating strategy implementation: %v\n", err)
			os.Exit(1)
		}
	} else {
		fmt.Printf("Skipping file: %s\n", strategyImplPath)
	}
	
	fmt.Printf("Successfully created strategy implementation for '%s' in domain '%s'\n", strategyName, domainName)
}