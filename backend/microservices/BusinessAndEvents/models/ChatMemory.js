import mongoose from 'mongoose';

const chatMemorySchema = new mongoose.Schema({
  sessionId: String,
  question: String,
  answer: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('ChatMemory', chatMemorySchema);