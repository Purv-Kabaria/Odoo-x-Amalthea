// Script to migrate ApprovalRule documents from "company" to "organization" field
const mongoose = require("mongoose");

// Connect to MongoDB
async function migrateApprovalRules() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/amalthea"
    );

    console.log("Connected to MongoDB");

    // Get the ApprovalRule collection
    const db = mongoose.connection.db;
    const collection = db.collection("approvalrules");

    // Find documents with "company" field
    const oldSchemaDocs = await collection
      .find({ company: { $exists: true } })
      .toArray();

    console.log(`Found ${oldSchemaDocs.length} documents with "company" field`);

    if (oldSchemaDocs.length > 0) {
      console.log("Migrating documents...");

      for (const doc of oldSchemaDocs) {
        console.log(`Migrating document ${doc._id}`);

        // Update the document to use "organization" instead of "company"
        await collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              organization: doc.company.toString(), // Convert ObjectId to string if needed
            },
            $unset: {
              company: "", // Remove the old field
            },
          }
        );

        console.log(`✅ Migrated document ${doc._id}`);
      }

      console.log("Migration completed successfully!");
    } else {
      console.log("No documents need migration");
    }

    // Verify the migration
    const remainingOldDocs = await collection
      .find({ company: { $exists: true } })
      .toArray();
    const newSchemaDocs = await collection
      .find({ organization: { $exists: true } })
      .toArray();

    console.log(`\nVerification:`);
    console.log(`Documents with "company" field: ${remainingOldDocs.length}`);
    console.log(`Documents with "organization" field: ${newSchemaDocs.length}`);
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migrateApprovalRules();
