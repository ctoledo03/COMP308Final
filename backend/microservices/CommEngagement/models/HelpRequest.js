import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema({
	author: { type: mongoose.Schema.Types.ObjectId, required: true },
	description: { type: String, required: true },
	location: { type: String },
	isResolved: { type: Boolean, default: false },
	volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date }
});

export default mongoose.model('HelpRequest', helpRequestSchema);
