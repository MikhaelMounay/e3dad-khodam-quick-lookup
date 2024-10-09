package main

import (
	"fmt"
	"strconv"
	"time"

	"github.com/xuri/excelize/v2"
)

func getDataFromExcel(filePath string) []UserData {
	file, err := excelize.OpenFile(filePath)
	if err != nil {
		panic(err)
	}

	defer func() {
		if err := file.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	rows, err := file.GetRows("Sheet1")
	if err != nil {
		panic(err)
	}

	headers := rows[0]

	var users = make([]UserData, len(rows)-1)
	for i, row := range rows[1:] {
		age, err := strconv.Atoi(row[4])
		if err != nil {
			fmt.Printf("Error: error parsing Age: \"%v\" in row %v of name %v\n", err, i, row[1])
		}

		birthDate_str := ""
		var birthDate time.Time
		if len(row[8]) == 14 {
			if row[8][0] == '2' {
				birthDate_str += "19"
			} else {
				birthDate_str += "20"
			}
			birthDate_str += row[8][1:3] + "-" + row[8][3:5] + "-" + row[8][5:7]

			birthDate, err = time.Parse("2006-01-02", birthDate_str)
			if err != nil {
				fmt.Printf("Error: `%v` in row %v of name %v\n", err, i, row[1])
			}
		}

		attendance := make(map[string]bool)
		for j, header := range headers[14 : len(headers)-1] {
			attendance[header] = row[j+14] == "1"
		}

		users[i] = UserData{
			NameAr:               row[0],
			NameEn:               row[1],
			Gender:               row[2] == "M",
			Phone:                row[3],
			Age:                  age,
			Alert:                row[5],
			PenanceFather:        row[6],
			RecommendationLetter: row[7],
			NationalId:           row[8],
			GroupName:            row[9],
			ServantName:          row[10],
			Address:              row[11],
			Region:               row[12],
			BirthDate:            birthDate,
			Attendance:           attendance,
		}
	}

	return users
}
