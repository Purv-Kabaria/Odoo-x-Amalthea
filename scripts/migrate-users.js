// Migration script to add organization field to existing users
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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Migration function
const migrateUsers = async () => {
  try {
    // Find all users without organization field
    const usersWithoutOrg = await User.find({ organization: { $exists: false } });
    
    console.log(`Found ${usersWithoutOrg.length} users without organization field`);
    
    // Update each user with a default organization
    for (const user of usersWithoutOrg) {
      // Set organization based on email domain or use a default
      const defaultOrg = user.email.includes('@') 
        ? user.email.split('@')[1].split('.')[0] + ' Corp'
        : 'Default Organization';
      
      await User.findByIdAndUpdate(user._id, { 
        organization: defaultOrg 
      });
      
      console.log(`Updated user ${user.name} (${user.email}) with organization: ${defaultOrg}`);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run migration
connectDB().then(() => {
  migrateUsers();
});
