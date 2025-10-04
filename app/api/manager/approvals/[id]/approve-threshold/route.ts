import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Expense } from "@/models/expense";
import User from "@/models/User";
import ApprovalRule from "@/models/ApprovalRules";
import mongoose from "mongoose";

interface ApprovalData {
  approverId: string;
  approvedAt: Date;
  comment?: string;
  sequenceNo?: number;
}

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
        { error: "Access denied. Only managers can approve expenses." },
        { status: 403 }
      );
    }

    const expense = await Expense.findById(expenseId).populate("userId", "name email organization");
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Ensure approvals field is initialized
    if (!expense.approvals) {
      expense.approvals = [];
    }

    // Check if the expense belongs to a user in the same organization
    if (!expense.userId || expense.userId.organization !== manager.organization) {
      return NextResponse.json(
        { error: "Access denied. You can only approve expenses from your organization." },
        { status: 403 }
      );
    }

    // Find the appropriate approval rule for this expense
    const approvalRule = await ApprovalRule.findOne({
      organization: manager.organization,
      appliesToUser: expense.userId._id
    }).populate("approvers.user", "name email");

    if (!approvalRule) {
      return NextResponse.json(
        { error: "No approval rule found for this expense" },
        { status: 404 }
      );
    }

    // Check if this manager is authorized to approve this expense
    const isAuthorizedApprover = approvalRule.approvers.some(
      approver => approver.user._id.toString() === managerId
    );

    if (!isAuthorizedApprover) {
      return NextResponse.json(
        { error: "You are not authorized to approve this expense" },
        { status: 403 }
      );
    }

    // Check if this manager has already approved this expense
    const hasAlreadyApproved = expense.approvals && expense.approvals.length > 0 
      ? expense.approvals.some(
          (approval: ApprovalData) => approval.approverId.toString() === managerId
        )
      : false;

    if (hasAlreadyApproved) {
      return NextResponse.json(
        { error: "You have already approved this expense" },
        { status: 400 }
      );
    }

    // Check if sequential approval is enabled and if this manager is next in sequence
    if (approvalRule.approverSequence) {
      const sortedApprovers = approvalRule.approvers.sort((a, b) => a.sequenceNo - b.sequenceNo);
      const currentApproverIndex = sortedApprovers.findIndex(
        approver => approver.user._id.toString() === managerId
      );
      
      if (currentApproverIndex === -1) {
        return NextResponse.json(
          { error: "You are not authorized to approve this expense" },
          { status: 403 }
        );
      }

      // Check if all previous approvers have approved
      for (let i = 0; i < currentApproverIndex; i++) {
        const previousApproverId = sortedApprovers[i].user._id.toString();
        const hasPreviousApproved = expense.approvals && expense.approvals.length > 0
          ? expense.approvals.some(
              (approval: ApprovalData) => approval.approverId.toString() === previousApproverId
            )
          : false;
        
        if (!hasPreviousApproved) {
          const previousApproverName = (sortedApprovers[i].user as unknown as { name: string }).name;
          return NextResponse.json(
            { 
              error: `Sequential approval required. Please wait for ${previousApproverName} to approve first.`,
              sequentialRequired: true,
              waitingFor: previousApproverName
            },
            { status: 400 }
          );
        }
      }
    }

    // Add the approval
    const newApproval = {
      approverId: new mongoose.Types.ObjectId(managerId),
      approvedAt: new Date(),
      comment: managerComment.trim() || undefined,
      sequenceNo: approvalRule.approvers.find(
        approver => approver.user._id.toString() === managerId
      )?.sequenceNo || 0
    };

    const updatedApprovals = [...(expense.approvals || []), newApproval];

    // Calculate current approval percentage
    const totalApprovers = approvalRule.approvers.length;
    const currentApprovals = updatedApprovals.length;
    const currentApprovalPercentage = Math.round((currentApprovals / totalApprovers) * 100);

    // Check if threshold is met
    const thresholdMet = currentApprovalPercentage >= approvalRule.minApprovalPercent;
    
    let updatedExpense;
    if (thresholdMet) {
      // Threshold reached, approve the expense
      updatedExpense = await Expense.findByIdAndUpdate(
        expenseId,
        {
          status: "approved",
          approvals: updatedApprovals,
          currentApprovalPercentage,
          approvalThreshold: approvalRule.minApprovalPercent,
          managerComment: managerComment.trim() || undefined,
          approvedBy: managerId,
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      ).populate("userId", "name email organization")
       .populate("approvedBy", "name email");
    } else {
      // Threshold not met, just add the approval
      updatedExpense = await Expense.findByIdAndUpdate(
        expenseId,
        {
          approvals: updatedApprovals,
          currentApprovalPercentage,
          approvalThreshold: approvalRule.minApprovalPercent,
          updatedAt: new Date(),
        },
        { new: true }
      ).populate("userId", "name email organization");
    }

    return NextResponse.json(
      {
        message: thresholdMet 
          ? "Expense approved successfully (threshold reached)" 
          : "Approval recorded, waiting for more approvals",
        expense: updatedExpense,
        thresholdMet,
        currentApprovalPercentage,
        approvalThreshold: approvalRule.minApprovalPercent,
        approvalsNeeded: totalApprovers - currentApprovals
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving expense:", error);
    return NextResponse.json(
      { error: "Failed to approve expense" },
      { status: 500 }
    );
  }
}
