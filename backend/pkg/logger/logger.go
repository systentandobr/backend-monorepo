package logger

import (
	"log"
	"os"
)

var logger *log.Logger

func InitLogger() {
	logger = log.New(os.Stdout, "InvestTracker: ", log.LstdFlags|log.Lshortfile)
}

func GetLogger() *log.Logger {
	if logger == nil {
		InitLogger()
	}
	return logger
}
