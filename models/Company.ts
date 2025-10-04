import mongoose, { Document, Model } from "mongoose";

export interface ICompany extends Document {
  name: string;
  adminId: string;
  defaultCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new mongoose.Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    adminId: { type: String, required: true },
    defaultCurrency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

const Company: Model<ICompany> = (mongoose.models.Company as Model<ICompany>) || mongoose.model<ICompany>("Company", CompanySchema);

export default Company;

