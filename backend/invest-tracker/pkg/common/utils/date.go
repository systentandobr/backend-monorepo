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
