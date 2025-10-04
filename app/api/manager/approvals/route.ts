import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";

import User from "@/models/User";
import { Expense } from "@/models/expense";
import ApprovalRule from "@/models/ApprovalRules";

interface ApprovalData {
  approverId: string;
  approvedAt: Date;
  comment?: string;
  sequenceNo?: number;
}

// Helper function to determine next approver for sequential approval
function getNextApprover(expense: { approverSequence?: boolean; approvals?: Array<{ approverId: string }> }) {
  if (!expense.approverSequence || !expense.approvals) {
    return null;
  }
  
  // This would need to be enhanced based on the approval rule structure
  // For now, return null as we'll implement this logic in the frontend
  return null;
}
  
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
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ submittedAt: -1 })
      .limit(10);


    const testApprovalRequests = allExpenses
      .filter((expense) => expense.userId) // Filter out expenses without userId
      .map((expense) => {
        return {
          _id: expense._id.toString(),
          approvalSubject: expense.expenseType || "Expense",
          requestOwner: {
            name: expense.userId?.name || "Unknown User",
            email: expense.userId?.email || "unknown@example.com",
          },
          category: expense.expenseType,
          requestStatus: expense.status,
          totalAmount: expense.amount,
          currency: expense.currency?.code || expense.currency,
          description: expense.description,
          createdAt: expense.submittedAt?.toISOString() || new Date().toISOString(),
          managerComment: expense.managerComment,
          approvedBy: expense.approvedBy ? {
            name: expense.approvedBy.name,
            email: expense.approvedBy.email
          } : undefined,
          approvedAt: expense.approvedAt?.toISOString(),
          rejectedBy: expense.rejectedBy ? {
            name: expense.rejectedBy.name,
            email: expense.rejectedBy.email
          } : undefined,
          rejectedAt: expense.rejectedAt?.toISOString(),
          // New fields for threshold-based approval
          approvals: (expense.approvals || []).map((approval: ApprovalData) => ({
            approverId: approval.approverId.toString(),
            approvedAt: approval.approvedAt.toISOString(),
            comment: approval.comment,
            sequenceNo: approval.sequenceNo
          })),
          approvalThreshold: expense.approvalThreshold,
          currentApprovalPercentage: expense.currentApprovalPercentage || 0,
          // Add sequential approval info
          approverSequence: expense.approverSequence,
          nextApprover: getNextApprover(expense),
        };
      });

      return NextResponse.json(testApprovalRequests, { status: 200 });
    }

    const expenses = await Expense.find({
      userId: { $in: assignedUserIds },
    })
      .populate("userId", "name email")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ submittedAt: -1 });

    const approvalRequests = expenses
      .filter((expense) => expense.userId) // Filter out expenses without userId
      .map((expense) => {
        return {
          _id: expense._id.toString(),
          approvalSubject: expense.expenseType || "Expense",
          requestOwner: {
            name: expense.userId?.name || "Unknown User",
            email: expense.userId?.email || "unknown@example.com",
          },
          category: expense.expenseType,
          requestStatus: expense.status,
          totalAmount: expense.amount,
          currency: expense.currency?.code || expense.currency,
          description: expense.description,
          createdAt: expense.submittedAt?.toISOString() || new Date().toISOString(),
          managerComment: expense.managerComment,
          approvedBy: expense.approvedBy ? {
            name: expense.approvedBy.name,
            email: expense.approvedBy.email
          } : undefined,
          approvedAt: expense.approvedAt?.toISOString(),
          rejectedBy: expense.rejectedBy ? {
            name: expense.rejectedBy.name,
            email: expense.rejectedBy.email
          } : undefined,
          rejectedAt: expense.rejectedAt?.toISOString(),
          // New fields for threshold-based approval
          approvals: (expense.approvals || []).map((approval: ApprovalData) => ({
            approverId: approval.approverId.toString(),
            approvedAt: approval.approvedAt.toISOString(),
            comment: approval.comment,
            sequenceNo: approval.sequenceNo
          })),
          approvalThreshold: expense.approvalThreshold,
          currentApprovalPercentage: expense.currentApprovalPercentage || 0,
          // Add sequential approval info
          approverSequence: expense.approverSequence,
          nextApprover: getNextApprover(expense),
        };
      });

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
