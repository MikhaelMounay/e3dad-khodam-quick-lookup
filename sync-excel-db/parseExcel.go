package main

import (
	"fmt"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
)

func getDataFromExcel(filePath string, sheetName string) []UserData {
	file, err := excelize.OpenFile(filePath)
	if err != nil {
		panic(err)
	}

	defer func() {
		if err := file.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	rows, err := file.GetRows(sheetName)
	if err != nil {
		panic(err)
	}

	headers := rows[0]

	var users = make([]UserData, len(rows)-2)
	for i, row := range rows[1 : len(rows)-1] {
		// Age
		age, err := strconv.Atoi(row[6])
		if err != nil {
			fmt.Printf("Error: error parsing Age: \"%v\" in row %v of name %v\n", err, i+2, row[2])
		}

		// BirthDate
		birthDate_str := ""
		var birthDate time.Time
		if len(row[7]) == 14 {
			if row[7][0] == '2' {
				birthDate_str += "19"
			} else {
				birthDate_str += "20"
			}
			birthDate_str += row[7][1:3] + "-" + row[7][3:5] + "-" + row[7][5:7]

			birthDate, err = time.Parse("2006-01-02", birthDate_str)
			if err != nil {
				birthDate, err = time.Parse("02-Jan-06", row[12])
				if err != nil {
					fmt.Printf("Error: `%v` in row %v of name %v\n", err, i+2, row[2])
				}
			}
		}

		// Attendance
		attendance := make(map[string]*bool, 41)
		for j, header := range headers[27:68] {
			day, err := time.Parse("2-Jan", header)
			if err != nil {
				fmt.Printf("Error: `%v` in column %v of name %v\n", err, j+27, header)
			}

			if slices.Contains([]time.Month{time.September, time.October, time.November, time.December}, day.Month()) {
				day = day.AddDate(2025, 0, 0)
			} else {
				day = day.AddDate(2026, 0, 0)
			}

			if row[j+27] == "1" {
				attendance[day.Format("2006-01-02")] = new(bool)
				*(attendance[day.Format("2006-01-02")]) = true
			} else {
				if time.Since(day).Seconds() > 0 {
					attendance[day.Format("2006-01-02")] = new(bool)
					*(attendance[day.Format("2006-01-02")]) = false
				} else {
					attendance[day.Format("2006-01-02")] = nil
				}
			}
		}

		// Quizzes
		quizzes := make(map[string]int, 32)
		for j, header := range headers[68:100] {
			if row[j+68] == "" {
				quizzes[fmt.Sprintf("%02d_%s", j, strings.Split(header, "\n")[1])] = 0
				continue
			}

			quizzes[fmt.Sprintf("%02d_%s", j, strings.Split(header, "\n")[1])], err = strconv.Atoi(row[j+68])
			if err != nil {
				fmt.Printf("Error: `%v` in column %v of name %v\n", err, j+68, header)
			}
		}

		// Grades
		grades := map[string]string{
			"01attendance_40":  row[16],
			"02quizzes_30":     row[17],
			"03hymns1_10":      row[18],
			"04project_20":     row[19],
			"05recitations_10": row[20],
			"06hymns2_10":      row[21],
			"07research_20":    row[22],
			"08exam1_60":       row[23],
			"09exam2_50":       row[24],
			"10total_250":      row[25],
			"11grade_100":      row[26],
		}

		users[i] = UserData{
			NameAr:               row[2],
			NameEn:               row[3],
			Gender:               row[4] == "M",
			Phone:                "0" + row[5],
			Age:                  age,
			Alert:                row[100],
			PenanceFather:        row[13],
			RecommendationLetter: row[14],
			NationalId:           row[7],
			GroupName:            row[8],
			ServantName:          row[9],
			Address:              row[10],
			Region:               row[11],
			BirthDate:            birthDate,
			Attendance:           attendance,
			AttendanceRate:       row[15],
			Quizzes:              quizzes,
			Grades:               grades,
		}
	}

	return users
}
