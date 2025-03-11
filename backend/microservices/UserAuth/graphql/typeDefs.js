const typeDefs = `#graphql
	type User {
		id: ID!
		username: String!
		email: String!
		role: String!
		createdAt: String!
	}

	type Query {
		me: User
	}

	type Mutation {
		signup(username: String!, email: String!, password: String!, role: String!): Boolean
		login(username: String!, password: String!): Boolean
		logout: Boolean
	}
`;

export default typeDefs;