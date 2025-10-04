import mongoose, { Schema } from 'mongoose';

export interface IApproval {
  approverId: mongoose.Types.ObjectId;
  approvedAt: Date;
  comment?: string;
  sequenceNo?: number;
}

export interface IExpense {
  expenseType: 'travel' | 'meal' | 'supplies' | 'software' | 'training' | 'other';
  amount: number;
  currency: {
    code: string;
    name: string;
    symbol?: string;
  };
  date: Date;
  description: string;
  receiptFile?: string;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  updatedAt: Date;
  managerComment?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  // New fields for threshold-based approval
  approvals: IApproval[];
  approvalRuleId?: mongoose.Types.ObjectId;
  approvalThreshold?: number;
  currentApprovalPercentage?: number;
  approverSequence?: boolean;
}

const approvalSchema = new Schema<IApproval>({
  approverId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  approvedAt: { type: Date, default: Date.now },
  comment: { type: String, maxlength: 500 },
  sequenceNo: { type: Number, default: 0 }
});

const expenseSchema = new Schema<IExpense>({
  expenseType: { 
    type: String, 
    enum: ['travel', 'meal', 'supplies', 'software', 'training', 'other'],
    required: true 
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { 
    code: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String }
  },
  date: { type: Date, required: true },
  description: { type: String, required: true, minlength: 5, maxlength: 500 },
  receiptFile: { type: String },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  managerComment: { type: String, maxlength: 500 },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: { type: Date },
  rejectedBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: { type: Date },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // New fields for threshold-based approval
  approvals: { type: [approvalSchema], default: [] },
  approvalRuleId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalRule'
  },
  approvalThreshold: { type: Number, min: 0, max: 100 },
  currentApprovalPercentage: { type: Number, min: 0, max: 100, default: 0 },
  approverSequence: { type: Boolean, default: false }
});

// Add indexes for better query performance
expenseSchema.index({ userId: 1, submittedAt: -1 });
expenseSchema.index({ status: 1 });

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);