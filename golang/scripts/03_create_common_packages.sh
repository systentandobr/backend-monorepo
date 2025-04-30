#!/bin/bash
# Creates common utility packages
if [ $# -lt 1 ]; then echo "Usage: $0 <base_dir>"; exit 1; fi
BASE_DIR=$1

# Create errors package
mkdir -p $BASE_DIR/pkg/common/errors
cat > $BASE_DIR/pkg/common/errors/errors.go << 'EOT'
package errors

import (
	"errors"
	"fmt"
)

type ErrorType string

const (
	TypeValidation   ErrorType = "VALIDATION"
	TypeNotFound     ErrorType = "NOT_FOUND"
	TypeDuplicated   ErrorType = "DUPLICATED"
	TypeUnauthorized ErrorType = "UNAUTHORIZED"
	TypeForbidden    ErrorType = "FORBIDDEN"
	TypeInternal     ErrorType = "INTERNAL"
	TypeExternal     ErrorType = "EXTERNAL"
)

type AppError struct {
	Type       ErrorType
	Message    string
	Details    map[string]interface{}
	StatusCode int
	OrigErr    error
}

func (e *AppError) Error() string {
	if e.OrigErr != nil {
		return fmt.Sprintf("%s: %s [%s]", e.Type, e.Message, e.OrigErr.Error())
	}
	return fmt.Sprintf("%s: %s", e.Type, e.Message)
}

func (e *AppError) Unwrap() error { return e.OrigErr }

func NewValidationError(message string, details map[string]interface{}, origErr error) *AppError {
	return &AppError{Type: TypeValidation, Message: message, Details: details, StatusCode: 400, OrigErr: origErr}
}

func NewNotFoundError(message string, origErr error) *AppError {
	return &AppError{Type: TypeNotFound, Message: message, StatusCode: 404, OrigErr: origErr}
}

func NewInternalError(message string, origErr error) *AppError {
	return &AppError{Type: TypeInternal, Message: message, StatusCode: 500, OrigErr: origErr}
}

func IsNotFoundError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeNotFound
}
EOT

# Create logger package
mkdir -p $BASE_DIR/pkg/common/logger
cat > $BASE_DIR/pkg/common/logger/logger.go << 'EOT'
package logger

import (
	"context"
	"io"
	"os"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Logger interface {
	Debug(msg string, fields ...Field)
	Info(msg string, fields ...Field)
	Warn(msg string, fields ...Field)
	Error(msg string, fields ...Field)
	Fatal(msg string, fields ...Field)
	With(fields ...Field) Logger
	WithContext(ctx context.Context) Logger
}

type Field struct {
	Key   string
	Value interface{}
}

type Config struct {
	Level      string
	Format     string
	Output     io.Writer
	TimeFormat string
}

func DefaultConfig() Config {
	return Config{
		Level:      "info",
		Format:     "json",
		Output:     os.Stdout,
		TimeFormat: time.RFC3339,
	}
}

// Implementation
type zapLogger struct {
	logger *zap.Logger
}

func New(config Config) (Logger, error) {
	var level zapcore.Level
	switch config.Level {
	case "debug":
		level = zapcore.DebugLevel
	case "info":
		level = zapcore.InfoLevel
	case "warn":
		level = zapcore.WarnLevel
	case "error":
		level = zapcore.ErrorLevel
	case "fatal":
		level = zapcore.FatalLevel
	default:
		level = zapcore.InfoLevel
	}

	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "time",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.TimeEncoder(func(t time.Time, enc zapcore.PrimitiveArrayEncoder) { enc.AppendString(t.Format(config.TimeFormat)) }),
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	var encoder zapcore.Encoder
	if config.Format == "json" {
		encoder = zapcore.NewJSONEncoder(encoderConfig)
	} else {
		encoder = zapcore.NewConsoleEncoder(encoderConfig)
	}

	writeSyncer := zapcore.AddSync(config.Output)
	core := zapcore.NewCore(encoder, writeSyncer, level)
	zapLogger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return &zapLogger{logger: zapLogger}, nil
}

func (l *zapLogger) Debug(msg string, fields ...Field) { l.logger.Debug(msg, fieldsToZapFields(fields)...) }
func (l *zapLogger) Info(msg string, fields ...Field)  { l.logger.Info(msg, fieldsToZapFields(fields)...) }
func (l *zapLogger) Warn(msg string, fields ...Field)  { l.logger.Warn(msg, fieldsToZapFields(fields)...) }
func (l *zapLogger) Error(msg string, fields ...Field) { l.logger.Error(msg, fieldsToZapFields(fields)...) }
func (l *zapLogger) Fatal(msg string, fields ...Field) { l.logger.Fatal(msg, fieldsToZapFields(fields)...) }

func (l *zapLogger) With(fields ...Field) Logger {
	return &zapLogger{logger: l.logger.With(fieldsToZapFields(fields)...)}
}

func (l *zapLogger) WithContext(ctx context.Context) Logger {
	return l
}

func fieldsToZapFields(fields []Field) []zap.Field {
	zapFields := make([]zap.Field, 0, len(fields))
	for _, field := range fields {
		zapFields = append(zapFields, zap.Any(field.Key, field.Value))
	}
	return zapFields
}

// Helper functions
func String(key string, value string) Field       { return Field{Key: key, Value: value} }
func Int(key string, value int) Field             { return Field{Key: key, Value: value} }
func Float64(key string, value float64) Field     { return Field{Key: key, Value: value} }
func Error(err error) Field                       { return Field{Key: "error", Value: err.Error()} }
func Any(key string, value interface{}) Field     { return Field{Key: key, Value: value} }
EOT

# Create date utils package
mkdir -p $BASE_DIR/pkg/common/utils
cat > $BASE_DIR/pkg/common/utils/date.go << 'EOT'
package utils

import "time"

type DateRange struct {
	Start time.Time
	End   time.Time
}

func NewDateRange(start, end time.Time) DateRange {
	return DateRange{Start: start, End: end}
}

func (dr DateRange) DaysInRange() int {
	return int(dr.End.Sub(dr.Start).Hours() / 24)
}

func (dr DateRange) Contains(date time.Time) bool {
	return (date.Equal(dr.Start) || date.After(dr.Start)) && 
		   (date.Equal(dr.End) || date.Before(dr.End))
}

func LastNDays(n int) DateRange {
	end := time.Now()
	start := end.AddDate(0, 0, -n)
	return DateRange{Start: start, End: end}
}

func LastNMonths(n int) DateRange {
	end := time.Now()
	start := end.AddDate(0, -n, 0)
	return DateRange{Start: start, End: end}
}

func StartOfDay(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
}

func EndOfDay(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 999999999, date.Location())
}
EOT

echo "Common packages created successfully"
