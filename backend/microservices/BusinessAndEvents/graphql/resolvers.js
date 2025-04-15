// resolvers.js
import { BusinessListing } from '../models/BusinessListing.js';
import { BusinessDeal } from '../models/BusinessDeal.js';
import { CommunityEvent } from '../models/CommunityEvent.js';

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
		  
			if (listingId === 'all') {
			  const listings = await BusinessListing.find({ owner: user.user._id });
			  const listingIds = listings.map(l => l._id);
			  const deals = await BusinessDeal.find({ listing: { $in: listingIds } }).populate('listing');
		  
			  return deals;
			}
		  
			return await BusinessDeal.find({ listing: listingId }).populate('listing');
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
			return await CommunityEvent.create(args);
		},
	},

	BusinessDeal: {
		listing: async (parent) => {
		return await BusinessListing.findById(parent.listing);
		}
	}
};

export default resolvers;