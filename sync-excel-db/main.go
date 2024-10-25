package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gosuri/uilive"
)

type UserData struct {
	NameAr               string
	NameEn               string
	Gender               bool
	Phone                string
	Age                  int
	Alert                string
	PenanceFather        string
	RecommendationLetter string
	NationalId           string
	GroupName            string
	ServantName          string
	Address              string
	Region               string
	BirthDate            time.Time
	Attendance           map[string]bool
	AttendanceRate       string
	Quizzes              map[string]int
}

func main() {
	fmt.Println("\n---------------------------------------------------------------------------------------")
	fmt.Println("\n-----------------------  E3dad Khodam St Mary Church ElZeitoun  -----------------------")
	fmt.Println("\n---------------------------------------------------------------------------------------")
	fmt.Println("\n---------------  Quick Information Lookup | Student Information Portal  ---------------")
	fmt.Println("\n---------------------------------------------------------------------------------------")
	fmt.Println("\n-----------  Welcome to the Excel to Firebase sync tool! (v1.2 2024-10-25)  -----------")
	fmt.Println("\n---------------------------------------------------------------------------------------")

	// Get password from user
	scanner := bufio.NewScanner(os.Stdin)

	fmt.Print("\n\nPlease enter password to continue: ")
	scanner.Scan()
	password := scanner.Text()
	if password != "hat4ofony_every_week_:)" {
		fmt.Println("Incorrect password! Exiting...")
		return
	} else {
		fmt.Println("\nHellos :)")
	}

	// Get inputs from user
	fmt.Print("\n\nEnter the path of the Excel file: ")
	scanner.Scan()
	filePath := strings.ReplaceAll(scanner.Text(), "\"", "")

	fmt.Print("Enter the name of the sheet: (Sheet 1) ")
	scanner.Scan()
	sheetName := scanner.Text()
	if sheetName == "" {
		sheetName = "Sheet 1"
	}

	// Read data from Excel file
	userData := getDataFromExcel(filePath, sheetName)
	fmt.Printf("\n%d records loaded successfully!\n\nDeleting current collection...\n", len(userData))

	// Connect to Firestore
	if err := initFirebase(); err != nil {
		panic(err)
	}
	defer firestoreClient.Close()

	// Delete all records in the collection
	if err := deleteCollection("user_data"); err != nil {
		fmt.Printf("Error deleting collection: `%v`\n", err)
		return
	} else {
		fmt.Println("Collection deleted successfully!\n\nAdding new records...")
	}

	// Setup uilive Writer for better CLI output
	writer := uilive.New()
	writer.Start()

	for i, userRecord := range userData {
		fmt.Fprintf(writer, "Adding user record %d\n", i)

		_, _, err := firestoreClient.Collection("user_data").Add(ctx, userRecord)
		if err != nil {
			fmt.Printf("Error adding user record %v: `%v`\n", i, err)
		}
	}
	fmt.Fprintf(writer, "Adding user record %d\n", len(userData))
	writer.Stop()

	fmt.Println("\nFinished adding new records!")
	fmt.Println("\nHave a nice day! Bless you :)")
	fmt.Print("\nPress enter/return to exit...")
	fmt.Scanln()
}
