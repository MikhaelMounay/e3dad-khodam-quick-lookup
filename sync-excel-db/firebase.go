package main

import (
	"context"

	firestore "cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"

	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

var ctx context.Context
var firestoreClient *firestore.Client

func initFirebase() error {
	ctx = context.Background()
	serviceAccount := option.WithCredentialsFile("e3dad-khodam-quick-lookup-firebase-adminsdk-asaq3-b669c16b66.json")
	app, err := firebase.NewApp(ctx, nil, serviceAccount)
	if err != nil {
		panic(err)
	}

	firestoreClient, err = app.Firestore(ctx)
	if err != nil {
		return err
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
