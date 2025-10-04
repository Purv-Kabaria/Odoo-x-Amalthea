// Script to seed sample approval requests for testing
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "employee", "manager"], default: "employee" },
  organization: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
}, { timestamps: true });

// Approval Rule schema
const approvalRuleSchema = new mongoose.Schema({
  organization: { type: String, required: true, trim: true },
  ruleName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  appliesToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isManagerApprover: { type: Boolean, default: true },
  approverSequence: { type: Boolean, default: false },
  minApprovalPercent: { type: Number, required: true, min: 0, max: 100 },
  approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Approval Request schema
const approvalRequestSchema = new mongoose.Schema({
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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const ApprovalRule = mongoose.model('ApprovalRule', approvalRuleSchema);
const ApprovalRequest = mongoose.model('ApprovalRequest', approvalRequestSchema);

// Seed data
const seedApprovalRequests = async () => {
  try {
    // Find or create a sample user
    let user = await User.findOne({ email: 'sarah@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Sarah',
        email: 'sarah@example.com',
        password: 'hashedpassword',
        role: 'employee',
        organization: 'acinfo',
        country: 'United States'
      });
    }

    // Find or create a manager
    let manager = await User.findOne({ email: 'manager@example.com' });
    if (!manager) {
      manager = await User.create({
        name: 'Manager',
        email: 'manager@example.com',
        password: 'hashedpassword',
        role: 'manager',
        organization: 'acinfo',
        country: 'United States'
      });
    }

    // Create approval rule
    let rule = await ApprovalRule.findOne({ ruleName: 'Rule 1' });
    if (!rule) {
      rule = await ApprovalRule.create({
        organization: 'acinfo',
        ruleName: 'Rule 1',
        description: 'Nothing',
        appliesToUser: user._id,
        manager: manager._id,
        isManagerApprover: true,
        approverSequence: false,
        minApprovalPercent: 100,
        approvers: [manager._id]
      });
    }

    // Create sample approval requests
    const sampleRequests = [
      {
        organization: 'acinfo',
        approvalSubject: 'Food expenses for team lunch',
        requestOwner: user._id,
        category: 'Food',
        requestStatus: 'approved',
        totalAmount: 567,
        currency: '$',
        convertedAmount: 49896,
        convertedCurrency: 'INR',
        approvalRule: rule._id,
        description: 'Team lunch at restaurant'
      },
      {
        organization: 'acinfo',
        approvalSubject: 'Office supplies purchase',
        requestOwner: user._id,
        category: 'Office Supplies',
        requestStatus: 'pending',
        totalAmount: 250,
        currency: '$',
        convertedAmount: 22000,
        convertedCurrency: 'INR',
        approvalRule: rule._id,
        description: 'Stationery and office materials'
      },
      {
        organization: 'acinfo',
        approvalSubject: 'Travel expenses',
        requestOwner: user._id,
        category: 'Travel',
        requestStatus: 'pending',
        totalAmount: 1200,
        currency: '$',
        convertedAmount: 105600,
        convertedCurrency: 'INR',
        approvalRule: rule._id,
        description: 'Business trip to client location'
      }
    ];

    // Clear existing requests and create new ones
    await ApprovalRequest.deleteMany({});
    
    for (const requestData of sampleRequests) {
      await ApprovalRequest.create(requestData);
    }

    console.log('Sample approval requests created successfully');
  } catch (error) {
    console.error('Error seeding approval requests:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
connectDB().then(() => {
  seedApprovalRequests();
});




