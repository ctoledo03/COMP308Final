import mongoose from 'mongoose';

const BusinessListingSchema = new mongoose.Schema({
	businessName: { type: String, required: true },
	owner: { type: mongoose.Schema.Types.ObjectId, required: true },
	description: { type: String },
	location: { type: String },
	phone: { type: String },
	email: { type: String },
	createdAt: { type: Date, default: Date.now }
});

export const BusinessListing = mongoose.model('BusinessListing', BusinessListingSchema);