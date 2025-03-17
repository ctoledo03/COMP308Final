import CommunityPost from '../models/CommunityPost.js';
import HelpRequest from '../models/HelpRequest.js';
import { GraphQLError } from 'graphql';

const resolvers = {
	Query: {
		authorized: (_, __, { user }) => {
			if (!user) {
				throw new GraphQLError('You must be logged in');
			}
			return true;
		},

		communityPosts: async (_, { category }) => {
			const filter = category ? { category } : {};
			return await CommunityPost.find(filter);
		},

		helpRequests: async (_, { isResolved }) => {
			const filter = isResolved !== undefined ? { isResolved } : {};
			return await HelpRequest.find(filter);
		}
	},

	Mutation: {
		addCommunityPost: async (_, { title, content, category }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');
			console.log('user:', user);

			const newPost = new CommunityPost({
				author: user.user._id,
				title,
				content,
				category
			});
			return await newPost.save();
		},

		editCommunityPost: async (_, { id, title, content, category }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');

			const post = await CommunityPost.findById(id);
			if (!post) throw new GraphQLError('Post not found');
			if (post.author.toString() !== user.id) throw new GraphQLError('Unauthorized');

			post.title = title || post.title;
			post.content = content || post.content;
			post.category = category || post.category;
			post.updatedAt = new Date();
			await post.save();
			return true;
		},

		deleteCommunityPost: async (_, { id }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');

			const post = await CommunityPost.findById(id);
			if (!post) throw new GraphQLError('Post not found');
			if (post.author.toString() !== user.id) throw new GraphQLError('Unauthorized');

			await post.deleteOne();
			return true;
		},

		addHelpRequest: async (_, { description, location }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');
			const newRequest = new HelpRequest({
				author: user.id,
				description,
				location
			});
			return await newRequest.save();
		},

		editHelpRequest: async (_, { id, description, location, isResolved }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');

			const helpRequest = await HelpRequest.findById(id);
			if (!helpRequest) throw new GraphQLError('Help request not found');
			if (helpRequest.author.toString() !== user.id) throw new GraphQLError('Unauthorized');

			helpRequest.description = description || helpRequest.description;
			helpRequest.location = location || helpRequest.location;
			helpRequest.isResolved = isResolved !== undefined ? isResolved : helpRequest.isResolved;
			helpRequest.updatedAt = new Date();
			await helpRequest.save();
			return true;
		},

		deleteHelpRequest: async (_, { id }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');

			const helpRequest = await HelpRequest.findById(id);
			if (!helpRequest) throw new GraphQLError('Help request not found');
			if (helpRequest.author.toString() !== user.id) throw new GraphQLError('Unauthorized');

			await helpRequest.deleteOne();
			return true;
		},

		volunteer: async (_, { helpRequestId }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');

			const helpRequest = await HelpRequest.findById(helpRequestId);
			if (!helpRequest) throw new GraphQLError('Help request not found');
			if (helpRequest.author.toString() === user.id) throw new GraphQLError('You cannot volunteer for your own request');

			if (!helpRequest.volunteers.includes(user.id)) {
				helpRequest.volunteers.push(user.id);
				await helpRequest.save();
			}

			return true;
		}
	}
};

export default resolvers;
