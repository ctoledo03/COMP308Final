import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['resident', 'business_owner', 'community_organizer'] 
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log('🔍 Comparing passwords:');
  console.log('Candidate password length:', candidatePassword.length);
  console.log('Stored hash length:', this.password.length);
  const result = await bcrypt.compare(candidatePassword, this.password);
  console.log('Password match result:', result);
  return result;
};

export default mongoose.model('User', userSchema);