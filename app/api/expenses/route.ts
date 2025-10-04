import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Expense } from "@/models/expense";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { fetchCurrencies, isValidCurrencyCode } from "@/lib/currencyUtils";

interface ExpenseQuery {
  userId?: string;
  status?: string;
}

// Add GET handler for fetching expenses
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    // Build query
    const query: ExpenseQuery = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    
    const expenses = await Expense.find(query)
      .populate('userId', 'name email') // This will include user details
      .populate('approvedBy', 'name email') // Include approver details
      .populate('rejectedBy', 'name email') // Include rejector details
      .sort({ submittedAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error("GET expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Starting expense creation process");
    
    // Get JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    let payload;
    try {
      payload = verifyToken(token);
      if (!payload.id) {
        return NextResponse.json(
          { error: "Invalid authentication token" },
          { status: 401 }
        );
      }
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }
      
    // Connect to database
    await connectToDatabase();
    console.log("Database connection successful");
      
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
    if (!data.expenseType || !data.amount || !data.currency || !data.date || !data.description) {
      console.error("Missing required fields:", { 
        hasExpenseType: !!data.expenseType,
        hasAmount: !!data.amount, 
        hasCurrency: !!data.currency,
        hasDate: !!data.date,
        hasDescription: !!data.description
      });
      return NextResponse.json(
        { error: "Missing required fields: expenseType, amount, currency, date, and description are all required" },
        { status: 400 }
      );
    }
      
    // Validate amount is a valid number
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a valid positive number" },
        { status: 400 }
      );
    }
      
    // Validate currency has required properties
    if (!data.currency.code || !data.currency.name) {
      return NextResponse.json(
        { error: "Currency must have both code and name properties" },
        { status: 400 }
      );
    }
      
    // Validate expense type against allowed values
    const validExpenseTypes = ['travel', 'meal', 'supplies', 'software', 'training', 'other'];
    if (!validExpenseTypes.includes(data.expenseType)) {
      return NextResponse.json(
        { error: `Invalid expense type. Must be one of: ${validExpenseTypes.join(', ')}` },
        { status: 400 }
      );
    }
      
    // Validate date
    const expenseDate = new Date(data.date);
    if (isNaN(expenseDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }
      
    // Check if date is not in the future
    if (expenseDate > new Date()) {
      return NextResponse.json(
        { error: "Expense date cannot be in the future" },
        { status: 400 }
      );
    }
      
    // Check currency using the validation function
    if (!isValidCurrencyCode(data.currency.code)) {
      return NextResponse.json(
        { error: "Invalid currency code" },
        { status: 400 }
      );
    }
      
    // Try to fetch currencies in background to update cache, but don't wait for it
    fetchCurrencies().catch(error => {
      console.warn("Background currency fetch failed:", error);
    });

    // Get user information
    const User = (await import("@/models/User")).default;
    const user = await User.findById(payload.id).select("organization");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find the appropriate approval rule for this user
    const ApprovalRule = (await import("@/models/ApprovalRules")).default;
    const approvalRule = await ApprovalRule.findOne({
      organization: user.organization,
      appliesToUser: payload.id
    });

    // Prepare expense data with proper types and user ID from token
    const expenseData = {
      expenseType: data.expenseType,
      amount: amount,
      currency: {
        code: data.currency.code,
        name: data.currency.name,
        symbol: data.currency.symbol || undefined
      },
      date: expenseDate,
      description: data.description.trim(),
      userId: payload.id, // Use the authenticated user's ID
      status: 'pending' as const,
      submittedAt: new Date(),
      updatedAt: new Date(),
      // Add approval rule information if found
      ...(approvalRule && {
        approvalRuleId: approvalRule._id,
        approvalThreshold: approvalRule.minApprovalPercent,
        currentApprovalPercentage: 0,
        approvals: [],
        approverSequence: approvalRule.approverSequence
      })
    };

    console.log("Creating expense with data:", JSON.stringify(expenseData));
    
    const savedExpense = await Expense.create(expenseData);
    console.log("Expense created successfully with ID:", savedExpense._id);
    
    return NextResponse.json({
      success: true,
      message: "Expense created successfully",
      data: savedExpense
    }, { status: 201 });
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

// Add PUT handler for updating expenses
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const data = await req.json();
    const { id, status } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }
    
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, approved, rejected" },
        { status: 400 }
      );
    }
    
    const expense = await Expense.findByIdAndUpdate(
      id,
      { 
        ...data,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Expense updated successfully",
      data: expense
    });
  } catch (error) {
    console.error("PUT expenses error:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}