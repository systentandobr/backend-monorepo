package jobs

import (
	"context"
	"fmt"
	"time"

	"github.com/robfig/cron/v3"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/service"
	assetService "github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/service"
	notificationService "github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/notification/service"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
)

// AssetDataJob implements a scheduled job for collecting asset data
type AssetDataJob struct {
	service    assetService.StockService
	logger     logger.Logger
	cronID     cron.EntryID
	scheduler  *cron.Cron
	isRunning  bool
	cronSpec   string
	ctx        context.Context
	cancelFunc context.CancelFunc
}

// NewAssetDataJob creates a new scheduled job
func NewAssetDataJob(
	service assetService.StockService,
	logger logger.Logger,
	scheduler *cron.Cron,
) *AssetDataJob {
	ctx, cancel := context.WithCancel(context.Background())
	
	return &AssetDataJob{
		service:    service,
		logger:     logger,
		scheduler:  scheduler,
		isRunning:  false,
		cronSpec:   "0 */1 * * *", // Default: hourly
		ctx:        ctx,
		cancelFunc: cancel,
	}
}

// SetSchedule updates the job schedule using cron specification
func (j *AssetDataJob) SetSchedule(cronSpec string) {
	j.cronSpec = cronSpec
	
	// If job is already running, restart it with new schedule
	if j.isRunning {
		j.Stop()
		j.Start()
	}
}

// Start begins the scheduled job
func (j *AssetDataJob) Start() error {
	if j.isRunning {
		return fmt.Errorf("job is already running")
	}
	
	j.logger.Info("Starting AssetDataJob with schedule", logger.String("schedule", j.cronSpec))
	
	// Schedule the job
	var err error
	j.cronID, err = j.scheduler.AddFunc(j.cronSpec, func() {
		j.Run()
	})
	
	if err != nil {
		return fmt.Errorf("failed to schedule AssetDataJob: %w", err)
	}
	
	j.isRunning = true
	return nil
}

// Stop cancels the scheduled job
func (j *AssetDataJob) Stop() {
	if !j.isRunning {
		return
	}
	
	j.logger.Info("Stopping AssetDataJob")
	j.scheduler.Remove(j.cronID)
	j.cancelFunc()
	
	// Create new context for next run
	j.ctx, j.cancelFunc = context.WithCancel(context.Background())
	j.isRunning = false
}

// Run executes the job logic
func (j *AssetDataJob) Run() {
	startTime := time.Now()
	j.logger.Info("Running AssetDataJob")
	
	// Create a child context with timeout for this run
	ctx, cancel := context.WithTimeout(j.ctx, 30*time.Minute)
	defer cancel()
	
	// Implement your job logic here
	// For example:
	// err := j.collectAssetData(ctx)
	// if err != nil {
	//     j.logger.Error("Error collecting asset data", logger.Error(err))
	// }
	
	j.logger.Info("AssetDataJob completed", 
		logger.String("duration", time.Since(startTime).String()))
}

// AssetAnalysisJob implements a scheduled job for analyzing assets
type AssetAnalysisJob struct {
	stockService         assetService.StockService
	marketAnalysisService service.MarketAnalysisService
	logger               logger.Logger
	cronID               cron.EntryID
	scheduler            *cron.Cron
	isRunning            bool
	cronSpec             string
	ctx                  context.Context
	cancelFunc           context.CancelFunc
}

// NewAssetAnalysisJob creates a new scheduled job
func NewAssetAnalysisJob(
	stockService assetService.StockService,
	marketAnalysisService service.MarketAnalysisService,
	logger logger.Logger,
	scheduler *cron.Cron,
) *AssetAnalysisJob {
	ctx, cancel := context.WithCancel(context.Background())
	
	return &AssetAnalysisJob{
		stockService:         stockService,
		marketAnalysisService: marketAnalysisService,
		logger:               logger,
		scheduler:            scheduler,
		isRunning:            false,
		cronSpec:             "0 0 * * *", // Default: daily at midnight
		ctx:                  ctx,
		cancelFunc:           cancel,
	}
}

// SetSchedule updates the job schedule using cron specification
func (j *AssetAnalysisJob) SetSchedule(cronSpec string) {
	j.cronSpec = cronSpec
	
	// If job is already running, restart it with new schedule
	if j.isRunning {
		j.Stop()
		j.Start()
	}
}

// Start begins the scheduled job
func (j *AssetAnalysisJob) Start() error {
	if j.isRunning {
		return fmt.Errorf("job is already running")
	}
	
	j.logger.Info("Starting AssetAnalysisJob with schedule", logger.String("schedule", j.cronSpec))
	
	// Schedule the job
	var err error
	j.cronID, err = j.scheduler.AddFunc(j.cronSpec, func() {
		j.Run()
	})
	
	if err != nil {
		return fmt.Errorf("failed to schedule AssetAnalysisJob: %w", err)
	}
	
	j.isRunning = true
	return nil
}

// Stop cancels the scheduled job
func (j *AssetAnalysisJob) Stop() {
	if !j.isRunning {
		return
	}
	
	j.logger.Info("Stopping AssetAnalysisJob")
	j.scheduler.Remove(j.cronID)
	j.cancelFunc()
	
	// Create new context for next run
	j.ctx, j.cancelFunc = context.WithCancel(context.Background())
	j.isRunning = false
}

// Run executes the job logic
func (j *AssetAnalysisJob) Run() {
	startTime := time.Now()
	j.logger.Info("Running AssetAnalysisJob")
	
	// Create a child context with timeout for this run
	ctx, cancel := context.WithTimeout(j.ctx, 30*time.Minute)
	defer cancel()
	
	// Implement your job logic here
	// For example:
	// err := j.analyzeAssets(ctx)
	// if err != nil {
	//     j.logger.Error("Error analyzing assets", logger.Error(err))
	// }
	
	j.logger.Info("AssetAnalysisJob completed", 
		logger.String("duration", time.Since(startTime).String()))
}

// OpportunityDetectionJob implements a scheduled job for detecting investment opportunities
type OpportunityDetectionJob struct {
	opportunityService   service.OpportunityService
	notificationService  notificationService.NotificationService
	logger               logger.Logger
	cronID               cron.EntryID
	scheduler            *cron.Cron
	isRunning            bool
	cronSpec             string
	ctx                  context.Context
	cancelFunc           context.CancelFunc
}

// NewOpportunityDetectionJob creates a new scheduled job
func NewOpportunityDetectionJob(
	opportunityService service.OpportunityService,
	notificationService notificationService.NotificationService,
	logger logger.Logger,
	scheduler *cron.Cron,
) *OpportunityDetectionJob {
	ctx, cancel := context.WithCancel(context.Background())
	
	return &OpportunityDetectionJob{
		opportunityService:  opportunityService,
		notificationService: notificationService,
		logger:              logger,
		scheduler:           scheduler,
		isRunning:           false,
		cronSpec:            "0 */3 * * *", // Default: every 3 hours
		ctx:                 ctx,
		cancelFunc:          cancel,
	}
}

// SetSchedule updates the job schedule using cron specification
func (j *OpportunityDetectionJob) SetSchedule(cronSpec string) {
	j.cronSpec = cronSpec
	
	// If job is already running, restart it with new schedule
	if j.isRunning {
		j.Stop()
		j.Start()
	}
}

// Start begins the scheduled job
func (j *OpportunityDetectionJob) Start() error {
	if j.isRunning {
		return fmt.Errorf("job is already running")
	}
	
	j.logger.Info("Starting OpportunityDetectionJob with schedule", logger.String("schedule", j.cronSpec))
	
	// Schedule the job
	var err error
	j.cronID, err = j.scheduler.AddFunc(j.cronSpec, func() {
		j.Run()
	})
	
	if err != nil {
		return fmt.Errorf("failed to schedule OpportunityDetectionJob: %w", err)
	}
	
	j.isRunning = true
	return nil
}

// Stop cancels the scheduled job
func (j *OpportunityDetectionJob) Stop() {
	if !j.isRunning {
		return
	}
	
	j.logger.Info("Stopping OpportunityDetectionJob")
	j.scheduler.Remove(j.cronID)
	j.cancelFunc()
	
	// Create new context for next run
	j.ctx, j.cancelFunc = context.WithCancel(context.Background())
	j.isRunning = false
}

// Run executes the job logic
func (j *OpportunityDetectionJob) Run() {
	startTime := time.Now()
	j.logger.Info("Running OpportunityDetectionJob")
	
	// Create a child context with timeout for this run
	ctx, cancel := context.WithTimeout(j.ctx, 30*time.Minute)
	defer cancel()
	
	// Implement your job logic here
	// For example:
	// opportunities, err := j.opportunityService.DetectOpportunities(ctx)
	// if err != nil {
	//     j.logger.Error("Error detecting opportunities", logger.Error(err))
	//     return
	// }
	// 
	// for _, opportunity := range opportunities {
	//     err = j.notificationService.NotifyOpportunity(ctx, opportunity)
	//     if err != nil {
	//         j.logger.Error("Error sending notification", logger.Error(err))
	//     }
	// }
	
	j.logger.Info("OpportunityDetectionJob completed", 
		logger.String("duration", time.Since(startTime).String()))
}