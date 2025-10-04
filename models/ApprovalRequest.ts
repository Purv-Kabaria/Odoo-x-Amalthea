import mongoose, { Document, Model } from "mongoose";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface IApprovalRequest extends Document {
  organization: string;
  approvalSubject: string;
  requestOwner: mongoose.Types.ObjectId;
  category: string;
  requestStatus: ApprovalStatus;
  totalAmount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  approvalRule: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalRequestSchema = new mongoose.Schema<IApprovalRequest>(
  {
    organization: { type: String, required: true, trim: true },
    approvalSubject: { type: String, required: true, trim: true },
    requestOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, trim: true },
    requestStatus: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true },
    convertedAmount: { type: Number },
    convertedCurrency: { type: String, trim: true },
    approvalRule: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalRule', required: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

// Clear the model cache to ensure fresh schema
if (mongoose.models.ApprovalRequest) {
  delete mongoose.models.ApprovalRequest;
}

const ApprovalRequest: Model<IApprovalRequest> = mongoose.model<IApprovalRequest>("ApprovalRequest", ApprovalRequestSchema);

export default ApprovalRequest;


