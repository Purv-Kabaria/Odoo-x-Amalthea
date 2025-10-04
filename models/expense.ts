import mongoose, { Schema } from 'mongoose';

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
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>({
  expenseType: { 
    type: String, 
    enum: ['travel', 'meal', 'supplies', 'software', 'training', 'other'],
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { 
    code: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String }
  },
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
