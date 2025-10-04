import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Expense } from "@/models/expense";
import User from "@/models/User";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id: expenseId } = await params;
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Get request body for manager comment
    let managerComment = "";
    try {
      const body = await request.json();
      managerComment = body.comment || "";
    } catch {
      // If no body or invalid JSON, continue without comment
      console.log("No comment provided or invalid JSON");
    }

    // Get manager information
    const manager = await User.findById(managerId).select("name email organization role");
    if (!manager) {
      return NextResponse.json(
        { error: "Manager not found" },
        { status: 404 }
      );
    }

    // Check if user is actually a manager
    if (manager.role !== "manager" && manager.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Only managers can reject expenses." },
        { status: 403 }
      );
    }

    const expense = await Expense.findById(expenseId).populate("userId", "name email organization");
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Check if the expense belongs to a user in the same organization
    if (!expense.userId || expense.userId.organization !== manager.organization) {
      return NextResponse.json(
        { error: "Access denied. You can only reject expenses from your organization." },
        { status: 403 }
      );
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        status: "rejected",
        managerComment: managerComment.trim() || undefined,
        rejectedBy: managerId,
        rejectedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("userId", "name email organization")
     .populate("rejectedBy", "name email");

    return NextResponse.json(
      {
        message: "Expense rejected successfully",
        expense: updatedExpense,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting expense:", error);
    return NextResponse.json(
      { error: "Failed to reject expense" },
      { status: 500 }
    );
  }
}
