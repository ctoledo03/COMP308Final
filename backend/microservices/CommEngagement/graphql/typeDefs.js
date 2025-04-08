const typeDefs = `#graphql
	type CommunityPost {
		id: ID!
		author: ID!
		title: String!
		content: String!
		category: String!
		aiSummary: String
		createdAt: String!
		updatedAt: String
	}

	type HelpRequest {
		id: ID!
		author: ID!
		description: String!
		location: String
		isResolved: Boolean!
		volunteers: [ID!]
		createdAt: String!
		updatedAt: String
	}

	type CommunityAIResponse {
		question: String!
		sessionId: String!
		answer: String!
		followUp: String!
	}

	type Query {
		authorized: Boolean!
		communityPosts(category: String): [CommunityPost!]!  
		helpRequests(isResolved: Boolean): [HelpRequest!]!  
		communityAIQuery(question: String!, sessionId: String!): CommunityAIResponse!
	}

	type Mutation {
		addCommunityPost(title: String!, content: String!, category: String!): CommunityPost!
		editCommunityPost(id: ID!, title: String, content: String, category: String): Boolean
		deleteCommunityPost(id: ID!): Boolean

		addHelpRequest(description: String!, location: String): HelpRequest!
		editHelpRequest(id: ID!, description: String, location: String, isResolved: Boolean): Boolean
		deleteHelpRequest(id: ID!): Boolean
		volunteer(helpRequestId: ID!): Boolean
	}
`;

export default typeDefs;
