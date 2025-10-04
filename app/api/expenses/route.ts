import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Expense } from "@/models/expense";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    // Get first user from the database for testing
    // Using one of the IDs from your Compass interface
    const user = await User.findById('68e0409993374931d8db79d4');
    
    if (!user) {
      console.error("No user found in database");
      return NextResponse.json({ error: "No user found in database" }, { status: 404 });
    }

    console.log("Creating expense for user:", user._id);
    
    const expenseData = {
      ...data,
      userId: user._id,
      status: 'pending',
      submittedAt: new Date(),
      updatedAt: new Date()
    };

    console.log("Expense data to be saved:", expenseData);

    const expense = await Expense.create(expenseData);
    
    console.log("Expense created:", expense);

    return NextResponse.json({
      message: "Expense created successfully",
      data: expense
    }, { status: 201 });

  } catch (error: any) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create expense" },
      { status: 500 }
    );
  }
}

// ...existing GET and PUT handlers...
