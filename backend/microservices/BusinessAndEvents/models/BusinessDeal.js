import mongoose from 'mongoose';

const BusinessDealSchema = new mongoose.Schema({
	listing: { type: mongoose.Schema.Types.ObjectId, required: true },
	title: { type: String, required: true },
	details: { type: String },
	discountPercentage: { type: Number },
	startDate: { type: Date },
	endDate: { type: Date },
	createdAt: { type: Date, default: Date.now }
});

export const BusinessDeal = mongoose.model('BusinessDeal', BusinessDealSchema);