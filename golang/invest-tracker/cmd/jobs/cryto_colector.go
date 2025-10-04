// cmd/jobs/crypto_collector.go
package jobs

import (
	"context"
	"sync"
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/repository"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
	"github.com/systentandobr/invest-tracker/pkg/infrastructure/services/binance"
)

// CryptoDataCollectorJob é um job para coletar dados de criptomoedas
type CryptoDataCollectorJob struct {
	binanceClient      *binance.BinanceClient
	assetRepo          repository.AssetRepository
	priceHistoryRepo   repository.PriceHistoryRepository
	logger             logger.Logger
	symbols            []string
	running            bool
	interval           time.Duration
	stopChan           chan struct{}
	mutex              sync.Mutex
	lastCollectionTime time.Time
}

// NewCryptoDataCollectorJob cria uma nova instância do job
func NewCryptoDataCollectorJob(
	binanceClient *binance.BinanceClient,
	assetRepo repository.AssetRepository,
	priceHistoryRepo repository.PriceHistoryRepository,
	log logger.Logger,
) *CryptoDataCollectorJob {
	// Lista padrão de criptomoedas a serem monitoradas
	defaultSymbols := []string{
		"BTC", "ETH", "BNB", "SOL", "ADA", "XRP", "DOT", "DOGE", "AVAX", "MATIC",
	}

	return &CryptoDataCollectorJob{
		binanceClient:    binanceClient,
		assetRepo:        assetRepo,
		priceHistoryRepo: priceHistoryRepo,
		logger:           log,
		symbols:          defaultSymbols,
		interval:         15 * time.Minute, // Intervalo padrão
		stopChan:         make(chan struct{}),
	}
}

// AddSymbol adiciona um símbolo à lista de monitoramento
func (j *CryptoDataCollectorJob) AddSymbol(symbol string) {
	j.mutex.Lock()
	defer j.mutex.Unlock()

	// Verificar se o símbolo já existe
	for _, s := range j.symbols {
		if s == symbol {
			return
		}
	}

	j.symbols = append(j.symbols, symbol)
	j.logger.Info("Símbolo adicionado ao monitoramento", logger.String("symbol", symbol))
}

// RemoveSymbol remove um símbolo da lista de monitoramento
func (j *CryptoDataCollectorJob) RemoveSymbol(symbol string) {
	j.mutex.Lock()
	defer j.mutex.Unlock()

	for i, s := range j.symbols {
		if s == symbol {
			// Remover o símbolo mantendo a ordem
			j.symbols = append(j.symbols[:i], j.symbols[i+1:]...)
			j.logger.Info("Símbolo removido do monitoramento", logger.String("symbol", symbol))
			return
		}
	}
}

// SetInterval define o intervalo de coleta
func (j *CryptoDataCollectorJob) SetInterval(interval time.Duration) {
	j.mutex.Lock()
	defer j.mutex.Unlock()

	j.interval = interval
	j.logger.Info("Intervalo de coleta atualizado", logger.String("interval", interval.String()))
}

// Start inicia o job de coleta
func (j *CryptoDataCollectorJob) Start() {
	j.mutex.Lock()
	if j.running {
		j.mutex.Unlock()
		return
	}
	j.running = true
	j.mutex.Unlock()

	j.logger.Info("Iniciando job de coleta de dados de criptomoedas", 
		logger.Int("symbols", len(j.symbols)), 
		logger.String("interval", j.interval.String()))

	// Executar uma coleta inicial imediatamente
	go j.collectData()

	// Iniciar o loop de coleta periódica
	go func() {
		ticker := time.NewTicker(j.interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				go j.collectData()
			case <-j.stopChan:
				j.logger.Info("Job de coleta de dados de criptomoedas interrompido")
				return
			}
		}
	}()
}

// Stop interrompe o job de coleta
func (j *CryptoDataCollectorJob) Stop() {
	j.mutex.Lock()
	defer j.mutex.Unlock()

	if !j.running {
		return
	}

	j.stopChan <- struct{}{}
	j.running = false
	j.logger.Info("Job de coleta de dados interrompido")
}

// IsRunning verifica se o job está em execução
func (j *CryptoDataCollectorJob) IsRunning() bool {
	j.mutex.Lock()
	defer j.mutex.Unlock()
	return j.running
}

// GetLastCollectionTime retorna o timestamp da última coleta
func (j *CryptoDataCollectorJob) GetLastCollectionTime() time.Time {
	j.mutex.Lock()
	defer j.mutex.Unlock()
	return j.lastCollectionTime
}

// collectData realiza a coleta de dados
func (j *CryptoDataCollectorJob) collectData() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	start := time.Now()
	j.logger.Info("Iniciando coleta de dados", logger.Int("symbols", len(j.symbols)))

	// Copiar símbolos para evitar problemas de concorrência
	j.mutex.Lock()
	symbols := make([]string, len(j.symbols))
	copy(symbols, j.symbols)
	j.mutex.Unlock()

	// Coletar informações básicas de todas as criptomoedas
	cryptos, err := j.binanceClient.GetCryptocurrencies(ctx)
	if err != nil {
		j.logger.Error("Erro ao coletar criptomoedas", logger.Error(err))
		return
	}

	// Criar um mapa para rápido acesso
	cryptoMap := make(map[string]*entity.Cryptocurrency)
	for _, crypto := range cryptos {
		cryptoMap[crypto.Symbol] = crypto
	}

	// Processar cada símbolo da lista de monitoramento
	var wg sync.WaitGroup
	for _, symbol := range symbols {
		wg.Add(1)
		go func(symbol string) {
			defer wg.Done()
			j.processSymbol(ctx, symbol, cryptoMap)
		}(symbol)
	}

	wg.Wait()

	// Atualizar timestamp da última coleta
	j.mutex.Lock()
	j.lastCollectionTime = time.Now()
	j.mutex.Unlock()

	elapsed := time.Since(start)
	j.logger.Info("Coleta de dados concluída", 
		logger.Int("symbols", len(symbols)),
		logger.String("elapsed", elapsed.String()))
}

// processSymbol processa um símbolo específico
func (j *CryptoDataCollectorJob) processSymbol(
	ctx context.Context,
	symbol string,
	cryptoMap map[string]*entity.Cryptocurrency,
) {
	// Verificar se temos dados básicos para este símbolo
	crypto, found := cryptoMap[symbol]
	if !found {
		// Se não encontrou no mapa, buscar diretamente
		var err error
		crypto, err = j.binanceClient.GetCryptoBySymbol(ctx, symbol)
		if err != nil {
			j.logger.Error("Erro ao buscar criptomoeda", 
				logger.String("symbol", symbol),
				logger.Error(err))
			return
		}
	}

	// Salvar ou atualizar entidade
	existingCrypto, err := j.assetRepo.GetBySymbol(ctx, symbol, entity.AssetTypeCrypto)
	if err != nil {
		// Não encontrou, salvar nova entidade
		if err := j.assetRepo.Save(ctx, crypto); err != nil {
			j.logger.Error("Erro ao salvar criptomoeda", 
				logger.String("symbol", symbol),
				logger.Error(err))
		}
	} else {
		// Atualizar existente
		if err := j.assetRepo.UpdatePrice(ctx, existingCrypto.GetID(), crypto.CurrentPrice); err != nil {
			j.logger.Error("Erro ao atualizar preço da criptomoeda",
				logger.String("symbol", symbol),
				logger.Error(err))
		}
	}

	// Coletar histórico de preços diário para os últimos 30 dias
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -30) // 30 dias atrás
	
	history, err := j.binanceClient.GetPriceHistory(ctx, symbol, valueobject.TimeframeDaily, &startDate, &endDate)
	if err != nil {
		j.logger.Error("Erro ao coletar histórico de preços",
			logger.String("symbol", symbol),
			logger.Error(err))
		return
	}

	// Salvar histórico de preços
	err = j.priceHistoryRepo.SavePricePoints(ctx, "crypto-"+symbol, valueobject.TimeframeDaily, history.Data)
	if err != nil {
		j.logger.Error("Erro ao salvar histórico de preços",
			logger.String("symbol", symbol),
			logger.Error(err))
	}

	j.logger.Debug("Processamento concluído para símbolo", 
		logger.String("symbol", symbol),
		logger.Float64("price", crypto.CurrentPrice),
		logger.Int("historyPoints", len(history.Data)))
}

// RunOnce executa uma coleta única
func (j *CryptoDataCollectorJob) RunOnce() {
	j.collectData()
}

// GetCryptoSymbols retorna a lista de símbolos monitorados
func (j *CryptoDataCollectorJob) GetCryptoSymbols() []string {
	j.mutex.Lock()
	defer j.mutex.Unlock()
	
	result := make([]string, len(j.symbols))
	copy(result, j.symbols)
	return result
}