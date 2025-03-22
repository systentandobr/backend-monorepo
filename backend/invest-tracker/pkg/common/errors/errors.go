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
