import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Expense } from "@/models/expense";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const expenseId = params.id;

    // Update the expense status to rejected
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { 
        status: 'rejected'
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
      message: "Expense rejected successfully",
      expense: updatedExpense
    }, { status: 200 });

  } catch (error) {
    console.error("Error rejecting expense:", error);
    return NextResponse.json(
      { error: "Failed to reject expense" },
      { status: 500 }
    );
  }
}