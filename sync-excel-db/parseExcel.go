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
		age, err := strconv.Atoi(row[5])
		if err != nil {
			fmt.Printf("Error: error parsing Age: \"%v\" in row %v of name %v\n", err, i+2, row[2])
		}

		// BirthDate
		birthDate_str := ""
		var birthDate time.Time
		if len(row[6]) == 14 {
			if row[6][0] == '2' {
				birthDate_str += "19"
			} else {
				birthDate_str += "20"
			}
			birthDate_str += row[6][1:3] + "-" + row[6][3:5] + "-" + row[6][5:7]

			birthDate, err = time.Parse("2006-01-02", birthDate_str)
			if err != nil {
				birthDate, err = time.Parse("02-Jan-06", row[11])
				if err != nil {
					fmt.Printf("Error: `%v` in row %v of name %v\n", err, i+2, row[2])
				}
			}
		}

		// Attendance
		attendance := make(map[string]bool)
		for j, header := range headers[26:70] {
			day, err := time.Parse("2-Jan", header)
			if err != nil {
				fmt.Printf("Error: `%v` in column %v of name %v\n", err, j+26, header)
			}

			if slices.Contains([]time.Month{time.October, time.November, time.December}, day.Month()) {
				day = day.AddDate(2024, 0, 0)
			} else {
				day = day.AddDate(2025, 0, 0)
			}

			attendance[day.Format("2006-01-02")] = row[j+26] == "1"
		}

		// Quizzes
		quizzes := make(map[string]int, 30)
		for j, header := range headers[70:100] {
			if row[j+70] == "" {
				quizzes[fmt.Sprintf("%02d_%s", j, strings.Split(header, "\n")[1])] = 0
				continue
			}

			quizzes[fmt.Sprintf("%02d_%s", j, strings.Split(header, "\n")[1])], err = strconv.Atoi(row[j+70])
			if err != nil {
				fmt.Printf("Error: `%v` in column %v of name %v\n", err, j+70, header)
			}
		}

		users[i] = UserData{
			NameAr:               row[1],
			NameEn:               row[2],
			Gender:               row[3] == "M",
			Phone:                "0" + row[4],
			Age:                  age,
			Alert:                row[101],
			PenanceFather:        row[12],
			RecommendationLetter: row[13],
			NationalId:           row[6],
			GroupName:            row[7],
			ServantName:          row[8],
			Address:              row[9],
			Region:               row[10],
			BirthDate:            birthDate,
			Attendance:           attendance,
			AttendanceRate:       row[14],
			Quizzes:              quizzes,
		}
	}

	return users
}
