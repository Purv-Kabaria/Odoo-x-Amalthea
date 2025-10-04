import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Expense } from "@/models/expense";
import User from "@/models/User";

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
          role: "user",
          organization: "Default Organization"
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

    // Prepare expense data
    const expenseData = {
      expenseType: data.expenseType,
      amount: Number(data.amount),
      currency: data.currency,
      date: new Date(data.date),
      description: data.description || "",
      userId: user._id,
      status: 'pending',
      submittedAt: new Date(),
      updatedAt: new Date()
    };

    console.log("Creating expense with data:", JSON.stringify(expenseData));
    
    // Create the expense
    try {
      const expense = await Expense.create(expenseData);
      console.log("Expense created successfully:", expense._id);
      
      return NextResponse.json({
        message: "Expense created successfully",
        data: expense
      }, { status: 201 });
      
    } catch (createError) {
      console.error("Expense creation error:", createError);
      return NextResponse.json(
        { error: "Failed to create expense", details: createError instanceof Error ? createError.message : 'Unknown error' },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { 
        error: "An unexpected error occurred", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    const expenses = await Expense.find({})
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });
    
    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}