// pkg/infrastructure/http/client.go
package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
)

// ClientConfig representa a configuração do cliente HTTP
type ClientConfig struct {
	BaseURL             string
	Timeout             time.Duration
	MaxRetries          int
	RetryWaitTime       time.Duration
	RetryMaxWaitTime    time.Duration
	DefaultHeaders      map[string]string
	SkipCertValidation  bool
}

// DefaultConfig retorna a configuração padrão
func DefaultConfig() ClientConfig {
	return ClientConfig{
		Timeout:          10 * time.Second,
		MaxRetries:       3,
		RetryWaitTime:    time.Second,
		RetryMaxWaitTime: 5 * time.Second,
		DefaultHeaders: map[string]string{
			"Content-Type": "application/json",
			"Accept":       "application/json",
		},
		SkipCertValidation: false,
	}
}

// Client encapsula um cliente HTTP com recursos adicionais
type Client struct {
	client  *http.Client
	config  ClientConfig
	logger  logger.Logger
}

// NewClient cria um novo cliente HTTP
func NewClient(config ClientConfig, log logger.Logger) *Client {
	if log == nil {
		logConfig := logger.DefaultConfig()
		var err error
		log, err = logger.New(logConfig)
		if err != nil {
			panic(err)
		}
	}

	// Criar cliente HTTP com timeout
	client := &http.Client{
		Timeout: config.Timeout,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: config.SkipCertValidation,
			},
		},
	}

	return &Client{
		client: client,
		config: config,
		logger: log,
	}
}

// Get realiza uma requisição HTTP GET
func (c *Client) Get(ctx context.Context, path string, result interface{}, headers map[string]string) error {
	url := c.buildURL(path)
	
	c.logger.Debug("HTTP GET request", 
		logger.String("url", url),
		logger.Any("headers", headers),
	)
	
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return errors.NewInternalError("failed to create request", err)
	}
	
	// Adicionar headers
	c.addHeaders(req, headers)
	
	return c.do(req, result)
}

// Post realiza uma requisição HTTP POST
func (c *Client) Post(ctx context.Context, path string, body, result interface{}, headers map[string]string) error {
	url := c.buildURL(path)
	
	bodyBytes, err := c.marshalBody(body)
	if err != nil {
		return err
	}
	
	c.logger.Debug("HTTP POST request", 
		logger.String("url", url),
		logger.Any("headers", headers),
		logger.Any("body", body),
	)
	
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return errors.NewInternalError("failed to create request", err)
	}
	
	// Adicionar headers
	c.addHeaders(req, headers)
	
	return c.do(req, result)
}

// Put realiza uma requisição HTTP PUT
func (c *Client) Put(ctx context.Context, path string, body, result interface{}, headers map[string]string) error {
	url := c.buildURL(path)
	
	bodyBytes, err := c.marshalBody(body)
	if err != nil {
		return err
	}
	
	c.logger.Debug("HTTP PUT request", 
		logger.String("url", url),
		logger.Any("headers", headers),
		logger.Any("body", body),
	)
	
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return errors.NewInternalError("failed to create request", err)
	}
	
	// Adicionar headers
	c.addHeaders(req, headers)
	
	return c.do(req, result)
}

// Delete realiza uma requisição HTTP DELETE
func (c *Client) Delete(ctx context.Context, path string, result interface{}, headers map[string]string) error {
	url := c.buildURL(path)
	
	c.logger.Debug("HTTP DELETE request", 
		logger.String("url", url),
		logger.Any("headers", headers),
	)
	
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return errors.NewInternalError("failed to create request", err)
	}
	
	// Adicionar headers
	c.addHeaders(req, headers)
	
	return c.do(req, result)
}

// Patch realiza uma requisição HTTP PATCH
func (c *Client) Patch(ctx context.Context, path string, body, result interface{}, headers map[string]string) error {
	url := c.buildURL(path)
	
	bodyBytes, err := c.marshalBody(body)
	if err != nil {
		return err
	}
	
	c.logger.Debug("HTTP PATCH request", 
		logger.String("url", url),
		logger.Any("headers", headers),
		logger.Any("body", body),
	)
	
	req, err := http.NewRequestWithContext(ctx, http.MethodPatch, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return errors.NewInternalError("failed to create request", err)
	}
	
	// Adicionar headers
	c.addHeaders(req, headers)
	
	return c.do(req, result)
}

// do executa uma requisição HTTP e processa a resposta
func (c *Client) do(req *http.Request, result interface{}) error {
	var resp *http.Response
	var err error
	var bodyBytes []byte
	
	// Executar com retry
	for attempt := 0; attempt <= c.config.MaxRetries; attempt++ {
		resp, err = c.client.Do(req)
		
		if err != nil {
			c.logger.Warn("HTTP request failed",
				logger.String("url", req.URL.String()),
				logger.Int("attempt", attempt),
				logger.Error(err),
			)
			
			// Se for o último retry, retornar o erro
			if attempt == c.config.MaxRetries {
				return errors.NewExternalError("http request failed after retries", err)
			}
			
			// Calcular tempo de espera para próximo retry
			wait := c.calculateRetryWaitTime(attempt)
			c.logger.Debug("Retrying HTTP request", 
				logger.Int("attempt", attempt), 
				logger.Duration("wait", wait),
			)
			
			// Esperar antes de tentar novamente
			time.Sleep(wait)
			continue
		}
		
		// Se chegou aqui, a requisição foi bem-sucedida
		break
	}
	
	// Garantir que o corpo da resposta seja fechado
	defer func() {
		if resp != nil && resp.Body != nil {
			resp.Body.Close()
		}
	}()
	
	// Ler o corpo da resposta
	bodyBytes, err = io.ReadAll(resp.Body)
	if err != nil {
		return errors.NewExternalError("failed to read response body", err)
	}
	
	// Verificar se a resposta foi bem-sucedida (2xx)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return c.handleErrorResponse(resp, bodyBytes)
	}
	
	// Se não há resultado esperado, retorna sucesso
	if result == nil {
		return nil
	}
	
	// Desserializar o corpo da resposta
	err = json.Unmarshal(bodyBytes, result)
	if err != nil {
		return errors.NewExternalError("failed to unmarshal response", err)
	}
	
	return nil
}

// handleErrorResponse processa respostas de erro
func (c *Client) handleErrorResponse(resp *http.Response, body []byte) error {
	c.logger.Warn("HTTP error response",
		logger.Int("status", resp.StatusCode),
		logger.String("body", string(body)),
	)
	
	// Tentar extrair mensagem de erro da resposta
	var errorResponse struct {
		Error       string `json:"error"`
		Message     string `json:"message"`
		Description string `json:"description"`
	}
	
	if err := json.Unmarshal(body, &errorResponse); err == nil {
		errorMsg := errorResponse.Error
		if errorMsg == "" {
			errorMsg = errorResponse.Message
		}
		if errorMsg == "" {
			errorMsg = errorResponse.Description
		}
		if errorMsg != "" {
			switch {
			case resp.StatusCode == 400:
				return errors.NewValidationError("bad request: "+errorMsg, nil, nil)
			case resp.StatusCode == 401:
				return errors.NewUnauthorizedError("unauthorized: "+errorMsg, nil)
			case resp.StatusCode == 403:
				return errors.NewForbiddenError("forbidden: "+errorMsg, nil)
			case resp.StatusCode == 404:
				return errors.NewNotFoundError("not found: "+errorMsg, nil)
			case resp.StatusCode == 409:
				return errors.NewDuplicatedError("conflict: "+errorMsg, nil)
			case resp.StatusCode >= 500:
				return errors.NewExternalError("server error: "+errorMsg, nil)
			default:
				return errors.NewExternalError(fmt.Sprintf("http error %d: %s", resp.StatusCode, errorMsg), nil)
			}
		}
	}
	
	// Fallback para caso não consiga extrair uma mensagem específica
	return errors.NewExternalError(fmt.Sprintf("http error %d", resp.StatusCode), nil)
}

// marshalBody serializa o corpo da requisição
func (c *Client) marshalBody(body interface{}) ([]byte, error) {
	if body == nil {
		return nil, nil
	}
	
	// Se já for []byte, retornar diretamente
	if bodyBytes, ok := body.([]byte); ok {
		return bodyBytes, nil
	}
	
	// Se for string, converter para bytes
	if bodyStr, ok := body.(string); ok {
		return []byte(bodyStr), nil
	}
	
	// Caso contrário, serializar como JSON
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, errors.NewInternalError("failed to marshal request body", err)
	}
	
	return bodyBytes, nil
}

// addHeaders adiciona headers à requisição
func (c *Client) addHeaders(req *http.Request, headers map[string]string) {
	// Adicionar headers padrão
	for key, value := range c.config.DefaultHeaders {
		req.Header.Set(key, value)
	}
	
	// Adicionar headers específicos da requisição
	for key, value := range headers {
		req.Header.Set(key, value)
	}
}

// buildURL constrói a URL completa
func (c *Client) buildURL(path string) string {
	// Se a baseURL não estiver definida, usar o path como URL completa
	if c.config.BaseURL == "" {
		return path
	}
	
	// Se o path começar com http:// ou https://, é uma URL completa
	if strings.HasPrefix(path, "http://") || strings.HasPrefix(path, "https://") {
		return path
	}
	
	// Garantir que não haja barras duplicadas
	baseURL := strings.TrimSuffix(c.config.BaseURL, "/")
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	
	return baseURL + path
}

// calculateRetryWaitTime calcula o tempo de espera entre retries
func (c *Client) calculateRetryWaitTime(attempt int) time.Duration {
	// Implementar backoff exponencial
	wait := c.config.RetryWaitTime * time.Duration(1<<uint(attempt))
	if wait > c.config.RetryMaxWaitTime {
		wait = c.config.RetryMaxWaitTime
	}
	return wait
}