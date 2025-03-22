package http

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
)

type Client struct {
	client  *http.Client
	baseURL string
	logger  logger.Logger
}

type ClientConfig struct {
	BaseURL        string
	Timeout        time.Duration
	DefaultHeaders map[string]string
}

func NewClient(config ClientConfig, log logger.Logger) *Client {
	return &Client{
		client:  &http.Client{Timeout: config.Timeout},
		baseURL: config.BaseURL,
		logger:  log,
	}
}

func (c *Client) Get(ctx context.Context, path string, result interface{}) error {
	url := c.baseURL + path
	
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode >= 400 {
		return fmt.Errorf("server returned error: %d", resp.StatusCode)
	}
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}
	
	if err := json.Unmarshal(body, result); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}
	
	return nil
}
