// Script to check existing ApprovalRule documents and their schema
const mongoose = require("mongoose");

// Connect to MongoDB
async function checkApprovalRules() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/amalthea"
    );

    console.log("Connected to MongoDB");

    // Get the ApprovalRule collection
    const db = mongoose.connection.db;
    const collection = db.collection("approvalrules");

    // Find all documents
    const documents = await collection.find({}).toArray();

    console.log(`Found ${documents.length} ApprovalRule documents:`);

    documents.forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`);
      console.log("ID:", doc._id);
      console.log("Fields:", Object.keys(doc));

      if (doc.company) {
        console.log('⚠️  WARNING: Document has "company" field:', doc.company);
      }
      if (doc.organization) {
        console.log('✅ Document has "organization" field:', doc.organization);
      }
    });

    // Check if any documents have the old "company" field
    const oldSchemaDocs = documents.filter((doc) => doc.company);

    if (oldSchemaDocs.length > 0) {
      console.log(
        `\n⚠️  Found ${oldSchemaDocs.length} documents with old "company" field`
      );
      console.log("These documents need to be updated or removed");
    } else {
      console.log('\n✅ All documents use the new "organization" field');
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

checkApprovalRules();
