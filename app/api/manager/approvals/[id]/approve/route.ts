import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Expense from "@/models/expense";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const expenseId = params.id;

    // Update the expense status to approved
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { 
        status: 'approved'
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!updatedExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Expense approved successfully",
      expense: updatedExpense
    }, { status: 200 });

  } catch (error) {
    console.error("Error approving expense:", error);
    return NextResponse.json(
      { error: "Failed to approve expense" },
      { status: 500 }
    );
  }
}