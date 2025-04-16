import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

const BusinessDealSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  details: { type: String },
  discountPercentage: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  summary: { type: String },
  sentiment: { type: String },
  comments: {
    type: [CommentSchema],
    default: []
  }
});

export const BusinessDeal = mongoose.model('BusinessDeal', BusinessDealSchema);
