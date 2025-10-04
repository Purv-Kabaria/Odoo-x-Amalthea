// Script to clear all ApprovalRule documents (use with caution!)
const mongoose = require("mongoose");

async function clearApprovalRules() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/amalthea"
    );

    console.log("Connected to MongoDB");

    // Get the ApprovalRule collection
    const db = mongoose.connection.db;
    const collection = db.collection("approvalrules");

    // Count existing documents
    const count = await collection.countDocuments();
    console.log(`Found ${count} ApprovalRule documents`);

    if (count > 0) {
      console.log("Clearing all ApprovalRule documents...");
      const result = await collection.deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents`);
    } else {
      console.log("No documents to clear");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

clearApprovalRules();
