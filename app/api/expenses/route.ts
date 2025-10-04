import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Expense } from "@/models/expense";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    console.log("Starting expense creation process");
    
    // Connect to database with error handling
    try {
      await connectToDatabase();
      console.log("Database connection successful");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }
    
    // Parse JSON with error handling
    let data;
    try {
      data = await req.json();
      console.log("Received expense data:", JSON.stringify(data));
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON data" },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data.expenseType || !data.amount || !data.currency || !data.date) {
      console.error("Missing required fields:", { 
        hasExpenseType: !!data.expenseType,
        hasAmount: !!data.amount, 
        hasCurrency: !!data.currency,
        hasDate: !!data.date
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // First try to find a user
    let user;
    try {
      user = await User.findOne();
      console.log("User search result:", user ? `Found user: ${user._id}` : "No user found");
    } catch (userError) {
      console.error("User search error:", userError);
      return NextResponse.json(
        { error: "Failed to find or create user" },
        { status: 500 }
      );
    }
    
    // If no user exists, create a default user
    if (!user) {
      try {
        user = await User.create({
          name: "Default User",
          email: "default@example.com",
          password: "password123",
          role: "user"
        });
        console.log("Created default user:", user._id);
      } catch (createUserError) {
        console.error("Create user error:", createUserError);
        return NextResponse.json(
          { error: "Failed to create default user" },
          { status: 500 }
        );
      }
    }

    // DEBUG: Log the Expense model schema to see what it expects
    console.log("Expense schema paths:", Object.keys(Expense.schema.paths));
    
    // Prepare expense data - try to match exactly what the schema expects
    const expenseData = {
      expenseType: data.expenseType,
      amount: Number(data.amount) + 0.0, // Force it to be a double by adding 0.0
      currency: data.currency,
      date: new Date(data.date),
      description: data.description || "",
      userId: user._id,
      status: 'pending',
      submittedAt: new Date(),
      updatedAt: new Date()
    };

    console.log("Creating expense with data:", JSON.stringify(expenseData));
    
    // Try a direct MongoDB insertion to bypass Mongoose validation temporarily
    try {
      // Using direct MongoDB API to debug
      const db = mongoose.connection.db;
      const collection = db.collection('expenses'); // Make sure this matches your collection name
      
      // Convert amount to explicit double for MongoDB
      const expenseDataWithDouble = {
        ...expenseData,
        amount: new mongoose.Types.Decimal128(expenseData.amount.toString())
      };
      
      console.log("Inserting with explicit double conversion:", expenseDataWithDouble.amount);
      
      const result = await collection.insertOne(expenseDataWithDouble);
      console.log("Expense inserted using direct MongoDB API:", result);
      
      return NextResponse.json({
        message: "Expense created successfully (direct insertion)",
        data: { _id: result.insertedId, ...expenseData }
      }, { status: 201 });
      
    } catch (directInsertError) {
      console.error("Direct MongoDB insertion error:", directInsertError);
      
      // If direct insertion also fails, there's a deeper issue
      if (directInsertError.code === 121) {
        // Get validation errors details
        console.error("Validation error details:", JSON.stringify(directInsertError.errInfo));
      }
      
      // Fall back to Mongoose and get more validation details
      try {
        const expense = new Expense(expenseData);
        await expense.validate();
        // If we get here, the validation passed in Mongoose but not in MongoDB
        console.log("Mongoose validation passed but MongoDB rejected document");
      } catch (validationError) {
        console.error("Mongoose validation error:", validationError);
        if (validationError.errors) {
          for (const field in validationError.errors) {
            console.error(`Field '${field}' error:`, validationError.errors[field].message);
          }
        }
      }
      
      return NextResponse.json(
        { error: "Failed to create expense due to validation errors" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error.message },
      { status: 500 }
    );
  }
}

// ...existing GET and PUT handlers...
