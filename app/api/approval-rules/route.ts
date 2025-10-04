import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import ApprovalRule from "@/models/ApprovalRules";

// Debug: Log the model schema
console.log("ApprovalRule model schema paths:", Object.keys(ApprovalRule.schema.paths)); 

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));
    
    // Add organization field from the request body or headers
    const { organization, ...ruleData } = body;
    
    if (!organization) {
      console.log("Organization missing from request body");
      return NextResponse.json(
        { error: "Organization is required" },
        { status: 400 }
      );
    }
    
    const approvalRuleData = {
      ...ruleData,
      organization
    };
    
    console.log("Creating approval rule with data:", JSON.stringify(approvalRuleData, null, 2));
    
    const approvalRule = new ApprovalRule(approvalRuleData);
    const savedRule = await approvalRule.save();
    
    console.log("Successfully created approval rule:", savedRule._id);
    return NextResponse.json(savedRule, { status: 201 });
  } catch (error) {
    console.error("Error creating approval rule:", error);
    return NextResponse.json(
      { error: "Failed to create approval rule" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    const approvalRules = await ApprovalRule.find()
      .populate("appliesToUser", "name email")
      .populate("manager", "name email")
      .populate("approvers.user", "name email");
    
    return NextResponse.json(approvalRules, { status: 200 });
  } catch (error) {
    console.error("Error fetching approval rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch approval rules" },
      { status: 500 }
    );
  }
}