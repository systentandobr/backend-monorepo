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
