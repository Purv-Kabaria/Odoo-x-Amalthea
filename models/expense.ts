import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Enum for approval status
export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

// Interface for ApprovalRecord subdocument
export interface IApprovalRecord {
  approver?: Types.ObjectId;
  required?: boolean;
  sequenceNo?: number;
  status: ApprovalStatus;
  comments?: string;
  actedAt?: Date;
  autoApprove?: boolean;
}

// Interface for Expense document
export interface IExpense extends Document {
  company?: Types.ObjectId;
  user?: Types.ObjectId;
  category?: string;
  description?: string;
  amount?: number;
  currency?: string;
  convertedAmount?: number; // into company baseCurrency
  date?: Date;
  status: ApprovalStatus;
  approvalRule?: Types.ObjectId;
  approvals: IApprovalRecord[];
  currentSequenceIndex: number; // for sequential flow
  createdAt: Date;
}

// Schema for ApprovalRecord subdocument
const ApprovalRecordSchema: Schema<IApprovalRecord> = new Schema({
  approver: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  required: {
    type: Boolean,
    default: false
  },
  sequenceNo: {
    type: Number,
    default: 0
  },
  status: { 
    type: String, 
    enum: Object.values(ApprovalStatus), 
    default: ApprovalStatus.PENDING 
  },
  comments: {
    type: String,
    trim: true
  },
  actedAt: {
    type: Date
  },
  autoApprove: {
    type: Boolean,
    default: false
  }
});

// Schema for Expense document
const ExpenseSchema: Schema<IExpense> = new Schema({
  company: { 
    type: Schema.Types.ObjectId, 
    ref: "Company" 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    trim: true,
    uppercase: true
  },
  convertedAmount: {
    type: Number,
    min: 0
  }, // into company baseCurrency
  date: {
    type: Date
  },
  status: { 
    type: String, 
    enum: Object.values(ApprovalStatus), 
    default: ApprovalStatus.PENDING 
  },
  approvalRule: { 
    type: Schema.Types.ObjectId, 
    ref: "ApprovalRule" 
  },
  approvals: [ApprovalRecordSchema],
  currentSequenceIndex: { 
    type: Number, 
    default: 0,
    min: 0
  }, // for sequential flow
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create and export the model
const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
