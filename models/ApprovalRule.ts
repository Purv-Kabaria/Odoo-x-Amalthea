import mongoose, { Document, Model } from "mongoose";

export interface IApprovalRule extends Document {
  organization: string;
  ruleName: string;
  description: string;
  appliesToUser: mongoose.Types.ObjectId;
  manager: mongoose.Types.ObjectId;
  isManagerApprover: boolean;
  approverSequence: boolean;
  minApprovalPercent: number;
  approvers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalRuleSchema = new mongoose.Schema<IApprovalRule>(
  {
    organization: { type: String, required: true, trim: true },
    ruleName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    appliesToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isManagerApprover: { type: Boolean, default: true },
    approverSequence: { type: Boolean, default: false },
    minApprovalPercent: { type: Number, required: true, min: 0, max: 100 },
    approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Only create the model if it doesn't exist to avoid cache clearing issues
const ApprovalRule: Model<IApprovalRule> = mongoose.models.ApprovalRule || mongoose.model<IApprovalRule>("ApprovalRule", ApprovalRuleSchema);

export default ApprovalRule;


