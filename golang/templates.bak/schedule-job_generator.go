package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/cmd/templates/common"

)

const jobTemplate = `package jobs

import (
	"context"
	"time"

	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/service"
	"{{.ImportBasePath}}/pkg/common/logger"
	"github.com/robfig/cron/v3"
)

// {{.EntityName}}Job implements a scheduled job for {{.EntityName}} operations
type {{.EntityName}}Job struct {
	service    service.{{.ServiceName}}
	logger     logger.Logger
	cronID     cron.EntryID
	scheduler  *cron.Cron
	isRunning  bool
	cronSpec   string
	ctx        context.Context
	cancelFunc context.CancelFunc
}

// New{{.EntityName}}Job creates a new scheduled job
func New{{.EntityName}}Job(
	service service.{{.ServiceName}},
	logger logger.Logger,
	scheduler *cron.Cron,
) *{{.EntityName}}Job {
	ctx, cancel := context.WithCancel(context.Background())
	
	return &{{.EntityName}}Job{
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
func (j *{{.EntityName}}Job) SetSchedule(cronSpec string) {
	j.cronSpec = cronSpec
	
	// If job is already running, restart it with new schedule
	if j.isRunning {
		j.Stop()
		j.Start()
	}
}

// Start begins the scheduled job
func (j *{{.EntityName}}Job) Start() error {
	if j.isRunning {
		return fmt.Errorf("job is already running")
	}
	
	j.logger.Info("Starting {{.EntityName}}Job with schedule", logger.String("schedule", j.cronSpec))
	
	// Schedule the job
	var err error
	j.cronID, err = j.scheduler.AddFunc(j.cronSpec, func() {
		j.Run()
	})
	
	if err != nil {
		return fmt.Errorf("failed to schedule {{.EntityName}}Job: %w", err)
	}
	
	j.isRunning = true
	return nil
}

// Stop cancels the scheduled job
func (j *{{.EntityName}}Job) Stop() {
	if !j.isRunning {
		return
	}
	
	j.logger.Info("Stopping {{.EntityName}}Job")
	j.scheduler.Remove(j.cronID)
	j.cancelFunc()
	
	// Create new context for next run
	j.ctx, j.cancelFunc = context.WithCancel(context.Background())
	j.isRunning = false
}

// Run executes the job logic
func (j *{{.EntityName}}Job) Run() {
	startTime := time.Now()
	j.logger.Info("Running {{.EntityName}}Job")
	
	// Create a child context with timeout for this run
	ctx, cancel := context.WithTimeout(j.ctx, 30*time.Minute)
	defer cancel()
	
	// Implement your job logic here
	// For example:
	// err := j.process{{.EntityName}}Data(ctx)
	// if err != nil {
	//     j.logger.Error("Error processing {{.EntityName}} data", logger.Error(err))
	// }
	
	j.logger.Info("{{.EntityName}}Job completed", 
		logger.String("duration", time.Since(startTime).String()))
}

// Example job implementation methods below:

// process{{.EntityName}}Data is an example implementation
func (j *{{.EntityName}}Job) process{{.EntityName}}Data(ctx context.Context) error {
	// Get data from service
	data, err := j.service.GetAll{{.EntityNamePlural}}(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to get {{.EntityNamePlural}}: %w", err)
	}
	
	// Process data
	for _, item := range data {
		// Example processing
		j.logger.Debug("Processing {{.EntityName}}", logger.String("id", item.ID))
		
		// Check if context is cancelled
		if ctx.Err() != nil {
			return ctx.Err()
		}
	}
	
	return nil
}
`

const schedulerTemplate = `package scheduler

import (
	"context"
	"sync"

	"{{.ImportBasePath}}/internal/domain/{{.DomainName}}/service"
	"{{.ImportBasePath}}/internal/jobs"
	"{{.ImportBasePath}}/pkg/common/logger"
	"github.com/robfig/cron/v3"
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

// Register{{.EntityName}}Job creates and registers a {{.EntityName}} job
func (s *JobScheduler) Register{{.EntityName}}Job({{.EntityNameLower}}Service service.{{.ServiceName}}) *jobs.{{.EntityName}}Job {
	s.lock.Lock()
	defer s.lock.Unlock()
	
	job := jobs.New{{.EntityName}}Job({{.EntityNameLower}}Service, s.logger, s.cron)
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
`

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run job-generator.go <domain-name> <entity-name>")
		fmt.Println("Example: go run job-generator.go asset StockData")
		os.Exit(1)
	}

	domainName := os.Args[1]
	entityName := os.Args[2]
	
	// Ensure first letter of entity name is uppercase
	entityName = strings.Title(entityName)
	
	data := common.NewTemplateData(domainName, entityName)
	
	// Define paths for job files
	jobsDir := filepath.Join("invest-tracker", "internal", "jobs")
	if err := os.MkdirAll(jobsDir, 0755); err != nil {
		fmt.Printf("Error creating jobs directory: %v\n", err)
		os.Exit(1)
	}
	
	schedulerDir := filepath.Join("invest-tracker", "internal", "scheduler")
	if err := os.MkdirAll(schedulerDir, 0755); err != nil {
		fmt.Printf("Error creating scheduler directory: %v\n", err)
		os.Exit(1)
	}
	
	jobPath := filepath.Join(jobsDir, strings.ToLower(entityName)+"_job.go")
	schedulerPath := filepath.Join(schedulerDir, "scheduler.go")
	
	// Create job file
	if common.PromptOverwrite(jobPath) {
		if err := common.CreateFileFromTemplate(jobTemplate, jobPath, data); err != nil {
			fmt.Printf("Error creating job file: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Created job file: %s\n", jobPath)
	} else {
		fmt.Printf("Skipping file: %s\n", jobPath)
	}
	
	// Create scheduler file if it doesn't exist
	if !CheckFileExists(schedulerPath) {
		if err := common.CreateFileFromTemplate(schedulerTemplate, schedulerPath, data); err != nil {
			fmt.Printf("Error creating scheduler file: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Created scheduler file: %s\n", schedulerPath)
	} else {
		fmt.Println("Scheduler file already exists, updating to add new job registration method")
		// Here you would update the scheduler file to add the new job registration method
		// This would require parsing the file and adding the new method
		// For simplicity, we'll just print a message
		fmt.Printf("Please manually add Register%sJob method to %s\n", entityName, schedulerPath)
	}
	
	fmt.Printf("Successfully created job for '%s' in domain '%s'\n", entityName, domainName)
	fmt.Println("Don't forget to add the job to the scheduler in your application bootstrap")
}