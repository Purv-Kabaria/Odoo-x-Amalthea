import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import ApprovalRule from "@/models/ApprovalRules";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const approvalRule = await ApprovalRule.findById(id)
      .populate("appliesToUser", "name email")
      .populate("manager", "name email")
      .populate("approvers.user", "name email");
    
    if (!approvalRule) {
      return NextResponse.json(
        { error: "Approval rule not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(approvalRule, { status: 200 });
  } catch (error) {
    console.error("Error fetching approval rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch approval rule" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const body = await request.json();
    const updatedRule = await ApprovalRule.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
      .populate("appliesToUser", "name email")
      .populate("manager", "name email")
      .populate("approvers.user", "name email");
    
    if (!updatedRule) {
      return NextResponse.json(
        { error: "Approval rule not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedRule, { status: 200 });
  } catch (error) {
    console.error("Error updating approval rule:", error);
    return NextResponse.json(
      { error: "Failed to update approval rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const deletedRule = await ApprovalRule.findByIdAndDelete(id);
    
    if (!deletedRule) {
      return NextResponse.json(
        { error: "Approval rule not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Approval rule deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting approval rule:", error);
    return NextResponse.json(
      { error: "Failed to delete approval rule" },
      { status: 500 }
    );
  }
}