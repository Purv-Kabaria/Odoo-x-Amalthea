import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";

import User from "@/models/User";
import { Expense } from "@/models/expense";
import ApprovalRule from "@/models/ApprovalRules";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    if (!Expense) {
      throw new Error("Expense model is not available");
    }

    if (!User) {
      throw new Error("User model is not available");
    }

    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    const testManagerId = managerId || "507f1f77bcf86cd799439011";

    const approvalRules = await ApprovalRule.find({ manager: testManagerId })
      .populate("appliesToUser", "name email")
      .populate("manager", "name email");

    const assignedUserIds = approvalRules
      .map((rule) => rule.appliesToUser?._id)
      .filter(Boolean);

    if (assignedUserIds.length === 0) {
      const allExpenses = await Expense.find({})
        .populate("userId", "name email")
        .sort({ submittedAt: -1 })
        .limit(10);

      const testApprovalRequests = allExpenses.map((expense) => ({
        _id: expense._id,
        approvalSubject: expense.expenseType || "Expense",
        requestOwner: {
          name: expense.userId.name,
          email: expense.userId.email,
        },
        category: expense.expenseType,
        requestStatus: expense.status,
        totalAmount: expense.amount,
        currency: expense.currency.code || expense.currency,
        description: expense.description,
        createdAt: expense.submittedAt,
      }));

      return NextResponse.json(testApprovalRequests, { status: 200 });
    }

    const expenses = await Expense.find({
      userId: { $in: assignedUserIds },
    })
      .populate("userId", "name email")
      .sort({ submittedAt: -1 });

    const approvalRequests = expenses.map((expense) => ({
      _id: expense._id,
      approvalSubject: expense.expenseType || "Expense",
      requestOwner: {
        name: expense.userId.name,
        email: expense.userId.email,
      },
      category: expense.expenseType,
      requestStatus: expense.status,
      totalAmount: expense.amount,
      currency: expense.currency.code || expense.currency,
      description: expense.description,
      createdAt: expense.submittedAt,
    }));

    return NextResponse.json(approvalRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching manager approvals:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch approval requests",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
