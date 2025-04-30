package scheduler

import (
	"context"
	"sync"

	"github.com/robfig/cron/v3"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/analysis/service"
	assetService "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/asset/service"
	notificationService "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/notification/service"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/jobs"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/logger"
)

// JobScheduler manages all scheduled jobs
type JobScheduler struct {
	cron      *cron.Cron
	jobs      []Job
	logger    logger.Logger
	lock      sync.RWMutex
}

// Job interface for all scheduled jobs
type Job interface {
	Start() error
	Stop()
	Run()
}

// NewJobScheduler creates a new job scheduler
func NewJobScheduler(logger logger.Logger) *JobScheduler {
	// Create cron scheduler with seconds-level precision
	c := cron.New(cron.WithSeconds())
	
	return &JobScheduler{
		cron:   c,
		jobs:   make([]Job, 0),
		logger: logger,
	}
}

// RegisterAssetDataJob creates and registers an AssetData job
func (s *JobScheduler) RegisterAssetDataJob(stockService assetService.StockService) *jobs.AssetDataJob {
	s.lock.Lock()
	defer s.lock.Unlock()
	
	job := jobs.NewAssetDataJob(stockService, s.logger, s.cron)
	s.jobs = append(s.jobs, job)
	
	return job
}

// RegisterAssetAnalysisJob creates and registers an AssetAnalysis job
func (s *JobScheduler) RegisterAssetAnalysisJob(
	stockService assetService.StockService,
	marketAnalysisService service.MarketAnalysisService,
) *jobs.AssetAnalysisJob {
	s.lock.Lock()
	defer s.lock.Unlock()
	
	job := jobs.NewAssetAnalysisJob(stockService, marketAnalysisService, s.logger, s.cron)
	s.jobs = append(s.jobs, job)
	
	return job
}

// RegisterOpportunityDetectionJob creates and registers an OpportunityDetection job
func (s *JobScheduler) RegisterOpportunityDetectionJob(
	opportunityService service.OpportunityService,
	notificationService notificationService.NotificationService,
) *jobs.OpportunityDetectionJob {
	s.lock.Lock()
	defer s.lock.Unlock()
	
	job := jobs.NewOpportunityDetectionJob(opportunityService, notificationService, s.logger, s.cron)
	s.jobs = append(s.jobs, job)
	
	return job
}

// StartAll starts all registered jobs
func (s *JobScheduler) StartAll() {
	s.lock.RLock()
	defer s.lock.RUnlock()
	
	s.logger.Info("Starting all scheduled jobs")
	
	// Start the cron scheduler
	s.cron.Start()
	
	// Start each job
	for _, job := range s.jobs {
		if err := job.Start(); err != nil {
			s.logger.Error("Failed to start job", logger.Error(err))
		}
	}
}

// StopAll stops all jobs and the scheduler
func (s *JobScheduler) StopAll(ctx context.Context) {
	s.lock.Lock()
	defer s.lock.Unlock()
	
	s.logger.Info("Stopping all scheduled jobs")
	
	// Stop each job
	for _, job := range s.jobs {
		job.Stop()
	}
	
	// Stop the cron scheduler
	stopCtx := s.cron.Stop()
	
	// Wait for jobs to complete or context to timeout
	select {
	case <-stopCtx.Done():
		s.logger.Info("All jobs stopped gracefully")
	case <-ctx.Done():
		s.logger.Warn("Context timeout while waiting for jobs to stop")
	}
}