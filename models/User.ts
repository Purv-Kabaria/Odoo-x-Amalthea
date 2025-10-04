import mongoose, { Document, Model } from "mongoose";

export type Role = "admin" | "employee" | "manager";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  organization: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee", "manager"], default: "employee" },
    organization: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Only create the model if it doesn't exist to avoid cache clearing issues
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
