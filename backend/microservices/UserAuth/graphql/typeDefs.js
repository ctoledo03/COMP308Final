const typeDefs = `#graphql
	type User {
		id: ID!
		username: String!
		email: String!
		role: String!
		createdAt: String!
	}

	enum UserRole {
		resident
		business_owner
		community_organizer
	}

	type Query {
		me: User
	}

	type Mutation {
		signup(username: String!, email: String!, password: String!, role: UserRole!): Boolean
		login(username: String!, password: String!): Boolean
		logout: Boolean
	}
`;

export default typeDefs;