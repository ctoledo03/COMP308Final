// resolvers.js
import { BusinessListing } from '../models/BusinessListing.js';
import { BusinessDeal } from '../models/BusinessDeal.js';
import { CommunityEvent } from '../models/CommunityEvent.js';
import { analyzeComments } from '../utils/AICommentAnalysis.js';


export const resolvers = {
	Query: {
		authorized: (_, __, { user }) => {
			if (!user) {
				throw new GraphQLError('You must be logged in');
			}
			return true;
		},
	
		// All listings / deals / events
		businessListings: async () => await BusinessListing.find(),
		businessDeals: async () => await BusinessDeal.find().populate('listing'),
		communityEvents: async () => await CommunityEvent.find(),
	
		// Owner-specific queries
		myBusinessListings: async (_, __, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');
			return await BusinessListing.find({ owner: user.user._id });
		},
	
		myBusinessDeals: async (_, { listingId }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');
		  
			let deals;
			if (listingId === 'all') {
			  const listings = await BusinessListing.find({ owner: user.user._id });
			  const listingIds = listings.map(l => l._id);
			  deals = await BusinessDeal.find({ listing: { $in: listingIds } }).populate('listing');
			} else {
			  deals = await BusinessDeal.find({ listing: listingId }).populate('listing');
			}
		  
			// Dynamically add summary/sentiment (attached to doc instance, not saved)
			await Promise.all(
			  deals.map(async (deal) => {
				if (deal.comments.length === 0) return;
		  
				const { summary, sentiment } = await analyzeComments(deal.comments);
				deal.set('summary', summary, { strict: false });
				deal.set('sentiment', sentiment, { strict: false });
			  })
			);
		  
			return deals;
		},

		myCommunityEvents: async (_, __, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');
			return await CommunityEvent.find({ organizer: user.user._id });
		}
	},

	Mutation: {
		createBusinessListing: async (_, args, { user }) => {
			if (!user) throw new Error("Unauthorized");
			const listing = new BusinessListing({ ...args, owner: user.user._id });
			return await listing.save();
		},

		createBusinessDeal: async (_, args, { user }) => {
			if (!user) throw new GraphQLError("Not authenticated");
			return await BusinessDeal.create(args);
		},

		createCommunityEvent: async (_, args, { user }) => {
			if (!user) throw new GraphQLError("Not authenticated");
			const event = new CommunityEvent({ ...args, organizer: user.user._id });
			return await event.save();
		},

		addCommentToDeal: async (_, { dealId, text, username },) => {	  
			const deal = await BusinessDeal.findById(dealId);
			const { summary, sentiment } = await analyzeComments(deal.comments);
			if (!deal) throw new GraphQLError("Business deal not found");
		  
			const comment = {
			  text,
			  author: username,
			  createdAt: new Date()
			};

			deal.summary = summary;
			deal.sentiment = sentiment;
			deal.comments.push(comment);
			await deal.save();

			return deal;
		}
	},

	BusinessDeal: {
		listing: async (parent) => {
			return await BusinessListing.findById(parent.listing);
		},
		commentInsights: async (deal) => {
			const commentTexts = deal.comments.map(c => c.text);
			return await analyzeComments(commentTexts);
		}	
	}
};

export default resolvers;