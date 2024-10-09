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
}

func main() {
	// Get inputs from user
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Print("Enter the path of the Excel file: ")
	scanner.Scan()
	filePath := strings.ReplaceAll(scanner.Text(), "\"", "")

	// Read data from Excel file
	userData := getDataFromExcel(filePath)
	fmt.Printf("%v records loaded successfully!\nDeleting current collection...\n", len(userData))

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
		fmt.Println("Collection deleted successfully!\nAdding new records...")
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

	fmt.Println("Finished adding new record!")
	fmt.Print("\nPress enter/return to exit...")
	fmt.Scanln()
}
