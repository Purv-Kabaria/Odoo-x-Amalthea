import mongoose, { Schema } from 'mongoose';

export interface IExpense {
  userId: Schema.Types.ObjectId;  // Changed from employeeId to userId
  expenseType: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  receiptFile?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Changed from employeeId
  expenseType: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  receiptFile: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
