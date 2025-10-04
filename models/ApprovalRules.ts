import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Interface for Approver subdocument
export interface IApprover {
  user: Types.ObjectId;
  required: boolean;
  sequenceNo: number;
  autoApprove: boolean;
}

// Interface for ApprovalRule document
export interface IApprovalRule extends Document {
  organization: string;
  ruleName?: string;
  description?: string;
  appliesToUser?: Types.ObjectId;
  manager?: Types.ObjectId;
  isManagerApprover: boolean;
  approverSequence: boolean;
  minApprovalPercent: number;
  approvers: IApprover[];
  createdAt: Date;
}

// Schema for Approver subdocument
const ApproverSubSchema: Schema<IApprover> = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  required: { 
    type: Boolean, 
    default: false 
  },        // must-approve
  sequenceNo: { 
    type: Number, 
    default: 0 
  },           // order if sequence enabled
  autoApprove: { 
    type: Boolean, 
    default: false 
  }      // e.g., CFO auto-approve rule
});

// Schema for ApprovalRule document
const ApprovalRuleSchema: Schema<IApprovalRule> = new Schema({
  organization: { 
    type: String, 
    required: true,
    trim: true
  },
  ruleName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  appliesToUser: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  }, // rule for which user
  manager: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  }, // default manager
  isManagerApprover: { 
    type: Boolean, 
    default: false 
  },
  approverSequence: { 
    type: Boolean, 
    default: false 
  }, // sequential vs parallel
  minApprovalPercent: { 
    type: Number, 
    default: 100,
    min: 0,
    max: 100
  },  // 60 etc.
  approvers: [ApproverSubSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create and export the model
// Force clear any existing model to ensure fresh schema
if (mongoose.models.ApprovalRule) {
  console.log("Deleting existing ApprovalRule model from cache");
  delete mongoose.models.ApprovalRule;
}

// Also clear from mongoose.modelSchemas if it exists
if ((mongoose as any).modelSchemas && (mongoose as any).modelSchemas.ApprovalRule) {
  console.log("Deleting existing ApprovalRule schema from cache");
  delete (mongoose as any).modelSchemas.ApprovalRule;
}

console.log("Creating fresh ApprovalRule model with organization field");
const ApprovalRule: Model<IApprovalRule> = mongoose.model<IApprovalRule>("ApprovalRule", ApprovalRuleSchema);

export default ApprovalRule;
