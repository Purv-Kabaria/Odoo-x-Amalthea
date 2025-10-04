"use server";

import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "employee" | "manager";
};

type LoginInput = {
  email: string;
  password: string;
};

export async function signUpAction(data: SignupInput) {
  await connectToDatabase();

  const { name, email, password, role = "employee" } = data;
  if (!name || !email || !password) {
    throw new Error("Missing required fields");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashed, role });

  const token = signToken({ id: user._id, role: user.role, email: user.email });

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

export async function loginAction(data: LoginInput) {
  await connectToDatabase();

  const { email, password } = data;
  if (!email || !password) throw new Error("Missing email or password");

  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = signToken({ id: user._id, role: user.role, email: user.email });

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
  
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
  
  return users.map(user => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
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
    return payload as { id: string; role: string; email: string };
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