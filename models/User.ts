import mongoose, { Document, Model } from "mongoose";

export type Role = "admin" | "employee" | "manager";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee", "manager"], default: "employee" },
  },
  { timestamps: true }
);

const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

export default User;
