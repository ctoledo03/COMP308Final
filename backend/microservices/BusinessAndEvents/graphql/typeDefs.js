const typeDefs = `#graphql
  type Comment {
    text: String!
    author: ID!
    createdAt: String
  }

  type BusinessListing {
    id: ID!
    businessName: String!
    owner: ID
    description: String
    location: String
    phone: String
    email: String
    createdAt: String
  }

  type BusinessDeal {
    id: ID!
    listing: BusinessListing!
    title: String!
    details: String
    discountPercentage: Float
    startDate: String
    endDate: String
    createdAt: String
    comments: [Comment]
    summary: String
    sentiment: String
  }

  type CommunityEvent {
    id: ID!
    title: String!
    description: String
    organizer: ID!
    location: String
    date: String!
    createdAt: String
  }

  type CommentInsights {
    summary: String
    sentiment: String
  }

  extend type BusinessDeal {
    commentInsights: CommentInsights
  }

  type Query {
    authorized: Boolean!
    businessListings: [BusinessListing]
    businessDeals: [BusinessDeal]
    communityEvents: [CommunityEvent]
    myBusinessListings: [BusinessListing]
    myBusinessDeals(listingId: ID!): [BusinessDeal]
    myCommunityEvents: [CommunityEvent]
  }

  type Mutation {
    createBusinessListing(
      businessName: String!
      owner: ID
      description: String
      location: String
      phone: String
      email: String
    ): BusinessListing

    createBusinessDeal(
      listing: ID!
      title: String!
      details: String
      discountPercentage: Float
      startDate: String
      endDate: String
    ): BusinessDeal

    createCommunityEvent(
      title: String!
      description: String
      organizer: ID
      location: String
      date: String!
    ): CommunityEvent

    addCommentToDeal(
      dealId: ID!
      text: String!
      username: String!
    ): BusinessDeal
  }
`;

export default typeDefs;