import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const organization = searchParams.get('organization');
    const role = searchParams.get('role');
    
    const query: Record<string, string> = {};
    if (organization) {
      query.organization = organization;
    }
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query)
      .select("-password");
    
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, email, role, organization } = body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }
    
    const user = new User({
      name,
      email,
      role,
      organization,
    });
    
    const savedUser = await user.save();
    
    // Return user without password
    const populatedUser = await User.findById(savedUser._id)
      .select("-password");
    
    return NextResponse.json(populatedUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
