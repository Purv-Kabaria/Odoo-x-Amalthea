"use server";

import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import Company from "@/models/Company";
import ApprovalRule from "@/models/ApprovalRules";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  organization: string;
  role?: "admin" | "employee" | "manager";
  companyCurrency?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function signUpAction(data: SignupInput) {
  await connectToDatabase();

  const { name, email, password, organization, role, companyCurrency } = data;
  if (!name || !email || !password || !organization) {
    throw new Error("Missing required fields");
  }

  // Debug: Log the organization value
  console.log("Signup data:", { name, email, organization, role });

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already in use");
  }

  // Check if this organization already exists
  const existingCompany = await Company.findOne({ name: organization });
  const isFirstUser = !existingCompany;
  const userRole = isFirstUser ? "admin" : "employee";

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const userData = { 
    name, 
    email, 
    password: hashed, 
    organization,
    role: role || userRole 
  };
  
  // Debug: Log what we're saving
  console.log("Creating user with data:", userData);
  
  const user = await User.create(userData);
  
  // Debug: Log what was actually saved
  console.log("User created:", user);

  // If this is the first user for this organization, create a company record
  if (isFirstUser) {
    const newCompany = await Company.create({
      name: organization,
      adminId: String(user._id),
      defaultCurrency: companyCurrency || 'EUR'
    });
    console.log('Created new company:', {
      name: newCompany.name,
      adminId: newCompany.adminId,
      defaultCurrency: newCompany.defaultCurrency
    });
  }

  const token = signToken({ id: user._id, role: user.role, email: user.email, organization: user.organization });

  const cookieStore = await cookies();
  cookieStore.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
  };
}

export async function getCompanyDefaultCurrency(organization: string): Promise<string> {
  await connectToDatabase();
  
  const company = await Company.findOne({ name: organization });
  if (!company) {
    console.log(`Company not found: ${organization}`);
    return 'EUR';
  }
  
  // If company exists but doesn't have defaultCurrency, update it
  if (!company.defaultCurrency) {
    console.log(`Updating company ${organization} with default currency EUR`);
    await Company.findByIdAndUpdate(company._id, { defaultCurrency: 'EUR' });
    return 'EUR';
  }
  
  return company.defaultCurrency;
}

export async function getCompanyInfo(organization: string): Promise<{ name: string; defaultCurrency: string; adminId: string } | null> {
  await connectToDatabase();
  
  try {
    const company = await Company.findOne({ name: organization });
    if (!company) return null;
    
    // If company exists but doesn't have defaultCurrency, update it
    if (!company.defaultCurrency) {
      console.log(`Updating company ${organization} with default currency EUR`);
      await Company.findByIdAndUpdate(company._id, { defaultCurrency: 'EUR' });
    }
    
    return {
      name: company.name,
      defaultCurrency: company.defaultCurrency || 'EUR',
      adminId: company.adminId
    };
  } catch (error) {
    console.error("Failed to get company info:", error);
    return null;
  }
}

export async function loginAction(data: LoginInput) {
  await connectToDatabase();

  const { email, password } = data;
  if (!email || !password) throw new Error("Missing email or password");

  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = signToken({ id: user._id, role: user.role, email: user.email, organization: user.organization });

  const cookieStore = await cookies();
  cookieStore.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return { ok: true };
}

export async function getAllUsersAction() {
  await connectToDatabase();
  
  // Get current user to determine visibility
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) throw new Error("Not authenticated");
  
  const { verifyToken } = await import("@/lib/jwt");
  const currentUser = verifyToken(token);
  
  let query = {};
  
  // Admin can only see users from their own organization
  if (currentUser.role === "admin") {
    query = { organization: currentUser.organization };
  }
  // Other roles have no access
  else {
    throw new Error("Unauthorized: Admin access required");
  }
  
  const users = await User.find(query, { password: 0 }).sort({ createdAt: -1 }).lean();
  
  return users.map(user => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));
}

export async function getCurrentUserAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const { verifyToken } = await import("@/lib/jwt");
    const payload = verifyToken(token);
    return payload as { id: string; role: string; email: string; organization: string };
  } catch  {
    return null;
  }
}

export async function updateUserAction(userId: string, data: { name?: string; email?: string }) {
  await connectToDatabase();
  
  const updateData: { name?: string; email?: string } = {};
  if (data.name) updateData.name = data.name;
  if (data.email) {
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email: data.email, _id: { $ne: userId } });
    if (existingUser) {
      throw new Error("Email already in use");
    }
    updateData.email = data.email;
  }
  
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).lean();
  if (!user) throw new Error("User not found");
  
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function deleteUserAction(userId: string) {
  await connectToDatabase();
  
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error("User not found");
  
  // Logout the user by clearing the cookie
  const cookieStore = await cookies();
  cookieStore.set({
    name: "token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  
  return { success: true };
}

export async function deleteUserByAdminAction(targetUserId: string) {
  await connectToDatabase();
  
  // Get current user to verify admin permissions
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) throw new Error("Not authenticated");
  
  try {
    const { verifyToken } = await import("@/lib/jwt");
    const currentUser = verifyToken(token);
    
    // Check if current user is admin
    if (currentUser.role !== "admin" && !currentUser.email?.endsWith("@admin")) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    // Prevent admin from deleting themselves
    if (currentUser.id === targetUserId) {
      throw new Error("Cannot delete your own account");
    }
    
    // Get the target user to check organization
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw new Error("User not found");
    
    // Admin can only delete users from their organization
    if (targetUser.organization !== currentUser.organization) {
      throw new Error("Unauthorized: Can only delete users from your organization");
    }
    
    const user = await User.findByIdAndDelete(targetUserId);
    if (!user) throw new Error("User not found");
    
    return { success: true, deletedUser: user.name };
  } catch (error) {
    throw error;
  }
}

export async function updateUserRoleAction(targetUserId: string, newRole: "admin" | "employee" | "manager") {
  await connectToDatabase();
  
  // Get current user to verify admin permissions
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) throw new Error("Not authenticated");
  
  try {
    const { verifyToken } = await import("@/lib/jwt");
    const currentUser = verifyToken(token);
    
    // Check if current user is admin
    if (currentUser.role !== "admin" && !currentUser.email?.endsWith("@admin")) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    // Get the target user to check organization
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw new Error("User not found");
    
    // Admin can only update users from their organization
    if (targetUser.organization !== currentUser.organization) {
      throw new Error("Unauthorized: Can only update users from your organization");
    }
    
    // Validate role
    if (!["admin", "employee", "manager"].includes(newRole)) {
      throw new Error("Invalid role specified");
    }
    
    const user = await User.findByIdAndUpdate(
      targetUserId, 
      { role: newRole }, 
      { new: true }
    ).lean();
    
    if (!user) throw new Error("User not found");
    
    return { 
      success: true, 
      updatedUser: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteApprovalRuleAction(ruleId: string) {
  await connectToDatabase();
  
  // Get current user to verify admin permissions
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) throw new Error("Not authenticated");
  
  try {
    const { verifyToken } = await import("@/lib/jwt");
    const currentUser = verifyToken(token);
    
    // Check if current user is admin
    if (currentUser.role !== "admin" && !currentUser.email?.endsWith("@admin")) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    // Get the rule to check organization
    const rule = await ApprovalRule.findById(ruleId);
    if (!rule) throw new Error("Approval rule not found");
    
    // Admin can only delete rules from their organization
    if (rule.organization !== currentUser.organization) {
      throw new Error("Unauthorized: Can only delete rules from your organization");
    }
    
    const deletedRule = await ApprovalRule.findByIdAndDelete(ruleId);
    if (!deletedRule) throw new Error("Approval rule not found");
    
    return { 
      success: true, 
      deletedRule: {
        id: String(deletedRule._id),
        ruleName: deletedRule.ruleName || "Unnamed Rule"
      }
    };
  } catch (error) {
    throw error;
  }
}