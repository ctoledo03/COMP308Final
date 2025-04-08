import CommunityPost from '../models/CommunityPost.js';
import HelpRequest from '../models/HelpRequest.js';
import { GraphQLError } from 'graphql';
import { graph } from "../basicGraph.js";

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
		},

		communityAIQuery: async (_, { question, sessionId }) => {
			console.log(`Question: ${question}`)

			try {
				const result = await graph.invoke({ question, sessionId });
				console.log("✅ Grah result:", result);
				return result
			  } catch (err) {
				console.error("❌ Graph failed:", err.stack);
				throw new GraphQLError('Error generating response: ' + err);
			}
		}
	},

	Mutation: {
		addCommunityPost: async (_, { title, content, category }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');
			console.log('Creating post with user:', user);

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
			
			console.log('Auth Check:', {
				postAuthor: post.author.toString(),
				userId: user.user._id,
				fullUser: user,
				match: post.author.toString() === user.user._id
			});

			if (post.author.toString() !== user.user._id) {
				throw new GraphQLError('Unauthorized');
			}

			if (title !== undefined) post.title = title;
			if (content !== undefined) post.content = content;
			if (category !== undefined) post.category = category;
			post.updatedAt = new Date();

			try {
				await post.save();
				return true;
			} catch (error) {
				console.error('Error saving post:', error);
				throw new GraphQLError('Failed to update post');
			}
		},

		deleteCommunityPost: async (_, { id }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');

			const post = await CommunityPost.findById(id);
			if (!post) throw new GraphQLError('Post not found');
			
			console.log('Deleting post:', {
				postId: id,
				postAuthor: post.author,
				currentUser: user,
				userId: user.user._id
			});

			if (post.author.toString() !== user.user._id) {
				throw new GraphQLError('Unauthorized');
			}

			await post.deleteOne();
			return true;
		},

		addHelpRequest: async (_, { title, description, location }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');
			
			const newRequest = new HelpRequest({
				author: user.user._id,
				title,
				description,
				location,
				volunteers: []
			});
			return await newRequest.save();
		},

		editHelpRequest: async (_, { id, title, description, location, isResolved }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');

			const request = await HelpRequest.findById(id);
			if (!request) throw new GraphQLError('Help request not found');
			if (request.author.toString() !== user.user._id) throw new GraphQLError('Unauthorized');

			if (title) request.title = title;
			if (description) request.description = description;
			if (location !== undefined) request.location = location;
			if (isResolved !== undefined) request.isResolved = isResolved;
			request.updatedAt = new Date();
			
			await request.save();
			return true;
		},

		deleteHelpRequest: async (_, { id }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');

			const request = await HelpRequest.findById(id);
			if (!request) throw new GraphQLError('Help request not found');
			if (request.author.toString() !== user.user._id) throw new GraphQLError('Unauthorized');

			await request.deleteOne();
			return true;
		},

		volunteer: async (_, { helpRequestId }, { user }) => {
			if (!user) throw new GraphQLError('You must be logged in');

			const request = await HelpRequest.findById(helpRequestId);
			if (!request) throw new GraphQLError('Help request not found');
			
			// Can't volunteer for your own request
			if (request.author.toString() === user.user._id) {
				throw new GraphQLError('Cannot volunteer for your own request');
			}

			// Check if already volunteered
			if (!request.volunteers.includes(user.user._id)) {
				request.volunteers.push(user.user._id);
				await request.save();
			}

			return true;
		}
	}
};

export default resolvers;
