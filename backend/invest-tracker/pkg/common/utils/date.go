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

// NewDateRange cria um novo intervalo de datas
func NewDateRange(start, end time.Time) DateRange {
	return DateRange{
		Start: start,
		End:   end,
	}
}

// DaysInRange retorna o número de dias no intervalo
func (dr DateRange) DaysInRange() int {
	return int(dr.End.Sub(dr.Start).Hours() / 24)
}

// Contains verifica se uma data está dentro do intervalo
func (dr DateRange) Contains(date time.Time) bool {
	return (date.Equal(dr.Start) || date.After(dr.Start)) && 
		   (date.Equal(dr.End) || date.Before(dr.End))
}

// LastNDays retorna o intervalo dos últimos N dias
func LastNDays(n int) DateRange {
	end := time.Now()
	start := end.AddDate(0, 0, -n)
	return DateRange{
		Start: start,
		End:   end,
	}
}

// LastNMonths retorna o intervalo dos últimos N meses
func LastNMonths(n int) DateRange {
	end := time.Now()
	start := end.AddDate(0, -n, 0)
	return DateRange{
		Start: start,
		End:   end,
	}
}

// LastNYears retorna o intervalo dos últimos N anos
func LastNYears(n int) DateRange {
	end := time.Now()
	start := end.AddDate(-n, 0, 0)
	return DateRange{
		Start: start,
		End:   end,
	}
}

// StartOfDay retorna a data com hora, minuto, segundo e nanossegundo zerados
func StartOfDay(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
}

// EndOfDay retorna a data com hora, minuto, segundo e nanossegundo no final do dia
func EndOfDay(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 999999999, date.Location())
}

// StartOfMonth retorna a data do primeiro dia do mês
func StartOfMonth(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), 1, 0, 0, 0, 0, date.Location())
}

// EndOfMonth retorna a data do último dia do mês
func EndOfMonth(date time.Time) time.Time {
	return StartOfMonth(date).AddDate(0, 1, 0).Add(-time.Nanosecond)
}

// StartOfYear retorna a data do primeiro dia do ano
func StartOfYear(date time.Time) time.Time {
	return time.Date(date.Year(), 1, 1, 0, 0, 0, 0, date.Location())
}

// EndOfYear retorna a data do último dia do ano
func EndOfYear(date time.Time) time.Time {
	return time.Date(date.Year(), 12, 31, 23, 59, 59, 999999999, date.Location())
}

// FormatDate formata uma data para string no formato padrão
func FormatDate(date time.Time) string {
	return date.Format("2006-01-02")
}

// FormatDateTime formata uma data e hora para string no formato padrão
func FormatDateTime(date time.Time) string {
	return date.Format("2006-01-02 15:04:05")
}

// ParseDate analisa uma string de data no formato padrão
func ParseDate(date string) (time.Time, error) {
	return time.Parse("2006-01-02", date)
}

// ParseDateTime analisa uma string de data e hora no formato padrão
func ParseDateTime(date string) (time.Time, error) {
	return time.Parse("2006-01-02 15:04:05", date)
}