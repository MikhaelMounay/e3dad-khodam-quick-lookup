package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	firestore "cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/storage"
	"github.com/google/uuid"

	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

var ctx context.Context
var firestoreClient *firestore.Client
var storageClient *storage.Client

func initFirebase() error {
	ctx = context.Background()
	config := &firebase.Config{
		StorageBucket: "e3dad-khodam-quick-lookup.appspot.com",
	}
	// serviceAccount := option.WithCredentialsJSON([]byte(`{
		
	// }`))
	serviceAccount := option.WithCredentialsFile("e3dad-khodam-quick-lookup-firebase-adminsdk-asaq3-b669c16b66.json")
	app, err := firebase.NewApp(ctx, config, serviceAccount)
	if err != nil {
		panic(err)
	}

	firestoreClient, err = app.Firestore(ctx)
	if err != nil {
		return err
	}

	storageClient, err = app.Storage(ctx)
	if err != nil {
		fmt.Printf("Error initializing storage client: `%v`\n", err)
	}

	return nil
}

func deleteCollection(collectionName string) error {
	batchSize := 100

	collection := firestoreClient.Collection(collectionName)
	bulkwriter := firestoreClient.BulkWriter(ctx)

	for {
		// Get a batch of documents
		iter := collection.Limit(batchSize).Documents(ctx)
		numDeleted := 0

		for {
			doc, err := iter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				return err
			}

			bulkwriter.Delete(doc.Ref)
			numDeleted++
		}

		if numDeleted == 0 {
			bulkwriter.End()
			break
		}

		bulkwriter.Flush()
	}
	return nil
}

func uploadFileToStorage(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Printf("Error opening file: `%v`\n", err)
		return err
	}
	defer file.Close()

	defaultBucketHandle, err := storageClient.DefaultBucket()
	if err != nil {
		fmt.Printf("Error getting default bucket: `%v`\n", err)
	}

	objectHandle := defaultBucketHandle.Object(fmt.Sprintf("%s_%s%s", strings.ReplaceAll(strings.ReplaceAll(filepath.Base(file.Name()), filepath.Ext(file.Name()), ""), " ", "_"), time.Now().Format("2006-01-02_03-04-05PM"), filepath.Ext(file.Name())))
	storageWriter := objectHandle.NewWriter(ctx)
	id := uuid.New()
	storageWriter.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	storageWriter.ObjectAttrs.Metadata = map[string]string{"firebaseStorageDownloadTokens": id.String()}
	defer storageWriter.Close()

	if _, err := io.Copy(storageWriter, file); err != nil {
		fmt.Printf("Error uploading file to storage: `%v`\n", err)
		return err
	}

	return nil
}
