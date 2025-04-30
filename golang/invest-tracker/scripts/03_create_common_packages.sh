#!/bin/bash
# 03_create_common_packages.sh - Cria os pacotes comuns de utilidades, erros e logging

# Verifica se os parâmetros foram fornecidos
if [ $# -lt 2 ]; then
  echo "Uso: $0 <base_dir> <import_path>"
  exit 1
fi

BASE_DIR=$1
IMPORT_PATH=$2

echo "Criando pacotes comuns em: $BASE_DIR"

# Entrar no diretório base
cd "$BASE_DIR" || exit 1

# Criar pacote de erros
ERROR_FILE="pkg/common/errors/errors.go"
mkdir -p "$(dirname "$ERROR_FILE")"
cat > "$ERROR_FILE" << 'EOF'
// pkg/common/errors/errors.go
package errors

import (
	"errors"
	"fmt"
)

// ErrorType representa os diferentes tipos de erros
type ErrorType string

const (
	// Tipos de erro
	TypeValidation   ErrorType = "VALIDATION"   // Erro de validação
	TypeNotFound     ErrorType = "NOT_FOUND"    // Recurso não encontrado
	TypeDuplicated   ErrorType = "DUPLICATED"   // Recurso duplicado
	TypeUnauthorized ErrorType = "UNAUTHORIZED" // Acesso não autorizado
	TypeForbidden    ErrorType = "FORBIDDEN"    // Acesso proibido
	TypeInternal     ErrorType = "INTERNAL"     // Erro interno do servidor
	TypeExternal     ErrorType = "EXTERNAL"     // Erro de serviço externo
	TypeTimeout      ErrorType = "TIMEOUT"      // Erro de timeout
	TypeBadGateway   ErrorType = "BAD_GATEWAY"  // Erro de gateway
	TypeUnavailable  ErrorType = "UNAVAILABLE"  // Serviço indisponível
)

// AppError representa um erro da aplicação
type AppError struct {
	Type       ErrorType
	Message    string
	Details    map[string]interface{}
	StatusCode int
	OrigErr    error
}

// Error implementa a interface error
func (e *AppError) Error() string {
	if e.OrigErr != nil {
		return fmt.Sprintf("%s: %s [%s]", e.Type, e.Message, e.OrigErr.Error())
	}
	return fmt.Sprintf("%s: %s", e.Type, e.Message)
}

// Unwrap implementa a interface de unwrapping
func (e *AppError) Unwrap() error {
	return e.OrigErr
}

// Is implementa a interface de comparação
func (e *AppError) Is(target error) bool {
	t, ok := target.(*AppError)
	if !ok {
		return false
	}
	return e.Type == t.Type
}

// WithDetails adiciona detalhes ao erro
func (e *AppError) WithDetails(details map[string]interface{}) *AppError {
	if e.Details == nil {
		e.Details = make(map[string]interface{})
	}
	for k, v := range details {
		e.Details[k] = v
	}
	return e
}

// Funções para criar erros específicos

// NewValidationError cria um erro de validação
func NewValidationError(message string, details map[string]interface{}, origErr error) *AppError {
	return &AppError{
		Type:       TypeValidation,
		Message:    message,
		Details:    details,
		StatusCode: 400,
		OrigErr:    origErr,
	}
}

// NewNotFoundError cria um erro de recurso não encontrado
func NewNotFoundError(message string, origErr error) *AppError {
	return &AppError{
		Type:       TypeNotFound,
		Message:    message,
		StatusCode: 404,
		OrigErr:    origErr,
	}
}

// NewDuplicatedError cria um erro de recurso duplicado
func NewDuplicatedError(message string, origErr error) *AppError {
	return &AppError{
		Type:       TypeDuplicated,
		Message:    message,
		StatusCode: 409,
		OrigErr:    origErr,
	}
}

// NewUnauthorizedError cria um erro de acesso não autorizado
func NewUnauthorizedError(message string, origErr error) *AppError {
	return &AppError{
		Type:       TypeUnauthorized,
		Message:    message,
		StatusCode: 401,
		OrigErr:    origErr,
	}
}

// NewForbiddenError cria um erro de acesso proibido
func NewForbiddenError(message string, origErr error) *AppError {
	return &AppError{
		Type:       TypeForbidden,
		Message:    message,
		StatusCode: 403,
		OrigErr:    origErr,
	}
}

// NewInternalError cria um erro interno do servidor
func NewInternalError(message string, origErr error) *AppError {
	return &AppError{
		Type:       TypeInternal,
		Message:    message,
		StatusCode: 500,
		OrigErr:    origErr,
	}
}

// NewExternalError cria um erro de serviço externo
func NewExternalError(message string, origErr error) *AppError {
	return &AppError{
		Type:       TypeExternal,
		Message:    message,
		StatusCode: 502,
		OrigErr:    origErr,
	}
}

// NewTimeoutError cria um erro de timeout
func NewTimeoutError(message string, origErr error) *AppError {
	return &AppError{
		Type:       TypeTimeout,
		Message:    message,
		StatusCode: 504,
		OrigErr:    origErr,
	}
}

// Funções de verificação de tipo de erro
func IsValidationError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeValidation
}

func IsNotFoundError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeNotFound
}

func IsDuplicatedError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeDuplicated
}

func IsUnauthorizedError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeUnauthorized
}

func IsForbiddenError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeForbidden
}

func IsInternalError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeInternal
}

func IsExternalError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeExternal
}

func IsTimeoutError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeTimeout
}
EOF

echo "Pacote de erros criado: $ERROR_FILE"

# Criar pacote de logger
LOGGER_FILE="pkg/common/logger/logger.go"
mkdir -p "$(dirname "$LOGGER_FILE")"
cat > "$LOGGER_FILE" << 'EOF'
// pkg/common/logger/logger.go
package logger

import (
	"context"
	"io"
	"os"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

const (
	LevelDebug = "debug"
	LevelInfo  = "info"
	LevelWarn  = "warn"
	LevelError = "error"
	LevelFatal = "fatal"
)

// Logger interface
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
		Level:      LevelInfo,
		Format:     "json",
		Output:     os.Stdout,
		TimeFormat: time.RFC3339,
	}
}

type zapLogger struct {
	logger *zap.Logger
}

func New(config Config) (Logger, error) {
	var level zapcore.Level
	switch config.Level {
	case LevelDebug:
		level = zapcore.DebugLevel
	case LevelInfo:
		level = zapcore.InfoLevel
	case LevelWarn:
		level = zapcore.WarnLevel
	case LevelError:
		level = zapcore.ErrorLevel
	case LevelFatal:
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
	if config.Output == nil {
		writeSyncer = zapcore.AddSync(os.Stdout)
	}

	core := zapcore.NewCore(encoder, writeSyncer, level)
	zapLogger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return &zapLogger{logger: zapLogger}, nil
}

func (l *zapLogger) Debug(msg string, fields ...Field) {
	l.logger.Debug(msg, fieldsToZapFields(fields)...)
}

func (l *zapLogger) Info(msg string, fields ...Field) {
	l.logger.Info(msg, fieldsToZapFields(fields)...)
}

func (l *zapLogger) Warn(msg string, fields ...Field) {
	l.logger.Warn(msg, fieldsToZapFields(fields)...)
}

func (l *zapLogger) Error(msg string, fields ...Field) {
	l.logger.Error(msg, fieldsToZapFields(fields)...)
}

func (l *zapLogger) Fatal(msg string, fields ...Field) {
	l.logger.Fatal(msg, fieldsToZapFields(fields)...)
}

func (l *zapLogger) With(fields ...Field) Logger {
	return &zapLogger{
		logger: l.logger.With(fieldsToZapFields(fields)...),
	}
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

// Field creation helpers
func String(key string, value string) Field {
	return Field{Key: key, Value: value}
}

func Int(key string, value int) Field {
	return Field{Key: key, Value: value}
}

func Int64(key string, value int64) Field {
	return Field{Key: key, Value: value}
}

func Float64(key string, value float64) Field {
	return Field{Key: key, Value: value}
}

func Bool(key string, value bool) Field {
	return Field{Key: key, Value: value}
}

func Time(key string, value time.Time) Field {
	return Field{Key: key, Value: value}
}

func Duration(key string, value time.Duration) Field {
	return Field{Key: key, Value: value}
}

func Error(err error) Field {
	return Field{Key: "error", Value: err.Error()}
}

func Any(key string, value interface{}) Field {
	return Field{Key: key, Value: value}
}
EOF

echo "Pacote de logger criado: $LOGGER_FILE"

# Criar pacote de utilitários para datas
UTILS_DATE_FILE="pkg/common/utils/date.go"
mkdir -p "$(dirname "$UTILS_DATE_FILE")"
cat > "$UTILS_DATE_FILE" << 'EOF'
// pkg/common/utils/date.go
package utils

import (
	"time"
)

// DateRange representa um intervalo de datas
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

func LastNYears(n int) DateRange {
	end := time.Now()
	start := end.AddDate(-n, 0, 0)
	return DateRange{Start: start, End: end}
}

func StartOfDay(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
}

func EndOfDay(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 999999999, date.Location())
}

func StartOfMonth(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), 1, 0, 0, 0, 0, date.Location())
}

func EndOfMonth(date time.Time) time.Time {
	return StartOfMonth(date).AddDate(0, 1, 0).Add(-time.Nanosecond)
}

func StartOfYear(date time.Time) time.Time {
	return time.Date(date.Year(), 1, 1, 0, 0, 0, 0, date.Location())
}

func EndOfYear(date time.Time) time.Time {
	return time.Date(date.Year(), 12, 31, 23, 59, 59, 999999999, date.Location())
}

func FormatDate(date time.Time) string {
	return date.Format("2006-01-02")
}

func FormatDateTime(date time.Time) string {
	return date.Format("2006-01-02 15:04:05")
}

func ParseDate(date string) (time.Time, error) {
	return time.Parse("2006-01-02", date)
}

func ParseDateTime(date string) (time.Time, error) {
	return time.Parse("2006-01-02 15:04:05", date)
}
EOF

echo "Pacote de utilitários de data criado: $UTILS_DATE_FILE"

# Criar pacote de utilitários para strings
UTILS_STRING_FILE="pkg/common/utils/string.go"
mkdir -p "$(dirname "$UTILS_STRING_FILE")"
cat > "$UTILS_STRING_FILE" << 'EOF'
// pkg/common/utils/string.go
package utils

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"regexp"
	"strings"
	"unicode"
)

func GenerateRandomString(n int) (string, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	
	return base64.URLEncoding.EncodeToString(b)[:n], nil
}

func GenerateRandomHex(n int) (string, error) {
	bytes := make([]byte, n/2+1)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	
	return hex.EncodeToString(bytes)[:n], nil
}

func TruncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	
	if maxLen < 4 {
		return s[:maxLen]
	}
	
	return s[:maxLen-3] + "..."
}

func SlugifyString(s string) string {
	s = strings.ToLower(s)
	re := regexp.MustCompile("[^a-z0-9]+")
	s = re.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

func RemoveAccents(s string) string {
	replacements := map[rune]string{
		'á': "a", 'à': "a", 'â': "a", 'ã': "a", 'ä': "a",
		'é': "e", 'è': "e", 'ê': "e", 'ë': "e",
		'í': "i", 'ì': "i", 'î': "i", 'ï': "i",
		'ó': "o", 'ò': "o", 'ô': "o", 'õ': "o", 'ö': "o",
		'ú': "u", 'ù': "u", 'û': "u", 'ü': "u",
		'ç': "c",
		'Á': "A", 'À': "A", 'Â': "A", 'Ã': "A", 'Ä': "A",
		'É': "E", 'È': "E", 'Ê': "E", 'Ë': "E",
		'Í': "I", 'Ì': "I", 'Î': "I", 'Ï': "I",
		'Ó': "O", 'Ò': "O", 'Ô': "O", 'Õ': "O", 'Ö': "O",
		'Ú': "U", 'Ù': "U", 'Û': "U", 'Ü': "U",
		'Ç': "C",
	}
	
	var result strings.Builder
	for _, r := range s {
		if replacement, ok := replacements[r]; ok {
			result.WriteString(replacement)
		} else {
			result.WriteRune(r)
		}
	}
	
	return result.String()
}

func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	return emailRegex.MatchString(strings.ToLower(email))
}

func IsEmptyOrWhitespace(s string) bool {
	return len(strings.TrimSpace(s)) == 0
}

func Capitalize(s string) string {
	if s == "" {
		return s
	}
	runes := []rune(s)
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}

func MaskString(s string, visibleChars int) string {
	if len(s) <= visibleChars {
		return s
	}
	
	visible := s[len(s)-visibleChars:]
	masked := strings.Repeat("*", len(s)-visibleChars)
	return masked + visible
}
EOF

echo "Pacote de utilitários de string criado: $UTILS_STRING_FILE"

# Criar pacote de utilitários para matemática e cálculos financeiros
UTILS_MATH_FILE="pkg/common/utils/math.go"
mkdir -p "$(dirname "$UTILS_MATH_FILE")"
cat > "$UTILS_MATH_FILE" << 'EOF'
// pkg/common/utils/math.go
package utils

import (
	"fmt"
	"math"
	"sort"
	"strconv"
)

func RoundTo(value float64, places int) float64 {
	if places < 0 {
		places = 0
	}
	
	factor := math.Pow10(places)
	return math.Round(value*factor) / factor
}

func FormatCurrency(value float64, symbol string) string {
	if symbol == "" {
		symbol = "R$"
	}
	
	return symbol + " " + FormatNumber(value, 2)
}

func FormatNumber(value float64, decimals int) string {
	return fmt.Sprintf("%."+strconv.Itoa(decimals)+"f", value)
}

func FormatPercentage(value float64, decimals int) string {
	if decimals < 0 {
		decimals = 0
	}
	
	return fmt.Sprintf("%."+strconv.Itoa(decimals)+"f%%", value)
}

func CalculateCAGR(initialValue, finalValue float64, years float64) float64 {
	if initialValue <= 0 || years <= 0 {
		return 0
	}
	
	return math.Pow(finalValue/initialValue, 1/years) - 1
}

func CalculateROI(initialValue, finalValue float64) float64 {
	if initialValue <= 0 {
		return 0
	}
	
	return (finalValue - initialValue) / initialValue
}

func CalculateStandardDeviation(values []float64) float64 {
	n := len(values)
	if n < 2 {
		return 0
	}
	
	mean := CalculateMean(values)
	sumSquaredDiffs := 0.0
	for _, v := range values {
		diff := v - mean
		sumSquaredDiffs += diff * diff
	}
	
	return math.Sqrt(sumSquaredDiffs / float64(n))
}

func CalculateMean(values []float64) float64 {
	n := len(values)
	if n == 0 {
		return 0
	}
	
	sum := 0.0
	for _, v := range values {
		sum += v
	}
	
	return sum / float64(n)
}

func CalculateMedian(values []float64) float64 {
	n := len(values)
	if n == 0 {
		return 0
	}
	
	sorted := make([]float64, n)
	copy(sorted, values)
	sort.Float64s(sorted)
	
	if n%2 == 0 {
		return (sorted[n/2-1] + sorted[n/2]) / 2
	}
	
	return sorted[n/2]
}

func CalculateVariance(values []float64) float64 {
	n := len(values)
	if n < 2 {
		return 0
	}
	
	mean := CalculateMean(values)
	sumSquaredDiffs := 0.0
	for _, v := range values {
		diff := v - mean
		sumSquaredDiffs += diff * diff
	}
	
	return sumSquaredDiffs / float64(n)
}

func CalculateCorrelation(x, y []float64) float64 {
	n := len(x)
	if n != len(y) || n < 2 {
		return 0
	}
	
	meanX := CalculateMean(x)
	meanY := CalculateMean(y)
	
	sumXY, sumX2, sumY2 := 0.0, 0.0, 0.0
	for i := 0; i < n; i++ {
		diffX := x[i] - meanX
		diffY := y[i] - meanY
		
		sumXY += diffX * diffY
		sumX2 += diffX * diffX
		sumY2 += diffY * diffY
	}
	
	if sumX2 == 0 || sumY2 == 0 {
		return 0
	}
	
	return sumXY / (math.Sqrt(sumX2) * math.Sqrt(sumY2))
}

func CalculatePresentValue(futureValue float64, rate float64, periods int) float64 {
	if rate <= -1 {
		return 0
	}
	
	return futureValue / math.Pow(1+rate, float64(periods))
}

func CalculateFutureValue(presentValue float64, rate float64, periods int) float64 {
	return presentValue * math.Pow(1+rate, float64(periods))
}

func LinearRegression(x, y []float64) (slope, intercept float64) {
	n := len(x)
	if n != len(y) || n < 2 {
		return 0, 0
	}
	
	meanX := CalculateMean(x)
	meanY := CalculateMean(y)
	
	sumXY, sumX2 := 0.0, 0.0
	for i := 0; i < n; i++ {
		xDiff := x[i] - meanX
		sumXY += xDiff * (y[i] - meanY)
		sumX2 += xDiff * xDiff
	}
	
	if sumX2 == 0 {
		return 0, meanY
	}
	
	slope = sumXY / sumX2
	intercept = meanY - slope*meanX
	
	return slope, intercept
}
EOF

echo "Pacote de utilitários matemáticos criado: $UTILS_MATH_FILE"

echo "Pacotes comuns criados com sucesso!"