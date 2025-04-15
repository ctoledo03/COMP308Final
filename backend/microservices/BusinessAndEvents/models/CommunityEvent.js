import mongoose from 'mongoose';

const CommunityEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  organizer: { type: mongoose.Schema.Types.ObjectId, required: true },
  location: { type: String },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CommunityEvent = mongoose.model('CommunityEvent', CommunityEventSchema);