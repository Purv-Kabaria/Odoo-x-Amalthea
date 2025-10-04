import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import mongoose from "mongoose";
// Import User model first to ensure it's registered before Expense model
import User from "@/models/User";
import { Expense } from "@/models/expense";
import ApprovalRule from "@/models/ApprovalRules";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Ensure the models are available
    if (!Expense) {
      throw new Error('Expense model is not available');
    }
    
    if (!User) {
      throw new Error('User model is not available');
    }
    
    // Get the manager ID from the request (you might want to get this from JWT token or session)
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');
    
    // For testing purposes, if no managerId is provided, use a default one
    // In production, this should come from authentication
    const testManagerId = managerId || "507f1f77bcf86cd799439011"; // Replace with actual manager ID

    // Find all approval rules where this manager is assigned
    const approvalRules = await ApprovalRule.find({ manager: testManagerId })
      .populate('appliesToUser', 'name email')
      .populate('manager', 'name email');

    // Get all user IDs that are assigned to this manager
    const assignedUserIds = approvalRules.map(rule => rule.appliesToUser?._id).filter(Boolean);

    // If no approval rules found, try to get all expenses for testing
    if (assignedUserIds.length === 0) {
      const allExpenses = await Expense.find({})
        .populate('userId', 'name email')
        .sort({ submittedAt: -1 })
        .limit(10); // Limit to 10 for testing

      const testApprovalRequests = allExpenses.map((expense: any) => ({
        _id: expense._id,
        approvalSubject: expense.expenseType || 'Expense',
        requestOwner: {
          name: expense.userId.name,
          email: expense.userId.email
        },
        category: expense.expenseType,
        requestStatus: expense.status,
        totalAmount: expense.amount,
        currency: expense.currency.code || expense.currency,
        description: expense.description,
        createdAt: expense.submittedAt
      }));

      return NextResponse.json(testApprovalRequests, { status: 200 });
    }

    // Fetch all expenses from assigned users
    const expenses = await Expense.find({ 
      userId: { $in: assignedUserIds } 
    })
    .populate('userId', 'name email')
    .sort({ submittedAt: -1 });

    // Transform the data to match the expected format
    const approvalRequests = expenses.map(expense => ({
      _id: expense._id,
      approvalSubject: expense.expenseType || 'Expense',
      requestOwner: {
        name: expense.userId.name,
        email: expense.userId.email
      },
      category: expense.expenseType,
      requestStatus: expense.status,
      totalAmount: expense.amount,
      currency: expense.currency.code || expense.currency,
      description: expense.description,
      createdAt: expense.submittedAt
    }));

    return NextResponse.json(approvalRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching manager approvals:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch approval requests",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


